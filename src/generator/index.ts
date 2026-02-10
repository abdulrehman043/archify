import { ProjectConfig } from './types.js';
import { buildPlan } from './plan.js';
import { executePlan } from './writer.js';

export async function generateProject(config: ProjectConfig): Promise<void> {
  const plan = buildPlan(config);

  console.log('\n📦 Creating project structure...\n');

  // Show what will be created
  for (const item of plan) {
    if (item.type === 'dir') {
      console.log(`  📁 ${item.path}/`);
    } else {
      console.log(`  📄 ${item.path}`);
    }
  }

  // Execute the plan
  await executePlan(plan);

  console.log(`\n✅ Project "${config.projectName}" created successfully!\n`);
  console.log('Next steps:');
  console.log(`  cd ${config.projectName}`);
  console.log('  npm install');

  if (config.database === 'postgresql') {
    console.log('  npx prisma generate');
    console.log('  npx prisma db push');
  }

  console.log('  npm run dev');
  console.log('');
}
