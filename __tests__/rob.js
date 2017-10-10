/* eslint-env node, jest */
const mongoose = require('mongoose');
const RobModule = require('../src/modules/rob');
const user = require('../src/modules/user');
const User = require('../src/db/models/user');

const RobCommands = require('../src/commands/games/rob');
const Commando = require('discord.js-commando');
const path = require('path');

const client = new Commando.Client();
client.registry
  .registerGroups([
    ['sounds', 'Soundbox'],
    ['album', 'Album Mappa'],
    ['first', 'Chope le first'],
    ['games', 'Mini jeux'],
    ['infos', 'Informations'],
    ['bank', 'Informations bancaires'],
    ['rob', 'Voler un utilisateur'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, '..', 'src', 'commands'));

const rob = new RobCommands(client);

jest.useFakeTimers();

beforeAll(() => {
  mongoose.Promise = Promise;
  mongoose.connect('mongodb://localhost/mappabot', {
    useMongoClient: true,
  });
});
beforeEach(async (done) => {
  const mockUser = new User({ userId: 1 });
  await mockUser.save(() => done());
});
afterEach(async () => {
  await User.remove({ userId: 1 });
});
afterAll((done) => {
  mongoose.disconnect(done);
});

describe('Test for robbing module', () => {
  it('should default rob status to false', async () => {
    const { isGettingRob } = await user.get(1);

    expect(isGettingRob).toBe(false);
  });

  it('should toggle rob status', async () => {
    const { isGettingRob } = await RobModule.toggleRobStatus('1');

    expect(isGettingRob).toBe(true);
  });

  it('should be 5 minutes for rob time', () => {
    expect(RobModule.time).toEqual(5 * 1000 * 60);
  });

  it('should be back to false after 5 minutes', async () => {
    RobModule.do(1);

    expect(setTimeout.mock.calls[0][1]).toBe(5000);
    expect(setTimeout.mock.calls.length).toBe(1);
  });
});

describe('test for money to steal', () => {
  it('should return amount for < 10000', () => {
    expect(RobModule.getMoneyToSteal(9000)).toEqual(9000 * 0.05);
  });

  it('should return amount for < 30000', () => {
    expect(RobModule.getMoneyToSteal(24000)).toEqual(24000 * 0.08);
  });

  it('should return amount for < 30000', () => {
    expect(RobModule.getMoneyToSteal(24000)).toEqual(24000 * 0.08);
  });

  it('should return amount for < 30000', () => {
    expect(RobModule.getMoneyToSteal(24000)).toEqual(24000 * 0.08);
  });

  it('should return amount for < 50000', () => {
    expect(RobModule.getMoneyToSteal(44000)).toEqual(44000 * 0.1);
  });

  it('should return amount for < 100000', () => {
    expect(RobModule.getMoneyToSteal(98000)).toEqual(98000 * 0.14);
  });

  it('should return amount for < 130000', () => {
    expect(RobModule.getMoneyToSteal(128000)).toEqual(128000 * 0.16);
  });

  it('should return amount for < 170000', () => {
    expect(RobModule.getMoneyToSteal(168000)).toEqual(168000 * 0.18);
  });

  it('should return amount for > 170000', () => {
    expect(RobModule.getMoneyToSteal(180000)).toEqual(180000 * 0.2);
  });

  it('should throw if not a number', () => {
    expect(RobModule.getMoneyToSteal('lol')).toEqual(false);
  });

  it('should throw for overinterger', () => {
    expect(RobModule.getMoneyToSteal(1e1000)).toEqual(false);
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
