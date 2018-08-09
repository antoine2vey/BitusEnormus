import Commando, { CommandMessage } from 'discord.js-commando'
import fs from 'fs'
import ytdl from 'ytdl-core'

class RegisterCommand extends Commando.Command {
  constructor(client: any) {
    super(client, {
      name: 'play',
      aliases: ['play'],
      group: 'music',
      memberName: 'play',
      description: 'Play music',
      details: 'Play a Youtube music',
      examples: ['!play <recherche>'],
      argsCount: 1,
      args: [
        {
          key: 'term',
          label: 'Link',
          prompt: 'Quelle vidéo Youtube?',
          type: 'string'
        }
      ]
    })
  }

  async run(message: CommandMessage, { term }: { term: string }): Promise<any> {
    const channel = message.member.voiceChannel

    channel
      .join()
      .then(connection => {
        const readable = ytdl(term, {
          quality: 'highestaudio',
          filter: 'audioonly'
        })

        connection.playStream(readable)
      })
      .catch(console.error)
  }
}

module.exports = RegisterCommand
