import { getProjectConfig } from './prompts.js';
import { generateProject } from './generator/index.js';

export async function runCli(argv: string[]) {
  const projectName = argv[2];

  if (!projectName) {
    console.log('\n🏗️  Archify - Quick Project Scaffolding\n');
    console.log('Usage: archify <project-name>\n');
    console.log('Example: archify my-app\n');
    process.exit(1);
  }

  // Check for reserved names
  const reserved = ['node_modules', 'src', 'dist', 'test', 'tests'];
  if (reserved.includes(projectName.toLowerCase())) {
    console.error(`\n❌ "${projectName}" is a reserved name. Please choose another.\n`);
    process.exit(1);
  }

  console.log(`\n🏗️  Archify - Setting up "${projectName}"\n`);

  const config = await getProjectConfig(projectName);

  // Handle ctrl+c during prompts
  if (!config.language || !config.architecture || !config.framework || !config.database) {
    console.log('\n👋 Setup cancelled.\n');
    process.exit(0);
  }

  await generateProject(config);
}
