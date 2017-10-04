/* eslint-env node, jest */
const mongoose = require('mongoose');
const user = require('../../src/modules/user');
const User = require('../../src/db/models/user');

const DEFAULT_MONEY_USER = User.schema.obj.kebabs.default;

beforeAll(() => {
  mongoose.Promise = Promise;
  mongoose.connect('mongodb://localhost/mappabot', {
    useMongoClient: true,
  });
});
beforeEach(async (done) => {
  const mockUser = new User({ userId: 1, guildId: 1 });
  await mockUser.save(() => done());
});
afterEach(async () => {
  await User.remove({ userId: 1 });
  await User.remove({ userId: 2 });
});
afterAll((done) => {
  mongoose.disconnect(done);
});

describe('Test for user command', () => {
  it('should get an user by its id', async () => {
    expect.assertions(1);
    const __user__ = await user.get(1, 1);

    expect(__user__).toBeTruthy();
  });

  it('should get defaulted to 50 kebabs', async () => {
    expect.assertions(1);
    const __user__ = await user.get(1, 1);

    expect(__user__.kebabs).toEqual(DEFAULT_MONEY_USER);
  });

  it.skip('should update user', async () => {
    expect.assertions(1);
    const GIVEN_MONEY = 50;
    const user_ = await user.userQuery(1, 1, GIVEN_MONEY);

    expect(user_.kebabs).toEqual(DEFAULT_MONEY_USER + GIVEN_MONEY);
  });

  it.skip('should upsert new user', async () => {
    expect.assertions(1);

    const __user__ = await user.userQuery(2, 1, 50);

    expect(__user__.kebabs).toEqual(50);
  });

  it.skip('should give money when first', async () => {
    expect.assertions(1);
    user.didFirst(1, 1);
    const __user__ = await User.findOne({ userId: 1, guildId: 1 });

    expect(__user__.kebabs).toEqual(DEFAULT_MONEY_USER + user.firstGive);
  });

  it('should create new user if not here in database', async () => {
    expect.assertions(1);
    const registered = await user.register(1, 1);

    expect(registered).toBe(true);
  });

  it('should not create new user if here in database', async () => {
    expect.assertions(1);
    const registered = await user.register(2, 1);

    expect(registered).toBe(false);
  });

  it('should update all user for n kebabs', async () => {
    expect.assertions(1);
    const newUser = new User({ userId: 2, guildId: 1 });
    newUser.save();

    await user.giveDaily();
    const firstUser = await user.get(1, 1);
    const secondUser = await user.get(2, 1);

    const toGive = DEFAULT_MONEY_USER + (user.defaultGive * 4);

    expect([firstUser.kebabs, secondUser.kebabs]).toEqual([toGive, toGive]);
  });

  it('should give to one and remove for one if enough money', async () => {
    expect.assertions(1);
    const hasGiven = await user.giveTo(1, 2, 10);

    expect(hasGiven).toBe(true);
  });

  it('should throw if trying to give too much money', async () => {
    expect.assertions(1);
    const hasGiven = await user.giveTo(1, 2, DEFAULT_MONEY_USER * 2);

    expect(hasGiven).toBe(false);
  });
});

describe('check assertions for guild comportement', () => {
  beforeEach(async () => {
    const mockUser = new User({ userId: 2, guildId: 2 });
    await mockUser.save();
  });
  afterEach(async () => {
    await User.remove({ userId: 2 });
  });

  it('should return an array of users for a certain guild', async () => {
    expect.assertions(1);
    const users = await user.users(1);

    expect(Array.isArray(users)).toBe(true);
  });

  it('should return users for a given and different guild', async () => {
    const users = await user.users(2);

    expect(Array.isArray(users)).toBe(true);
    expect(users[0].guildId).toEqual('2');
  });
});
