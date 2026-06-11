#!/usr/bin/env bash
# Phase 1 — create the outstanding [Learn] tracking issues from the body files in
# ./issues/. Each issue is labeled `content` and typed `Feature`.
#
#   ./create-issues.sh            # dry-run (lists what would be created)
#   ./create-issues.sh --create   # actually create issues
#
# Skips guides #2 (using-agents), #3 (harper-applications-in-depth) and the #11
# caching series — those are already shipped in learn/.
#
# `gh` (<= 2.92) has no `--type` flag, so the issue type is applied via the REST
# API immediately after creation. Org issue type "Feature" must exist.

set -euo pipefail

REPO="HarperFast/documentation"
LABELS="content"
ISSUE_TYPE="Feature"
DIR="$(cd "$(dirname "$0")" && pwd)/issues"
create=false
[[ "${1:-}" == "--create" ]] && create=true

# Manifest: "title|body-file" (order encodes the intended authoring sequence).
ISSUES=(
  "[Learn] Deploy to Fabric|01-deploy-to-fabric.md"
  "[Learn] Defining Databases and Tables|04-defining-databases-tables.md"
  "[Learn] Loading Data|05-loading-data.md"
  "[Learn] Users & Roles|06-users-and-roles.md"
  "[Learn] Querying and Interacting with Data|07-querying-interacting.md"
  "[Learn] Real-Time Data Access Introduction|08-real-time-intro.md"
  "[Learn] Custom Resources|09-custom-resources.md"
  "[Learn] Web Apps|10-web-apps.md"
  "[Learn] Data with Replication|12-data-with-replication.md"
  "[Learn] Plugin Development|13-plugin-development.md"
  "[Learn] Running Harper Locally|14-running-locally.md"
  "[Learn] Running Harper in a Container|15-running-in-container.md"
  "[Learn] Fabric Deployment Guide|16-fabric-deployment.md"
  "[Learn] Manual / Local Replication Setup|17-manual-replication-setup.md"
  "[Learn] Logging|18-logging.md"
  "[Learn] Analytics & Grafana Plugin|19-analytics-grafana.md"
  "[Learn] Certificate Management & Verification|20-certificates.md"
  "[Learn] Security Configuration|21-security-configuration.md"
  "[Learn] Compaction|22-compaction.md"
  "[Learn] Jobs|23-jobs.md"
)

for entry in "${ISSUES[@]}"; do
  title="${entry%%|*}"
  file="$DIR/${entry##*|}"
  [[ -f "$file" ]] || { echo "missing body: $file" >&2; exit 1; }
  if $create; then
    url=$(gh issue create --repo "$REPO" --title "$title" --label "$LABELS" --body-file "$file")
    num="${url##*/}"
    gh api --method PATCH "repos/$REPO/issues/$num" -f "type=$ISSUE_TYPE" >/dev/null
    echo "created: $title (type=$ISSUE_TYPE) -> $url"
  else
    echo "would create: $title   (label: $LABELS, type: $ISSUE_TYPE, body: issues/${entry##*|})"
  fi
done

echo
echo "Total: ${#ISSUES[@]} issues."
$create && echo "Done." || echo "DRY RUN — re-run with --create to create these issues."
