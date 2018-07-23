import Commando from 'discord.js-commando'

class RegisterCommand extends Commando.Command {
  constructor(client: any) {
    super(client, {
      name: 'register',
      aliases: ['register'],
      group: 'infos',
      memberName: 'register',
      description: 'Register',
      details: "S'enregistrer pour pourvoir gagner des kebabs",
      examples: ['!register'],
      argsCount: 0,
    })
  }

  async run(message) {
    console.log(message)
  }
}

module.exports = RegisterCommand
