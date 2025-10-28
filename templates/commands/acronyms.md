```markdown
---
description: Update or override the acronyms used across all templates by reading the canonical values from the project constitution (/memory/constitution.md).
scripts:
  sh: scripts/bash/update-agent-context.sh --json --paths-only
  ps: scripts/powershell/update-agent-context.ps1 -Json -PathsOnly
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

Goal: Ensure every template and command in the repository uses the acronyms defined in the project's constitution (the single source of truth at `/memory/constitution.md`). If the constitution does not define acronyms, the command will apply sensible defaults.

Important: This is a repository-level synchronization command. It must be run once, and its changes committed after review.

Execution steps:

1. Load `/memory/constitution.md` and parse the ACRONYMS section. Look for a Markdown table under the `[ACRONYMS]` placeholder or the example table present in the template.

   - If a well-formed table is found, extract the mapping of "Artefact type" → "Acronym to user".
   - If no table exists or parsing fails, fall back to these defaults:
     - Functional Requirement → `FR`
     - Success Criteria → `SC`
     - User Story → `UST`
     - Checklist Item → `CHK`
   - Normalise all acronym tokens to upper-case strings without surrounding punctuation (e.g., `FR`, `SC`, `UST`, `CHK`).

2. Build a source-acronyms set by scanning the repository templates to detect currently-used acronym prefixes. Search the following locations (in order):
   - `/templates/*.md`
   - `/templates/commands/*.md`
   - `/memory/*.md`

   Use regex heuristics to find prefixes used in artifact labels, e.g.:
   - `\b([A-Z]{2,5})-\d{3}\b` (matches `FR-001`, `UST-001`, `SC-001`)
   - `\[([A-Z]{2,5})-\d{3}\]` (matches `[UST-001]` style)

   From the matches, infer a mapping of existing acronym → artifact type when possible. If a direct mapping cannot be inferred for a prefix, consider it a candidate to be replaced only if it matches one of the defaults.

3. For each template file under `/templates` and `/templates/commands`:
   - Make a safe, idempotent rewrite pass:
     - Replace occurrences of label prefixes using regex boundaries. Examples:
       - `FR-###` → `{NEW_FR_PREFIX}-###`
       - `[UST-###]` → `[{NEW_UST_PREFIX}-###]`
       - Bold tokens like `**SC-001**` → `**{NEW_SC_PREFIX}-001**`
     - Only replace the prefix portion (the numeric suffix and punctuation remain unchanged).
     - Preserve case in the numeric suffix and surrounding punctuation.
   - Do not change free-form prose where the acronym appears as natural language (only update clearly structured artifact identifiers and bracketed labels).
   - Create a .bak copy of each file before writing changes (e.g., `spec-template.md.bak`) to allow easy review.

4. After rewriting templates, scan for any remaining occurrences of old prefixes matching the original detected set. If any remain, emit a warning list grouped by file and line number for manual review.

5. Update `/memory/constitution.md` only if the user explicitly asks the command to write the canonical acronyms (the default is read-only). If the user supplies `--write-constitution` or similar in `$ARGUMENTS`, then also replace or insert the ACRONYMS table in the constitution to match the values used.

6. Output a JSON summary on stdout (machine-readable) containing:
   - `updated_files`: list of files changed
   - `backups`: list of backup file paths created
   - `warnings`: list of strings describing unresolved matches requiring manual review
   - `source_acronyms`: detected acronyms and sample matches
   - `applied_acronyms`: the mapping applied (artifact type → acronym)

Behavior & Safety rules:

- Only structured identifiers are updated (patterned labels like `FR-001`, `[UST-001]`, `**SC-001**`).
- Do not infer or rename arbitrary short-caps words that are not clearly artifact prefixes.
- Keep the numeric suffix unchanged and preserve number widths (e.g., `001`).
- Keep backups of every file modified and never delete originals.
- If `--dry-run` present in `$ARGUMENTS`, perform analysis and show proposed diffs but do not write files.
- If `--confirm` is present, apply changes; otherwise, require confirmation before writing.

Examples (for humans):

- Run analysis only:
  - `.specify/scripts/bash/update-agent-context.sh --json --paths-only --dry-run`

- Apply changes and write constitution as well:
  - `.specify/scripts/bash/update-agent-context.sh --json --paths-only --confirm --write-constitution`

Notes:

- The canonical mapping lives in `/memory/constitution.md`. This command uses that file as the authoritative source unless explicitly overridden.
- After running, review backups and the JSON summary, then commit the changes with a message like: `chore: sync acronyms from constitution`.

```
