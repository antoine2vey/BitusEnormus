/* eslint-env node, jest */
const mongoose = require('mongoose');
const expect = require('expect');
const user = require('../../src/modules/User');
const User = require('../../src/db/models/user');

const DEFAULT_MONEY_USER = user.defaultGive;

beforeAll(() => {
  mongoose.Promise = Promise;
  mongoose.connect('mongodb://localhost/mappabot', {
    useMongoClient: true,
  });
});
beforeEach(async (done) => {
  const mockUser = new User({ userId: 1, guildId: 1, username: 'Antoine' });
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
    const { client } = await user.get(1, 1);

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
    expect(client.userId).toEqual('1');
  });

  it(`should get defaulted to ${DEFAULT_MONEY_USER} kebabs`, async () => {
    const { client } = await user.get(1, 1);

    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
  });

  it('should pay an user', async () => {
    const money = 50;
    await user.pay(1, 1, money);
    const { client } = await user.get(1, 1);

    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER + money);
    expect(typeof client.kebabs).toBe('number');
  });

  it('should withdraw an user', async () => {
    const money = 50;
    await user.withdraw(1, 1, money);
    const { client } = await user.get(1, 1);

    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER - money);
    expect(typeof client.kebabs).toBe('number');
  });

  it('should upsert new user', async () => {
    const { client } = await user.pay(2, 1, 50);

    expect(client.kebabs).toEqual(50);
    expect(typeof client.kebabs).toBe('number');
  });

  it('should give money when first', async () => {
    await user.didFirst(1, 1);
    const { client } = await user.get(1, 1);

    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER + user.firstGive);
    expect(typeof client.kebabs).toBe('number');
  });

  it('should create new user if not here in database', async () => {
    const { client } = await user.register(1, 1, 'Antoine');

    expect(client).toBeTruthy();
    expect(client.username).toEqual('Antoine');
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
  });

  it('should not create new user if here in database', async () => {
    const { client } = await user.register(2, 1, 'John');

    expect(client).toBeTruthy();
    expect(client.username).toEqual('John');
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
  });

  it('should update all user for n kebabs', async () => {
    await user.payAll();
    const { client } = await user.get(1, 1);

    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER + user.defaultGive * 4);
  });

  it('should give to one and remove for one if enough money', async () => {
    const givenMoney = 100;
    const hasGiven = await user.giveTo(1, 2, 1, givenMoney);
    const { client } = await user.get(1, 1);

    expect(hasGiven).toBe(true);
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER - givenMoney);
  });

  it('should throw if trying to give too much money', async () => {
    const hasGiven = await user.giveTo(1, 2, 1, DEFAULT_MONEY_USER * 2);
    const { client } = await user.get(1, 1);

    expect(hasGiven).toBe(false);
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
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

  it('should return an array of users for a certain guild (unordered)', async () => {
    const { users } = await user.getAll(1, false);
    expect(Array.isArray(users)).toBe(true);
  });

  it('should return an array of users ordered by kebabs', async () => {
    const { users } = await user.getAll(1);

    expect(Array.isArray(users)).toBe(true);
    expect(users[0].kebabs).toBeGreaterThan(400);
  });

  it('should return users for a given and different guild', async () => {
    const { users } = await user.getAll(2);

    expect(Array.isArray(users)).toBe(true);
    expect(users[0].guildId).toEqual('2');
  });
});
