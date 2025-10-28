# Data Model

This file describes the core data shapes used for the Configurable Acronyms feature.

## Entities

### AcronymConfig
- artifactType: string  # e.g. "Functional Requirement", "User Story"
- acronym: string       # e.g. "FR", "USR"
- createdBy: string     # author/actor
- createdAt: string     # ISO 8601 timestamp
- version: string       # constitution version when set
- metadata?: object     # optional free-form metadata

Validation:
- `acronym` MUST match /^[A-Z0-9_-]{1,10}$/ (upper-case letters, digits, underscore, dash).
- `artifactType` MUST be non-empty and unique per AcronymConfig.

### BranchConfig
- branchAcronym: string    # which acronym is preferred for branch labels (e.g., "FTR")
- enforcePattern: string   # pattern or token like "{JIRAKEY}" or "{ACRONYM}-{SEQ}"
- allowAliasMapping: boolean

Validation:
- `enforcePattern` MUST contain at least one token (e.g., `{JIRAKEY}` or `{ACRONYM}`).

### JiraMapping
- acronym: string         # e.g., "FTR"
- jiraIssueType: string    # e.g., "Story", "Task", "Bug"
- jiraProjectKey?: string # optional specific project key


## Numbering and State Transitions

Numbering for an Acronym follows `<ACRONYM>-<sequential-number>` where the sequence increments per artifact type unless a Jira key is used.

State machine for applying an acronym update:
- DRAFT → DRY-RUN (preview) → APPLIED (single commit on new branch) → REVIEWED → MERGED

Operations that modify repository files MUST be executed in DRY-RUN first and only move to APPLIED upon explicit confirmation.

## Storage

All data is persisted in `memory/constitution.md`. The file should include a machine-readable YAML/JSON block under an `Acronyms` key to be consumed by automation. Example:

```yaml
Acronyms:
  - artifactType: "Functional Requirement"
    acronym: "FR"
    createdBy: "alice"
    createdAt: "2025-10-28T12:00:00Z"
    version: "1.2.0"
BranchConfig:
  branchAcronym: "FTR"
  enforcePattern: "{JIRAKEY}"
  allowAliasMapping: true
JiraMapping:
  - acronym: "FTR"
    jiraIssueType: "Story"
    jiraProjectKey: "SPEC"
```

## Edge cases

- If Jira returns a key with a non-numeric suffix (e.g., `SPEC-ABC`), accept as canonical and use verbatim for branch/spec id.
- If constitution lacks an Acronym entry for a requested artifact type, fall back to defaults from `templates/` and log an amendment proposal.
