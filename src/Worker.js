// @flow

const child = require('child_process');
const path = require('path');

const Hash = require('./Hash');

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

const run = async ({ project, rootDir }: WorkerParams) => {
  const projectPath = path.join(rootDir, project.name);
  const sha1sum = await Hash.sha1sum(projectPath);
  console.log(sha1sum);
  await runYarn('install', projectPath);
  await runYarn('test', projectPath);
};

module.exports = {
  run,
};
