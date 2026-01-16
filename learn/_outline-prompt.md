# Harper Learn Guide Outline Generator Prompt

Use this prompt to generate detailed outlines for new Learn section guide pages.

## Your Task

You are creating a detailed outline for a new Harper Learn guide page. Your outline should:

1. Follow the Learn guide template structure exactly
2. Match the writing style and prose-like nature of existing Learn guides
3. Build naturally on concepts from previous guides
4. Include detailed notes using comment syntax for content guidance
5. Not be a reference page - this is narrative, educational content

## Required Context Files to Review

Before creating the outline, you MUST read these files to understand context:

1. **`learn/index.mdx`** - Introduction to the Learn section
2. **`learn/getting-started/install-and-connect-harper.mdx`** - First guide, understand writing style
3. **`learn/getting-started/create-your-first-application.mdx`** - Second guide, what concepts are introduced
4. **Any existing `learn/` guides** - Check what content already exists to ensure natural flow
5. **Relevant `docs/` pages** - Source material for technical details (paths will be provided)

## Learn Section Philosophy (Key Points)

- **Narrative, prose-like guides** that teach concepts, not just list features
- **Build on previous guides** - always reference what was introduced earlier
- **Three target personas**: AI agents, "Get-it-done" developers, "Inquisitive" developers
- **Example-based and hands-on** - provide concrete, working examples
- **Ordered logically** - guides should be completable in sequence like a course
- **Independently referenceable** - each guide should also work standalone with proper prerequisites
- **End-to-end demonstrations** - fully show features in action, not partial examples
- **Link to reference docs** - guides teach, references provide complete technical details
- **Not promoting deprecated features** - focus on recommended approaches (e.g., avoid Fastify routes, SQL, clustering)

## Template Structure

Every Learn guide follows this structure:

```mdx
---
title: <Title>
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

{/* Introduction paragraph - 2-4 sentences providing a high-level description of what this guide covers and why it matters. Should connect to previous guides when applicable. */}

## What You Will Learn

{/* Bulleted list of specific learning outcomes - be concrete and actionable. 4-7 items typically. */}

## Prerequisites

{/* List required prior knowledge and tools. Always link to other guides for knowledge prerequisites. Include Harper installation requirements (CLI, local installation, or Fabric instance). May include repo templates or setup steps. */}

## <Content Section 1>

{/* AI Generated Outline: Detailed note about what content goes here, examples to include, concepts to explain, etc. */}

### <Subsection if needed>

{/* AI Generated Outline: More specific guidance for this subsection */}

## <Content Section 2>

{/* AI Generated Outline: ... */}

## <Final Content Section>

{/* AI Generated Outline: ... */}

## Additional Resources

{/* Links to:
- Related reference documentation pages
- Other relevant Learn guides
- External resources if applicable
- Can duplicate some prerequisite links
Should be the LAST section */}
```

## Comment Syntax for Notes

Use MDX-style comments with the prefix "AI Generated Outline:" for all guidance notes:

```mdx
{/* AI Generated Outline: This section should explain X concept. Include a code example using Y. Reference the Dog table from Getting Started. Build on the config.yaml knowledge from the Create Your First Application guide. */}
```

These comments should:
- Provide clear content guidance for the section
- Suggest specific examples or code snippets to include
- Reference previous guides and what concepts to build on
- Note connections to reference documentation
- Suggest visual aids (diagrams, code blocks, etc.)
- Indicate the appropriate level of detail (overview vs deep-dive)

## Writing Style Guidelines

When creating outline notes, guide the writer to:

1. **Use narrative, teaching-focused prose** - Explain concepts in a conversational, educational tone
2. **Build on previous knowledge explicitly** - "As you saw in Create Your First Application..." or "Remember the Dog table we created earlier..."
3. **Preview upcoming topics naturally** - "We'll explore this in depth in the Custom Resources guide..."
4. **Include concrete examples** - Prefer building on the Dog/first-harper-app example or similar
5. **Use code examples consistently** - Include both `curl` and `fetch` examples for HTTP requests
6. **Support both local and Fabric** - Provide instructions for both when relevant
7. **Teach the "why" not just the "how"** - Explain why something matters, not just what it does

## Example Comment Patterns

Good outline comments explain purpose and provide guidance:

```mdx
## Section Title

{/* AI Generated Outline: This section deepens the understanding of X introduced in [Previous Guide]. Start with a brief recap of what the user already knows, then explain [new concept]. Include a concrete example that extends the Dog table by adding [feature]. Show both the code and the result. Explain why this pattern is useful for [use case]. Reference the [Y Reference Doc] for complete technical details. */}

### Subsection Title

{/* AI Generated Outline: Provide a comparison between X and Y approaches. Use a simple table or bullet points to highlight key differences. Recommend when to use each approach with 2-3 practical scenarios. Keep this at a conceptual level - detailed API information belongs in the reference docs. */}
```

## Section Structure Guidance

Typical Learn guide sections (adapt based on content):

1. **Conceptual Foundation** - Explain the "what" and "why" of the topic
2. **Basic Implementation** - Simple, working example building on Getting Started
3. **Common Patterns** - Show 2-3 typical use cases
4. **Advanced Concepts** - Deeper features (but save some for future guides)
5. **Best Practices** - Recommendations and gotchas
6. **Debugging/Troubleshooting** - Common issues and solutions
7. **Transitional/Preview** - Set up expectations for next guides
8. **Additional Resources** - Links to references and related content

Not every guide needs all sections - adapt based on the topic.

## What to Include in Prerequisites

Prerequisites should list:

1. **Previous Learn guides** - Link to specific guides the reader should complete first
2. **Concepts assumed** - "Basic familiarity with X" or "Understanding of Y from previous guide"
3. **Tools required** - "Harper CLI", "Working Harper installation", "Node.js", etc.
4. **Setup requirements** - "Clone this repo template" or "Complete the setup from [guide]"

Don't list the general prerequisites (Node.js, HTTP client, etc.) unless it's a Getting Started guide - those are stated in the Learn index.

## What to Include in Additional Resources

Additional Resources should link to:

1. **Reference documentation** - Technical details for APIs, configurations, etc. used in the guide
2. **Related Learn guides** - Other guides that expand on related topics
3. **External resources** - Official docs for third-party tools (Next.js, GraphQL, etc.)
4. **Previous guides** - Can duplicate prerequisite links for convenience

Format as markdown bullet lists with descriptive link text.

## Content Balance

Learn guides should:

- **Teach concepts narratively** - Don't just list features or options
- **Include enough technical detail** to understand and use the feature
- **Link to reference docs** for complete API specifications and all options
- **Use working examples** that readers can follow along with
- **Build progressively** - Simple to more complex within the guide
- **Set up future guides** - Preview what comes next in the learning journey

## Common Mistakes to Avoid

1. **Don't create reference pages** - These are guides, not exhaustive documentation
2. **Don't skip connections to previous content** - Always build on what came before
3. **Don't use incomplete examples** - Show working, end-to-end demonstrations
4. **Don't assume knowledge not yet introduced** - Check prerequisites carefully
5. **Don't go too deep too fast** - Save advanced topics for later guides
6. **Don't forget both local and Fabric** - Support both where applicable
7. **Don't omit the "why"** - Explain why something matters, not just how to do it

## Recommendations for Docs Changes

After creating the outline, provide recommendations for how existing `docs/` pages should be updated now that this Learn guide will exist:

- Which sections can be removed (now covered in Learn)
- What should remain as technical reference
- What content might move to future Learn guides
- How to restructure for clarity

## Input Format

You will receive:

1. **Guide topic/title** - What this guide is about
2. **Target section** - Where it fits (Getting Started, Developers, Administration)
3. **Outline notes** - Specific requirements and sections to include
4. **Source material** - Which `docs/` pages to pull information from

## Output Format

Provide:

1. **The complete MDX outline file** - Ready to save with all comment notes
2. **Summary of the outline** - Brief explanation of structure and flow
3. **Recommendations for docs changes** - What to update in existing documentation
4. **Notes on writing style** - Reminders about tone, examples, and connections to make

---

## Now Create the Outline

Based on the input provided below, create a detailed outline for a new Harper Learn guide following all the guidelines above.

**Input will be provided by the user in the conversation.**
