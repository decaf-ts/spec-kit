<!--
Template: templates/commands/decaf-ts-extensions.md
Version: 1.0.0
Created: 2025-10-28
Last Amended: 2025-10-28
Notes: This template provides decaf-ts-specific guidance. Always validate generated
       artifacts against `.specify/memory/constitution.md`.
-->

```markdown
---
description: "decaf-ts guidance: conventions and patterns LLMs should follow when generating code and templates for decaf-ts projects"
---

# decaf-ts LLM Guidance (for Spec Kit adaptations)

Purpose: Provide concrete, machine-actionable guidance so LLM-driven flows (e.g., `/speckit.*`)
generate artifacts consistent with decaf-ts design patterns.

Core conventions:

- Monorepo structure: prefer `packages/<name>/src` for packages. Root-level `apps/` or
  `services/` only when necessary.
- Package entrypoint: `packages/<name>/src/index.ts`. Build scripts should output to `dist/`.
- Package.json: include `types` field, `exports` map, and `module`/`main` where applicable.
- Type safety: enable `strict` in `tsconfig.json`. Use `unknown` over `any` when appropriate.
- Tests: prefer `vitest` or `jest` depending on plan; place tests alongside `src` in `__tests__`
  or `tests/` folders. TDD-first: generate tests before implementation tasks.
- Tooling: prefer `pnpm` and workspace protocol. Provide `scripts` for `build`, `test`, `lint`,
  and `check-types` in each package when applicable.
- Contract-first: when APIs are part of the feature, produce OpenAPI (YAML/JSON) contract
  snippets and contract tests that validate request/response shapes.

LLM behavior rules (must follow):

1. Always consult `plan.md` for language and framework decisions. If `plan.md` is missing,
   assume TypeScript + Node (monorepo) and prompt for clarification.
2. When creating tasks, include exact file paths and package names. Do not use placeholders
   such as `[FILE]` or `[PATH]` in generated tasks.
3. For implementation tasks, prefer small change sets (single-responsibility commits). Each
   task description MUST be directly actionable by an LLM (e.g., "Create `packages/foo/src/index.ts`"
   with the exported function signature and an initial test file `packages/foo/__tests__/index.test.ts").
4. If adding or bumping dependencies, include `pnpm` or `package.json` edits as explicit tasks
   in Phase 1 (Setup).
5. When producing examples or snippets, include minimal reproducible code that compiles under
   `tsc --noEmit` with `strict` enabled.

Conventional commit & release guidance for generated changes:

- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
- Document breaking changes in the changelog and include migration guidance in the PR body.

Notes for maintainers:

- This file is intentionally small and conservative. Expand it when decaf-ts patterns are
  further specified for your organization.

```
