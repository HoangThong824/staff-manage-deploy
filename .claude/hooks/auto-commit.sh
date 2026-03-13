#!/bin/bash
# .claude/hooks/auto-commit.sh

# Lấy file thay đổi gần nhất (từ env hoặc fallback)
FILES_CHANGED=$(git diff --name-only HEAD)

if [ -z "$FILES_CHANGED" ]; then
  echo "No changes to commit"
  exit 0
fi

# Commit message đơn giản dựa trên files
MSG="Claude auto: refactor/update ($(echo "$FILES_CHANGED" | head -n 3 | tr '\n' ', ' | sed 's/,$//'))"

git add -A
git commit -m "$MSG" --no-verify || true
echo "Auto committed: $MSG"