const ServerFirst = require('../db/models/first');

class First {
  async do(guildId, callback) {
    const server = await ServerFirst.findOne({ guildId });

    if (!server) {
      const newServer = new ServerFirst({ guildId });
      return await newServer.save(() => callback());
    }

    return await ServerFirst.update({ guildId }, { hasDoneFirst: true }, callback());
  }

  async hasBeenDone(guildId) {
    return await ServerFirst.findOne({ guildId }) || false;
  }

  async resetServers() {
    return await ServerFirst.update({}, { hasDoneFirst: false });
  }
}

module.exports = new First();
