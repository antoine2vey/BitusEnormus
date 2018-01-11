/* eslint-env node, jest */
const mongoose = require('mongoose');
const expect = require('expect');
const user = require('../../src/modules/User');
const User = require('../../src/db/models/user');
const { bank } = require('../../src/modules/Bank');

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
  await User.remove({ userId: 10 });
});
afterAll((done) => {
  mongoose.disconnect(done);
});

describe('Checking all User methods', () => {
  it('Should get a single user', async () => {
    const { client } = await user.get(1, 1, 'Antoine');

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
    expect(client.username).toEqual('Antoine');
  });

  it('Should create an user if it not exists on get', async () => {
    const { client, fresh } = await user.get(2, 1, 'John');

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
    expect(client.username).toEqual('John');
    expect(fresh).toBeFalsy();
  });

  it('Should return an Array of users for a certain guild (unordered)', async () => {
    const { users } = await user.getAll(1, false);
    expect(Array.isArray(users)).toBe(true);
  });

  it('Should return an Array of users ordered by kebabs', async () => {
    const { users } = await user.getAll(1);

    expect(Array.isArray(users)).toBe(true);
    expect(users[0].kebabs).toBeGreaterThan(DEFAULT_MONEY_USER - 100);
  });

  it('Should pay an user based on amount and return it', async () => {
    const { client } = await user.pay(1, 1, 100);

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER + 100);
  });

  it('Should withdraw money from an user', async () => {
    const { client } = await user.withdraw(1, 1, 100);

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER - 100);
  });

  it('Should registers an user', async () => {
    const { client } = await user.register(10, 1, 'Carry');

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
    expect(client.username).toEqual('Carry');
  });

  it('Should pay all users', async () => {
    await user.payAll();
    const { users } = await user.getAll(1);

    expect(Array.isArray(users)).toBe(true);
    expect(users[0].kebabs).toEqual(DEFAULT_MONEY_USER + user.defaultGive * 4);
  });

  it('Should do first and pay someone and returns it', async () => {
    const { client } = await user.didFirst(1, 1);

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER + user.firstGive);
  });

  it('Should give money to another user (enough money)', async () => {
    await user.register(10, 1, 'Carry');
    const hasGiven = await user.giveTo(1, 10, 1, 200);
    const Antoine = await user.get(1, 1);
    const Carry = await user.get(10, 1);

    expect(Carry.client).toBeTruthy();
    expect(Antoine.client).toBeTruthy();
    expect(Carry.client.kebabs).toEqual(DEFAULT_MONEY_USER + 200);
    expect(Antoine.client.kebabs).toEqual(DEFAULT_MONEY_USER - 200);
    expect(hasGiven).toBeTruthy();
  });

  it('Should give money to another user (not enough money)', async () => {
    await user.register(10, 1, 'Carry');
    const hasGiven = await user.giveTo(1, 10, 1, 600);
    const Antoine = await user.get(1, 1);
    const Carry = await user.get(10, 1);

    expect(Carry.client).toBeTruthy();
    expect(Antoine.client).toBeTruthy();
    expect(Carry.client.kebabs).toEqual(DEFAULT_MONEY_USER);
    expect(Antoine.client.kebabs).toEqual(DEFAULT_MONEY_USER);
    expect(hasGiven).toBeFalsy();
  });

  it('Should create user in database', async () => {
    const { client } = await user.create(10, 1, 'Carry');

    expect(client).toBeTruthy();
    expect(client.kebabs).toEqual(DEFAULT_MONEY_USER);
    expect(client.username).toEqual('Carry');
  });

  it.skip('Create bank for an user', async () => {
    const Carry = await user.get(10, 1, 'Carry');
    const { client } = await bank.create(Carry.client);

    expect(client).toBeTruthy();
  });
});
