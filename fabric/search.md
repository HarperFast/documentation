---
title: Search
---

# Search

Search in Fabric Studio takes you straight to an organization, a cluster, or a page inside the cluster you're signed in to, without clicking through menus.

## Opening Search

Open search in either of two ways:

- Click **Search** in the top right of the navigation bar.
- Press <kbd>⌘</kbd> <kbd>K</kbd> on macOS, or <kbd>Ctrl</kbd> <kbd>K</kbd> on Windows and Linux.

The shortcut does nothing while your cursor is in a text field or code editor, so it never interrupts typing. Click outside the field first, or use the **Search** button.

## What You Can Find

### Organizations and Clusters

Search lists your organizations and their clusters. Type part of a name to find one. Each result says whether it's an organization or a cluster, and a cluster also shows its organization.

Every word you type must appear in the name or in its organization's name, so adding an organization's name narrows the results to that organization's clusters. For example, `acme prod` finds a cluster named `prod` in the `Acme` organization, and leaves out clusters named `prod` in your other organizations.

Choosing an organization opens its page, and choosing a cluster opens that cluster.

### Pages in Your Cluster

Once you sign in to a cluster, search also finds the pages inside it. For example, typing `domain` finds that cluster's **Config** > **Domains** page, where you manage its [custom domains](./custom-domains.md).

Choosing a page opens it directly.

## Choosing a Result

Results update as you type, with the closest matches first.

Use <kbd>↑</kbd> and <kbd>↓</kbd> to choose a result and <kbd>Enter</kbd> to open it, or click it. Press <kbd>Esc</kbd> to close search without leaving the page you're on.

Search shows up to 40 results at a time. If you don't see what you're looking for, type more of its name.
