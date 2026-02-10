import prompts from 'prompts';
import { ProjectConfig } from './generator/types.js';

export async function getProjectConfig(projectName: string): Promise<ProjectConfig> {
  const response = await prompts([
    {
      type: 'select',
      name: 'language',
      message: 'Select language:',
      choices: [
        { title: 'TypeScript', value: 'ts' },
        { title: 'JavaScript', value: 'js' }
      ]
    },
    {
      type: 'select',
      name: 'architecture',
      message: 'Select architecture:',
      choices: [
        { title: 'MVC', value: 'mvc', description: 'Models, Views, Controllers' },
        { title: 'MVC + Services', value: 'mvc-service', description: 'MVC with service layer' },
        { title: 'Clean Architecture', value: 'clean', description: 'Use cases, entities, repositories' },
        { title: 'Hexagonal', value: 'hexagonal', description: 'Ports and adapters pattern' }
      ]
    },
    {
      type: 'select',
      name: 'framework',
      message: 'Select framework:',
      choices: [
        { title: 'Express', value: 'express' },
        { title: 'Fastify', value: 'fastify' },
        { title: 'None (vanilla Node.js)', value: 'none' }
      ]
    },
    {
      type: 'select',
      name: 'database',
      message: 'Select database:',
      choices: [
        { title: 'None', value: 'none' },
        { title: 'MongoDB (Mongoose)', value: 'mongodb' },
        { title: 'PostgreSQL (Prisma)', value: 'postgresql' }
      ]
    }
  ]);

  return {
    projectName,
    language: response.language,
    architecture: response.architecture,
    framework: response.framework,
    database: response.database
  };
}
