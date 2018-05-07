// https://discordapp.com/api/oauth2/authorize?client_id=336909405981376524&scope=bot&permissions=0import type { DiscordClient } from './types'
const Commando = require('discord.js-commando')
const path = require('path')
const { user, first } = require('./modules')
const Bank = require('./db/models/bank')


const Helpers = require('./modules/helpers')

class Bot extends Helpers {
  client: any

  constructor(): void {
    super()

    this.client = new Commando.Client({ owner: process.env.OWNER_ID })

    this.client.on('ready', async () => {
      await this.bootDatabase()
      this.setNewEmote(this.client.emojis.find('name', 'kebab'))

      console.log('🚀  🚀  🚀')

      // Everytime at midnight
      this.makeTask('0 0 * * *', async () => {
        await user.giveDaily()
        await first.resetServers()
      })
      // Update bank every 2 hours
      this.makeTask('0 */2 * * *', async () => {
        const banks = await Bank.find({})
        banks.forEach((bank) => {
          // eslint-disable-next-line
          bank.amount = Math.floor(bank.amount + bank.amount * (0.15 / 12))
          bank.save()
        })
      })
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
      ])
      .registerDefaults()
      .registerCommandsIn(path.join(__dirname, 'commands'))

    this.client.login(process.env.DISCORD_TOKEN)
  }
}

new Bot()
