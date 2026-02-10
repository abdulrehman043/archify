import { ProjectConfig } from '../generator/types.js';

// Helper to get import paths based on architecture
function getImportPaths(config: ProjectConfig) {
  const { architecture } = config;

  switch (architecture) {
    case 'clean':
      return {
        service: '../../application/services/user.service.js',
        repository: '../../infrastructure/repositories/user.repository.js',
        model: '../../infrastructure/models/user.model.js',
        entity: '../../domain/entities/user.entity.js',
        database: '../../config/database.js',
        controller: '../controllers/user.controller.js',
      };
    case 'hexagonal':
      return {
        service: '../../core/services/user.service.js',
        repository: '../outbound/user.adapter.js',
        model: './models/user.model.js',
        entity: '../../core/domain/user.entity.js',
        port: '../../core/ports/user.port.js',
        database: '../../config/database.js',
        controller: '../user.controller.js',
      };
    default: // mvc, mvc-service
      return {
        service: '../services/user.service.js',
        repository: '../repositories/user.repository.js',
        model: '../models/user.model.js',
        database: '../config/database.js',
        controller: '../controllers/user.controller.js',
      };
  }
}

// Base templates
export function getPackageJson(config: ProjectConfig): string {
  const { projectName, language, framework, database } = config;

  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};

  // Framework dependencies
  if (framework === 'express') {
    deps['express'] = '^4.18.2';
    if (language === 'ts') devDeps['@types/express'] = '^4.17.21';
  } else if (framework === 'fastify') {
    deps['fastify'] = '^4.25.0';
  }

  // Database dependencies
  if (database === 'mongodb') {
    deps['mongoose'] = '^8.0.3';
  } else if (database === 'postgresql') {
    deps['@prisma/client'] = '^5.7.1';
    devDeps['prisma'] = '^5.7.1';
  }

  // TypeScript dependencies
  if (language === 'ts') {
    devDeps['typescript'] = '^5.3.3';
    devDeps['ts-node'] = '^10.9.2';
    devDeps['@types/node'] = '^20.10.6';
  }

  // Common dependencies
  deps['dotenv'] = '^16.3.1';
  devDeps['nodemon'] = '^3.0.2';

  const scripts: Record<string, string> = {};
  if (language === 'ts') {
    scripts['build'] = 'tsc';
    scripts['start'] = 'node dist/index.js';
    scripts['dev'] = 'nodemon --exec ts-node src/index.ts';
  } else {
    scripts['start'] = 'node src/index.js';
    scripts['dev'] = 'nodemon src/index.js';
  }

  if (database === 'postgresql') {
    scripts['db:generate'] = 'prisma generate';
    scripts['db:migrate'] = 'prisma migrate dev';
    scripts['db:push'] = 'prisma db push';
  }

  return JSON.stringify({
    name: projectName,
    version: '1.0.0',
    description: '',
    main: language === 'ts' ? 'dist/index.js' : 'src/index.js',
    scripts,
    keywords: [],
    author: '',
    license: 'ISC',
    type: 'module',
    dependencies: deps,
    devDependencies: devDeps
  }, null, 2);
}

export function getTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      lib: ['ES2020'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  }, null, 2);
}

export function getGitignore(): string {
  return `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.prisma/
`;
}

export function getEnvFile(config: ProjectConfig): string {
  let content = `PORT=3000
NODE_ENV=development
`;

  if (config.database === 'mongodb') {
    content += `MONGODB_URI=mongodb://localhost:27017/${config.projectName}\n`;
  } else if (config.database === 'postgresql') {
    content += `DATABASE_URL="postgresql://user:password@localhost:5432/${config.projectName}?schema=public"\n`;
  }

  return content;
}

export function getEnvExample(config: ProjectConfig): string {
  return getEnvFile(config).replace(/=.*/g, '=');
}

// Entry point templates
export function getIndexFile(config: ProjectConfig): string {
  const { framework, database } = config;

  let imports = `import 'dotenv/config';\n`;

  if (database === 'mongodb') {
    imports += `import { connectDB } from './config/database.js';\n`;
  }

  imports += `import { app } from './app.js';\n\n`;

  let code = `const PORT = process.env.PORT || 3000;\n\n`;

  if (database === 'mongodb') {
    code += `connectDB().then(() => {\n`;
    if (framework === 'fastify') {
      code += `  app.listen({ port: Number(PORT) }, (err, address) => {\n`;
      code += `    if (err) {\n`;
      code += `      console.error(err);\n`;
      code += `      process.exit(1);\n`;
      code += `    }\n`;
      code += `    console.log(\`Server running on \${address}\`);\n`;
      code += `  });\n`;
    } else {
      code += `  app.listen(PORT, () => {\n`;
      code += `    console.log(\`Server running on port \${PORT}\`);\n`;
      code += `  });\n`;
    }
    code += `});\n`;
  } else {
    if (framework === 'fastify') {
      code += `app.listen({ port: Number(PORT) }, (err, address) => {\n`;
      code += `  if (err) {\n`;
      code += `    console.error(err);\n`;
      code += `    process.exit(1);\n`;
      code += `  }\n`;
      code += `  console.log(\`Server running on \${address}\`);\n`;
      code += `});\n`;
    } else if (framework === 'express') {
      code += `app.listen(PORT, () => {\n`;
      code += `  console.log(\`Server running on port \${PORT}\`);\n`;
      code += `});\n`;
    } else {
      imports = `import 'dotenv/config';\n`;
      imports += `import http from 'http';\n`;
      imports += `import { app } from './app.js';\n\n`;
      code = `const PORT = process.env.PORT || 3000;\n\n`;
      code += `const server = http.createServer(app);\n`;
      code += `server.listen(PORT, () => {\n`;
      code += `  console.log(\`Server running on port \${PORT}\`);\n`;
      code += `});\n`;
    }
  }

  return imports + code;
}

export function getAppFile(config: ProjectConfig): string {
  const { framework, language, architecture } = config;
  const isTs = language === 'ts';

  // Get correct route import based on architecture
  let routeImport = './routes/index.js';
  if (architecture === 'clean') {
    routeImport = './interfaces/routes/index.js';
  } else if (architecture === 'hexagonal') {
    routeImport = './adapters/inbound/routes/index.js';
  }

  if (framework === 'express') {
    return `import express${isTs ? ', { Application }' : ''} from 'express';
import { router } from '${routeImport}';

export const app${isTs ? ': Application' : ''} = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
`;
  } else if (framework === 'fastify') {
    return `import Fastify from 'fastify';
import { routes } from '${routeImport}';

export const app = Fastify({ logger: true });

app.register(routes, { prefix: '/api' });

app.get('/health', async () => {
  return { status: 'ok' };
});
`;
  } else {
    return `${isTs ? 'import { IncomingMessage, ServerResponse } from \'http\';\n\n' : ''}export const app = (req${isTs ? ': IncomingMessage' : ''}, res${isTs ? ': ServerResponse' : ''}) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
};
`;
  }
}

// Route templates
export function getRoutesIndex(config: ProjectConfig): string {
  const { framework, language, architecture } = config;
  const isTs = language === 'ts';

  // Get correct user routes import based on architecture
  let userRoutesImport = './user.routes.js';

  if (framework === 'express') {
    return `import { Router } from 'express';
import { userRoutes } from '${userRoutesImport}';

export const router = Router();

router.use('/users', userRoutes);
`;
  } else if (framework === 'fastify') {
    return `import { FastifyInstance } from 'fastify';
import { userRoutes } from '${userRoutesImport}';

export async function routes(app${isTs ? ': FastifyInstance' : ''}) {
  app.register(userRoutes, { prefix: '/users' });
}
`;
  }
  return '';
}

export function getUserRoutes(config: ProjectConfig): string {
  const { framework, language, architecture } = config;
  const isTs = language === 'ts';
  const hasController = architecture !== 'mvc' || framework !== 'none';

  // Get correct controller import path based on architecture
  let controllerImport = '../controllers/user.controller.js';
  if (architecture === 'clean') {
    controllerImport = '../controllers/user.controller.js';
  } else if (architecture === 'hexagonal') {
    controllerImport = '../user.controller.js';
  }

  if (framework === 'express') {
    if (hasController) {
      return `import { Router${isTs ? ', Request, Response' : ''} } from 'express';
import { UserController } from '${controllerImport}';

export const userRoutes = Router();
const controller = new UserController();

userRoutes.get('/', controller.getAll);
userRoutes.get('/:id', controller.getById);
userRoutes.post('/', controller.create);
userRoutes.put('/:id', controller.update);
userRoutes.delete('/:id', controller.delete);
`;
    } else {
      return `import { Router${isTs ? ', Request, Response' : ''} } from 'express';

export const userRoutes = Router();

userRoutes.get('/', (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {
  res.json({ users: [] });
});

userRoutes.get('/:id', (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {
  res.json({ user: { id: req.params.id } });
});

userRoutes.post('/', (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {
  res.status(201).json({ user: req.body });
});
`;
    }
  } else if (framework === 'fastify') {
    if (hasController) {
      return `import { FastifyInstance } from 'fastify';
import { UserController } from '${controllerImport}';

export async function userRoutes(app${isTs ? ': FastifyInstance' : ''}) {
  const controller = new UserController();

  app.get('/', controller.getAll);
  app.get('/:id', controller.getById);
  app.post('/', controller.create);
  app.put('/:id', controller.update);
  app.delete('/:id', controller.delete);
}
`;
    } else {
      return `import { FastifyInstance } from 'fastify';

export async function userRoutes(app${isTs ? ': FastifyInstance' : ''}) {
  app.get('/', async () => {
    return { users: [] };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params${isTs ? ' as { id: string }' : ''};
    return { user: { id } };
  });

  app.post('/', async (request) => {
    return { user: request.body };
  });
}
`;
    }
  }
  return '';
}

// Controller templates
export function getUserController(config: ProjectConfig): string {
  const { language, framework, architecture } = config;
  const isTs = language === 'ts';
  const paths = getImportPaths(config);
  const hasService = architecture !== 'mvc';

  if (framework === 'express') {
    let content = `import { Request, Response } from 'express';\n`;
    if (hasService) {
      content += `import { UserService } from '${paths.service}';\n\n`;
      content += `export class UserController {\n`;
      content += `  private userService = new UserService();\n\n`;
      content += `  getAll = async (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    const users = await this.userService.findAll();\n`;
      content += `    res.json({ users });\n`;
      content += `  };\n\n`;
      content += `  getById = async (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    const user = await this.userService.findById(req.params.id);\n`;
      content += `    if (!user) {\n`;
      content += `      return res.status(404).json({ error: 'User not found' });\n`;
      content += `    }\n`;
      content += `    res.json({ user });\n`;
      content += `  };\n\n`;
      content += `  create = async (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    const user = await this.userService.create(req.body);\n`;
      content += `    res.status(201).json({ user });\n`;
      content += `  };\n\n`;
      content += `  update = async (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    const user = await this.userService.update(req.params.id, req.body);\n`;
      content += `    res.json({ user });\n`;
      content += `  };\n\n`;
      content += `  delete = async (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    await this.userService.delete(req.params.id);\n`;
      content += `    res.status(204).send();\n`;
      content += `  };\n`;
      content += `}\n`;
    } else {
      content += `\nexport class UserController {\n`;
      content += `  getAll = (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    res.json({ users: [] });\n`;
      content += `  };\n\n`;
      content += `  getById = (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    res.json({ user: { id: req.params.id } });\n`;
      content += `  };\n\n`;
      content += `  create = (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    res.status(201).json({ user: req.body });\n`;
      content += `  };\n\n`;
      content += `  update = (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    res.json({ user: { id: req.params.id, ...req.body } });\n`;
      content += `  };\n\n`;
      content += `  delete = (req${isTs ? ': Request' : ''}, res${isTs ? ': Response' : ''}) => {\n`;
      content += `    res.status(204).send();\n`;
      content += `  };\n`;
      content += `}\n`;
    }
    return content;
  } else if (framework === 'fastify') {
    let content = `import { FastifyRequest, FastifyReply } from 'fastify';\n`;
    if (hasService) {
      content += `import { UserService } from '${paths.service}';\n\n`;
      content += `export class UserController {\n`;
      content += `  private userService = new UserService();\n\n`;
      content += `  getAll = async (request${isTs ? ': FastifyRequest' : ''}, reply${isTs ? ': FastifyReply' : ''}) => {\n`;
      content += `    const users = await this.userService.findAll();\n`;
      content += `    return { users };\n`;
      content += `  };\n\n`;
      content += `  getById = async (request${isTs ? ': FastifyRequest<{ Params: { id: string } }>' : ''}, reply${isTs ? ': FastifyReply' : ''}) => {\n`;
      content += `    const { id } = request.params${isTs ? '' : ' as { id: string }'};\n`;
      content += `    const user = await this.userService.findById(id);\n`;
      content += `    if (!user) {\n`;
      content += `      return reply.status(404).send({ error: 'User not found' });\n`;
      content += `    }\n`;
      content += `    return { user };\n`;
      content += `  };\n\n`;
      content += `  create = async (request${isTs ? ': FastifyRequest' : ''}, reply${isTs ? ': FastifyReply' : ''}) => {\n`;
      content += `    const user = await this.userService.create(request.body);\n`;
      content += `    return reply.status(201).send({ user });\n`;
      content += `  };\n\n`;
      content += `  update = async (request${isTs ? ': FastifyRequest<{ Params: { id: string } }>' : ''}, reply${isTs ? ': FastifyReply' : ''}) => {\n`;
      content += `    const { id } = request.params${isTs ? '' : ' as { id: string }'};\n`;
      content += `    const user = await this.userService.update(id, request.body);\n`;
      content += `    return { user };\n`;
      content += `  };\n\n`;
      content += `  delete = async (request${isTs ? ': FastifyRequest<{ Params: { id: string } }>' : ''}, reply${isTs ? ': FastifyReply' : ''}) => {\n`;
      content += `    const { id } = request.params${isTs ? '' : ' as { id: string }'};\n`;
      content += `    await this.userService.delete(id);\n`;
      content += `    return reply.status(204).send();\n`;
      content += `  };\n`;
      content += `}\n`;
    } else {
      content += `\nexport class UserController {\n`;
      content += `  getAll = async () => {\n`;
      content += `    return { users: [] };\n`;
      content += `  };\n\n`;
      content += `  getById = async (request${isTs ? ': FastifyRequest<{ Params: { id: string } }>' : ''}) => {\n`;
      content += `    const { id } = request.params${isTs ? '' : ' as { id: string }'};\n`;
      content += `    return { user: { id } };\n`;
      content += `  };\n\n`;
      content += `  create = async (request${isTs ? ': FastifyRequest' : ''}, reply${isTs ? ': FastifyReply' : ''}) => {\n`;
      content += `    return reply.status(201).send({ user: request.body });\n`;
      content += `  };\n\n`;
      content += `  update = async (request${isTs ? ': FastifyRequest<{ Params: { id: string } }>' : ''}) => {\n`;
      content += `    const { id } = request.params${isTs ? '' : ' as { id: string }'};\n`;
      content += `    return { user: { id, ...request.body } };\n`;
      content += `  };\n\n`;
      content += `  delete = async (request${isTs ? ': FastifyRequest<{ Params: { id: string } }>' : ''}, reply${isTs ? ': FastifyReply' : ''}) => {\n`;
      content += `    return reply.status(204).send();\n`;
      content += `  };\n`;
      content += `}\n`;
    }
    return content;
  }
  return '';
}

// Service templates
export function getUserService(config: ProjectConfig): string {
  const { language, database, architecture } = config;
  const isTs = language === 'ts';
  const paths = getImportPaths(config);

  let content = '';

  if (database === 'mongodb') {
    content += `import { User } from '${paths.model}';\n\n`;
  } else if (database === 'postgresql') {
    content += `import { prisma } from '${paths.database}';\n\n`;
  }

  if (architecture === 'clean' || architecture === 'hexagonal') {
    const repoImport = architecture === 'hexagonal' ? paths.repository : '../repositories/user.repository.js';
    content += `import { UserRepository } from '${repoImport}';\n\n`;
    content += `export class UserService {\n`;
    content += `  private repository = new UserRepository();\n\n`;
    content += `  async findAll() {\n`;
    content += `    return this.repository.findAll();\n`;
    content += `  }\n\n`;
    content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
    content += `    return this.repository.findById(id);\n`;
    content += `  }\n\n`;
    content += `  async create(data${isTs ? ': any' : ''}) {\n`;
    content += `    return this.repository.create(data);\n`;
    content += `  }\n\n`;
    content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
    content += `    return this.repository.update(id, data);\n`;
    content += `  }\n\n`;
    content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
    content += `    return this.repository.delete(id);\n`;
    content += `  }\n`;
    content += `}\n`;
  } else {
    content += `export class UserService {\n`;
    if (database === 'mongodb') {
      content += `  async findAll() {\n`;
      content += `    return User.find();\n`;
      content += `  }\n\n`;
      content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
      content += `    return User.findById(id);\n`;
      content += `  }\n\n`;
      content += `  async create(data${isTs ? ': any' : ''}) {\n`;
      content += `    return User.create(data);\n`;
      content += `  }\n\n`;
      content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
      content += `    return User.findByIdAndUpdate(id, data, { new: true });\n`;
      content += `  }\n\n`;
      content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
      content += `    return User.findByIdAndDelete(id);\n`;
      content += `  }\n`;
    } else if (database === 'postgresql') {
      content += `  async findAll() {\n`;
      content += `    return prisma.user.findMany();\n`;
      content += `  }\n\n`;
      content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
      content += `    return prisma.user.findUnique({ where: { id } });\n`;
      content += `  }\n\n`;
      content += `  async create(data${isTs ? ': any' : ''}) {\n`;
      content += `    return prisma.user.create({ data });\n`;
      content += `  }\n\n`;
      content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
      content += `    return prisma.user.update({ where: { id }, data });\n`;
      content += `  }\n\n`;
      content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
      content += `    return prisma.user.delete({ where: { id } });\n`;
      content += `  }\n`;
    } else {
      content += `  private users${isTs ? ': any[]' : ''} = [];\n\n`;
      content += `  async findAll() {\n`;
      content += `    return this.users;\n`;
      content += `  }\n\n`;
      content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
      content += `    return this.users.find(u => u.id === id);\n`;
      content += `  }\n\n`;
      content += `  async create(data${isTs ? ': any' : ''}) {\n`;
      content += `    const user = { id: String(this.users.length + 1), ...data };\n`;
      content += `    this.users.push(user);\n`;
      content += `    return user;\n`;
      content += `  }\n\n`;
      content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
      content += `    const index = this.users.findIndex(u => u.id === id);\n`;
      content += `    if (index !== -1) {\n`;
      content += `      this.users[index] = { ...this.users[index], ...data };\n`;
      content += `      return this.users[index];\n`;
      content += `    }\n`;
      content += `    return null;\n`;
      content += `  }\n\n`;
      content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
      content += `    const index = this.users.findIndex(u => u.id === id);\n`;
      content += `    if (index !== -1) {\n`;
      content += `      this.users.splice(index, 1);\n`;
      content += `    }\n`;
      content += `  }\n`;
    }
    content += `}\n`;
  }
  return content;
}

// Repository templates (for Clean/Hexagonal)
export function getUserRepository(config: ProjectConfig): string {
  const { language, database, architecture } = config;
  const isTs = language === 'ts';
  const paths = getImportPaths(config);

  let content = '';

  // Adjust model path for clean architecture
  let modelPath = paths.model;
  if (architecture === 'clean') {
    modelPath = '../models/user.model.js';
  }

  if (database === 'mongodb') {
    content += `import { User } from '${modelPath}';\n\n`;
    content += `export class UserRepository {\n`;
    content += `  async findAll() {\n`;
    content += `    return User.find();\n`;
    content += `  }\n\n`;
    content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
    content += `    return User.findById(id);\n`;
    content += `  }\n\n`;
    content += `  async create(data${isTs ? ': any' : ''}) {\n`;
    content += `    return User.create(data);\n`;
    content += `  }\n\n`;
    content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
    content += `    return User.findByIdAndUpdate(id, data, { new: true });\n`;
    content += `  }\n\n`;
    content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
    content += `    return User.findByIdAndDelete(id);\n`;
    content += `  }\n`;
    content += `}\n`;
  } else if (database === 'postgresql') {
    const dbPath = architecture === 'clean' ? '../../config/database.js' : paths.database;
    content += `import { prisma } from '${dbPath}';\n\n`;
    content += `export class UserRepository {\n`;
    content += `  async findAll() {\n`;
    content += `    return prisma.user.findMany();\n`;
    content += `  }\n\n`;
    content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
    content += `    return prisma.user.findUnique({ where: { id } });\n`;
    content += `  }\n\n`;
    content += `  async create(data${isTs ? ': any' : ''}) {\n`;
    content += `    return prisma.user.create({ data });\n`;
    content += `  }\n\n`;
    content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
    content += `    return prisma.user.update({ where: { id }, data });\n`;
    content += `  }\n\n`;
    content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
    content += `    return prisma.user.delete({ where: { id } });\n`;
    content += `  }\n`;
    content += `}\n`;
  } else {
    content += `export class UserRepository {\n`;
    content += `  private users${isTs ? ': any[]' : ''} = [];\n\n`;
    content += `  async findAll() {\n`;
    content += `    return this.users;\n`;
    content += `  }\n\n`;
    content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
    content += `    return this.users.find(u => u.id === id);\n`;
    content += `  }\n\n`;
    content += `  async create(data${isTs ? ': any' : ''}) {\n`;
    content += `    const user = { id: String(this.users.length + 1), ...data };\n`;
    content += `    this.users.push(user);\n`;
    content += `    return user;\n`;
    content += `  }\n\n`;
    content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
    content += `    const index = this.users.findIndex(u => u.id === id);\n`;
    content += `    if (index !== -1) {\n`;
    content += `      this.users[index] = { ...this.users[index], ...data };\n`;
    content += `      return this.users[index];\n`;
    content += `    }\n`;
    content += `    return null;\n`;
    content += `  }\n\n`;
    content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
    content += `    const index = this.users.findIndex(u => u.id === id);\n`;
    content += `    if (index !== -1) {\n`;
    content += `      this.users.splice(index, 1);\n`;
    content += `    }\n`;
    content += `  }\n`;
    content += `}\n`;
  }
  return content;
}

// Model templates
export function getUserModel(config: ProjectConfig): string {
  const { database, language } = config;
  const isTs = language === 'ts';

  if (database === 'mongodb') {
    return `import mongoose${isTs ? ', { Document }' : ''} from 'mongoose';

${isTs ? `export interface IUser extends Document {
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

` : ''}const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

export const User = mongoose.model${isTs ? '<IUser>' : ''}('User', userSchema);
`;
  }
  return '';
}

// Database config templates
export function getDatabaseConfig(config: ProjectConfig): string {
  const { database, language } = config;
  const isTs = language === 'ts';

  if (database === 'mongodb') {
    return `import mongoose from 'mongoose';

export async function connectDB()${isTs ? ': Promise<void>' : ''} {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
`;
  } else if (database === 'postgresql') {
    return `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDB()${isTs ? ': Promise<void>' : ''} {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected successfully');
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  }
}
`;
  }
  return '';
}

// Prisma schema
export function getPrismaSchema(config: ProjectConfig): string {
  return `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

// Clean Architecture specific templates
export function getUserEntity(config: ProjectConfig): string {
  const { language } = config;
  const isTs = language === 'ts';

  if (isTs) {
    return `export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
}
`;
  } else {
    return `// User entity definition
// {
//   id: string,
//   name: string,
//   email: string,
//   createdAt: Date,
//   updatedAt: Date
// }

export const createUser = (data) => ({
  id: data.id,
  name: data.name,
  email: data.email,
  createdAt: data.createdAt || new Date(),
  updatedAt: data.updatedAt || new Date()
});
`;
  }
}

// Use case templates
export function getCreateUserUseCase(config: ProjectConfig): string {
  const { language } = config;
  const isTs = language === 'ts';

  return `import { UserRepository } from '../../infrastructure/repositories/user.repository.js';
${isTs ? `import { CreateUserDTO, User } from '../../domain/entities/user.entity.js';` : ''}

export class CreateUserUseCase {
  constructor(private userRepository${isTs ? ': UserRepository' : ''}) {}

  async execute(data${isTs ? ': CreateUserDTO' : ''})${isTs ? ': Promise<User>' : ''} {
    // Add business logic/validation here
    return this.userRepository.create(data);
  }
}
`;
}

export function getGetUsersUseCase(config: ProjectConfig): string {
  const { language } = config;
  const isTs = language === 'ts';

  return `import { UserRepository } from '../../infrastructure/repositories/user.repository.js';
${isTs ? `import { User } from '../../domain/entities/user.entity.js';` : ''}

export class GetUsersUseCase {
  constructor(private userRepository${isTs ? ': UserRepository' : ''}) {}

  async execute()${isTs ? ': Promise<User[]>' : ''} {
    return this.userRepository.findAll();
  }
}
`;
}

// Hexagonal port interfaces
export function getUserPort(config: ProjectConfig): string {
  const { language } = config;

  if (language === 'ts') {
    return `export interface UserPort {
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any | null>;
  delete(id: string): Promise<void>;
}
`;
  }
  return `// User port interface
// Defines the contract for user operations
// Implementation should provide: findAll, findById, create, update, delete
`;
}

export function getUserAdapter(config: ProjectConfig): string {
  const { language, database } = config;
  const isTs = language === 'ts';

  let content = '';
  if (isTs) {
    content += `import { UserPort } from '../../core/ports/user.port.js';\n`;
  }

  if (database === 'mongodb') {
    content += `import { User } from './models/user.model.js';\n\n`;
  } else if (database === 'postgresql') {
    content += `import { prisma } from '../../config/database.js';\n\n`;
  }

  content += `export class UserAdapter${isTs ? ' implements UserPort' : ''} {\n`;

  if (database === 'mongodb') {
    content += `  async findAll() {\n    return User.find();\n  }\n\n`;
    content += `  async findById(id${isTs ? ': string' : ''}) {\n    return User.findById(id);\n  }\n\n`;
    content += `  async create(data${isTs ? ': any' : ''}) {\n    return User.create(data);\n  }\n\n`;
    content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n    return User.findByIdAndUpdate(id, data, { new: true });\n  }\n\n`;
    content += `  async delete(id${isTs ? ': string' : ''}) {\n    await User.findByIdAndDelete(id);\n  }\n`;
  } else if (database === 'postgresql') {
    content += `  async findAll() {\n    return prisma.user.findMany();\n  }\n\n`;
    content += `  async findById(id${isTs ? ': string' : ''}) {\n    return prisma.user.findUnique({ where: { id } });\n  }\n\n`;
    content += `  async create(data${isTs ? ': any' : ''}) {\n    return prisma.user.create({ data });\n  }\n\n`;
    content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n    return prisma.user.update({ where: { id }, data });\n  }\n\n`;
    content += `  async delete(id${isTs ? ': string' : ''}) {\n    await prisma.user.delete({ where: { id } });\n  }\n`;
  } else {
    content += `  private users${isTs ? ': any[]' : ''} = [];\n\n`;
    content += `  async findAll() {\n    return this.users;\n  }\n\n`;
    content += `  async findById(id${isTs ? ': string' : ''}) {\n    return this.users.find(u => u.id === id);\n  }\n\n`;
    content += `  async create(data${isTs ? ': any' : ''}) {\n    const user = { id: String(this.users.length + 1), ...data };\n    this.users.push(user);\n    return user;\n  }\n\n`;
    content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n    const index = this.users.findIndex(u => u.id === id);\n    if (index !== -1) {\n      this.users[index] = { ...this.users[index], ...data };\n      return this.users[index];\n    }\n    return null;\n  }\n\n`;
    content += `  async delete(id${isTs ? ': string' : ''}) {\n    const index = this.users.findIndex(u => u.id === id);\n    if (index !== -1) this.users.splice(index, 1);\n  }\n`;
  }

  content += `}\n`;
  return content;
}

// Hexagonal service that uses UserAdapter
export function getUserServiceHexagonal(config: ProjectConfig): string {
  const { language } = config;
  const isTs = language === 'ts';

  let content = `import { UserAdapter } from '../../adapters/outbound/user.adapter.js';\n\n`;
  content += `export class UserService {\n`;
  content += `  private adapter = new UserAdapter();\n\n`;
  content += `  async findAll() {\n`;
  content += `    return this.adapter.findAll();\n`;
  content += `  }\n\n`;
  content += `  async findById(id${isTs ? ': string' : ''}) {\n`;
  content += `    return this.adapter.findById(id);\n`;
  content += `  }\n\n`;
  content += `  async create(data${isTs ? ': any' : ''}) {\n`;
  content += `    return this.adapter.create(data);\n`;
  content += `  }\n\n`;
  content += `  async update(id${isTs ? ': string' : ''}, data${isTs ? ': any' : ''}) {\n`;
  content += `    return this.adapter.update(id, data);\n`;
  content += `  }\n\n`;
  content += `  async delete(id${isTs ? ': string' : ''}) {\n`;
  content += `    return this.adapter.delete(id);\n`;
  content += `  }\n`;
  content += `}\n`;

  return content;
}
