# Gostlings — Interactive Go Exercises 🦊

An interactive, terminal-based Rustlings-style exercise runner for learning **Go (Golang)**, developed by the **Mozilla Campus Club of SLIIT**.

---

## 🚀 Quick Start & Installation

Students can download the CLI and exercise files onto their machine with a single terminal command:

### 🪟 Windows (PowerShell)
Open PowerShell in your desired workspace directory and run:

```powershell
iwr -useb https://raw.githubusercontent.com/Mozilla-Campus-Club-of-SLIIT/codenight-n3-GO/main/install.ps1 | iex
```

Then launch the runner:
```powershell
.\gostlings.exe
```

---

### 🍎 macOS & 🐧 Linux (Terminal)
Open Terminal in your desired workspace directory and run:

```bash
curl -fsSL https://raw.githubusercontent.com/Mozilla-Campus-Club-of-SLIIT/codenight-n3-GO/main/install.sh | bash
```

Then launch the runner:
```bash
./gostlings
```

---

## 🎮 TUI Controls & Shortcuts

| Hotkey | Action |
| :--- | :--- |
| **`[← ↑ ↓ →]`** | Navigate across exercise cards in the grid |
| **`[r]` or `[Enter]`** | Run unit tests for selected exercise (with running fox ASCII animation) |
| **`[l]`** | Open the exercise `.go` file in your preferred editor (VS Code, `$VISUAL`, `$EDITOR`, or default app) |
| **`[h]`** | Toggle formatted Markdown task explanation & hints |
| **`[Tab]` / `[Shift+Tab]`** | Jump to Next / Previous Chapter section |
| **`[n]` / `[p]`** | Jump to Next / Previous exercise |
| **`[q]` / `[Esc]`** | Quit Gostlings |
