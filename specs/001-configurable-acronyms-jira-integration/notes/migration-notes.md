# Migration Notes: Acronym Update

Date: 2025-10-29

This note describes the recommended rollout for applying acronym replacements across repositories using the `speckit.updateAcronyms` tooling.

When to run:
- Run migration when you have consensus on the acronym mappings and a green CI on the feature branch containing the constitution changes.

Recommended steps:

1. Configure acronyms

   - Use the interactive `configureAcronyms` CLI to persist the chosen acronyms in `.specify/memory/constitution.md`.
   - Review the constitution file and ensure `Acronyms`, `BranchConfig`, and `JiraMapping` entries are present and correct.

2. Dry-run the update

   - Run `node ./src/cli/updateAcronyms.ts --dry-run --target .` to generate a preview JSON at `specs/001-configurable-acronyms-jira-integration/update-acronyms-dryrun.json`.
   - Inspect `changedFiles` and `summary` to confirm the expected replacements.

3. Peer review

   - Open a PR with the constitution changes (if any) and attach the dry-run JSON to the PR for reviewers.
   - Ask reviewers to inspect the list of changed files and replacement counts.

4. Apply (single commit)

   - When reviewers approve, run `node ./src/cli/updateAcronyms.ts --apply --branch="chore/update-acronyms-<ts>"`.
   - The tool will create a branch, apply replacements, commit once, and write `update-acronyms-result.json` with branch & commit info.

5. CI & PR validation

   - Ensure CI runs (tests/lint/build) on the apply branch before merging.
   - Prefer merging via PR with reviewers who can validate large documentation changes.

6. Rollback

   - If unexpected issues are found after merge, revert the single commit or use Git revert on the apply branch.

Notes & caveats:
- Always run dry-run first. Dry-run is non-destructive and intended for reviewer inspection.
- Apply mode will change files in place; ensure you have a clean working tree before running it.
- If your project requires MCP/Jira integration for numbering/branching, ensure MCP discovery has been completed and is usable in CI before applying changes that depend on Jira keys.

Recorded-by: automation
