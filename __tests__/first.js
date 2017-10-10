/* eslint-env node, jest */
const ServerFirst = require('../src/modules/first');
const FirstModel = require('../src/db/models/first');
const User = require('../src/db/models/user');
const mongoose = require('mongoose');

beforeAll(() => {
  mongoose.Promise = Promise;
  mongoose.connect('mongodb://localhost/mappabot', { useMongoClient: true });
});

beforeEach((done) => {
  const s = new FirstModel({ guildId: 1 });
  const u = new User({ userId: 1, guildId: 1 });
  const fakeU = new User({ userId: 2, guildId: 1, firstCount: 5 });
  s.save(() => {
    u.save(() => {
      fakeU.save(() => done());
    });
  });
});

afterEach(async () => {
  await FirstModel.remove({ guildId: 1 });
  await User.remove({ userId: 1, guildId: 1 });
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
    await ServerFirst.do(1, 1, () => {});
    const end = await FirstModel.findOne({ guildId: 1 });

    expect(startServer.hasDoneFirst).toEqual(true);
    expect(afterReset.hasDoneFirst).toEqual(false);
    expect(end.hasDoneFirst).toEqual(true);
  });

  it('should increase first count', async () => {
    await ServerFirst.do(1, 1, () => {});
    const user = await User.findOne({ guildId: 1, userId: 1 });

    expect(user.firstCount).toEqual(1);
  });

  it('should increase even if not initialized', async () => {
    await ServerFirst.do(2, 1, () => {});
    const user = await User.findOne({ guildId: 1, userId: 2 });

    expect(user.firstCount).toEqual(6);
  });
});
