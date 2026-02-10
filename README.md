# Archify

Quick project scaffolding CLI for Node.js. Set up MVC, Clean Architecture, or Hexagonal projects in seconds.

Perfect for interviews and rapid prototyping - no more wasting time on project setup.

## Installation

```bash
npm install -g archify
```

Or use directly with npx:

```bash
npx archify my-app
```

## Usage

```bash
archify <project-name>
```

The CLI will prompt you to select:

1. **Language**: TypeScript or JavaScript
2. **Architecture**:
   - MVC - Models, Views, Controllers
   - MVC + Services - MVC with service layer
   - Clean Architecture - Use cases, entities, repositories
   - Hexagonal - Ports and adapters pattern
3. **Framework**: Express, Fastify, or None (vanilla Node.js)
4. **Database**: None, MongoDB (Mongoose), or PostgreSQL (Prisma)

## Example

```bash
$ archify my-api

🏗️  Archify - Setting up "my-api"

? Select language: TypeScript
? Select architecture: MVC + Services
? Select framework: Express
? Select database: MongoDB (Mongoose)

📦 Creating project structure...

  📁 my-api/
  📄 my-api/package.json
  📄 my-api/tsconfig.json
  📁 my-api/src/
  📄 my-api/src/index.ts
  📄 my-api/src/app.ts
  📁 my-api/src/controllers/
  📁 my-api/src/services/
  📁 my-api/src/models/
  📁 my-api/src/routes/
  ...

✅ Project "my-api" created successfully!

Next steps:
  cd my-api
  npm install
  npm run dev
```

## Generated Project Structure

### MVC + Services (Express + MongoDB)

```
my-app/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── routes/
│   │   ├── index.ts
│   │   └── user.routes.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── middleware/
│   ├── utils/
│   ├── app.ts
│   └── index.ts
├── .env
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

### Clean Architecture

```
my-app/
├── src/
│   ├── domain/
│   │   └── entities/
│   ├── application/
│   │   ├── use-cases/
│   │   └── services/
│   ├── infrastructure/
│   │   ├── repositories/
│   │   └── models/
│   ├── interfaces/
│   │   ├── controllers/
│   │   └── routes/
│   └── config/
└── ...
```

### Hexagonal Architecture

```
my-app/
├── src/
│   ├── core/
│   │   ├── domain/
│   │   ├── ports/
│   │   └── services/
│   ├── adapters/
│   │   ├── inbound/
│   │   │   ├── routes/
│   │   │   └── user.controller.ts
│   │   └── outbound/
│   │       └── user.adapter.ts
│   └── config/
└── ...
```

## License

MIT
