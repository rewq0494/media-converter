#!/bin/bash
# Media Converter 啟動腳本

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

if ! command -v node &>/dev/null; then
  if [ "$(uname)" = "Darwin" ]; then
    osascript -e 'display alert "找不到 Node.js" message "請先安裝 Node.js (https://nodejs.org)"'
  else
    echo "請先安裝 Node.js (https://nodejs.org)"
  fi
  exit 1
fi

npx electron . &
