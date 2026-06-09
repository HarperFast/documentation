**Section:** Developers. Evolves the schema system from Getting Started toward interactive examples and broader database/table configuration.

## Goals / Scope
- Build from the schema reference: `reference/database/schema.md`.
- Interactive examples: show what custom directives do via `curl`/`fetch`.
- Show Operations API usage (e.g. `create_table`) and CLI equivalents — `reference/operations-api/operations.md`, `reference/cli/commands.md`.
- Mention caching briefly, link to the shipped caching guides (`learn/developers/caching-with-harper.mdx`).
- Keep using the basic REST APIs from Getting Started for data interaction.
- Brief bonus section on replication; note v5 OSS does not enable replication by default.
- Keep scope lean — complex interaction comes later.

## Reference source material
- `reference/database/schema.md`, `reference/database/overview.md`
- Legacy narrative (optional): `git show 0f754c5f:docs/developers/applications/defining-schemas.md`

## Notes
- Dependency chain: first Developers-track guide → *Loading Data* → *Users & Roles* → *Querying* → *Real-Time* → *Custom Resources* → *Web Apps*.
