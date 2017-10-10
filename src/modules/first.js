const ServerFirst = require('../db/models/first');
const User = require('../db/models/user');

class First {
  async do(userId, guildId, callback) {
    const server = await ServerFirst.findOne({ guildId });
    await this.increaseFirst(userId, guildId);

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
    return await ServerFirst.update({}, { hasDoneFirst: false }, { multi: true });
  }

  increaseFirst(userId, guildId) {
    return User.findOneAndUpdate(
      { userId, guildId },
      { $inc: { firstCount: 1 } },
    );
  }
}

module.exports = new First();
