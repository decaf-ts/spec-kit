# Project Constitution

## Purpose
[PROJECT_NAME] – Project Constitution  
This document defines the immutable principles that govern how we develop features, produce specifications, and deliver implementations. It sets the foundation for all subsequent steps in our Spec-Driven Development workflow.

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

[ACRONYMS]
<!-- Example:
Below you may define the acronyms used for major artefact types. If you leave any blank, the system will use the default values shown.

| Artefact type             | Acronym to user | Acronym (default)|
|---------------------------|-----------------|------------------|
| Functional Requirement    | `TR`            | `TR`             |
| Success Criteria          | `SC`            | `SC`             |
| User Story                | `UST`           | `UST`            |
| Checklist Item            | `CHK`           | `CHK`            |

*Please update the acronyms above if your team uses different conventions, then save this file so the templates can pick up the values.*-->

[BRANCH NAMING CONVENTION]
***Branch names MUST follow the following pattern ***
<!-- Example: `<SPEC_ID> - <SPEC_NAME>` -->

[TOOLS]
<!-- Example: 
- JIRA_INTEGRATION via atlassian-mcp;
- CI/CD via github-actions-spec-kit;
-->


**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
