const ServerFirst = require('../db/models/first')
const User = require('../db/models/user')

class First {
  do(userId, guildId) {
    return new Promise(async (resolve, reject) => {
      const server = await ServerFirst.findOne({ guildId })
      await this.increaseFirst(userId, guildId)

      if (!server) {
        const newServer = new ServerFirst({ guildId })
        return await newServer.save((err) => {
          if (err) {
            return reject(err)
          }

          return resolve(true)
        })
      }

      return ServerFirst.update({ guildId }, { hasDoneFirst: true })
        .then(() => {
          resolve(true)
        })
        .catch(err => reject(err))
    })
  }

  /**
   * Resolve if first has been done on this server
   * @param {} guildId Guild
   */
  hasBeenDone(guildId) {
    return new Promise((resolve, reject) => {
      ServerFirst.findById(guildId)
        .then((guild) => {
          if (guild.hasDoneFirst) {
            return resolve(true)
          }

          return reject(false)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  /**
   * Reset all servers
   */
  resetServers() {
    return new Promise((resolve, reject) =>
      ServerFirst.update({}, { hasDoneFirst: false }, { multi: true }, (err, didUpdate) => {
        if (err || !didUpdate) {
          return reject('Server error')
        }

        return resolve(true)
      }),
    )
  }

  /**
   * Increase first count by one for a given user
   * @param {userId} user id
   * @param {guildId} guild id
   */
  increaseFirst(userId, guildId) {
    return new Promise((resolve, reject) =>
      User.findOneAndUpdate(
        { userId, guildId },
        { $inc: { firstCount: 1 } },
        { new: true, upsert: true },
        (err, user) => {
          if (err) {
            return reject('Server error')
          }

          if (!user) {
            return reject('No user found')
          }

          return resolve({ user })
        },
      ),
    )
  }
}

module.exports = new First()
