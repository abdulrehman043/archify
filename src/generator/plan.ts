import { ProjectConfig, PlanItem } from './types.js';
import * as templates from '../templates/index.js';

export function buildPlan(config: ProjectConfig): PlanItem[] {
  const { projectName, language, architecture, framework, database } = config;
  const ext = language === 'ts' ? 'ts' : 'js';
  const plan: PlanItem[] = [];

  // Root directory
  plan.push({ type: 'dir', path: projectName });

  // Base config files
  plan.push({
    type: 'file',
    path: `${projectName}/package.json`,
    content: templates.getPackageJson(config)
  });

  plan.push({
    type: 'file',
    path: `${projectName}/.gitignore`,
    content: templates.getGitignore()
  });

  plan.push({
    type: 'file',
    path: `${projectName}/.env`,
    content: templates.getEnvFile(config)
  });

  plan.push({
    type: 'file',
    path: `${projectName}/.env.example`,
    content: templates.getEnvExample(config)
  });

  if (language === 'ts') {
    plan.push({
      type: 'file',
      path: `${projectName}/tsconfig.json`,
      content: templates.getTsConfig()
    });
  }

  // Prisma schema for PostgreSQL
  if (database === 'postgresql') {
    plan.push({ type: 'dir', path: `${projectName}/prisma` });
    plan.push({
      type: 'file',
      path: `${projectName}/prisma/schema.prisma`,
      content: templates.getPrismaSchema(config)
    });
  }

  // Source directory
  plan.push({ type: 'dir', path: `${projectName}/src` });

  // Entry files
  plan.push({
    type: 'file',
    path: `${projectName}/src/index.${ext}`,
    content: templates.getIndexFile(config)
  });

  if (framework !== 'none') {
    plan.push({
      type: 'file',
      path: `${projectName}/src/app.${ext}`,
      content: templates.getAppFile(config)
    });
  }

  // Config directory
  plan.push({ type: 'dir', path: `${projectName}/src/config` });

  if (database !== 'none') {
    plan.push({
      type: 'file',
      path: `${projectName}/src/config/database.${ext}`,
      content: templates.getDatabaseConfig(config)
    });
  }

  // Build structure based on architecture
  switch (architecture) {
    case 'mvc':
      buildMvcStructure(plan, config);
      break;
    case 'mvc-service':
      buildMvcServiceStructure(plan, config);
      break;
    case 'clean':
      buildCleanStructure(plan, config);
      break;
    case 'hexagonal':
      buildHexagonalStructure(plan, config);
      break;
  }

  return plan;
}

function buildMvcStructure(plan: PlanItem[], config: ProjectConfig) {
  const { projectName, language, framework, database } = config;
  const ext = language === 'ts' ? 'ts' : 'js';

  // Controllers
  plan.push({ type: 'dir', path: `${projectName}/src/controllers` });
  if (framework !== 'none') {
    plan.push({
      type: 'file',
      path: `${projectName}/src/controllers/user.controller.${ext}`,
      content: templates.getUserController(config)
    });
  }

  // Models
  plan.push({ type: 'dir', path: `${projectName}/src/models` });
  if (database === 'mongodb') {
    plan.push({
      type: 'file',
      path: `${projectName}/src/models/user.model.${ext}`,
      content: templates.getUserModel(config)
    });
  }

  // Routes
  if (framework !== 'none') {
    plan.push({ type: 'dir', path: `${projectName}/src/routes` });
    plan.push({
      type: 'file',
      path: `${projectName}/src/routes/index.${ext}`,
      content: templates.getRoutesIndex(config)
    });
    plan.push({
      type: 'file',
      path: `${projectName}/src/routes/user.routes.${ext}`,
      content: templates.getUserRoutes(config)
    });
  }

  // Common/Utils
  plan.push({ type: 'dir', path: `${projectName}/src/middleware` });
  plan.push({ type: 'dir', path: `${projectName}/src/utils` });
}

function buildMvcServiceStructure(plan: PlanItem[], config: ProjectConfig) {
  const { projectName, language, framework, database } = config;
  const ext = language === 'ts' ? 'ts' : 'js';

  // Controllers
  plan.push({ type: 'dir', path: `${projectName}/src/controllers` });
  if (framework !== 'none') {
    plan.push({
      type: 'file',
      path: `${projectName}/src/controllers/user.controller.${ext}`,
      content: templates.getUserController(config)
    });
  }

  // Services
  plan.push({ type: 'dir', path: `${projectName}/src/services` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/services/user.service.${ext}`,
    content: templates.getUserService(config)
  });

  // Models
  plan.push({ type: 'dir', path: `${projectName}/src/models` });
  if (database === 'mongodb') {
    plan.push({
      type: 'file',
      path: `${projectName}/src/models/user.model.${ext}`,
      content: templates.getUserModel(config)
    });
  }

  // Routes
  if (framework !== 'none') {
    plan.push({ type: 'dir', path: `${projectName}/src/routes` });
    plan.push({
      type: 'file',
      path: `${projectName}/src/routes/index.${ext}`,
      content: templates.getRoutesIndex(config)
    });
    plan.push({
      type: 'file',
      path: `${projectName}/src/routes/user.routes.${ext}`,
      content: templates.getUserRoutes(config)
    });
  }

  // Common/Utils
  plan.push({ type: 'dir', path: `${projectName}/src/middleware` });
  plan.push({ type: 'dir', path: `${projectName}/src/utils` });
}

function buildCleanStructure(plan: PlanItem[], config: ProjectConfig) {
  const { projectName, language, framework, database } = config;
  const ext = language === 'ts' ? 'ts' : 'js';

  // Domain layer - Entities
  plan.push({ type: 'dir', path: `${projectName}/src/domain` });
  plan.push({ type: 'dir', path: `${projectName}/src/domain/entities` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/domain/entities/user.entity.${ext}`,
    content: templates.getUserEntity(config)
  });

  // Application layer - Use Cases
  plan.push({ type: 'dir', path: `${projectName}/src/application` });
  plan.push({ type: 'dir', path: `${projectName}/src/application/use-cases` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/application/use-cases/create-user.use-case.${ext}`,
    content: templates.getCreateUserUseCase(config)
  });
  plan.push({
    type: 'file',
    path: `${projectName}/src/application/use-cases/get-users.use-case.${ext}`,
    content: templates.getGetUsersUseCase(config)
  });

  // Infrastructure layer - Repositories
  plan.push({ type: 'dir', path: `${projectName}/src/infrastructure` });
  plan.push({ type: 'dir', path: `${projectName}/src/infrastructure/repositories` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/infrastructure/repositories/user.repository.${ext}`,
    content: templates.getUserRepository(config)
  });

  // Models (for MongoDB)
  if (database === 'mongodb') {
    plan.push({ type: 'dir', path: `${projectName}/src/infrastructure/models` });
    plan.push({
      type: 'file',
      path: `${projectName}/src/infrastructure/models/user.model.${ext}`,
      content: templates.getUserModel(config)
    });
  }

  // Interface layer - Controllers & Routes
  plan.push({ type: 'dir', path: `${projectName}/src/interfaces` });

  if (framework !== 'none') {
    plan.push({ type: 'dir', path: `${projectName}/src/interfaces/controllers` });
    plan.push({
      type: 'file',
      path: `${projectName}/src/interfaces/controllers/user.controller.${ext}`,
      content: templates.getUserController(config)
    });

    plan.push({ type: 'dir', path: `${projectName}/src/interfaces/routes` });
    plan.push({
      type: 'file',
      path: `${projectName}/src/interfaces/routes/index.${ext}`,
      content: templates.getRoutesIndex(config)
    });
    plan.push({
      type: 'file',
      path: `${projectName}/src/interfaces/routes/user.routes.${ext}`,
      content: templates.getUserRoutes(config)
    });
  }

  // Services (for clean architecture, these orchestrate use cases)
  plan.push({ type: 'dir', path: `${projectName}/src/application/services` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/application/services/user.service.${ext}`,
    content: templates.getUserService(config)
  });
}

function buildHexagonalStructure(plan: PlanItem[], config: ProjectConfig) {
  const { projectName, language, framework, database } = config;
  const ext = language === 'ts' ? 'ts' : 'js';

  // Core domain
  plan.push({ type: 'dir', path: `${projectName}/src/core` });
  plan.push({ type: 'dir', path: `${projectName}/src/core/domain` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/core/domain/user.entity.${ext}`,
    content: templates.getUserEntity(config)
  });

  // Ports (interfaces)
  plan.push({ type: 'dir', path: `${projectName}/src/core/ports` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/core/ports/user.port.${ext}`,
    content: templates.getUserPort(config)
  });

  // Services (application layer)
  plan.push({ type: 'dir', path: `${projectName}/src/core/services` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/core/services/user.service.${ext}`,
    content: templates.getUserServiceHexagonal(config)
  });

  // Adapters
  plan.push({ type: 'dir', path: `${projectName}/src/adapters` });

  // Inbound adapters (controllers/routes)
  plan.push({ type: 'dir', path: `${projectName}/src/adapters/inbound` });
  if (framework !== 'none') {
    plan.push({
      type: 'file',
      path: `${projectName}/src/adapters/inbound/user.controller.${ext}`,
      content: templates.getUserController(config)
    });
    plan.push({ type: 'dir', path: `${projectName}/src/adapters/inbound/routes` });
    plan.push({
      type: 'file',
      path: `${projectName}/src/adapters/inbound/routes/index.${ext}`,
      content: templates.getRoutesIndex(config)
    });
    plan.push({
      type: 'file',
      path: `${projectName}/src/adapters/inbound/routes/user.routes.${ext}`,
      content: templates.getUserRoutes(config)
    });
  }

  // Outbound adapters (repositories/external services)
  plan.push({ type: 'dir', path: `${projectName}/src/adapters/outbound` });
  plan.push({
    type: 'file',
    path: `${projectName}/src/adapters/outbound/user.adapter.${ext}`,
    content: templates.getUserAdapter(config)
  });

  // Models (for MongoDB)
  if (database === 'mongodb') {
    plan.push({ type: 'dir', path: `${projectName}/src/adapters/outbound/models` });
    plan.push({
      type: 'file',
      path: `${projectName}/src/adapters/outbound/models/user.model.${ext}`,
      content: templates.getUserModel(config)
    });
  }
}
