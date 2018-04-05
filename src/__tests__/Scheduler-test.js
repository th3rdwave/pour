// @flow

describe('DependencyGraph', () => {
  it('runs tasks in the right order', async () => {
    // Setup worker mock.
    jest.resetModules();
    const run = jest.fn().mockResolvedValue();
    jest.doMock('../Worker', () => ({
      run,
    }));
    const Scheduler = require('../Scheduler');

    const graph = {
      node: { name: 'root' },
      edges: [
        {
          node: { name: 'app' },
          edges: [{ node: { name: 'shared' }, edges: [] }],
        },
        {
          node: { name: 'api' },
          edges: [{ node: { name: 'shared' }, edges: [] }],
        },
        { node: { name: 'shared' }, edges: [] },
      ],
    };

    await Scheduler.start({ dependencies: graph, rootDir: '', metaDir: '' });

    expect(run.mock.calls).toMatchSnapshot();
  });
});
