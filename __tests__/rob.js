/* eslint-env node, jest */
const mongoose = require('mongoose');
const rob = require('../src/modules/rob');
const user = require('../src/modules/User');
const User = require('../src/db/models/user');

jest.useFakeTimers();

beforeAll(() => {
  mongoose.Promise = Promise;
  mongoose.connect('mongodb://localhost/mappabot', {
    useMongoClient: true,
  });
});
beforeEach(async (done) => {
  const mockUser = new User({ userId: 1, guildId: 1, username: 'Antoine' });
  const targetUser = new User({ userId: 2, guildId: 1, username: 'John' });
  await mockUser.save(async () => {
    await targetUser.save(() => done());
  });
});
afterEach(async () => {
  await User.remove({ userId: 1 });
  await User.remove({ userId: 2 });
});
afterAll((done) => {
  mongoose.disconnect(done);
});

describe('guild workers', () => {
  it('should instantiate empty workers', () => {
    const workers = rob.guilds;

    expect(workers).toEqual(new Map());
  });

  it('should add a worker to a given guild', () => {
    const guildId = 1;
    const initiator = 1;
    const target = 2;

    rob.setWorker(guildId, initiator, target);

    const worker = rob.guilds.get(guildId);
    expect(worker).toBeDefined();
    expect(worker.initiator).toEqual(1);
    expect(worker.target).toEqual(2);
    expect(rob.isWorkerActive(1)).toBe(true);
  });

  it('should cancel rob if there is one', () => {
    const robCancelled = rob.cancelWorker(1, 2);
    const robNotExists = rob.cancelWorker(10, 20);

    expect(robCancelled).toBe(true);
    expect(robNotExists).toBe(false);
    expect(rob.isWorkerActive(1)).toBe(false);
  });
});

describe('Test for robbing module', () => {
  it('should default rob status to false', async () => {
    const { client } = await user.get(1, 1, 'Antoine');

    expect(client.isGettingRob).toBe(false);
  });

  it('should toggle rob status', async () => {
    const { client } = await rob.toggleRobStatus(1, 1, 'Antoine');

    expect(client.isGettingRob).toBe(true);
  });

  it('should be 5 minutes for rob time', () => {
    expect(rob.time).toEqual(process.env.NODE_ENV !== 'development' ? 300000 : 5000);
  });

  it.skip('should be back to false after given time', async () => {
    try {
      await rob.do(1, 1, 2, 'John');
      expect(setTimeout.mock.calls[0][1]).toBe(5000);

      jest.runAllTimers();
      // Run timer to proc closer worker
    } catch (err) {
      expect(err).toBeDefined();
    }
  });

  it('deletes the worker after job and update user', () => {
    const worker = rob.guilds.get(1);

    expect(worker).toBeUndefined();
  });

  it('checks if a worker is active', () => {
    expect(rob.isWorkerActive(1)).toBe(false);
  })
});

describe('test for money to steal', () => {
  it('should return amount for < 10000', () => {
    expect(rob.getMoneyToSteal(9000)).toEqual(9000 * 0.05);
  });

  it('should return amount for < 30000', () => {
    expect(rob.getMoneyToSteal(24000)).toEqual(24000 * 0.08);
  });

  it('should return amount for < 30000', () => {
    expect(rob.getMoneyToSteal(24000)).toEqual(24000 * 0.08);
  });

  it('should return amount for < 30000', () => {
    expect(rob.getMoneyToSteal(24000)).toEqual(24000 * 0.08);
  });

  it('should return amount for < 50000', () => {
    expect(rob.getMoneyToSteal(44000)).toEqual(44000 * 0.1);
  });

  it('should return amount for < 100000', () => {
    expect(rob.getMoneyToSteal(98000)).toEqual(98000 * 0.14);
  });

  it('should return amount for < 130000', () => {
    expect(rob.getMoneyToSteal(128000)).toEqual(128000 * 0.16);
  });

  it('should return amount for < 170000', () => {
    expect(rob.getMoneyToSteal(168000)).toEqual(168000 * 0.18);
  });

  it('should return amount for > 170000', () => {
    expect(rob.getMoneyToSteal(180000)).toEqual(180000 * 0.2);
  });

  it('should throw if not a number', () => {
    expect(rob.getMoneyToSteal('lol')).toEqual(false);
  });

  it('should throw for overinterger', () => {
    expect(rob.getMoneyToSteal(1e1000)).toEqual(false);
  });

  it('should not steal if money is under 5000', () => {
    expect(rob.getMoneyToSteal(3000)).toEqual(false);
  });
});

describe('display correct flashlight', () => {
  const blueLight = ':large_blue_circle:';
  const redLight = ':red_circle:';
  const wrapper = light => `:oncoming_police_car: ${light} :oncoming_police_car:`;

  it('start with blue flashlight', () => {
    expect(rob.flashlight).toEqual(wrapper(blueLight));
    rob.flashLight += 1;
  });

  it('follow with red flashlight', () => {
    expect(rob.flashlight).toEqual(wrapper(redLight));
    rob.flashLight += 1;
  });

  it('follows with blue flashlight', () => {
    expect(rob.flashlight).toEqual(wrapper(blueLight));
  });
});
