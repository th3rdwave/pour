// @flow

const DependencyGraph = require('../DependencyGraph');

describe('DependencyGraph', () => {
  it('creates a simple graph', () => {
    const config = {
      projects: [
        {
          name: 'app',
          dependencies: ['shared'],
        },
        {
          name: 'api',
          dependencies: ['shared'],
        },
        {
          name: 'shared',
        },
      ],
    };

    const graph = DependencyGraph.create(config);
    expect(graph).toMatchSnapshot();
  });

  it('traverses a graph', () => {
    const config = {
      projects: [
        {
          name: 'app',
          dependencies: ['shared'],
        },
        {
          name: 'api',
          dependencies: ['shared'],
        },
        {
          name: 'shared',
        },
      ],
    };

    const graph = DependencyGraph.create(config);

    const cb = jest.fn().mockReturnValue(true);
    DependencyGraph.traverse(cb, graph);
    expect(cb).toHaveBeenCalledTimes(5);
  });

  it('maps once a graph', () => {
    const config = {
      projects: [
        {
          name: 'app',
          dependencies: ['shared'],
        },
        {
          name: 'api',
          dependencies: ['shared'],
        },
        {
          name: 'shared',
        },
      ],
    };

    const graph = DependencyGraph.create(config);

    const cb = jest.fn(e => e.node.name);
    const res = DependencyGraph.mapOnce(cb, graph);
    expect(cb).toHaveBeenCalledTimes(3);
    expect(res).toMatchSnapshot();
  });

  it('removes all nodes by name', () => {
    const config = {
      projects: [
        {
          name: 'app',
          dependencies: ['shared'],
        },
        {
          name: 'api',
          dependencies: ['shared'],
        },
        {
          name: 'shared',
        },
      ],
    };

    const graph = DependencyGraph.create(config);
    DependencyGraph.remove('shared', graph);
    expect(graph).toMatchSnapshot();
  });
});
