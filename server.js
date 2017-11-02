const IRC = require('irc-framework');
const skateboard = require('skateboard');
const fetch = require('fetch-retry');

const bot = new IRC.Client();
let count = 0;
let socket = null;

const getConfig = fetch(`https://configapi.glitch.me/config/${process.env.PROJECT_ID}`, {
    retries: 3,
    retryDelay: 1000
  })
  .then((res) => res.json())
  .then((data) => {
    botConnect(data, () => {
      console.log('joined channel!');
      
      skateboard({port: 3000}, (stream) => {
      socket = stream;
    });

    bot.matchMessage(/^\d\d?$/, (event) => {
      const n = parseInt(event.message);
      count = (n - count === 1) ? n : 0;
      socket.write(count.toString()); 
    });
  });
});

function botConnect(config, callback) {
  bot.connect({
    host: 'irc.chat.twitch.tv',
    port: 6667,
    nick: config.TWITCH_NICK,
    password: config.TWITCH_TOKEN
  });

  bot.on('registered', () => {
    console.log('reg happened!');
    bot.requestCap('twitch.tv/membership');

    const channel = bot.channel(config.TWITCH_CHAN);
    channel.join();
    return callback();
  });
};
