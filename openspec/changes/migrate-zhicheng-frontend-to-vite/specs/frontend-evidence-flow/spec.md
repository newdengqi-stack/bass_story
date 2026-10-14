## Purpose

保证简历、岗位和诊断页面围绕同一份用户确认资料一致工作，明确区分演示案例与用户事实；防止无资料、未回答或证据不足在前端被误显示为确定性的能力结论。

## ADDED Requirements

### Requirement: Fictional data cannot impersonate user facts
The frontend SHALL label fictional examples and SHALL NOT present fixed example experience as extracted from arbitrary user input.

#### Scenario: Input differs from the example
- **WHEN** a user provides resume text or a file unrelated to the demonstration case
- **THEN** the UI shows a draft based on available facts or an explicit pending/manual-entry state, rather than replacing it with fictional project claims

#### Scenario: No project is supplied
- **WHEN** a user elects not to supply project material
- **THEN** dependent project review remains unknown or not applicable and no project contribution is invented

### Requirement: Confirmations follow the current fact version
The frontend SHALL invalidate dependent confirmations and results when their resume, contribution, role or JD input changes.

#### Scenario: Edit a confirmed JD
- **WHEN** a user edits a confirmed JD or switches the selected role
- **THEN** previous extracted requirements and scope confirmations cannot authorize the changed input

### Requirement: General assessment is independent of an old role
The frontend SHALL use a general assessment scope when that mode is selected and SHALL NOT derive role Gap or role-specific defer advice without a confirmed target.

#### Scenario: Switch from a role to general assessment
- **WHEN** a user selects a role and subsequently chooses general assessment
- **THEN** the question scope and submission summary identify general assessment and do not silently reuse the old role

### Requirement: Answers remain consistent across in-session navigation
The frontend SHALL retain answer drafts and explicit skipped states during page navigation, distinguish answer and skip counts, and prevent duplicate submissions.

#### Scenario: Return to the assessment
- **WHEN** a user navigates away and returns within the same active session
- **THEN** previously recorded answers, skips and progress remain consistent

#### Scenario: Skip a question
- **WHEN** a user skips an assessment question
- **THEN** it is recorded as unverified rather than incorrect or evidence of low skill

### Requirement: Input errors are recoverable
The frontend SHALL validate file and text input using the current configured policy and SHALL provide accessible error feedback and a retry or manual-entry path.

#### Scenario: Unsupported upload
- **WHEN** a selected file violates the advertised policy
- **THEN** processing does not proceed with that invalid file and the UI provides a clear correction path
