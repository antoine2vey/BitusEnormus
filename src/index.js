/**
 * INV LINK: https://discordapp.com/api/oauth2/authorize?client_id=336909405981376524&scope=bot&permissions=0
 */
const Commando = require('discord.js-commando');
const sqlite = require('sqlite');
const env = require('dotenv');
const path = require('path');
const initMongo = require('./db/config');
const CronTask = require('cron').CronJob;
const { user, emoji, first } = require('./modules');
const Bank = require('./db/models/bank');

env.config();
const log = arg => console.log(arg);
const CronJob = (pattern, fn) => new CronTask(pattern, fn, null, true, 'Europe/Paris');
const client = new Commando.Client({ owner: process.env.OWNER_ID });

client.on('ready', async () => {
  initMongo();
  emoji.setKebab(client.emojis.find('name', 'kebab').id);

  log('🚀  🚀  🚀');

  // Everytime at midnight
  CronJob('0 0 * * *', async () => {
    await user.giveDaily();
    await first.resetServers();
  });
  // Update bank every 2 hours
  CronJob('0 */2 * * *', async () => {
    const banks = await Bank.find({});
    banks.forEach((bank) => {
      // eslint-disable-next-line
      bank.amount = Math.floor(bank.amount + (bank.amount * (0.15 / 12)));
      bank.save();
    });
  });
});

client.setProvider(sqlite.open(path.join(__dirname, 'settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))).catch(console.error);

client.registry
  .registerGroups([
    ['sounds', 'Soundbox'],
    ['album', 'Album Mappa'],
    ['first', 'Chope le first'],
    ['games', 'Mini jeux'],
    ['infos', 'Informations'],
    ['bank', 'Informations bancaires'],
  ])
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.login(process.env.DISCORD_TOKEN);
