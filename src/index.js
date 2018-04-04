// @flow

const path = require('path');
const os = require('os');

const DependencyGraph = require('./DependencyGraph');

const run = async () => {
  const config = path.join(process.cwd(), 'package.json');
  const metaDir = path.join(os.homedir(), '.pour-meta');

  const dependencies = DependencyGraph.create(config);
};

run();
