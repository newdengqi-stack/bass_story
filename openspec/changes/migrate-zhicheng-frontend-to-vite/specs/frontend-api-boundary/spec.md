## Purpose

为知程 AI 前端提供一致的业务接口边界，使演示服务与未来 FastAPI 服务能够通过相同契约接入，异步任务、输入错误、访问失效和数据删除均可清楚呈现且不误导用户。

## ADDED Requirements

### Requirement: Mock and live business responses are distinguishable
The frontend SHALL use a uniform business-service boundary for resume, role, assessment, task, report and deletion operations and SHALL identify Mock operation visibly.

#### Scenario: A live request fails
- **WHEN** a live API request fails
- **THEN** the frontend reports the failure and does not silently replace it with fictional success data

### Requirement: Requests expose typed recoverable states
The frontend SHALL validate consumed response fields and distinguish loading, empty, error, cancelled, unauthorized, expired and successful states.

#### Scenario: A task request times out
- **WHEN** an asynchronous operation times out or is cancelled during navigation
- **THEN** pending UI terminates appropriately and the user can retry or resume without duplicated answer evidence

### Requirement: Frontend contains no internal credentials or connections
The frontend MUST NOT contain model secrets, connect directly to the database or invoke private Agents, and SHALL treat all browser-exposed configuration as public.

#### Scenario: Configure a backend endpoint
- **WHEN** the frontend is configured for a business API
- **THEN** configuration contains only public endpoint/mode settings and private model credentials remain outside frontend source and bundles

### Requirement: Deletion claims reflect the service response
The frontend SHALL distinguish a deletion request being accepted from deletion being completed, and SHALL scope Mock clearing to demonstration memory.

#### Scenario: Deletion is pending
- **WHEN** the service has accepted deletion but has not confirmed completion
- **THEN** the UI shows pending deletion rather than claiming all backend, provider and backup copies have been removed
