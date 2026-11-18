---
title: Search
---

# Search

Fabric Studio's search jumps straight to any organization or cluster you can access, by name, without clicking through the organization and cluster lists.

## Opening Search

Open search in either of two ways:

- Click **Search** in the top right of the navigation bar.
- Press <kbd>⌘</kbd> <kbd>K</kbd> on macOS, or <kbd>Ctrl</kbd> <kbd>K</kbd> on Windows and Linux.

The shortcut does nothing while your cursor is in a text field or code editor, so it never interrupts typing. Click outside the field first, or use the **Search** button.

## Finding an Organization or Cluster

Type part of a name. Results update as you type, and each one says whether it is an organization or a cluster; a cluster also shows the organization it belongs to.

Every word you type must appear in the result's name or in its organization's name, so adding an organization's name narrows the results to that organization's clusters. For example, `acme prod` finds a cluster named `prod` in the `Acme` organization, and leaves out clusters named `prod` in other organizations.

Results are ordered by how closely they match:

1. Names that match your search exactly
2. Names that start with your search
3. Names where each word you typed starts a word in the name
4. Names that contain each word you typed
5. Clusters that match only through their organization's name

Ties go to the organization you are currently in. With nothing typed, search lists your organizations first, starting with the current one, then their clusters.

Search shows up to 40 results at a time. If there are more, type more of the name to narrow them down.

## Opening a Result

Use <kbd>↑</kbd> and <kbd>↓</kbd> to choose a result and <kbd>Enter</kbd> to open it, or click it. Choosing an organization opens its page, and choosing a cluster opens that cluster. Press <kbd>Esc</kbd> to close search without leaving the page you are on.

## What Search Includes

Search covers:

- Organizations you are a member of, except locked memberships
- Clusters in those organizations that your role lets you view, except clusters that have been removed or terminated

Cluster names load in the background when you open search, so on accounts with many organizations, results can keep arriving for a moment after you start typing. If an organization's clusters fail to load, search says its results may be incomplete; select **Retry** to load them again.

Your search text stays in your browser. Studio matches it against names it has already loaded, and does not send it to Harper.
