// @flow

const fs = require('fs-extra');
const nullthrows = require('nullthrows').default;
const path = require('path');

const DependencyGraph = require('./DependencyGraph');
const Hash = require('./Hash');
const Log = require('./Log');
const Worker = require('./Worker');

import type { ProjectGraph, Project } from './DependencyGraph';

const getCachedSha1Sum = async (metaDir, project) => {
  try {
    return await fs.readFile(path.join(metaDir, project), 'utf8');
  } catch (ex) {
    return null;
  }
};

const writeCachedSha1Sum = async (metaDir, project, sha1sum) => {
  await fs.writeFile(path.join(metaDir, project), sha1sum, {
    encoding: 'utf8',
  });
};

const hasProjectChanged = (project, projectsMetaInfo) => {
  const info = nullthrows(projectsMetaInfo.get(project));
  if (info.dirty) {
    return true;
  }
  return info.dependencies
    ? info.dependencies.some(d => hasProjectChanged(d, projectsMetaInfo))
    : false;
};

type Options = {
  dependencies: ProjectGraph,
  rootDir: string,
  metaDir: string,
};

const start = async ({
  dependencies,
  rootDir,
  metaDir,
}: Options): Promise<void> =>
  new Promise(async (resolve, reject) => {
    // Install dependencies for each project even if it did not change, this
    // avoid failing if all build artifacts are not cached. Yarn is already good
    // at not reinstalling if no changes.
    await Promise.all(
      DependencyGraph.mapOnce(async ({ node }) => {
        await Worker.install({ project: node, rootDir });
      }, dependencies)
    );

    // Execute root project tasks
    await Worker.run({ project: dependencies.node, rootDir });

    // Compute hashes once for each project.
    const projectsMetaInfo = new Map(
      await Promise.all(
        DependencyGraph.mapOnce(
          async ({ node: { name, dependencies, ignore } }) => {
            const meta = await getCachedSha1Sum(metaDir, name);
            const projectPath = path.join(rootDir, name);
            const sha1sum = await Hash.sha1sum(
              projectPath,
              ignore ? new Set(ignore) : null
            );
            return [
              name,
              { name, dependencies, dirty: sha1sum !== meta, sha1sum },
            ];
          },
          dependencies
        )
      )
    );

    // Run tasks in order.
    const startedProjects = new Set();
    const getNextProject = (): Project | null => {
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

    const executeTasks = () => {
      let curProject;
      let tasks: Array<Project> = [];
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
        tasks.map(async t => {});
        for (const t of tasks) {
          const completeTask = () => {
            DependencyGraph.remove(t.name, dependencies);
            // Check if new tasks are available to be executed.
            executeTasks();
          };
          if (hasProjectChanged(t.name, projectsMetaInfo)) {
            Log.info('Running task for ' + t.name);
            Worker.run({ project: t, rootDir })
              .then(async () => {
                Log.info('Finished task for ' + t.name);
                await writeCachedSha1Sum(
                  metaDir,
                  t.name,
                  nullthrows(projectsMetaInfo.get(t.name)).sha1sum
                );
                completeTask();
              })
              .catch(reject);
          } else {
            Log.info('Skipping ' + t.name);
            completeTask();
          }
        }
      }
    };

    executeTasks();
  });

module.exports = {
  start,
};
