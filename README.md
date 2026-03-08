# 🚀 Turborepo Fullstack Starter

Monorepo สำหรับโปรเจคที่ใช้ **Next.js + NestJS + Shadcn + Tailwind v4 + Prisma v7 + PostgreSQL** บน Turborepo

## 🗂 โครงสร้างโปรเจค

```
my-app/
├── apps/
│   ├── web/          # Next.js (Frontend)
│   └── backend/      # NestJS (Backend)
├── packages/
│   ├── database/     # Prisma Client (Shared DB)
│   ├── types/        # Shared TypeScript Types
│   └── ui/           # Shadcn UI Components
└── turbo.json
```

## ✅ Prerequisites

ติดตั้ง Tools เหล่านี้ให้ครบก่อนเริ่ม

| Tool       | Version  |
| ---------- | -------- |
| Node.js    | >= 20.19 |
| pnpm       | >= 9     |
| PostgreSQL | >= 14    |

```bash
# ติดตั้ง pnpm (ถ้ายังไม่มี)
npm install -g pnpm

# ติดตั้ง NestJS CLI
npm install -g @nestjs/cli
```

---

## 📦 Step 1 — สร้าง Monorepo ด้วย Shadcn CLI

```bash
npx shadcn@latest init --monorepo
```

หลังจาก init เสร็จ ให้ลบไฟล์ `._*` ที่ระบบสร้างขึ้นมาโดยอัตโนมัติ

**macOS / Linux:**

```bash
find . -name "._*" -delete
```

**Windows (PowerShell):**

```powershell
Get-ChildItem -Recurse -Force -Filter "._*" | Remove-Item -Force
```

---

## 🔧 Step 2 — สร้าง Backend ด้วย NestJS

```bash
cd apps
npx @nestjs/cli new backend --package-manager pnpm
```

### แก้ Port ไม่ให้ชนกับ Next.js

เปิด `apps/backend/src/main.ts` และเปลี่ยน port เป็น `3001` (หรือเลขอื่นที่ไม่ใช่ 3000)

```typescript
await app.listen(3001)
```

### แก้ไข Script ใน `apps/backend/package.json`

```json
"scripts": {
  "build": "nest build",
  "start:dev": "nest start --watch",
}
```

เป็น:

```json
"scripts": {
  "build": "nest build --webpack",
  "dev": "nest start --watch",
}
```

### เพิ่ม `devDependencies` ให้ใช้ typescript-config ใน `apps/backend/package.json`

```json
"devDependencies": {
  "@workspace/typescript-config": "workspace:*",
}
```

### เพิ่ม `extends` ใน `apps/backend/tsconfig.json`

```json
"extends": "@workspace/typescript-config/base.json",
"compilerOptions": {
  ...
}
```

### ติดตั้ง Dependencies

```bash
# รันที่ Root folder
pnpm install
```

---

## 🧩 Step 3 — สร้าง Shared Types (`packages/types`)

### 3.1 ตั้งค่า `package.json`

เปิด `packages/types/package.json` และแก้ให้เป็น:

```json
{
  "name": "@workspace/types",
  "version": "1.0.0",
  "private": true,
  "exports": {
    ".": "./index.ts"
  }
}
```

### 3.2 สร้างไฟล์ tsconfig.json

สร้าง `packages/types/tsconfig.json`:

```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "strictPropertyInitialization": false
  },
  "include": ["."],
  "exclude": ["node_modules"]
}
```

### 3.3 สร้างไฟล์ Types

สร้าง `packages/types/src/users/create-user.request.ts`:

```typescript
export class CreateUserRequest {
  name: string
  email: string
}
```

สร้าง `packages/types/index.ts`:

```typescript
export * from "./src/users/create-user.request"
```

### 3.4 ผูก Package เข้ากับแต่ละ App

**Frontend** — `apps/web/package.json`:

```json
"dependencies": {
  "@workspace/types": "workspace:*"
}
```

**Backend** — `apps/backend/package.json`:

```json
"devDependencies": {
  "@workspace/types": "workspace:*"
}
```

### 3.5 ติดตั้ง Dependencies

```bash
# รันที่ Root folder
pnpm install
```

---

## 🗄 Step 4 — ตั้งค่าฐานข้อมูลด้วย Prisma (`packages/database`)

### 4.1 สร้างและ Init Package

```bash
mkdir packages/database
cd packages/database
pnpm init
pnpm add -D prisma
pnpm add @prisma/client @prisma/adapter-pg pg dotenv
npx prisma init
```

### 4.2 ตั้งค่า `packages/database/package.json`

```json
{
  "name": "@workspace/database",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy"
  },
  # ถ้าติดตั้งตามด้านบนแล้วจะขึ้นให้เอง
  "devDependencies": {
    "prisma": "^version"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^version",
    "@prisma/client": "^version",
    "dotenv": "^version",
    "pg": "^version"
  }
}
```

### 4.3 สร้าง Model ไฟล์

สร้าง folder `packages/database/prisma/models/` และสร้างไฟล์ `users.prisma`:

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

### 4.4 แก้ไข `prisma.config.ts`

เปลี่ยน path ของ schema จาก:

```ts
schema: "prisma/schema.prisma",
```

เป็น:

```ts
schema: "prisma",
```

### 4.5 ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน **3 ที่** ดังนี้:

- `packages/database/.env`
- `apps/web/.env`
- `apps/backend/.env`

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/YOUR_DATABASE_NAME?schema=public"
```

> ⚠️ เปลี่ยน `YOUR_DATABASE_NAME` เป็นชื่อ Database ของคุณ

### 4.6 สร้าง Prisma Client

สร้าง `packages/database/src/client.ts`:

```typescript
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

สร้าง `packages/database/src/index.ts`:

```typescript
export { prisma } from "./client"
export * from "../generated/prisma/client"
```

### 4.7 ผูก Database Package เข้ากับแต่ละ App

**Frontend** — `apps/web/package.json`:

```json
"dependencies": {
  "@workspace/database": "workspace:*"
}
```

**Backend** — `apps/backend/package.json`:

```json
"dependencies": {
  "@workspace/database": "workspace:*"
}
```

### 4.8 ติดตั้ง Dependencies

```bash
# รันที่ Root folder
pnpm install
```

---

## ⚙️ Step 5 — ตั้งค่า Turbo และ TypeScript

### 5.1 แก้ไข `turbo.json`

```json
{
  "ui": "tui",
  "globalEnv": ["DATABASE_URL"],
  "tasks": {
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "dependsOn": ["^db:generate"],
      "cache": false,
      "persistent": true
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    },
    "db:deploy": {
      "cache": false
    }
  }
}
```

### 5.2 แก้ไข `packages/typescript-config/base.json`

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler"
  }
}
```

---

## 🛢 Step 6 — Migrate ฐานข้อมูล

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema ไปที่ Database (สำหรับ Dev)
pnpm db:push

# หรือถ้าต้องการทำ Migration
pnpm db:migrate
```

---

## 🏃 รันโปรเจค

```bash
# รัน Dev Server ทั้งหมดพร้อมกัน (จาก Root)
pnpm dev
```

| Service            | URL                   |
| ------------------ | --------------------- |
| Frontend (Next.js) | http://localhost:3000 |
| Backend (NestJS)   | http://localhost:3001 |

---

## 🔗 References

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Prisma + Turborepo Guide](https://www.prisma.io/docs/guides/deployment/turborepo)
- [Shadcn UI](https://ui.shadcn.com)
- [NestJS Docs](https://docs.nestjs.com)
