// @flow

export type Project = {
  name: string,
  dependencies?: ?Array<string>,
  ignore?: ?Array<string>,
};

export type Config = {
  projects: Array<Project>,
};

export type Edge<T> = {
  node: T,
  edges: Array<Edge<T>>,
};

export type Graph<T> = Edge<T>;

export type ProjectGraph = Graph<Project>;

const create = (config: Config): ProjectGraph => {
  const addProjects = (projects, node) => {
    for (const p of projects) {
      const newNode = { node: p, edges: [] };
      node.edges.push(newNode);
      if (p.dependencies) {
        addProjects(
          p.dependencies.map(dep => {
            const project = config.projects.find(p => p.name === dep);
            if (!project) {
              throw new Error(`Invalid dependency name ${dep}.`);
            }
            return project;
          }),
          newNode
        );
      }
    }
  };

  const graph = { node: { name: 'root' }, edges: [] };
  addProjects(config.projects, graph);

  return graph;
};

/**
 * Traverse the graph and execute a the callback on each node, the callback must
 * return whether traversal should continue.
 */
const traverse = (
  callback: (Edge<Project>) => boolean,
  graph: ProjectGraph
): void => {
  let queue = [...graph.edges];
  while (queue.length > 0) {
    const edge = queue.pop();
    if (!callback(edge)) {
      return;
    }
    queue = queue.concat(edge.edges);
  }
};

/**
 * Map each unique edge in the graph (based on node.name).
 */
const mapOnce = <T>(
  callback: (Edge<Project>) => T,
  graph: ProjectGraph
): Array<T> => {
  const seen = new Set();
  const result = [];
  let queue = [...graph.edges];
  while (queue.length > 0) {
    const edge = queue.pop();
    if (!seen.has(edge.node.name)) {
      result.push(callback(edge));
      queue = queue.concat(edge.edges);
      seen.add(edge.node.name);
    }
  }
  return result;
};

/**
 * Remove a project by name from the graph (in place).
 */
const remove = (projectName: string, graph: ProjectGraph): void => {
  for (let i = graph.edges.length - 1; i >= 0; i--) {
    const e = graph.edges[i];
    if (e.node.name === projectName) {
      graph.edges.splice(i, 1);
    } else {
      remove(projectName, e);
    }
  }
};

module.exports = {
  create,
  traverse,
  remove,
  mapOnce,
};
