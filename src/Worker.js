// @flow

const child = require('child_process');
const fs = require('fs-extra');
const path = require('path');

import type { Project } from './DependencyGraph';

const runYarn = (command: string, cwd: string): Promise<{ code: number }> =>
  new Promise((resolve, reject) => {
    const c = child.exec(
      'yarn ' + command,
      { silent: false, env: process.env, cwd, encoding: 'utf8' },
      err => {
        if (err) {
          reject(err);
        } else {
          resolve({ code: 0 });
        }
      }
    );

    c.stdout.pipe(process.stdout);
    c.stderr.pipe(process.stderr);
  });

type WorkerParams = {
  project: Project,
  rootDir: string,
};

const install = async ({ project, rootDir }: WorkerParams): Promise<void> => {
  const projectPath = path.join(rootDir, project.name);
  await runYarn('install --non-interactive --frozen-lockfile', projectPath);
};

const run = async ({ project, rootDir }: WorkerParams): Promise<void> => {
  const isRoot = project.name === 'root';
  const projectPath = !isRoot ? path.join(rootDir, project.name) : rootDir;
  const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
  if (packageJson.scripts && packageJson.scripts.test) {
    await runYarn('test', projectPath);
  }
  if (packageJson.scripts && packageJson.scripts.deploy) {
    await runYarn('deploy', projectPath);
  }
};

module.exports = {
  run,
  install,
};
