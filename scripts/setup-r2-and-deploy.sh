#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Creating R2 bucket open-lovable-uploads..."
pnpm exec wrangler r2 bucket create open-lovable-uploads

echo "→ Deploying Worker with R2 binding..."
pnpm deploy:cf

echo "✓ R2 aktif. Upload logo di /admin/settings akan tersimpan di R2."
