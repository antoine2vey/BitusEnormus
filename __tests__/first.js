/* eslint-env node, jest */
const ServerFirst = require('../src/modules/first');
const FirstModel = require('../src/db/models/first');
const mongoose = require('mongoose');

beforeAll(() => {
  mongoose.Promise = Promise;
  mongoose.connect('mongodb://localhost/mappabot', { useMongoClient: true });
});

beforeEach((done) => {
  const s = new FirstModel({ guildId: 1 });
  s.save(() => done());
});

afterEach(async () => {
  await FirstModel.remove({ guildId: 1 });
});

afterAll((done) => {
  mongoose.disconnect(done);
});

describe('Test for first command', async () => {
  it('should be true when initd', async () => {
    const { hasDoneFirst } = await FirstModel.findOne({ guildId: 1 });

    expect(hasDoneFirst).toBe(true);
  });

  it('should reset all guilds', async () => {
    const servers = await FirstModel.find();
    await ServerFirst.resetServers();
    const newServers = await FirstModel.find({});

    expect(servers.length).toEqual(newServers.length);
    expect(newServers.map(s => s.hasDoneFirst)).toEqual(newServers.map(() => false));
  });

  it('should do first after midnight', async () => {
    // Before
    const startServer = await FirstModel.findOne({ guildId: 1 });
    // Reset
    await ServerFirst.resetServers();
    const afterReset = await FirstModel.findOne({ guildId: 1 });
    // Do
    await ServerFirst.do(1, () => {});
    const end = await FirstModel.findOne({ guildId: 1 });

    expect(startServer.hasDoneFirst).toEqual(true);
    expect(afterReset.hasDoneFirst).toEqual(false);
    expect(end.hasDoneFirst).toEqual(true);
  });
});
