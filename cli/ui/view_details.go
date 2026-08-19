package ui

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/charmbracelet/glamour"
	"github.com/charmbracelet/lipgloss"

	"github.com/Mozilla-Campus-Club-of-SLIIT/codenight-n3-GO/fox"
)

func renderMarkdown(mdContent string, wordWrap int) string {
	r, err := glamour.NewTermRenderer(
		glamour.WithAutoStyle(),
		glamour.WithWordWrap(wordWrap),
	)
	if err != nil {
		return mdContent
	}
	out, err := r.Render(mdContent)
	if err != nil {
		return mdContent
	}
	return strings.TrimSpace(out)
}

func (m Model) RenderRightDetails(rightWidth int, panelHeight int) string {
	if len(m.Exercises) == 0 {
		return RightPanelStyle.Width(rightWidth).Height(panelHeight).Render("Select an exercise.")
	}

	curEx := m.Exercises[m.FocusedIdx]
	isPassed := m.Progress.Passed[curEx.ID]

	contentWidth := rightWidth - 4
	if contentWidth < 30 {
		contentWidth = 30
	}
	wrapStyle := lipgloss.NewStyle().Width(contentWidth).Background(ColorPanelBg)

	// Header details
	titleText := fmt.Sprintf("%s (Question %d/3)", curEx.Title, curEx.TopicExerciseNum)
	title := SectionTitleStyle.Render(titleText)
	meta := wrapStyle.Render(fmt.Sprintf("Chapter:  %d · %s\nTopic:    %s\nFile:     %s",
		curEx.ChapterNumber, curEx.CategoryTitle, curEx.TopicTitle, curEx.FilePath))

	// Level badge
	var levelBadge string
	switch strings.ToLower(curEx.Level) {
	case "beginner":
		levelBadge = BadgeBeginnerStyle.Render("[BEGINNER]")
	case "intermediate":
		levelBadge = BadgeIntermediateStyle.Render("[INTERMEDIATE]")
	case "advanced":
		levelBadge = BadgeAdvancedStyle.Render("[ADVANCED]")
	default:
		levelBadge = fmt.Sprintf("[%s]", strings.ToUpper(curEx.Level))
	}

	// Status string
	statusStr := lipgloss.NewStyle().Foreground(ColorPending).Background(ColorPanelBg).Render("STATUS: PENDING [ ]")
	if isPassed {
		statusStr = lipgloss.NewStyle().Foreground(ColorSuccess).Background(ColorPanelBg).Bold(true).Render("STATUS: PASSED [✓]")
	}

	headerBlock := fmt.Sprintf("%s  %s\n%s\n%s\n", title, levelBadge, meta, statusStr)

	// Content area: Fox Animation vs Test Output vs Markdown Hint
	var body string

	if m.IsTesting {
		foxAscii := fox.GetFrame(m.FoxFrame)
		body = FoxBoxStyle.Render(foxAscii)
	} else if m.ShowHint {
		hintPath := filepath.Join(m.RootDir, curEx.DocPath)
		data, err := os.ReadFile(hintPath)
		if err != nil {
			body = lipgloss.NewStyle().Foreground(ColorFailure).Background(ColorPanelBg).Render("No hint file found.")
		} else {
			renderedMd := renderMarkdown(string(data), contentWidth)
			body = fmt.Sprintf("%s\n%s",
				lipgloss.NewStyle().Foreground(ColorHighlight).Background(ColorPanelBg).Bold(true).Render("=== TASK EXPLANATION & HINTS ==="),
				renderedMd)
		}
	} else if m.TestOutput != "" {
		outputStyle := lipgloss.NewStyle().Foreground(ColorFailure).Background(ColorPanelBg).Width(contentWidth)
		if isPassed {
			outputStyle = lipgloss.NewStyle().Foreground(ColorSuccess).Background(ColorPanelBg).Width(contentWidth)
		}
		body = fmt.Sprintf("%s\n%s",
			lipgloss.NewStyle().Foreground(ColorHighlight).Background(ColorPanelBg).Bold(true).Render("=== LATEST TEST OUTPUT ==="),
			outputStyle.Render(m.TestOutput))
	} else {
		body = wrapStyle.Foreground(ColorTextMuted).Render(
			"Press [r] or [Enter] to run tests for this exercise.\nPress [l] to open source file in your editor.\nPress [h] to view task instructions and hints.")
	}

	rightContent := lipgloss.JoinVertical(lipgloss.Left, headerBlock, body)

	style := RightPanelStyle.Width(rightWidth)
	if panelHeight > 0 {
		style = style.Height(panelHeight)
	}
	return style.Render(rightContent)
}

func (m Model) View() string {
	if len(m.Exercises) == 0 {
		return "Loading exercises..."
	}

	// Compute outer panel height matching inner content + borders
	panelHeight := (m.GridRows * 5) + 6

	rightWidth := 52
	if m.WindowWidth > 0 {
		leftWidth := (m.GridCols * 18) + 4
		availW := m.WindowWidth - leftWidth - 4
		if availW > 35 {
			rightWidth = availW
		}
	}

	// 1. Header Bar
	passedCount := 0
	for _, ex := range m.Exercises {
		if m.Progress.Passed[ex.ID] {
			passedCount++
		}
	}
	total := len(m.Exercises)
	pct := 0
	if total > 0 {
		pct = (passedCount * 100) / total
	}

	headerText := fmt.Sprintf(" GOSTLINGS — Mozilla Campus Club of SLIIT  |  Progress: %d/%d Passed (%d%%) ", passedCount, total, pct)
	header := TitleStyle.Render(headerText)

	// 2. Main Panels (Left Grid Matrix + Right Details)
	leftGrid := m.RenderLeftGrid(panelHeight)
	rightDetails := m.RenderRightDetails(rightWidth, panelHeight)
	mainPanels := lipgloss.JoinHorizontal(lipgloss.Top, leftGrid, rightDetails)

	// 3. Controls / Footer Bar
	controlsText := " [←↑↓→] Move  |  [r/Enter] Run Test  |  [l] Edit File  |  [h] Hint  |  [Tab] Chapter  |  [q] Quit"
	footer := FooterStyle.Render(controlsText)

	fullUI := lipgloss.JoinVertical(lipgloss.Left, header, mainPanels, footer)
	return AppStyle.Render(fullUI)
}
