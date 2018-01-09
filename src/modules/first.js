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
    return (await ServerFirst.findOne({ guildId })) || false;
  }

  /**
   * Reset all servers
   */
  resetServers() {
    return new Promise((resolve, reject) =>
      ServerFirst.update({}, { hasDoneFirst: false }, { multi: true }, (err, didUpdate) => {
        if (err || !didUpdate) {
          return reject('Server error');
        }

        resolve(true);
      }),
    );
  }

  /**
   * Increase first count by one for a given user
   * @param {userId} user id
   * @param {guildId} guild id
   */
  increaseFirst(userId, guildId) {
    return new Promise((resolve, reject) =>
      User.findOneAndUpdate({ userId, guildId }, { $inc: { firstCount: 1 } }, (err, user) => {
        if (err) {
          return reject('Server error');
        }

        if (!user) {
          return reject('No user found');
        }

        return resolve({ user });
      }),
    );
  }
}

module.exports = new First();
