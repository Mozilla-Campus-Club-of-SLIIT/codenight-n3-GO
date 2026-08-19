package ui

import (
	"fmt"

	"github.com/charmbracelet/lipgloss"

	"github.com/Mozilla-Campus-Club-of-SLIIT/codenight-n3-GO/manifest"
)

func renderCard(ex manifest.Exercise, isFocused bool, isPassed bool, isFailed bool) string {
	var style lipgloss.Style
	statusSymbol := "[ ]"

	if isPassed {
		statusSymbol = "[✓]"
		style = CardPassedStyle
	} else if isFailed {
		statusSymbol = "[✗]"
		style = CardFailedStyle
	} else {
		style = CardPendingStyle
	}

	if isFocused {
		style = CardFocusedStyle
	}

	// Shorten Topic Title if needed
	topShort := ex.TopicTitle
	if len(topShort) > 13 {
		topShort = topShort[:12] + "…"
	}

	qNumStr := fmt.Sprintf("Question %d", ex.TopicExerciseNum)
	content := fmt.Sprintf("%s\n%s\n%s", topShort, qNumStr, statusSymbol)
	return style.Render(content)
}

func (m Model) RenderLeftGrid(panelHeight int) string {
	if len(m.Exercises) == 0 {
		return LeftPanelStyle.Height(panelHeight).Render("No exercises found.")
	}

	pageSize := m.GridCols * m.GridRows
	if pageSize <= 0 {
		pageSize = 12
	}

	currentPage := m.FocusedIdx / pageSize
	totalPages := (len(m.Exercises) + pageSize - 1) / pageSize
	startIdx := currentPage * pageSize
	endIdx := startIdx + pageSize
	if endIdx > len(m.Exercises) {
		endIdx = len(m.Exercises)
	}

	pageExercises := m.Exercises[startIdx:endIdx]

	// Current Focused Exercise & Chapter Meta
	curEx := m.Exercises[m.FocusedIdx]
	
	// Count passed exercises in the current chapter
	chapPassed := 0
	chapTotal := 0
	for _, ex := range m.Exercises {
		if ex.CategoryID == curEx.CategoryID {
			chapTotal++
			if m.Progress.Passed[ex.ID] {
				chapPassed++
			}
		}
	}

	// Chapter Section Header
	chapHeaderStr := fmt.Sprintf("◆ Chapter %d: %s (%d/%d Passed) ◆",
		curEx.ChapterNumber, curEx.CategoryTitle, chapPassed, chapTotal)
	
	gridWidth := (m.GridCols * 18)
	chapHeader := ChapterHeaderStyle.Width(gridWidth - 2).Render(chapHeaderStr)

	var rows []string
	var currentRowCards []string

	for i, ex := range pageExercises {
		actualIdx := startIdx + i
		isFocused := actualIdx == m.FocusedIdx
		isPassed := m.Progress.Passed[ex.ID]
		isFailed := !isPassed && m.TestOutput != "" && isFocused

		cardStr := renderCard(ex, isFocused, isPassed, isFailed)
		currentRowCards = append(currentRowCards, cardStr)

		if len(currentRowCards) == m.GridCols || i == len(pageExercises)-1 {
			rowStr := lipgloss.JoinHorizontal(lipgloss.Top, currentRowCards...)
			rows = append(rows, rowStr)
			currentRowCards = nil
		}
	}

	gridStr := lipgloss.JoinVertical(lipgloss.Left, rows...)

	// Pagination & Chapter Info Footer inside Left Panel
	pagStr := fmt.Sprintf("  ← Page %d of %d →  |  [Tab] Jump Chapter", currentPage+1, totalPages)
	pagStyled := lipgloss.NewStyle().Foreground(ColorTextMuted).Background(ColorPanelBg).Render(pagStr)

	fullLeftContent := lipgloss.JoinVertical(lipgloss.Left, chapHeader, gridStr, "\n"+pagStyled)

	style := LeftPanelStyle
	if panelHeight > 0 {
		style = style.Height(panelHeight)
	}
	return style.Render(fullLeftContent)
}
