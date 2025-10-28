# quickstart.md

Quick steps to try the `speckit.updateAcronyms` flow (dry-run and apply).

Assumptions:
- You are in the repository root.
- Node >=20 and Python >=3.11 are available.

1. Review planned changes (dry-run):

```bash
./bin/speckit.updateAcronyms --dry-run --target .
```

This will scan templates and spec files and print a summary of potential
replacements without modifying files.

2. Apply changes (interactive):

```bash
./bin/speckit.updateAcronyms --apply --target . --branch "chore/update-acronyms-$(date +%Y%m%d%H%M)"
```

The command will create the branch, apply changes, commit them, and bump the
constitution version entry in `memory/constitution.md`.

3. Validate branch naming (example):

```bash
# Validate a branch name locally (uses config in memory/constitution.md)
./bin/speckit.validateBranch "SPEC-123"
```

4. Running tests:

```bash
npm run test:unit
npm run test:integration
```

Notes:
- The above `bin/` commands are placeholders for the intended CLI. The actual
  implementation will provide the `speckit.*` commands as npm scripts or
  python entry points as described in `research.md`.
# Quickstart: Configure Acronyms & Run Update

This quickstart demonstrates the common happy-path to configure acronyms and apply updates.

1. Ensure you're on a feature branch (the update command will create a separate chore branch for changes):

   git checkout -b 001-configurable-acronyms-jira-integration

2. Run a dry-run to preview changes:

   npx speckit updateAcronyms --dry-run

   - The command will print a list of affected files and proposed replacements.
   - Review the list before applying.

3. Apply changes interactively (recommended):

   npx speckit updateAcronyms

   - Confirms defaults, offers overrides, runs a dry-run, then asks for an explicit confirmation.
   - On confirm, the tool creates `chore/update-acronyms`, commits all changes, and prints the commit SHA.

4. Open a Pull Request against your working branch and follow your normal review process.

Notes:
- To run non-interactively accept defaults, use `--yes` (not recommended for large repo-wide changes).
- Use `--templates-only` to limit changes to the `templates/` directory.
