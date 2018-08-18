// https://discordapp.com/api/oauth2/authorize?client_id=336909405981376524&scope=bot&permissions=0
import path from 'path'
import Commando, { CommandMessage, CommandoClient } from 'discord.js-commando'
import Helpers from './modules/helpers'
import User from './modules/user'
import Server from './modules/server'
import Bank from './database/models/bank'
import { dBank } from './types/data';

class Bot extends Helpers {
  client: CommandoClient
  user: User
  server: Server

  constructor() {
    super()

    this.client = new Commando.CommandoClient({ owner: process.env.OWNER_ID })
    this.user = new User()
    this.server = new Server()

    this.client
      .on('ready', () => {
        this.bootDatabase().then(async () => {
          console.log('Booted!')

          // Everytime at midnight
          const giveMidnight = this.makeTask('0 0 * * *', () => {
            this.server.resetGuilds()
          })

          giveMidnight.start()
          // Update bank every 2 hours
          const growBank = this.makeTask('0 */2 * * *', async () => {
            for (let user of await this.user.getAll()) {
              if (user.bank) {
                // Win 0.25 of his bank per day, divided by 12 for 1 tick per 2 hours
                await Bank.increaseById(user.bank.id, Math.floor(user.bank.amount * (0.25 / 12)) || 10)
              }
            }
          })

          growBank.start()
        })
      })
      .on('message', async (message: CommandMessage) => {
        // If our user is not a bot, process message

        if (!message.author.bot) {
          await this.user.handleMessage(message)
        }
      })

    this.client.registry
      .registerGroups([
        ['sounds', 'Soundbox'],
        ['album', 'Album Mappa'],
        ['first', 'Chope le first'],
        ['games', 'Mini jeux'],
        ['infos', 'Informations'],
        ['bank', 'Informations bancaires'],
        ['rob', 'Voler un utilisateur'],
        ['music', 'Musique']
      ])
      .registerDefaults()
      .registerCommandsIn(path.join(__dirname, 'commands'))

    this.client.login(process.env.DISCORD_TOKEN)
  }
}

new Bot()
