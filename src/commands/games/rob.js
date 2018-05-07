const Commando = require('discord.js-commando')
const moment = require('moment')
const { rob, message } = require('../../modules')

module.exports = class RobCommand extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'rob',
      aliases: ['rob'],
      group: 'rob',
      memberName: 'rob',
      description: 'Vol',
      details: "Voler du fric à quelqu'un",
      examples: ['!rob @Antoine'],
      argsCount: 1,
      args: [
        {
          key: 'userId',
          label: 'User',
          prompt: 'Quel utilisateur voler?',
          type: 'string',
        },
      ],
    })
  }

  async run(msg) {
    const { id } = msg.mentions.users.first()
    const guildId = msg.guild.id
    const start = moment()
    const end = moment().add(rob.time, 'ms')

    const { user } = msg.guild.members.get(id)

    rob
      .do(id, guildId)
      .then(async () => {
        const percentage = rob.getPercentage(start, end)

        msg.channel.send(`Vol en cours ( de <@${id}> )`)
        const messageSent = await msg.channel.send(`Completé à ${percentage}%`)

        const timer = setInterval(() => {
          messageSent.edit(`Completé à ${percentage}% ${rob.flashlight}`)

          rob.flashLight += 1
          if (rob.getPercentage(start, end) === 100) {
            messageSent.edit('Vol completé :thinking:')
            clearInterval(timer)
          }
        }, 1000)
      })
      .catch((e) => {
        message.addError({
          name: 'Error',
          value: e,
        })

        message.send(msg)
      })
  }
}
