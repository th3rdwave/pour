#!/usr/bin/env node

// @flow

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const program = require('commander');

const DependencyGraph = require('./DependencyGraph');
const Scheduler = require('./Scheduler');

program
  .version(require('../package.json').version, '-v, --version')
  .option(
    '-r, --root [path]',
    'The root directory of the monorepo, relative to the cwd.'
  )
  .option(
    '-m, --meta [path]',
    'Directory where metadata about changed files is saved.',
    path.join(os.homedir(), '.pour-meta')
  )
  .parse(process.argv);

const run = async ({ root, projects, metaDir }) => {
  const absoluteRoot = root ? path.join(process.cwd(), root) : process.cwd();
  const rootPackageJson = await fs.readJson(
    path.join(absoluteRoot, 'package.json')
  );
  if (!rootPackageJson.pour) {
    throw new Error('Missing config');
  }

  await fs.ensureDir(metaDir);

  const dependencies = DependencyGraph.create(rootPackageJson.pour);
  try {
    await Scheduler.start({ dependencies, rootDir: absoluteRoot, metaDir });
  } catch (err) {
    console.error(err);
  }
  console.log('Finished');
};

const options = program.opts();
run({ root: options.root, projects: options.projects, metaDir: options.meta });
