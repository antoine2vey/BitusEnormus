// @flow

import type { Message } from 'discord.js'

const Commando = require('discord.js-commando')
const First = require('../../modules/first')

module.exports = class FirstCommand extends Commando.Command {
  constructor(client: any) {
    super(client, {
      name: 'first',
      aliases: ['first'],
      group: 'first',
      memberName: 'add',
      description: 'MAIS FIRST PUTAIN',
      details: 'FIRST BORDEL LA',
      examples: ['!first'],
      argsCount: 0,
    })
  }

  async run(message: Message) {
    new First(message)
  }
}