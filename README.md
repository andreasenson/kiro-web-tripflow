# TripFlow

A travel planning and management application built as a TypeScript monorepo. TripFlow supports **Planning Mode** (trip creation, itinerary building, budget management, AI-powered suggestions) and **Travelling Mode** (daily view, expense logging, offline-first sync).

## Project Structure

```
packages/
  shared/     - Shared TypeScript types, Zod validation schemas, and sync utilities
  backend/    - NestJS REST API (trips, itinerary, budget, sync, AI generation)
  web/        - Next.js frontend (Planning Mode + Travelling Mode)
```

**Tech stack:** TypeScript, pnpm workspaces, Turborepo, NestJS, Next.js, TypeORM (SQLite for dev/test), Zod, Tailwind CSS, Vitest + Jest.

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+

### Install

```bash
pnpm install
```

### Build

```bash
pnpm run build
```

### Test

```bash
pnpm run test
```

### Development

```bash
# Start backend API
pnpm --filter @tripflow/backend run start:dev

# Start web frontend
pnpm --filter @tripflow/web run dev
```

## Packages

| Package | Description |
|---------|-------------|
| `@tripflow/shared` | Zod schemas, TypeScript types, and offline sync utilities (field-level LWW conflict resolution) |
| `@tripflow/backend` | NestJS API with CRUD for trips, itinerary, budget, sync engine, and AI itinerary generation |
| `@tripflow/web` | Next.js app with trip management UI, offline queue, and sync status indicator |
