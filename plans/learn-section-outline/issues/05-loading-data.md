**Section:** Developers. Builds on the tables from *Defining Databases and Tables*; demonstrates bulk loading via the Data Loader plugin and other mechanisms.

## Goals / Scope
- Multiple ways to load data, kept approachable (no deep auth/roles yet — that is the next guide).
- Use Data Loader to explain the Harper application lifecycle: it survives restarts → frame Harper as a long-running system and how to think about lifecycle in dev vs production.
- Full end-to-end: load data → query with basic REST / Operations / CLI.
- Audience is ~4 guides in: comfortable with key concepts, not experts.

## Reference source material
- `reference/database/data-loader.md`
- Legacy narrative (optional): `git show 0f754c5f:docs/developers/applications/data-loader.md`

## Notes
- Related existing issue #513 (Document Harper restart behavior and guarantees) covers the lifecycle/restart framing — cross-link or fold in.
