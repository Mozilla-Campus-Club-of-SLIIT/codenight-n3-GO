package manifest

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Manifest struct {
	Title      string     `json:"title"`
	Categories []Category `json:"categories"`
}

type Category struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Topics []Topic `json:"topics"`
}

type Topic struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	ContentPath string     `json:"content_path"`
	Exercises   []Exercise `json:"exercises"`
}

type Exercise struct {
	ID               string `json:"id"`
	Title            string `json:"title"`
	Level            string `json:"level"`
	FilePath         string `json:"file_path"`
	TestPath         string `json:"test_path"`
	DocPath          string `json:"doc_path"`
	CategoryID       string `json:"-"`
	CategoryTitle    string `json:"-"`
	ChapterNumber    int    `json:"-"`
	TopicTitle       string `json:"-"`
	Index            int    `json:"-"`
	TopicExerciseNum int    `json:"-"`
}

type Progress struct {
	Passed map[string]bool `json:"passed"`
	LastID string          `json:"last_id"`
}

func FindRootDir() string {
	dir, err := os.Getwd()
	if err != nil {
		return "."
	}

	for {
		manifestPath := filepath.Join(dir, "exercises", "manifest.json")
		if _, err := os.Stat(manifestPath); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "."
}

func LoadManifest(rootDir string) (*Manifest, []Exercise, error) {
	path := filepath.Join(rootDir, "exercises", "manifest.json")
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, nil, fmt.Errorf("could not read manifest: %w", err)
	}

	var m Manifest
	if err := json.Unmarshal(data, &m); err != nil {
		return nil, nil, fmt.Errorf("could not parse manifest: %w", err)
	}

	var flat []Exercise
	idx := 0
	for catIdx, cat := range m.Categories {
		for _, top := range cat.Topics {
			for topicExIdx, ex := range top.Exercises {
				ex.CategoryID = cat.ID
				ex.CategoryTitle = cat.Title
				ex.ChapterNumber = catIdx + 1
				ex.TopicTitle = top.Title
				ex.Index = idx
				ex.TopicExerciseNum = topicExIdx + 1
				flat = append(flat, ex)
				idx++
			}
		}
	}

	return &m, flat, nil
}

func LoadProgress(rootDir string) Progress {
	path := filepath.Join(rootDir, ".gostlings_progress.json")
	data, err := os.ReadFile(path)
	if err != nil {
		return Progress{Passed: make(map[string]bool)}
	}
	var p Progress
	if err := json.Unmarshal(data, &p); err != nil {
		return Progress{Passed: make(map[string]bool)}
	}
	if p.Passed == nil {
		p.Passed = make(map[string]bool)
	}
	return p
}

func SaveProgress(rootDir string, p Progress) {
	path := filepath.Join(rootDir, ".gostlings_progress.json")
	data, _ := json.MarshalIndent(p, "", "  ")
	_ = os.WriteFile(path, data, 0644)
}
