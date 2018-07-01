// https://discordapp.com/api/oauth2/authorize?client_id=336909405981376524&scope=bot&permissions=0
import path from 'path'
import Commando from 'discord.js-commando'
import Helpers from './modules/helpers'

class Bot extends Helpers {
  client: any

  constructor() {
    super()

    this.client = new Commando.Client({ owner: process.env.OWNER_ID })

    this.client.on('ready', () => {
      this.bootDatabase()
        .then(() => {
          console.log('Booted!')
          this.setNewEmote(this.client.emojis.find('name', 'kebab'))

          // Everytime at midnight
          const giveMidnight = this.makeTask('0 0 * * *', () => {
          })
    
          giveMidnight.start()
          // Update bank every 2 hours
          const growBank = this.makeTask('0 */2 * * *', () => {})
    
          growBank.start()
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
        ['rob', 'Voler un utilisateur']
      ])
      .registerDefaults()
      .registerCommandsIn(path.join(__dirname, 'commands'))

    this.client.login(process.env.DISCORD_TOKEN)
  }
}

new Bot()