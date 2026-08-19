package editor

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
)

// OpenInEditor opens the specified file path in the user's preferred editor.
// It checks $VISUAL, $EDITOR, VS Code, and OS default openers.
func OpenInEditor(filePath string) error {
	// 1. Check VISUAL / EDITOR environment variable
	editor := os.Getenv("VISUAL")
	if editor == "" {
		editor = os.Getenv("EDITOR")
	}

	if editor != "" {
		cmd := exec.Command(editor, filePath)
		cmd.Stdin = os.Stdin
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		return cmd.Start()
	}

	// 2. Check if VS Code (`code`) is installed
	if _, err := exec.LookPath("code"); err == nil {
		cmd := exec.Command("code", filePath)
		return cmd.Start()
	}

	// 3. Fall back to OS-specific opener
	switch runtime.GOOS {
	case "windows":
		cmd := exec.Command("cmd", "/c", "start", "", filePath)
		return cmd.Start()
	case "darwin":
		cmd := exec.Command("open", filePath)
		return cmd.Start()
	default: // Linux / BSD
		if _, err := exec.LookPath("xdg-open"); err == nil {
			cmd := exec.Command("xdg-open", filePath)
			return cmd.Start()
		}
		// If xdg-open is not present, try common CLI editors
		for _, fallback := range []string{"nano", "vim", "vi"} {
			if _, err := exec.LookPath(fallback); err == nil {
				cmd := exec.Command(fallback, filePath)
				cmd.Stdin = os.Stdin
				cmd.Stdout = os.Stdout
				cmd.Stderr = os.Stderr
				return cmd.Start()
			}
		}
	}

	return fmt.Errorf("no suitable editor or opener found")
}
