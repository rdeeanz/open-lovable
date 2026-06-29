# Deploy Open Lovable ke Cloudflare (Workers + D1 Free Tier)

Panduan deploy aplikasi ke **Cloudflare Workers** dengan **D1** (database SQL gratis) dan **R2** (upload logo).

## Prasyarat

- Akun [Cloudflare](https://dash.cloudflare.com) (gratis)
- Node.js 20+ dan pnpm
- API keys: Firecrawl, minimal satu AI provider, Vercel Sandbox (untuk code generation)

## 1. Login Wrangler

```bash
pnpm exec wrangler login
```

## 2. Buat D1 Database (Free Tier)

```bash
pnpm exec wrangler d1 create open-lovable-db
```

Salin `database_id` dari output, lalu tempel di `wrangler.jsonc`.

## 3. Buat R2 Bucket (Free Tier)

```bash
pnpm exec wrangler r2 bucket create open-lovable-uploads
```

## 4. Jalankan Migrasi D1

```bash
pnpm db:migrate:local   # preview lokal
pnpm db:migrate:remote  # production
```

## 5. Set Secrets

```bash
cp .dev.vars.example .dev.vars
pnpm exec wrangler secret bulk .dev.vars
```

## 6. Preview & Deploy

```bash
pnpm preview:cf
pnpm deploy:cf
```

## Arsitektur

| Komponen | Cloudflare |
|----------|------------|
| Next.js | Workers + OpenNext |
| Users & settings | D1 (SQLite) |
| Logo | R2 |
| AI Sandbox | Vercel/E2B (eksternal) |

## Dev lokal (filesystem)

```bash
pnpm dev
```

Tetap memakai `data/*.json` tanpa D1.


## Catatan R2 (Upload Logo)

Jika `wrangler r2 bucket create` gagal dengan error **"Please enable R2 through the Cloudflare Dashboard"**:

1. Buka [Cloudflare Dashboard → R2](https://dash.cloudflare.com/?to=/:account/r2/overview)
2. Aktifkan R2 (gratis, pay-as-you-go dengan free tier)
3. Buat bucket: `pnpm exec wrangler r2 bucket create open-lovable-uploads`
4. Tambahkan kembali di `wrangler.jsonc`:

```json
"r2_buckets": [
  {
    "binding": "UPLOADS",
    "bucket_name": "open-lovable-uploads"
  }
]
```

5. Redeploy: `pnpm deploy:cf`

Tanpa R2, aplikasi tetap jalan — hanya upload logo admin yang belum tersimpan permanen.
