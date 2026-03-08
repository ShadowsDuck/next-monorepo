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
  "start:dev": "nest start --watch",
}
```

เป็น:

```json
"scripts": {
  "dev": "nest start --watch",
}
```

### เพิ่ม `devDependencies` ให้ใช้ typescript-config ใน `apps/backend/package.json`

```json
"devDependencies": {
  "@workspace/typescript-config": "workspace:*",
}
```

### แก้ไข `apps/backend/tsconfig.json`

```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
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
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w",
    "lint": "eslint . --max-warnings 0"
  },
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./dist/index.js"
    }
  },
  "devDependencies": {
    "@workspace/eslint-config": "workspace:*",
    "@workspace/typescript-config": "workspace:*",
    "@types/node": "22.8.2",
    "@types/eslint": "9.6.1",
    "eslint": "9.13.0",
    "typescript": "5.6.3"
  }
}
```

### 3.2 สร้างไฟล์ tsconfig.json

สร้าง `packages/types/tsconfig.json`:

```json
{
  "extends": "@workspace/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "strict": false
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### 3.3 สร้างไฟล์ Types

สร้าง `packages/types/src/products/dto/create-product.request.ts`:

```typescript
export class CreateProductRequest {
  name: string
  price: number
}
```

สร้าง `packages/types/src/products/interface/product.interface.ts`:

```typescript
import { CreateProductRequest } from "../dto/create-product.request"

export interface Product extends CreateProductRequest {
  id: string
}
```

สร้าง `packages/types/index.ts`:

```typescript
export * from "./products/dto/create-product.request"
export * from "./products/interfaces/product.interface"
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
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w",
    "lint": "eslint . --max-warnings 0",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy"
  },
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./dist/index.js"
    }
  },
  "devDependencies": {
    "@types/node": "^25.3.5",
    "prisma": "^7.4.2"
  },
  "dependencies": {
    "@workspace/eslint-config": "workspace:*",
    "@workspace/typescript-config": "workspace:*",
    "@prisma/adapter-pg": "^7.4.2",
    "@prisma/client": "^7.4.2",
    "dotenv": "^17.3.1",
    "pg": "^8.20.0"
  }
}
```

### 4.3 ตั้งค่า `schema.prisma` ใน `packages/database/prisma/schema.prisma`

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}
```

### 4.4 สร้าง Model ไฟล์

สร้าง folder `packages/database/prisma/models/` และสร้างไฟล์ `products.prisma`:

```prisma
model Product {
  id    String @id @default(cuid())
  name  String
  price Float
}
```

### 4.5 แก้ไข `prisma.config.ts`

เปลี่ยน path ของ schema จาก:

```ts
schema: "prisma/schema.prisma",
```

เป็น:

```ts
schema: "prisma",
```

### 4.6 สร้าง Prisma Client

สร้าง `packages/database/src/client.ts`:

```typescript
import { PrismaClient } from "./generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import "dotenv/config"

export const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

สร้าง `packages/database/src/index.ts`:

```typescript
export { prisma, adapter } from "./client"
export * from "./generated/prisma/client"
```

### 4.7 ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ใน **3 ที่** ดังนี้:

- `packages/database/.env`
- `apps/web/.env`
- `apps/backend/.env`

```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/YOUR_DATABASE_NAME?schema=public"
```

> ⚠️ เปลี่ยน `YOUR_DATABASE_NAME` เป็นชื่อ Database ของคุณ

### 4.8 ผูก Database Package เข้ากับแต่ละ App

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

### 4.9 ติดตั้ง Dependencies

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
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "incremental": false,
    "isolatedModules": true,
    "lib": ["es2022", "DOM", "DOM.Iterable"],
    "module": "NodeNext",
    "moduleDetection": "force",
    "moduleResolution": "nodenext",
    "strictPropertyInitialization": false,
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2022"
  }
}
```

---

## 🔌 Step 6 — ตั้งค่า Prisma ใน NestJS

### 6.1 สร้าง Prisma Module และ Service

```bash
cd apps/backend
nest g module prisma
nest g service prisma
```

### 6.2 แก้ไข `apps/backend/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from "@nestjs/common"
import { PrismaService } from "./prisma.service"

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 6.3 แก้ไข `apps/backend/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import { PrismaClient, adapter } from "@workspace/database"

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
```

### 6.4 สร้าง Products Resource

```bash
nest g resource products
```

### 6.5 แก้ไข `apps/backend/src/products/products.module.ts`

```typescript
import { Module } from "@nestjs/common"
import { ProductsController } from "./products.controller"
import { ProductsService } from "./products.service"

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

### 6.6 แก้ไข `apps/backend/src/products/products.controller.ts`

```typescript
import { Body, Controller, Get, Post } from "@nestjs/common"
import { CreateProductRequest, Product } from "@workspace/types"
import { ProductsService } from "./products.service"

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async createProduct(@Body() createProductRequest: CreateProductRequest) {
    return this.productsService.createProduct(createProductRequest)
  }

  @Get()
  async getProducts(): Promise<Product[]> {
    return this.productsService.getProducts()
  }
}
```

### 6.7 แก้ไข `apps/backend/src/products/products.service.ts`

```typescript
import { Injectable } from "@nestjs/common"
import { CreateProductRequest, Product } from "@workspace/types"
import { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(createProductRequest: CreateProductRequest) {
    await this.prisma.product.create({ data: createProductRequest })
    return createProductRequest
  }

  async getProducts(): Promise<Product[]> {
    return this.prisma.product.findMany()
  }
}
```

---

## 🛢 Step 7 — Migrate ฐานข้อมูล

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
