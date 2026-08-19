package ui

import "github.com/charmbracelet/lipgloss"

var (
	// Palette Colors
	ColorPrimary    = lipgloss.Color("208") // Mozilla Orange
	ColorSuccess    = lipgloss.Color("42")  // Green
	ColorFailure    = lipgloss.Color("196") // Red
	ColorPending    = lipgloss.Color("240") // Dark Gray
	ColorHighlight  = lipgloss.Color("51")  // Cyan / Bright Blue
	ColorBg         = lipgloss.Color("234") // Dark Background
	ColorCardBg     = lipgloss.Color("235") // Card Background
	ColorFocusBg    = lipgloss.Color("237") // Focused Card Background
	ColorPanelBg    = lipgloss.Color("234") // Panel Background
	ColorBorder     = lipgloss.Color("239") // Border Gray
	ColorTextMuted  = lipgloss.Color("245") // Muted Text

	// App Container Style (guarantees consistent background across the entire viewport)
	AppStyle = lipgloss.NewStyle().
			Background(ColorBg)

	// Main Header & Outer Frame
	HeaderStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(ColorPrimary).
			Background(ColorBg).
			Padding(0, 1).
			MarginBottom(0)

	TitleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("255")).
			Background(ColorPrimary).
			Padding(0, 2)

	ProgressBarFullStyle = lipgloss.NewStyle().
				Foreground(ColorSuccess).
				Background(ColorBg)

	ProgressBarEmptyStyle = lipgloss.NewStyle().
				Foreground(ColorPending).
				Background(ColorBg)

	// Panel Styles Base
	LeftPanelStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Background(ColorPanelBg).
			Padding(0, 1).
			MarginRight(1)

	RightPanelStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Background(ColorPanelBg).
			Padding(0, 1)

	// Chapter Section Header inside Left Panel
	ChapterHeaderStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorHighlight).
				Background(ColorCardBg).
				Padding(0, 1).
				MarginBottom(1).
				Align(lipgloss.Center)

	// Card Matrix Styles
	CardWidth  = 16
	CardHeight = 4

	CardPassedStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorSuccess).
			Foreground(ColorSuccess).
			Background(ColorCardBg).
			Padding(0, 1).
			Width(CardWidth).
			Height(CardHeight).
			Align(lipgloss.Center, lipgloss.Center)

	CardFailedStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorFailure).
			Foreground(ColorFailure).
			Background(ColorCardBg).
			Padding(0, 1).
			Width(CardWidth).
			Height(CardHeight).
			Align(lipgloss.Center, lipgloss.Center)

	CardPendingStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorPending).
			Foreground(ColorTextMuted).
			Background(ColorCardBg).
			Padding(0, 1).
			Width(CardWidth).
			Height(CardHeight).
			Align(lipgloss.Center, lipgloss.Center)

	CardFocusedStyle = lipgloss.NewStyle().
			Border(lipgloss.DoubleBorder()).
			BorderForeground(ColorHighlight).
			Bold(true).
			Foreground(lipgloss.Color("255")).
			Background(ColorFocusBg).
			Padding(0, 1).
			Width(CardWidth).
			Height(CardHeight).
			Align(lipgloss.Center, lipgloss.Center)

	// Detail View Styles
	SectionTitleStyle = lipgloss.NewStyle().
				Bold(true).
				Foreground(ColorHighlight).
				Background(ColorPanelBg).
				MarginBottom(1)

	BadgeBeginnerStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("42")).
				Background(ColorPanelBg).
				Bold(true)

	BadgeIntermediateStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("220")).
				Background(ColorPanelBg).
				Bold(true)

	BadgeAdvancedStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("202")).
				Background(ColorPanelBg).
				Bold(true)

	FoxBoxStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorPrimary).
			Foreground(ColorPrimary).
			Background(ColorPanelBg).
			Padding(0, 1).
			MarginTop(1).
			MarginBottom(1).
			Align(lipgloss.Center)

	// Footer / Controls
	FooterStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(ColorBorder).
			Foreground(lipgloss.Color("248")).
			Background(ColorBg).
			Padding(0, 1).
			MarginTop(0)
)
