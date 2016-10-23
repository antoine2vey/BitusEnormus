/*jshint eqnull:true*/
var mongoose = require('mongoose'),
  db = mongoose.connection,
  Schema = mongoose.Schema,
  Discord = require('discord.io'),
  Commands = require('./Commands.json'),
  Utils = require('./Utils.json'),
  bot = new Discord.Client({
    autorun: true,
    token: Utils.token
  }),
  Cleverbot = require('cleverbot-node'),
  fs = require('fs'),
  Lame = require('lame'),
  spawn = require('child_process').spawn;

cleverbot = new Cleverbot();
mongoose.Promise = require('bluebird');

/**
 * we put an offset in case there is any lags or what
 **/
const OFFSET = 2000;
var initRoll = false;
var hasRolled = false;
var isFirst = false;
var playerOne = {};
var playerTwo = {};
var SERVER_ID;
var CHANNEL_ID;
var BOT_CHANNEL_ID;
const IP_ADRESS = Utils.ip;
mongoose.connect('mongodb://'+IP_ADRESS+'/BitusEnormus');
var ladderboardSchema = new Schema({
  name: String,
  victories: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  bank: {
    type: Number,
    default: 0
  },
  date: Date,
  playerID: Number,
  timesHasBeenFirst: Number
});
var ladderboardPlayer = mongoose.model('Ladder', ladderboardSchema);


bot.on('ready', event => {
  bot.setPresence({
    game: "!help"
  });
});


bot.on('disconnect', (err, code) => {
  console.error('errcode %s', code);
  bot.connect();
});


bot.on('any', event => {
  if (event) {
    const today = new Date();
    const tommorow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const timeToMidnight = (tommorow - today);
    var timer = setTimeout(function() {
      isFirst = false;
    }, timeToMidnight);

    //We redefine message and user because event has a different structure
    if (event.d) {
      const message = event.d.content;
      const channelID = event.d.channel_id;
      const user = !event.d.author ? null : event.d.author.username;
      const id = !event.d.author ? null : event.d.author.id;

      if (message === "!first" && !isFirst && (new Date().getHours() >= 0 && new Date().getHours() < 12)) {
        isFirst = true;
        firstQuery(user, id);
        bot.sendMessage({
          to: channelID,
          message: `:robot: ${user} à eu le first a+ les noobix :robot:`
        });
      } else if (message === "!first" && !isFirst) {
        bot.sendMessage({
          to: channelID,
          message: `:robot: Attend 0h00 pour voter :robot:`
        });
      } else if (message === "!first" && isFirst)  {
        bot.sendMessage({
          to: channelID,
          message: `:robot: Trop tard grosse merde :robot:`
        });
      }
    }
    if(event.t === "GUILD_CREATE"){
      SERVER_ID = event.d.id;
    }
    if(event.t === "VOICE_STATE_UPDATE"){
      CHANNEL_ID = event.d.channel_id;
    }
  }
});


bot.on('message', (user, userID, channelID, message, event) => {

  if (message === "!roll" && !initRoll) {
    initRoll = true;
    playerOne = new Player(user, userID, true, undefined);
    bot.sendMessage({
      to: channelID,
      message: ':rocket:  ' + user + ' à démarré un duel! Utilisez "!roll me" pour l\'affronter  :rocket:'
    });
  }

  if (message === "!roll me" && initRoll && userID !== playerOne.id && !hasRolled) {
    /*Prevent from spamming !roll me that cause to add 'null' in database...*/
    hasRolled = true;
    playerTwo = new Player(user, userID, false, undefined);
    bot.sendMessage({
      to: channelID,
      message: `:rocket:  ${playerOne.name} :game_die: ${playerTwo.name}  :rocket:`
    });

    /**
     * We setTimeout for production environement because sometimes, the message
     * upper appears after the dice has been rolled, doesn't make any sense
     */
    setTimeout(function() {
      rollDice(channelID, playerOne.name, playerOne.id, playerTwo.name, playerTwo.id);
      initRoll = false;
      hasRolled = false;
      playerOne = {};
      playerTwo = {};
    }, 1000);
  }

  if (message === "!ladder") {
    ladderboardPlayer.find({})
      .sort('-victories')
      .exec(function(err, doc) {
        if (!err) {
          var ladder = doc;
          if (ladder.length) {
            bot.sendMessage({
              to: channelID,
              message: ladder.map((player, index) => {
                if(!player.name) return;
                return `**${setPlace(index+1)}** ${setMedal(index+1)} ${player.name} : ${player.victories} victoires et possède ${player.bank} kebabs!  (${getWinrate(player.victories, player.gamesPlayed)}% de winrate)\n\n`;
              }).join('')
            });
          } else {
            bot.sendMessage({
              to: channelID,
              message: `:rocket:  Aucun joueur n'a encore joué  :rocket:`
            });
          }
        }
      });
  }

  if (message === "!ladder first") {
    //If our player has more than 1 win, we can display him, otherwise, no!
    ladderboardPlayer.find({
        timesHasBeenFirst: {
          $gte: 1
        }
      })
      .sort('-timesHasBeenFirst')
      .exec(function(err, doc) {
        if (!err) {
          var firstLadder = doc;
          if (firstLadder.length) {
            bot.sendMessage({
              to: channelID,
              message: firstLadder.map((person, index) => {
                if (person.timesHasBeenFirst) {
                  if(!person.name) return;
                  return `**${setPlace(index+1)}** ${setMedal(index+1)} ${person.name} : ${person.timesHasBeenFirst} first!\n\n`;
                }
              }).join('')
            });
          } else {
            bot.sendMessage({
              to: channelID,
              message: `:rocket:  Aucun joueur n'a encore firsté  :rocket:`
            });
          }
        }
      });
  }

  if (message === "!help") {
    bot.sendMessage({
      to: channelID,
      message: Commands.help.map((command) => {
        return `:arrow_right: ${command.commandName} : ${command.explication} \n\n`;
      }).join('')
    });
  }

  if (message.match(/^(<@198532347765850112>)/g)) {
    var msgArr = message.split(' ');
    msgArr.shift();
    Cleverbot.prepare(function() {
      cleverbot.write(msgArr.join(' '), function(res) {
        bot.sendMessage({
          to: channelID,
          message: `:robot:  <@${userID}> ${res.message}  :robot:`
        });
      });
    });
  }

  if (message === "!argentstp") {
    ladderboardPlayer.find({
        playerId: userID
      })
      .exec(function(err, doc) {
        if (!err) {
          if (!doc.length) {
            getTodayMoney(user, userID, channelID);
          } else {
            var date;
            if (doc[0].date == null) {
              getTodayMoney(user, userID, channelID);
            }
            date = doc[0].date;
            var dateAfterOneDay = new Date(+date + 1 * 24 * 60 * 60 * 1000);
            var dateNow = new Date();

            if (dateNow > dateAfterOneDay) {
              getTodayMoney(user, userID, channelID);
            } else if (dateNow > date && dateNow < dateAfterOneDay) {
              bot.sendMessage({
                to: channelID,
                message: `Impossible, réessaye demain à ${dateAfterOneDay.getHours()}h${dateAfterOneDay.getMinutes()}m${dateAfterOneDay.getSeconds()}s`
              });
            }
          }
        }
      });
  }

  if (message.split(' ')[0] === "!gamble" && message.split(' ').length === 3) {
    const msgToArray = message.split(' ');
    var mise = msgToArray[1];
    var limit = msgToArray[2];

    if(!isFinite(mise) || isNaN(mise)) return;

    /**
     * We pass `compareNumber` function in parameters to filter REAL
     * integers because when you do 50-100, our result will be ['100', '50']
     * which is wrong
     */
    var tableSorted = limit.split('-').sort(compareNumber);

    var limitUp = tableSorted[1];
    var limitDown = tableSorted[0];

    var RandomNumber = Math.floor(Math.random() * 100) + 1;
    var promise = ladderboardPlayer.findOne({
      name: user
    }).exec();

    if (limit.split('-').length === 2 && limitUp <= 100 && limitDown >= 0) {
      /**
       * If so, we check if everything is a number and our `mise`>0
       */
      if (!isNaN(mise) && !isNaN(limitUp) && !isNaN(limitDown) && mise > 0) {
        promise.then(function(player) {
            if (player.bank >= mise) {
              getGambleMoney(limitDown, limitUp, mise, RandomNumber, user, userID, channelID);
            } else {
              bot.sendMessage({
                to: channelID,
                message: `${user}, il te manque ${mise-player.bank} kebabs`
              });
            }
          })
          /**
           * catch error if user isnt in database. We should create one but f*ck off,
           * just create your user in db with `!argentstp`
           */
          .catch(function(err) {
            if (err) {
              bot.sendMessage({
                to: channelID,
                message: 'Tu dois déjà avoir récupéré de l\'argent (!argentstp)'
              });
            }
          });
      } else {
        bot.sendMessage({
          to: channelID,
          message: `Met des chiffres dans ta demande ('!gamble [chiffre] ["chiffre"-"chiffre"]')  :robot:`
        });
      }
    }
  }

  if (message.split(' ')[0] === "!give" && message.split(' ').length === 3 && !isNaN(message.split(' ')[2])) {
    //Check if number is finite
    const msgArray = message.split(' ');
    const name = msgArray[1];
    const id = msgArray[1].replace(/\D/g, '');
    const amount = msgArray[2];
    const Promise = ladderboardPlayer.findOne({
      playerId: userID
    }).exec();

    if (isValidName(name) && id !== userID) {
      Promise.then(data => {
          //In case if he gives a negative amount;
          if (amount < 0) return;
          if (amount > data.bank) {
            bot.sendMessage({
              to: channelID,
              message: `Il te manque ${amount-data.bank} kebabs :burrito:`
            });
          } else {
            increaseBank(userID, -Math.abs(amount));
            increaseBank(id, amount);
            bot.sendMessage({
              to: channelID,
              message: `Transition effectuée! :burrito:`
            });
          }
        })
        .catch(err => {
          bot.sendMessage({
            to: channelID,
            message: `${user}, t'as pô de :burrito:`
          });
        });
    } else {
      bot.sendMessage({
        to: channelID,
        message: `T'es con ${user} ?`
      });
    }
  }

  if (message === "!airhorn"){
    const FILE = './airhorn.mp3';
    const FILE_LENGTH = 4;
    BOT_CHANNEL_ID = CHANNEL_ID;
    bot.joinVoiceChannel(BOT_CHANNEL_ID, err => {
      if(err){
        bot.sendMessage({
          to:channelID,
          message: 'Il faut être dans un channel pour initialiser le bot (re-rejoinds le)'
        });
      } else {
        bot.getAudioContext({channel:BOT_CHANNEL_ID, stereo: true}, (err, stream) =>{
          playMP3(stream, FILE);
        });

        setTimeout(() =>{
          bot.leaveVoiceChannel(BOT_CHANNEL_ID);
        }, (FILE_LENGTH*1000) + OFFSET);
      }
    });
  }

  if (message === "!deuxkatorze"){
    const FILE = './deux.ogg';
    const FILE_LENGTH = 24;
    BOT_CHANNEL_ID = CHANNEL_ID;
    bot.joinVoiceChannel(BOT_CHANNEL_ID, err => {
      if(err){
        bot.sendMessage({
          to:channelID,
          message: 'Il faut être dans un channel pour initialiser le bot (re-rejoinds le)'
        });
      } else {
        bot.getAudioContext({channel:BOT_CHANNEL_ID, stereo:true}, (err, stream) => {
          playMP3(stream, FILE);
        });

        setTimeout(() =>{
          bot.leaveVoiceChannel(BOT_CHANNEL_ID);
        }, (FILE_LENGTH*1000) + OFFSET);
      }
    });
  }

  if (message === "!mappa"){
    const mappaImages = require('./Mappa.json').album;
    var nbRandom = Math.floor(Math.random() * mappaImages.length);
    bot.sendMessage({
      to:channelID,
      message: mappaImages[nbRandom].link
    });
  }

  if (message === "!eject"){
    bot.leaveVoiceChannel(BOT_CHANNEL_ID);
  }

  if (message.split(' ')[0] === "!ty"){
    var msgToTransform = message.toLowerCase().split('');
    var modify = msgToTransform.splice(0,4);

    bot.deleteMessage({
      to:channelID,
      messageID: event.d.id
    });

    if(msgToTransform.join('').match(/^[a-zA-Z ]*$/g)){
        return bot.sendMessage({
          to:channelID,
          message: msgToTransform.map((letter) => {
            if(letter === " ") return ' ';
            return `:regional_indicator_${letter}:`
          }).join('')
        });
    }

    return;
  }

});


const playMP3 = (outputStream, inputFile) => {
  var lame = new Lame.Decoder();
	var input = fs.createReadStream(inputFile);
	lame.once('readable', function() {
		outputStream.send(lame);
	});
	input.pipe(lame);
};

const isValidName = name => {
  if (name.match(/^<@(?:[0-9]*)>/g)) return true;
};

const setMedal = rank => {
  if (rank === 1) return '  :medal:';
  else return ':military_medal:';
}

const setPlace = rank => {
  if (rank === 1)
    return '1st';
  else if (rank === 2)
    return '2nd';
  else if (rank === 3)
    return '3rd';
  else
    return rank + 'th';
}

const sayHelp = () =>{
  for (var i in Commands.help) {
    return `:star: ${Commands.help[i].commandName} : ${Commands.help[i].explication}`;
  }
}

const rollDice = (channelID, initName, initerId, adversaireName, adversaireId) => {
  playerOne.result = getRandomNumber();
  playerTwo.result = getRandomNumber();
  if (playerOne.result > playerTwo.result) {
    winQuery(playerOne.name, playerOne.id);
    looseQuery(playerTwo.name, playerTwo.id);
    setMoney(playerOne.id, 30);
    setMoney(playerTwo.id, -10);
    return bot.sendMessage({
      to: channelID,
      message: `:rocket:  ${initName} : **${playerOne.result}** | ${adversaireName} : **${playerTwo.result}**, **${initName} wonnered! +30 kebabs**  :rocket:`
    });
  } else {
    winQuery(playerTwo.name, playerTwo.id);
    looseQuery(playerOne.name, playerOne.id);
    setMoney(playerTwo.id, 30);
    setMoney(playerOne.id, -10);
    return bot.sendMessage({
      to: channelID,
      message: `:rocket:  ${adversaireName} : **${playerTwo.result}** | ${initName} : **${playerOne.result}**, **${adversaireName} wonnered! +30 kebabs**  :rocket:`
    });
  }
}

const getGambleMoney = (down, up, mise, nbRandom, user, userId, channelID) => {
  var newUpper;
  var newDown;

  if (down !== 1) {
    newUpper = up - down;
    newDown = 1;
  } else {
    newUpper = up;
  }

  var MoneyToSet = Math.round((((newDown / newUpper)* 100) * mise) - 500);

  if (down <= nbRandom && up >= nbRandom && down === up) {
    setMoney(userId, (mise*100));
    bot.sendMessage({
      to:channelID,
      message: `:robot: WOW ${user.toUppercase()} LE DIEU QUI GAGNE ${mise*100} KEBABS!!!1!`
    });
  } else if (down <= nbRandom && up >= nbRandom){
    setMoney(userId, MoneyToSet);
    bot.sendMessage({
      to: channelID,
      message: `:robot: ${user} fait ${nbRandom} et gagne ${MoneyToSet} kebabs  :robot:`
    });
  } else {
    setMoney(userId, -Math.abs(mise));
    bot.sendMessage({
      to: channelID,
      message: `:robot:  ${user} à fait ${nbRandom} perds ${mise} kebabs sale MERDE  :robot:`
    });
  }
}

const compareNumber = (a, b) => {
  return a - b;
}

const getRandomNumber = () => {
  return Math.floor(Math.random() * 100) + 1;
}

const winQuery = (playerName, playerId) => {
  var query = {
    playerId: playerId
  };
  var update = {
    $inc: {
      'victories': 1,
      'gamesPlayed': 1
    },
    $set: {
      'name': playerName
    }
  };
  var options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };
  ladderboardPlayer.findOneAndUpdate(query, update, options, function(err, doc) {});
}

const looseQuery = (playerName, playerId) => {
  var query = {
    playerId: playerId
  };
  var update = {
    $inc: {
      'gamesPlayed': 1
    },
    $set: {
      'name': playerName
    }
  };
  var options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };
  ladderboardPlayer.findOneAndUpdate(query, update, options, function(err, doc) {});
}

const firstQuery = (firsterName, firsterId) => {
  var query = {
    playerId: firsterId
  };
  var update = {
    $inc: {
      'timesHasBeenFirst': 1,
      'bank': 500
    },
    $set: {
      'name': firsterName
    }
  };
  var options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };
  ladderboardPlayer.findOneAndUpdate(query, update, options, function(err, doc) {});
}

const getWinrate = (win, total) => {
  if (win === 0 && total === 0) {
    return 0;
  } else {
    return ((win / total) * 100).toFixed(2);
  }
}

const sendFiles = (channelID, fileArr, interval) => {
  const resArr = [],
      len = fileArr.length,
      callback = typeof(arguments[2]) === 'function' ? arguments[2] : arguments[3];
  if (typeof(interval) !== 'number') interval = 1000;

  function _sendFiles() {
    setTimeout(function() {
      if (fileArr[0]) {
        bot.uploadFile({
          to: channelID,
          file: fileArr.shift()
        }, function(err, res) {
          if (err) {
            resArr.push(err);
          } else {
            resArr.push(res);
          }
          if (resArr.length === len)
            if (typeof(callback) === 'function') callback(resArr);
        });
        _sendFiles();
      }
    }, interval);
  }
  _sendFiles();
}

const setMoney = (playerId, amount) => {
  var query = {
    playerId: playerId
  };
  var update = {
    $inc: {
      'bank': amount
    }
  };
  var options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };
  ladderboardPlayer.findOneAndUpdate(query, update, options, function(err, doc) {});
}

const Player = (playerName, playerID, hasInit, rollResult) => {
  this.hasInit = hasInit;
  this.name = playerName;
  this.id = playerID;
  this.result = rollResult;
}

const getTodayMoney = (user, userId, channelID) => {
  var query = {
    playerId: userId
  };
  var update = {
    $inc: {
      'bank': 50
    },
    $set:  {
      date: new Date(),
      name: user
    }
  };
  var options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };
  ladderboardPlayer.findOneAndUpdate(query, update, options, function(err, doc) {});
  bot.sendMessage({
    to: channelID,
    message: `+50 kebabs pour ${user}`
  });
}

const increaseBank = (playerId, amount) => {
  if(!isFinite(amount)) return;

  var query = {
    playerId: playerId
  };
  var update = {
    $inc: {
      'bank': amount
    }
  };
  var options = {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  };
  ladderboardPlayer.findOneAndUpdate(query, update, options, function(err, doc) {});
}
