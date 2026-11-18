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

While you're working in a cluster you've signed in to, search also finds that cluster's pages: **Applications**, **Databases**, **APIs**, **Operations**, **Status**, **Logs**, and the pages under **Config** that you can open. Each page result shows where it lives, such as **Config › Infrastructure** for **Domains**.

You can find a page by its name or by the name of its group. A few pages also match related words. For example, `domain name` or `hostname` finds **Config** > **Domains**, where you manage the cluster's [custom domains](./custom-domains.md). So does any domain attached to the cluster, such as `api.example.com`.

Choosing a page opens it directly. With nothing typed, search lists the cluster's pages first, in menu order.

Page results appear only while you're inside the cluster. Leave it, for example to return to your organization's page, and search goes back to finding organizations and clusters.

## Choosing a Result

Results update as you type, with the closest matches first.

Use <kbd>↑</kbd> and <kbd>↓</kbd> to choose a result and <kbd>Enter</kbd> to open it, or click it. Press <kbd>Esc</kbd> to close search without leaving the page you're on.

Search shows up to 40 results at a time. If you don't see what you're looking for, type more of its name.
