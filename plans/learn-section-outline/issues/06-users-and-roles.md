**Section:** Developers. Comprehensive guide to Harper's built-in User and Role system, scoping what it is and is not for.

## Goals / Scope

- Iterate on the users-and-roles reference: `reference/users-and-roles/overview.md`, `reference/users-and-roles/configuration.md`, `reference/users-and-roles/operations.md`.
- Explain how roles matter specifically to application developers.
- Define clearly: native Users & Roles is for **database permissions**, not for building custom user/auth systems.
- Framing: "if you are content with users/roles being an internally defined, structured thing, great — for more control over your user/role schema, build your own."
- Show enforcement across REST, Operations API, CLI — expected successes and errors.
- Link to security and authentication guides.

## Reference source material

- `reference/users-and-roles/*`
- Legacy narrative (optional): `git show 0f754c5f:docs/developers/applications/defining-roles.md`, `git show 0f754c5f:docs/developers/security/users-and-roles.md`
