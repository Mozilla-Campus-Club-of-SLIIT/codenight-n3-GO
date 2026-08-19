package editor

import (
	"path/filepath"
	"testing"
)

func TestOpenInEditorNonExistent(t *testing.T) {
	// Should not crash when called with a valid or temporary file path
	tmpFile := filepath.Join(t.TempDir(), "test.go")
	_ = OpenInEditor(tmpFile)
}
