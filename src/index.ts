// https://discordapp.com/api/oauth2/authorize?client_id=336909405981376524&scope=bot&permissions=0
import path from 'path'
import Commando from 'discord.js-commando'
import Helpers from './modules/helpers'
import oneLine from 'common-tags'

class Bot extends Helpers {
  client: any

  constructor() {
    super()

    this.client = new Commando.Client({ owner: process.env.OWNER_ID })

    this.client
    .on('error', (err) => {
      console.log('salut', err)
    })
    .on('warn', (err) => {
      console.log('salutt', err)
    })
    .on('debug', console.log)
    .on('disconnect', () => {
      console.warn('Disconnected!')
    })
    .on('reconnecting', () => {
      console.warn('Reconnecting...')
    })
    .on('commandError', (cmd, err) => {
      if (err instanceof Commando.FriendlyError) return
      console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err)
    })
    .on('commandBlocked', (msg, reason) => {
      console.log(oneLine`
        Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
        blocked; ${reason}
      `)
    })
    .on('commandPrefixChange', (guild, prefix) => {
      console.log(oneLine`
        Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
        ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
      `)
    })
    .on('commandStatusChange', (guild, command, enabled) => {
      console.log(oneLine`
        Command ${command.groupID}:${command.memberName}
        ${enabled ? 'enabled' : 'disabled'}
        ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
      `)
    })
    .on('groupStatusChange', (guild, group, enabled) => {
      console.log(oneLine`
        Group ${group.id}
        ${enabled ? 'enabled' : 'disabled'}
        ${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
      `)
    })
    .on('ready', () => {
      this.bootDatabase()
        .then(() => {
          console.log('Booted!')
          this.setNewEmote(this.client.emojis.find('name', 'kebab'))

          // Everytime at midnight
          const giveMidnight = this.makeTask('0 0 * * *', () => {
            return 2
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
