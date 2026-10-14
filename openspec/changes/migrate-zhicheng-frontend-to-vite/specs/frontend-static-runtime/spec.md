## Purpose

保证知程 AI 前端能够作为独立静态站点构建与运行，在技术栈迁移中保留用户已经认可的品牌视觉、页面结构和导航路径，并以可复验的本地检查证明兼容性。

## ADDED Requirements

### Requirement: Existing pages remain accessible
The frontend SHALL preserve the eight existing page paths, provide an explicit fictional report sample entry, and show a useful not-found state for unknown paths.

#### Scenario: Open an existing page directly
- **WHEN** a user opens or refreshes any existing page path on the configured static host
- **THEN** the correct page renders without requiring a Node production web server

#### Scenario: Follow public navigation
- **WHEN** a user follows a public navigation link or section anchor
- **THEN** its intended page or section exists and is reachable

### Requirement: Migration preserves visual identity
The frontend SHALL preserve existing brand colors, font families, semantic status styles, page hierarchy and responsive behavior except documented defect corrections.

#### Scenario: Compare supported viewports
- **WHEN** the migrated pages are compared with recorded desktop and mobile baseline views
- **THEN** brand and information hierarchy remain recognizable and controls are readable without unintended horizontal overflow

### Requirement: Local verification is explicit
The project SHALL expose working build, type-check, lint and interaction-test commands and SHALL report their actual results separately from visual inspection.

#### Scenario: Verification fails
- **WHEN** a required local check fails or cannot run
- **THEN** delivery records the failure or limitation and does not label the check as passed
