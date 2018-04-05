// @flow

const DependencyGraph = require('./DependencyGraph');
const Worker = require('./Worker');

import type { ProjectGraph } from './DependencyGraph';

type Options = {
  dependencies: ProjectGraph,
  rootDir: string,
  metaDir: string,
};

const start = ({ dependencies, rootDir, metaDir }): Promise<void> => {
  const startedProjects = new Set();
  const getNextProject = () => {
    let projectToRun = null;
    DependencyGraph.traverse(edge => {
      if (!startedProjects.has(edge.node.name) && edge.edges.length === 0) {
        projectToRun = edge.node;
        return false;
      }
      return true;
    }, dependencies);
    if (projectToRun) {
      startedProjects.add(projectToRun.name);
    }
    return projectToRun;
  };

  const executeTasks = (resolve, reject) => {
    let curProject;
    let tasks = [];
    do {
      curProject = getNextProject();
      if (curProject) {
        tasks.push(curProject);
      }
    } while (curProject !== null);
    if (tasks.length === 0 && dependencies.edges.length === 0) {
      // Actually done!!
      resolve();
      return;
    } else {
      for (const t of tasks) {
        Worker.run({ project: t, rootDir })
          .then(() => {
            DependencyGraph.remove(t.name, dependencies);
            // Check if new tasks are available to be executed.
            executeTasks(resolve, reject);
          })
          .catch(reject);
      }
    }
  };

  return new Promise((resolve, reject) => executeTasks(resolve, reject));
};

module.exports = {
  start,
};
