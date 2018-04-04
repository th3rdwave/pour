// @flow

const child = require('child_process');

import type { Project } from './DependencyGraph';

const runYarn = (command: string, cwd: string) =>
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

const run = async (params: WorkerParams) => {};

module.exports = {
  run,
};
