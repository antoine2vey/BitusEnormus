const BankModel = require('../db/models/bank');

class Bank {
  /**
   * Create bank that belongs to an user
   * @param {*} belongsTo
   */
  create(belongsTo) {
    return new Promise((resolve, reject) => {
      const bank = new BankModel({
        belongsTo: belongsTo._id,
        lastSet: new Date(),
      });

      return bank.save((err) => {
        if (err) {
          return reject('Server error');
        }

        return resolve(bank);
      });
    });
  }

  /**
   * Get query for update bank
   * @param {*} method
   * @param {*} amount
   */
  getQuery(method, amount) {
    if (method === 'get') {
      return {
        $inc: { amount },
        lastGet: new Date(),
      };
    }

    return {
      $inc: { amount },
      lastSet: new Date(),
    };
  }

  /**
   * Update bank for a given query
   * @param {*} bankId
   * @param {*} query
   */
  update(bankId, query) {
    return new Promise((resolve, reject) => {
      BankModel.findByIdAndUpdate(bankId, query, { new: true }).exec((err, bank) => {
        if (err) {
          return reject('Server error');
        }

        return resolve({ bank });
      });
    });
  }
}

module.exports = {
  bank: new Bank(),
};
