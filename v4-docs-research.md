# v4 Docs Map

The point of this is to figure out the documented evolution of Harper features and subsystems from v4.1 to v4.7 in order to create a holistic solution for reorganized singular major v4 versioned docs. 

This is aligned with renaming `docs/` to `reference/` and furthering the ideal separation of prose content into `learn/`.

The structure I'm hoping to work towards is a single `reference/` folder layout that ideally has any _active_ features top-level. Then if there are legacy, deprecated, or even removed features (from a latest version), they will be documented in some sub-path such as `reference/legacy/` or something like that. 

When a feature has changed over time and some part of it is still active, but some other aspect has been deprecated; that feature should still live at top-level, but then that specific detail will be indicated as legacy/deprecated/removed.

Since we are operating within a single major version; there realistically shouldn't have been any "removed" features.

This information will also be extremely useful for guiding us on feature scope for v5 and beyond.

My plan is to go through versioned docs folders one by one and try to logically piece together a map. I've given AI a couple runs at this. Including evaluating release-notes and everything else. Unfortunately, it doesn't do a great job and creating the correct timeline. Furthermore, it gets awfully confused by things like the evolution of custom functions to components to applications/extensions and finally plugins. So while I'm sure with enough context and better prompting an AI could figure out, I believe this will be easier to complete with a human touch; especially since I'm quite familiar with harper feature set already.

## v4.1

Top Level sections include:
- Installation
  - Replaced by both newer installation instructions and learn guides
- Getting Started
  - Replaced entirely by learn guides
- External API docs (api.harperdb.io) which has since been redirected to operations api 
- Studio
  - We'll keep this around for now since it is still shipped with v4
- Cloud
  - No longer need to support these pages; cloud has been fully replaced by fabric
- Security
  - Lots of these pages still exist today but have been updated. 
  - In general I don't think there is anything in here that would be version specific; other than the larger concepts. 
  - This section has "JWT" and Certificate Management. in later harper versions we've likely added to those and so we'll detail that version specificity in the respective pages. 
    - Like there should be something that dictates that JWT support has existed as early as v4.1
    - But say some other scheme (Cookies?) didn't work until whatever minor version
- Clustering
  - Nested
  - More detailed config info for `clustering:` section.
  - includes some high level info for the feature
  - includes some ops apis
- Custom Functions
  - Nested
  - Very operations-api based
  - Also includes some ops apis like `restart_service` for reloading custom functions (we have component apis analogous to this today)
  - I think this section highlights how we'll need some sort of "legacy" ops api page or if things have been renamed and updated we need to ensure its detailed that something like `add_custom_function_project` has become _whatever_ in todays ops api
- Add-ons and SDKs
  - I believe we've deleted this page in latest versions; i think all of this external stuff is out of date today and wouldn't necessarily work even if we had a v4.1 user so we can keep it removed
- SQL Guide
  - nested pages of SQL info
- CLI
  - functional reference page; details many commands that still exist today
  - we'll need to do a special detailed analysis of command additions/changes over time as we merge this content
- Configuration
  - Very similar to the configuration page we have to day split up by sections
  - we'll need to do a special detailed analysis of this page as we merge versions to ensure we correctly document the version history of option additions/changes
  - Introduces the naming conventions (snake_case) we still use today
- Logging
  - High-level explanation of structure logger
  - No JS api info
  - References to config (but links to configuration page)
- Transaction Logging
  - (Operations API)
  - Moved to `` in the future
- Audit Logging
  - (Operations API)
  - Moved to `` in the future
- Async Jobs
  - (Operation API)
  - This is moved to Operations API / Jobs in the future
  - Looks almost identical; will need to do exact argument analysis later when reviewing operations API info
- Upgrade
  - At this point in the doc history this page simply details how to update the harper version globally installed via nvm or npm or whatever package manager
  - It also details that harper automatically handles upgrades by just running the `harperdb` command
- Reference
  - Content Types
    - JSON, CBOR, MsgPack, CSV
    - All of these still exist today; and there is a standalone content type page
  - Data Types
    - This becomes schema docs in the future
  - Dynamic Schema
    - This becomes schema docs in the future 
  - Headers
    - `server-timing`, `hdb-response-time`, `content-type`
  - Limits
    - Schema Naming restrictions
    - Table limitation (attribute maximum)
  - Storage Algorithm
- Support
  - This doesn't need its own page anymore. We include links to things like discord and support email in multiple places throughout docs site

## v4.2

First time pages have been nested into top-level sections Getting Started, Developers, Administration, Deployments, Reference. I think we absolutely want to get rid of these top level sections as they are just a bit confusing for reference docs. Its just more decisions a new user has to figure out on their own. When instead the left sidebar should just list as many top-level topics as it reasonably can so users can visually scan. Of course not everything has to be top-level.

- Getting Started
  - Completely replaced by Learn
- Developers
  - Familiar structure to todays docs containing:
  - Applications
    - Guide like that has been / will be replaced by Learn content
    - Subsections:
    - Caching
      - This is a key feature 
    - Debugging
      - This isn't necessarily a reference page; replaceable by Learn guide and cross links from configuration page (thread.debug) to Learn guide focussing on debugging
    - Fastify Routes
      - Should become a reference page for Fastify plugin
    - Schemas
      - Should become a reference page for all details of schema system
      - Also likely accompanied by detailed usage implementation guide in Learn
    - Examples
      - Marketing wants to have a page like this likely in Learn to start
  - Components
    - Oof! This is a confusing section; and I remember fixing this in later docs versions.
    - So this subsection details the concept of Components; related them to "Applications" and "Extensions" too but also encapsulates pages for things like "Drivers", "Google Data Studio", "SDKs", etc.
    - This has its own Operations page and Installation page too
    - This obviously will continue to have its own top-level section which will properly encapsulate applications, plugins, etc. (in-fact we already have the start of this in docs/reference/components now so we'll build off of that)
  - Operations API
    - First time having its own standalone section containing sub pages for all operations api types
    - Likely want to retain something like this and ensure this is the single source of reference for all operations apis. feature pages should link to this directly  
  - Real-Time
    - This page still exists today in a similar fashion
    - Need to consider making this nested i think and having dedicated pages for MQTT, WS, etc. 
    - Similar to ongoing idea below, likely want to have detailed ops/config info for any of these core features in their own reference section that parallels and links to/from other pages like a general overview pages. Akin to the general config or ops api page ideas, we could have another one for Real-Time that succinctly details the subsystems available, but then links out to reference and learn content depending what user wants. 
    - nonetheless things like mqtt is a standalone plugin; document it as such
    - but something like ws isn't exactly; its a feature of REST so ensure its appropriately organized by the plugin and well referenced for other sensible locations. 
    - In this regard we may not need a top-level "Real Time" page. These specific features MQTT, WS, do deserve detailed reference pages and sections, but we don't have to arbitrarily group them like this.
  - REST
    - should remain top level but is truly a built-in plugin. can be structured like other plugin docs
    - may need to think through how to incorporate all the configuration and subfeatures of this. like ws and interconnectedness with Resource API and things like content types. this goes back to the organization of information problem that this could live under an umbrella like "HTTP" or "Networking", but is there value in having higherlevel pages or can we just list this top-level along with everything else
  - Security
    - This might exist in v4.1 but aligned with some of the current thinking, this section has a "Configuration" page ... is this more like what we want out of dedicated sections for features and then having detailed subsections for similar parts? 
    - Instead of having a whole `security/configuration` page, I believe this could live in a root, or the relative configurations should go into a more specific topic. like `security/cors` and that can contain general reference as well as specific configuration info
    - Otherwise, seeing some trend of existing feature scope here like Basic auth, Cert mgmt, JWT, and Users & Roles
    - So just like other places; we likely don't need to lump these all into a "Security" subsection and they could just have their own top-level reference topic.
- Administration
  - Best Practices
    - This info should be migrated to a learn guide
  - Clone Node
    - A lot of configuration info; likely need to see how this maps to overall configuration changes over versions
    - Needs a learn guide for sure but also some reference for the relative configuration options or ops apis
  - Studio
    - This was moved around from old version and still persists today
  - Jobs
    - same as v4.1 page; should just exist top level or be completely folded into operations api
  - Logging
    - nested all three "Audit", "Standard", and "Transaction"
    - again, why nest? and furthermore, most of these pages are just operations reference. 
- Deployments
  - Configuration File
    - Good start to an important reference page. as i've written else where, I likely want to have a configuration page be more general and then list out all options but link out to specific pages for detailed description and usage patterns.
  - CLI
    - similar as before; good reference and could use more detail and structure
  - Cloud
    - remove! replaced by fabric
  - Install
    - this is a learn guide now; any other info should be included else where like configuration page (in a subsection about say necessary installation variables or the like)
    - The "On Linux" subpage should be a learn guide if its even still relevant.
  - Upgrade
    - likely can be removed or more simply retained. not as much upgrade info today. 
    - if there is actually some sort of api feature then it can documented in reference. but its just behavior of installation or something then absolutely simplify
- Reference
  - Many of the following subsections can exist as is; this is the basis for what we want this whole `/docs` section to become. 
  - Analytics
    - this is just a table; theres a few of these "system" tables that we could detail somewhere more technically 
  - Architecture
    - high level info that would fit better in an earlier page or in something like applications
    - new learn content already has this info in it.
    - v4.2 contains a relatively simple and still relevant ascii diagram we could bring back!
  - Clustering
    - generally just keep this as is
    - this is actually a good example of the ops api pattern I want other subsystems to align with. All the nitty gritty detail is in here including ops apis and such. Any other pages with this info are light and should generally link to this.
  - Content Types
    - Same as before; hasn't changed much.
    - notes this is specific to operations api
    - how does this apply to rest endpoints and custom resources exactly?
    - what about adding additional content types? (or is that a later version feature)
  - Data Types
    - same as before; should be folded into a schema reference
  - Dynamic Schema
    - as early as v4.2 we have this information disorganization where the user needs to read multiple different pages to even understand what the schema system is made of. if they missed the "defining schema" guide early on then this page and the previous make little sense. 
    - schemas system needs a detailed reference page! 
  - Globals
    - beginning of some js api reference docs that are important for extensions (at this time), but now applications and plugins
  - Headers
    - looks like we've already removed one of the headers previously defined in v4.1
  - Limits
    - same page as before; very light on information. not sure how relevant it is today
  - Resource Class
    - need to take a close look at this reference page especially how its evolved over latest versions. its very detailed and complete enough but as we merge versions need to take special care about documenting appropriate versions where things were added or modified.
  - SQL
    - same as before; likely being moved to a "legacy" or "deprecated" section in latest docs
  - Storage Algorithm
    - useful technical info; where is this today? Could likely be apart of a larger "DB" section or something or just "Additional Technical Details" as it doesn't have too much relevant info for app or even plugin devs.
  - Transactions
    - is this another global api? 
    - need to see what the state of this is today and ensure its represented in appropriate places like globals page
    - now maybe global page needs to be high level and we need separate pages for each api within it too? like logger could exist in logger of course. all the server stuff could exist in a Networking or simply "Server" part.

## 4.3

In v4.3, the docs didn't change much. There are only a couple new files `administration/compact.md` and `developers/security/mtls-auth.md`. Within the `administration/harperdb-studio/` directory, a few files changed between the versions.

The different file paths can be retrieved using:

```javascript
let v42 = fs.readdirSync('versioned_docs/version-4.2', { recursive: true });
let v43 = fs.readdirSync('versioned_docs/version-4.3', { recursive: true });
let v42_set = new Set(v42);
let v43_set = new Set(v43);
// Files removed/renamed in v43
v42_set.difference(v43_set);
// Set(4) {
//   'administration/harperdb-studio/instance-example-code.md',
//   'administration/harperdb-studio/manage-clustering.md',
//   'administration/harperdb-studio/manage-functions.md',
//   'administration/harperdb-studio/manage-schemas-browse-data.md'
// }
// Files created/renamed in v43
v43_set.difference(v42_set);
// Set(5) {
//   'administration/compact.md',
//   'administration/harperdb-studio/manage-applications.md',
//   'administration/harperdb-studio/manage-databases-browse-data.md',
//   'administration/harperdb-studio/manage-replication.md',
//   'developers/security/mtls-auth.md'
// }
```

Looking at the 4.3.0 release notes, we see a number of new features:

- Relationships and Joins with the `@relation` custom directive in schemas
- OpenAPI specification from ops api `GET /openapi`
- General query optimizations
- Indexing `null` values enabling querying by nulls `GET /Table/?attribute=null`
- CLI expanded to support certain ops apis
- BigInt support in schema system
- Studio upgrade
- MQTT upgrades such as mTLS support, single-level wildcards, CRDT, config changes, and more.
- Storage perf improvements with compaction and compression

There may be other changes too; but since the file structure is mostly the same we can likely utilize git `diff` to determine any notable changes to things.

## 4.4

A similar analysis comparing 4.4 to 4.3 shows that there are a number of new docs files. There was a bit of moving things around and renaming some things (like harperdb-cli.md to harper-cli.md) which causes a little confusion in the file history. but notably 4.4 was when we started adding distinct files for components (like built-in.md, managing.md, and reference.md); this was the first pass at really updating the definition for components overall. Furthermore, this version contains things like native replication and so some new pages exist for that. Finally, this was also about when we started creating things like Next.js support so files like `developers/applications/web-applications.md` was added.

Unfortunately, it looks like in [#303 (Restructure developer onboarding)](https://github.com/HarperFast/documentation/blob/ade07fd9428b0321c047ac8243ad1106bb0de2a8/versioned_sidebars/version-4.4-sidebars.json) the `developers/` tab in the sidebar was removed and has gone unnoticed for ~ 4 months.

The paths still exist, but are just missing from the sidebar navigation.

The 4.4.0 release note outlines all new features for this minor:

- Native Replication (codename Plexus) which uses direct WS connections
- Replication sharding as part of the new system
- Replicated operations and rolling restarts for clustered nodes
- Computed Properties for schema system
- Custom indexing using computed properties
- Native GraphQL querying support (experimental; provisional; incomplete)
- Dynamic certificate management
- Custom resource methods can now return `Response` objects (or a Response-like object)
- Auto-increment primary keys when defined as type `Any`, `Int`, or `Long`. `ID` and `String` continue to use GUIDs.
- Installation now includes dev v prod defaults
- Exported resources can now be configured to be specifically exported by a certain protocol (REST, MQTT, etc.) for more granular control over what is exported where

## 4.5

There is really only one new file in v4.5, `reference/blob.md`, but the list of features is longer than before:

- Blob storage
- password hashing upgrade (sha256, argon2id)
- resource and storage analytics
- Default replication port was changed from 9925 to 9933
- Expanded property access even if they aren't defined in a schema
- Storage reclamation (more of a platform feature than any kind of api)
- Expanded sharding functionality 
- Certificate revocation in clustering
- Built-in `loadEnv` plugin for environment variable loading
- `cluster_status` operation updates
- Improved URL path parsing for resources
- `server.authenticateUser` API 
- HTTP/2 support fo api endpoints (`http2` option)
- transactions can now be reused after calling `transaction.commit()`
- GraphQL query endpoint can be configured to listen on different ports; its also now disabled by default to avoid conflicts
- Global file handling improvements for components
- `Table.getRecordCount()` api
- Removed record counts from REST API

## 4.6

There are more file changes in v4.6 docs; this is when I added numerous files for components and moved them from `developers/` to `reference/`.

This is also when more resource reference pages were added

In addition to that new features include:

- Vector indexing: HNSW alg for tables
- Improvements to Extension system
- Plugin API!
- Logging improvements (granular configuration, per plugin/app configuration)
- Data Loader built-in plugin
- resource API changes (loadAsInstance and what not)
- Fixed `only-if-cached` behavior to not make a background request

## 4.7

Only one new file; `'developers/security/certificate-verification.md'`

Feature list much smaller:
- individual component status monitoring 
- OCSP support
- new analytics and licensing functionality (for Fabric)
- Plugin API changes

## Migration Ideas

From early on (v4.1) many features were fully controlled by ops apis. And at first they were presented based on the feature at hand. Like "Clustering", "Custom Functions", etc. and within the docs for that feature it included whatever relevant ops apis were needed. This makes me think that while we should have a technical reference for _all_ operations apis, it may be valuable to also associated specific ops apis with their relative feature. Like how is a user supposed to know if they want to do _clustering_ that they need to first look "ops apis"? Having a top level "Clustering" is valuable. That said; this is in part what the Learn section is meant to solve. Users should learn about how to Clustering via Learn guides. And then they can click through to reference pages for any other information. We also have Search in order to discover whatever specific ops apis. I think organizing the ops apis under an "Operations APIs" section is still correct but we should ensure discoverability. Maybe we don't nest it and just have them all viewable by default as soon as someone is looking at the left sidebar in Reference.

Just from reviewing v4.1 docs it is starting to show ideal core systems to document such as CLI, Operations API, Configuration, Schemas, Logging. Like the previous paragraph stated, some thought needs to be given to how information is organized. Logger is a great example of having configuration details, usage details, and API reference details. So should all of that exist under "Logging" or should it be spread out between sections? I think the reality is we'll need a bit of "both". Where there should be top-level sections "Configuration" and "Logging". Under configuration, it should have the general info about the config file and snake_case mapping to CLI options or operations API values, and it should list out all available configuration properties in a structure way (think JSON schema). Include short descriptions, but for any actual detail around say the `logger` section, it should link out to the Logging section for further information. Like expanded descriptions for example. Additionally, any "guide" or usage like info should be delegated to learn guides. But with this thinking; how should operations apis be documented? 

Should we simplify Ops Api section to include general ops api info (requests, endpoints, w/e), and then have a table/list of available (and deprecated) ops apis with short descriptions and then links out to other docs (related to the respective feature) that details the op? 

Could we introduce some form of a "tag" system for pages? This could help with information organization as we could get rid of top-level pages like "Real-Time" or "Security" and just tag relevant sections based on some of those top-level topics. We could incorporate these tags into search or even some of navigation mechanism. This may be more satisfactory of a compromise for self-navigation. Its simpler than trying to come up with overly organized top-level sections, and is better than search (though AI search would definitely trump this). I think a fundamental issue is that users still are hesitant to use search since its traditionally such a poor experience. Now with AI baked in its improved tremendously but still users aren't gravitating towards it. Many are simply used to self-navigating and so we need to find some compromise. Going back to concept of "tags", idk if that necessarily solves that problem unless we introduce a more interactive search page. I think i'd rather just ensure that searching `"networking"` will actually return pages like HTTP, REST, MQTT, w/e.

As I make my way through later v4 minors (4.3, 4.4, 4.5) its starting to show how the docs structure from as early as 4.2 doesn't change all too much. If I can sufficiently map out the top-level features to document, then come up with a reasonable format/structure for pages (like how to actually detail changes over versions), we should be in a really good place. Overall we'll significantly simplify the reference docs and make it much easier to maintain going into v5. We'll meet our obligation to provide "support" for existing v4 minors since we'll have changes documented. We've done an excellent job not breaking any apis over the development of v4 so in theory there shouldn't be much concern if say a v4.5 user was reading v4 docs which are more representative of latest v4.7 information but also contain notes about how things had changed for any particular part from v4.5 to v4.6 and beyond.

The real challenge in all of this is to figure out the high-level organization of information. I've flip-flopped a bit between high-level general pages and how everything should be organized, but I think through a lot of this it seems apparent we should document individual plugins and features thus the docs will logically map to the implementation. There will obviously be some cross-cuts, but i think organizing by feature makes the most sense. 