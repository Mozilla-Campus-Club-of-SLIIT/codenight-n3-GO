import "server-only";

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const RUN_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_BYTES = 1_000_000;

const MAX_CONCURRENT_RUNS = 16;

class Semaphore {
  private available: number;
  private readonly queue: (() => void)[] = [];

  constructor(max: number) {
    this.available = max;
  }

  async acquire(): Promise<void> {
    if (this.available > 0) {
      this.available -= 1;
      return;
    }
    await new Promise<void>((resolve) => this.queue.push(resolve));
  }

  release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.available += 1;
    }
  }
}

const runSlots = new Semaphore(MAX_CONCURRENT_RUNS);

const SHARED_GO_DIR = path.join(os.tmpdir(), "assessment-go-shared");
const sharedGoHome = path.join(SHARED_GO_DIR, "home");
const sharedGoCache = path.join(SHARED_GO_DIR, "gocache");
const sharedGoPath = path.join(SHARED_GO_DIR, "gopath");
let sharedGoDirReady: Promise<void> | null = null;

function ensureSharedGoDir(): Promise<void> {
  if (!sharedGoDirReady) {
    sharedGoDirReady = Promise.all([
      mkdir(sharedGoHome, { recursive: true }),
      mkdir(sharedGoCache, { recursive: true }),
      mkdir(sharedGoPath, { recursive: true }),
    ]).then(() => undefined);
  }
  return sharedGoDirReady;
}

type FixtureFile = { name: string; content: string };

export async function runGoTest(
  code: string,
  testCode: string,
  fixtures: FixtureFile[] = [],
): Promise<{ passed: boolean; output: string }> {
  await runSlots.acquire();
  try {
    return await runInIsolatedTempDir(code, testCode, fixtures);
  } finally {
    runSlots.release();
  }
}

async function runInIsolatedTempDir(
  code: string,
  testCode: string,
  fixtures: FixtureFile[],
): Promise<{ passed: boolean; output: string }> {
  const [tmpDir] = await Promise.all([
    mkdtemp(path.join(os.tmpdir(), "assessment-")),
    ensureSharedGoDir(),
  ]);

  try {
    await Promise.all([
      writeFile(path.join(tmpDir, "main.go"), code, "utf-8"),
      writeFile(path.join(tmpDir, "main_test.go"), testCode, "utf-8"),
      ...fixtures.map((fixture) =>
        writeFile(path.join(tmpDir, fixture.name), fixture.content, "utf-8"),
      ),
    ]);

    const { stdout, stderr } = await execFileAsync(
      "go",
      ["test", "-v", "main.go", "main_test.go"],
      {
        cwd: tmpDir,
        timeout: RUN_TIMEOUT_MS,
        maxBuffer: MAX_OUTPUT_BYTES,
        env: {
          ...(process.env || {}),
          HOME: sharedGoHome,
          GOCACHE: sharedGoCache,
          GOPATH: sharedGoPath,
        },
      },
    );

    return { passed: true, output: `${stdout}${stderr}`.trim() };
  } catch (error) {
    const execError = error as {
      stdout?: string;
      stderr?: string;
      killed?: boolean;
      signal?: string | null;
      code?: string | number;
      message: string;
    };
    if((execError as any).code === 'ENOENT') {
      return {
        passed: false,
        output:
          "Go toolchain not found: spawn go ENOENT. Install Go and ensure the 'go' binary is on PATH.",
      };
    }

    if (execError.killed || execError.signal) {
      return { passed: false, output: "Test run timed out after 10 seconds." };
    }

    const output = `${execError.stdout ?? ""}${execError.stderr ?? ""}`.trim();
    return {
      passed: false,
      output: output.length > 0 ? output : execError.message,
    };
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
