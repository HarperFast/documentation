# Harper v4 Reference Docs Plan

## Summary

This plan addresses two major transformations of the Harper v4 documentation:

**Horizontal Consolidation**: Merging versioned documentation from v4.1 through v4.7 into a single comprehensive v4 reference, using inline version annotations (similar to Node.js docs) to track when features were added, changed, or deprecated across minor versions.

**Vertical Reorganization**: Restructuring the documentation from role-based categories ("Developers," "Administration") to a flat, feature-based organization where Harper's core capabilities (CLI, Database, REST, MQTT, Components, Security, etc.) are prominently displayed as top-level sections.

### Key Strengths

**Feature-First Organization**: Core features like Static Files, Environment Variables, and MQTT become immediately discoverable as top-level sections rather than buried in nested hierarchies. This mirrors how successful API documentation (Stripe, Node.js) is structured and reflects how Harper is actually built - around plugins and features.

**Primary vs Secondary Reference Pattern**: Complex features that span multiple concerns (like Operations APIs used across different subsystems) have one exhaustive "primary" reference with other sections providing "quick reference" links. This solves discoverability without creating maintenance nightmares from duplication.

**Non-Collapsible Navigation**: Following the Learn section's pattern, all reference sections are visible immediately in the sidebar using `overview.md` files instead of hidden index pages. Users can visually scan the full feature list without clicking to expand nested sections.

**Pragmatic Legacy Handling**: Deprecated features (SQL, Custom Functions, Cloud) are moved to a dedicated `legacy/` section without extensive reorganization. This respects the evolution of Harper v4 while steering users toward current best practices.

**Intelligent Redirect Strategy**: Using sitemap analysis, Google Analytics data, and AI assistance to ensure existing documentation URLs remain functional, prioritizing the most-visited pages for perfect redirects while handling the long tail with catch-alls.

**Separation of Features from Concepts**: The plan distinguishes between standalone features (Components, Logging, REST) and cross-cutting concepts (caching, web applications) that are better documented as aspects of features or covered in Learn guides rather than separate reference sections.

This reorganization will significantly improve Harper documentation maintainability going forward, make v4 capabilities more discoverable to new users, and establish a solid foundation for v5 documentation.

---

The primary goal of this reorganization is to highlight key features of Harper and then pack as much information into it as possible. Thus the primary reorganization point is to no longer arbitrarily sort pages by attributes or tags like "developers" or "administration" and instead flatten out the structure and present content based on the most relevant feature.

We can generally follow a lot of what exists today as well as loosely use Harper's built-in feature list as a starting point. Any built-in plugin is really a core feature. Users shouldn't have to navigate through nested sections and pages to discover that Harper can support static file hosting. Static Files is a core feature and should be prominently displayed. More examples include: CLI, Configuration, Operations API, Security, Components, REST, Database, Resources, Environment Variables, (proper list in the outline below).

There will of course be some overlap, but by organizing by top-level feature we can ideally capture the core information for that feature all in one place. Then other sections that may overlap can link to the core reference while still providing some high-level information. If we want to get really fancy we can use MDX components or even store doc information in JSON and reference it programmatically throughout the section to ensure consistency across references.

For example, a lot of features have relative Operations APIs associated with them, such as `deploy_component`. The core `deploy_component` operation will be primarily documented in `reference/components/operations`. This will contain exhaustive information on the operation including all options, examples, edge cases, version history, etc. The same operation will also be listed on the `reference/operations-api/operations` page, but with only "necessary" or "quick" details such as description and options. This will then link out to the primary documentation reference for the operation in case users need more than a "quick" look. We'll utilize this pattern so that no matter how a user navigates the docs they should find what they are looking for.

Now obviously this could create synchronization issues if someone forgets to update the docs in one place but not the other. This is why things should only have one "primary" reference and be linked to from other "secondary" or "quick" references.

## Difference between a feature and concept

While we often advertise "caching" as one of Harper's key features, the reality is caching is a concept or aspect of other core features. Caching on Harper makes no sense to someone unfamiliar with our Resource API. So instead of having a dedicated top-level "Caching" section in the reference, we should concentrate on documenting the parts of the resource API and schema system that enable caching. Then accompany this with appropriate Learn guides that do focus on implementing certain caching examples.

Similarly, web applications are a feature of a variety of built-in and custom plugins.

## Deprecated/Legacy Content

There has been many changes over the course of v4, and many more to come in v5. Nonetheless, since we are collapsing documentation into major versions, we need to do something with content that is only relevant to a previous minor. Keep in mind that as long as we follow strict semver for our versioning, then we'll never have to deal with documenting a _removed_ feature in any singular major. I'm not necessarily going to solve for that circumstance because it really shouldn't happen.

However, we have historically deprecated or discouraged use of certain features over the course of a major version (custom functions, sql) while still maintaining support. We need a place to document these features less-prominently than active features so that we can continue to direct users in the right direction.

I believe this may be the only circumstance to make an exception to the general feature-based organization strategy (sorta). These legacy / deprecated / discouraged features should be nested within a top-level "Legacy" section. They can still be nested sections themselves, and potentially this is the one place we'd break the no-collapsing rule. The existing `/docs/reference/sql-guide` and `/docs/4.1/custom-functions/*` sections contain many pages. We really do not need to waste time rewriting or organizing this information. The simplest solution is to just take what exists and move it to a new `/reference/legacy/` sub path.

## Index.md vs Overview.md

One issue that has made our documentation confusing is the deep nesting of content. Users have to click many times to expand all the side-nav sections to potentially find the title they are looking for.

Furthermore, a lot of nested sections have index pages that may or may not contain important information. An index page is the page you see when clicking on a nested section title. Its not always clear that these nested section titles are even clickable.

As the Learn section demonstrates, section titles should be non-collapsible and not clickable. However, reference docs generally benefit from some sort of an overview section for general information and what not. As a result we have a choice: continue to use index pages (and iterate on making them more intuitively discoverable) or switch to an `overview.md` file that always exists at the top of any reference section.

This doc map assumes that we'd match the non-collapsible section headers like the Learn section has.
All sections and the docs within would be visible immediately.

This means no "index" pages as sometimes users don't realize it exists along with the nested content.
What would traditionally be an index page should now go into `overview.md`.

We may experiment with the index page pattern and compare/contrast, but I believe (based on the style and experience of the learn section), that this structure is least confusing.

## Scope and Flexibility of the Outline

The reference section outline below represents our best understanding of Harper v4's feature landscape based on documentation analysis from v4.1 through v4.7. However, it's important to note that this map intentionally walks a line between completeness and manageability.

**This is a living guide, not a rigid specification.** As implementation progresses, we expect to:

- **Discover additional pages or subsections** that make sense to add as we work through actual content migration
- **Consolidate pages** that turn out to have less content than anticipated
- **Split pages** that become unwieldy into multiple focused documents
- **Adjust organization** based on cross-referencing patterns that emerge during writing

**The map intentionally avoids overwhelming detail** in some areas. For example, MQTT configuration and security features (like mTLS) are noted but not broken into extensive subsections, even though they might warrant dedicated pages during implementation. Similarly, some features with significant cross-cutting concerns (security, configuration) are kept streamlined in the outline but will naturally expand to reference related sections throughout the docs.

**Feature-specific configuration and operations pages may fluctuate.** While some features clearly need dedicated configuration pages (like `logging/configuration.md`), others might fold configuration details into their overview or have configuration sufficiently covered in the central `configuration/options.md` page. These decisions will become clearer as we write the actual content.

The goal is to provide enough structure to guide implementation while remaining flexible enough to adapt to what we learn along the way.

## Version Annotations Strategy

Since we're consolidating v4.1 through v4.7 into a unified v4 reference, we need a consistent way to annotate when features were introduced, changed, or deprecated across minor versions. This follows the Node.js documentation pattern of inline version history.

### Annotation Patterns

**For new features:**
```markdown
## Relationships

Added in: v4.3.0

The `@relation` directive allows you to define relationships between tables...
```

**For changed features:**
```markdown
### Auto-increment Primary Keys

Changed in: v4.4.0

Primary keys can now auto-increment when defined as `Any`, `Int`, or `Long` types.
In previous versions, only GUIDs were supported for `ID` and `String` types.
```

**For deprecated features:**
```markdown
## SQL Querying

Deprecated in: v4.2.0 (moved to legacy in v4.7+)

SQL querying is still supported but discouraged. Consider using the REST API
or custom resources for querying data. See [Database](../database/overview.md)
for modern alternatives.
```

**For configuration options:**
```markdown
## Logging Configuration

### `logger.level`
- Type: `string`
- Default: `"info"`
- Added in: v4.1.0

### `logger.per_component`
- Type: `object`
- Default: `{}`
- Added in: v4.6.0

Allows granular logging configuration per component or plugin.
```

### Annotation Guidelines

- Use simple text annotations for now (no YAML frontmatter)
- Place version info prominently at the start of sections
- For minor changes within a feature, inline the version info with the specific detail
- Always indicate both when something was added AND when it changed significantly
- For deprecated features, provide guidance on modern alternatives
- When documenting operations APIs or configuration, include version info in tables/lists
- Focus on minor version (v4.3.0) unless a patch introduced the feature, then include patch (v4.3.2)

### Building Version History

When migrating content:
1. Start with v4.7 documentation as the base (most current)
2. Compare with earlier versions (v4.6 → v4.5 → ... → v4.1) to identify when features appeared
3. Use release notes to validate feature introduction versions
4. Use git diff between version folders to catch subtle changes
5. Annotate as you build rather than trying to add annotations retroactively

This approach ensures we preserve the evolution of Harper v4 while maintaining a single, coherent reference that serves users across all v4 minor versions.

## Reference Section Outline

```
reference/
├── cli/
│   ├── overview.md                  # High-level overview of the Harper CLI.
│   │                                # Include details such as general args, auth,
│   │                                # and provide a list of all available commands
│   │                                # with links to their appropriate detailed section
│   │                                # (in the other pages).
│   │
│   ├── commands.md                  # Detailed reference for each (non-operations api) CLI
│   │                                # command including light examples. Remember to link to
│   │                                # Learn section guides for more in-depth examples.
│   │
│   ├── operations-api-commands.md   # Detailed reference for each Operations API CLI command.
│   │                                # Even if it may seem repetitive (with the actual respective
│   │                                # operations api section), each command should clearly detail
│   │                                # itself including description and available arguments.
│   │
│   └── authentication.md            # (Optional) Specific reference for CLI authentication
│
├── configuration/
│   ├── overview.md                  # High-level overview of Harper configuration, such as
│   │                                # the `harper-config.yaml` file, configuration mechanisms,
│   │                                # and maybe some architecture notes such as how some core
│   │                                # features will require restarts, but other changes wont.
│   │
│   ├── options.md                   # List/table of all options. include brief descriptions and
│   │                                # any necessary info like data types and defaults.
│   │                                # Keep in mind that features will contain their own config
│   │                                # reference doc, and so this section should link out to the
│   │                                # relative detailed docs.
│   │
│   └── operations.md                # List/table of all operations related to managing configuration
│                                    # in detail.
│
├── operations-api/
│   ├── overview.md                  # High-level info on operations api including basics like request
│   │                                # shape and bonus features like health and open api endpoints.
│   │                                # Should include authentication info, and link to the specific
│   │                                # security pages for more details.
│   │
│   └── operations.md                # A complete simplified list of all operations that links out to
│                                    # specific sections for more details beyond short description and
│                                    # option data types.
│
├── security/
│   ├── overview.md                  # Deserves its own section since security is cross-feature and it
│   │                                # can encompass pages on the specific security related operations
│   │                                # and plugins like `tls`, JWT, and cert management.
│   │                                # Many other sections will link to here when mentioning auth.
│   │                                # The existing security section does a really excellent job of
│   │                                # organization information.
│   │
│   ├── basic-authentication.md      # Basic auth mechanism details
│   │
│   ├── jwt-authentication.md        # JWT auth mechanism details
│   │
│   ├── mtls-authentication.md       # mTLS auth mechanism details
│   │
│   ├── certificate-management.md    # Certificate management details
│   │
│   ├── certificate-verification.md  # Certificate verification (OCSP, etc.)
│   │
│   ├── cors.md                      # CORS configuration and usage
│   │
│   ├── ssl.md                       # SSL/TLS configuration
│   │
│   └── users-and-roles.md           # User and role management including `roles` plugin
│
├── components/
│   ├── overview.md                  # What are components? Evolution from custom functions to
│   │                                # components to applications/extensions to plugins.
│   │
│   ├── applications.md              # Application component details and API
│   │
│   ├── extension-api.md             # Extension API reference
│   │
│   └── plugin-api.md                # Plugin API reference
│
├── database/
│   ├── overview.md                  # Explain how Harper's data system is powered by Resources, but you don't
│   │                                # necessarily have to build custom resources to utilize the database system.
│   │                                # Detail how a lot is achievable using the schema system and auto rest api.
│   │
│   ├── schema.md                    # `graphqlSchema` plugin and the schema system. Including detailed api info
│   │                                # on the available directives and data types for schemas. likely a long page.
│   │                                # Can optionally break some parts out into their own pages like "blobs" and
│   │                                # "vector" as exists today.
│   │
│   ├── data-loader.md               # `dataLoader` plugin reference
│   │
│   ├── storage-algorithm.md         # Storage algorithm details
│   │
│   ├── jobs.md                      # Bulk data and jobs operations
│   │
│   ├── system-tables.md             # Harper system tables for variety of features
│   │
│   ├── compaction.md                # Storage compaction and compression details
│   │
│   └── transaction.md               # Transaction logging details
│
├── resources/
│   ├── overview.md                  # Split off from previous "data/" section since resources are generally for
│   │                                # custom implementations. The previous section is all schema and data stuff.
│   │                                # This one is all about building custom resources including the jsResource
│   │                                # plugin and global apis. Likely easiest to doc the plugin in this page and
│   │                                # use other pages for the api reference.
│   │
│   ├── resource-api.md              # Currently the resource api is split into two separate reference files that
│   │                                # are very similar but with the `loadAsInstance` thing have different signatures.
│   │                                # Easiest to stick to that model until we can simplify in future majors.
│   │
│   ├── global-apis.md               # `tables`, `databases`, `transactions` etc. 
│   │                                # `server` has its own section so mention and link.
│   │
│   └── query-optimization.md        # Query optimization details and best practices
│
├── environment-variables/
│   ├── overview.md                  # `loadEnv` plugin overview and usage
│   │
│   └── configuration.md             # Environment variable configuration options
│
├── static-files/
│   ├── overview.md                  # `static` plugin overview and usage
│   │
│   └── configuration.md             # Static file serving configuration options
│
├── http/
│   ├── overview.md                  # HTTP server overview and architecture
│   │
│   ├── configuration.md             # `http` configuration options
│   │
│   └── api.md                       # `server` global API reference
│
├── rest/
│   ├── overview.md                  # `rest` plugin and the overall system as it interacts
│   │                                # with things like schemas and custom resources.
│   │
│   ├── querying.md                  # REST querying syntax and capabilities
│   │
│   ├── headers.md                   # HTTP headers used by REST API
│   │
│   ├── content-types.md             # Supported content types (JSON, CBOR, MsgPack, CSV)
│   │
│   ├── websockets.md                # WebSocket support via REST plugin
│   │
│   └── server-sent-events.md        # Server-Sent Events (SSE) support
│
├── mqtt/
│   ├── overview.md                  # MQTT plugin overview, configuration, and usage
│   │
│   └── configuration.md             # MQTT-specific configuration options
│
├── logging/
│   ├── overview.md                  # Logging system overview and architecture
│   │
│   ├── configuration.md             # Logging configuration options (per-component, granular, etc.)
│   │
│   ├── api.md                       # Logger global API reference
│   │
│   └── operations.md                # Logging-related operations API
│
├── analytics/
│   ├── overview.md                  # Analytics system overview (resource/storage analytics, system tables)
│   │
│   └── operations.md                # Analytics-related operations
│
├── replication/
│   ├── overview.md                  # Replication system overview (native replication, Plexus)
│   │
│   ├── clustering.md                # Clustering configuration and management
│   │
│   └── sharding.md                  # Sharding configuration and strategies
│
├── graphql-querying/
│   └── overview.md                  # GraphQL querying feature (experimental/incomplete)
│
├── studio/
│   └── overview.md                  # Studio documentation (still ships with v4 but moving to legacy)
│
└── legacy/
    ├── cloud/                       # Legacy cloud documentation (replaced by Fabric)
    │
    ├── custom-functions/            # Custom functions (deprecated in favor of components)
    │
    ├── sql/                         # SQL guide (discouraged)
    │
    └── fastify-routes/              # Fastify routes (discouraged) 
```

## Redirects

One major concern with modifying the `/docs/` path is we've used this for many years for our documentation content. It is safe to assume that many backlinks to these pages exist across the internet. From our own content, to external posts written by community members. Thus, we must have a detailed plan for supporting these paths as we migrate to a new structure.

We can start by analyzing the docusaurus generated sitemap for all existing paths today. Then, using Google Analytics data for paths visited, we can find out what paths have been navigated to since we enabled analytics in October 2025. And finally, we can look to the existing redirects.ts file to understand what redirects have been created so far.

With a little help from AI, we can use these inputs to create a historical site map of paths we must ensure are redirected. With the analytics data, we can even understand exactly which paths are visited most frequently and depending on the volume, focus our efforts on redirecting the top N% of pages versus creating perfect redirects for all thousand pages.

That said, AI is also _pretty_ good at automating a redirect map too.

There is really a plethora of solutions here ranging from least to most effort and user experience. All paths must have a redirect, but effort is generally determined by how many of them will have "perfect redirects" to the most relevant content versus being included in a catch-all and how easy it will be to maintain the redirects overtime. And furthermore, many of our pages are duplicated across v4.2 to v4.7. If we assume we can safely redirect all of those duplicate pages, then the problem set significantly reduces.
