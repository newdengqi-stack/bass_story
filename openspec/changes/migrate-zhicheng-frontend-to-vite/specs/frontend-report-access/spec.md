## Purpose

保证知程 AI 的公开报告示例和正式技术报告具有清晰的展示边界，审核、发布及访问失效状态不会被混淆，用户只能看到业务服务明确授权提供的当前已发布报告版本。

## ADDED Requirements

### Requirement: Sample reports are explicitly fictional
The frontend SHALL keep public sample reports distinct from personal reports and SHALL NOT turn demonstration actions into claims of real human approval.

#### Scenario: Copy an example summary
- **WHEN** a user copies a fictional example summary
- **THEN** feedback describes copy success or failure without claiming approval was granted

### Requirement: Personal report bodies require authorized publication
The frontend SHALL render a personal report body only after the business API explicitly authorizes its published version; route visibility SHALL NOT be treated as a security control.

#### Scenario: Directly open an unpublished report
- **WHEN** a user opens a report path and the API indicates pending review, approval without publication or denied access
- **THEN** the frontend displays the relevant state without a formal report body

#### Scenario: Authorized content changes or access expires
- **WHEN** the API rejects the current version or reports expired or revoked access
- **THEN** the old body is removed and the frontend presents the appropriate recovery state

### Requirement: Review progress remains separate from skill evidence
The frontend SHALL distinguish review/publication, process progress, performance evidence and assessed level, and SHALL represent revision, rejection and unable-to-complete outcomes without fabricated skill conclusions.

#### Scenario: Review cannot complete
- **WHEN** the service reports that human review cannot complete
- **THEN** the UI explains that no formal conclusion is available and provides the supported deletion or recovery action without inventing a completion deadline
