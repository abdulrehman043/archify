import { mkdir, writeFile } from 'fs/promises';
import { dirname } from 'path';
import { PlanItem } from './types.js';

export async function executePlan(plan: PlanItem[]): Promise<void> {
  for (const item of plan) {
    if (item.type === 'dir') {
      await mkdir(item.path, { recursive: true });
    } else {
      // Ensure parent directory exists
      await mkdir(dirname(item.path), { recursive: true });
      await writeFile(item.path, item.content, 'utf-8');
    }
  }
}
