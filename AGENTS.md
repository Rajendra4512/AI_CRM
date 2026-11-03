# AI Development Rules

## Token Efficiency
- Identify relevant files before reading code.
- Search filenames, imports and symbols first.
- Never scan the entire repository unnecessarily.
- Read only relevant code sections.
- Avoid repeatedly reading unchanged files.
- Keep responses concise.

## Development
- Reuse existing components and services.
- Avoid duplicate implementations.
- Make minimal, targeted changes.
- Preserve existing working functionality.
- Do not perform unrelated refactoring.

## Testing
- Test only affected functionality.
- Avoid full application rebuilds unless required.
- Do not run broad test suites unnecessarily.

## Security
- Preserve tenant isolation and role permissions.
- Never expose credentials or secrets.
- Do not modify database schemas without approval.

## Completion
- Summarize changes briefly.
- List modified files.
- Report testing results.