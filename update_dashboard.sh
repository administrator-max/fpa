#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# update_dashboard.sh
# Usage: ./update_dashboard.sh "path/to/new_dashboard.html"
# Overwrites index.html, commits, and pushes to GitHub + Heroku.
# ─────────────────────────────────────────────────────────────
set -e
NEW_FILE="$1"
if [ -z "$NEW_FILE" ]; then echo "❌  Usage: ./update_dashboard.sh \"path/to/new_dashboard.html\""; exit 1; fi
if [ ! -f "$NEW_FILE" ]; then echo "❌  File not found: $NEW_FILE"; exit 1; fi
echo "📄  Copying new file to index.html..."
cp "$NEW_FILE" index.html
echo "📦  Git add + commit..."
git add index.html
git commit -m "chore: update dashboard $(date '+%Y-%m-%d %H:%M')"
echo "🔀  Push to GitHub..."
git push origin main
echo "🚀  Push to Heroku..."
git push heroku main
echo ""
echo "✅  Dashboard updated and deployed!"
