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
