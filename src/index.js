// @flow

require('flow-remove-types/register');

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const program = require('commander');

const DependencyGraph = require('./DependencyGraph');
const Scheduler = require('./Scheduler');

program
  .version('0.1.0')
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
  const absoluteRoot = path.join(process.cwd(), root);
  const rootPackageJson = await fs.readJson(
    path.join(absoluteRoot, 'package.json')
  );
  if (!rootPackageJson.pour) {
    throw new Error('Missing config');
  }

  const dependencies = DependencyGraph.create(rootPackageJson.pour);
  try {
    await Scheduler.start({ dependencies, rootDir: absoluteRoot, metaDir });
  } catch (err) {
    console.error(err);
  }
  console.log('Finished');
};

run({ root: program.root, projects: program.projects, metaDir: program.meta });
