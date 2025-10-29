````markdown
```markdown
---
description: Interactive CLI to update acronyms across templates and optionally update the constitution and create Jira issues (interactive only).
scripts:
  sh: .specify/scripts/bash/update-agent-context.sh --json --paths-only
  ps: .specify/scripts/powershell/update-agent-context.ps1 -Json -PathsOnly
---

## User Input

```text
$ARGUMENTS
```

This command must prompt the user before making any changes that affect repository files or external systems (Jira). Use `--dry-run` to preview replacements.

## Outline

1. Parse `/memory/constitution.md` and collect `Acronyms`, `BranchConfig`, and `JiraMapping` entries (if present).
2. Present suggested acronyms (defaults if missing) and allow interactive overrides. If `--yes` is supplied, accept defaults non-interactively.
3. Run an idempotent scan over `templates/` and `templates/commands/` to detect structured artifact identifiers to be updated.
4. Present a dry-run summary listing affected files and sample diffs. Require explicit confirmation to apply changes.
5. If user confirms and supplies consent to Jira operations:
   - Prompt for whether to create Jira issues for items requiring mapping; if user declines, fall back to local numbering.
   - Only after explicit confirmation call integration utilities (e.g., `@decaf-ts/mcp-server`) to create Jira issues.
6. Create a single branch (e.g., `chore/update-acronyms`), write backups, commit the changes, and print a JSON summary.

## Flags

- `--dry-run` / `-n` : Show proposed changes without writing files.
- `--yes` / `-y` : Accept suggested defaults non-interactively.
- `--templates-only` : Limit modifications to `/templates` and `/templates/commands`.
- `--rename-branches` : Interactive mode to propose branch renames (opt-in).

## Safety

- Never create Jira issues automatically in the background. Always prompt the user and require explicit consent before creating external issues. If credentials are missing or user declines, use local numbering and mark specs as `Jira: pending`.

## Output

- JSON summary containing `updated_files`, `backups`, `warnings`, and `commitSha` (if applied).

````
