# Changelog

## [0.0.1.0] - 2026-05-08

### Added
- Dark mode with theme toggle in the navigation bar — switches between light and dark color schemes
- OS preference detection — first visit automatically matches your system light/dark setting
- Theme persistence via localStorage — your preference is remembered across visits
- Cross-tab theme sync — changing theme in one tab updates all open tabs
- Smooth color transitions when switching themes (respects `prefers-reduced-motion`)

### Changed
- All pages now use CSS design tokens instead of hardcoded colors for consistent theming
- Badge tones (success, warning, error, info) now use `color-mix()` for adaptive backgrounds
- ImportBlock and ContributeCTA sections use semantic surface tokens for dark mode compatibility
