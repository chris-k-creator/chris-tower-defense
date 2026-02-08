#!/usr/bin/env bash
# Generates a simple CHANGELOG.md from git history
# Run this from the repository root after committing changes.

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "Not a git repository. Initialize one first: git init && git add . && git commit -m 'Initial'"
  exit 1
fi

cat > CHANGELOG.md <<'EOF'
# Changelog

Generated from `git log` (most recent commits first)

EOF

# Append commits
git --no-pager log --pretty=format:"- %h %ad — %s" --date=short >> CHANGELOG.md

echo "CHANGELOG.md updated (written from git log)."