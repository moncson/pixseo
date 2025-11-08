#!/bin/bash
# .nextディレクトリをFunctionsディレクトリにコピーするスクリプト

# プロジェクトルートの.nextディレクトリをFunctionsディレクトリにコピー
if [ -d ".next" ]; then
  echo "Copying .next directory to functions..."
  # 既存の.nextディレクトリを削除してからコピー
  rm -rf functions/.next
  cp -r .next functions/.next
  echo ".next directory copied successfully"
else
  echo "Error: .next directory not found. Please run 'npm run build' first."
  exit 1
fi

