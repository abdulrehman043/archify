export type Language = 'ts' | 'js';
export type Architecture = 'mvc' | 'mvc-service' | 'clean' | 'hexagonal';
export type Framework = 'none' | 'express' | 'fastify';
export type Database = 'none' | 'mongodb' | 'postgresql';

export interface ProjectConfig {
  projectName: string;
  language: Language;
  architecture: Architecture;
  framework: Framework;
  database: Database;
}

export interface FilePlan {
  type: 'file';
  path: string;
  content: string;
}

export interface DirectoryPlan {
  type: 'dir';
  path: string;
}

export type PlanItem = FilePlan | DirectoryPlan;
