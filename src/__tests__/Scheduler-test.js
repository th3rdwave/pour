// @flow

jest
  .mock('fs-extra')
  .mock('../Log')
  .mock('../Hash', () => ({
    sha1sum: () => 'a',
  }));

describe('Scheduler', () => {
  it('runs tasks in the right order', async () => {
    // Setup worker mock.
    jest.resetModules();
    // $FlowFixMe
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
