require("dotenv").config();

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const { Client, Intents } = require("discord.js");
const ora = require("ora");

let Bots = new Map();
Bots.set("javan", {
  token: process.env.javanToken,
  channelId: "971373495558742078",
  stream: "http://www.radiofaaz.com:8000/radiofaaz",
  type: "Javan",
});
Bots.set("lofi", {
  token: process.env.lofiToken,
  channelId: "971373529658441738",
  stream: "http://stream.laut.fm/lofi",
  type: "Lofi",
});
Bots.set("pop", {
  token: process.env.popToken,
  channelId: "971373552769040444",
  stream: "https://streams.ilovemusic.de/iloveradio3.mp3",
  type: "Pop",
});
Bots.set("testing", {
  token: process.env.testingToken,
  channelId: "854044194779955267",
  stream: "http://stream.laut.fm/lofi",
  type: "testing",
});

async function joinChannel(channelId, stream, client) {
  const voiceJoiner = ora(`${client.user.tag} joining voice channel`);
  let channel = await client.channels.fetch(channelId);

  try {
    const VoiceConnection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    const resource = createAudioResource(stream, {
      inlineVolume: true,
    });
    resource.volume.setVolume(0.2);
    const player = createAudioPlayer();
    VoiceConnection.subscribe(player);
    player.play(resource);
    player.on("idle", () => {
      try {
        player.stop();
      } catch (e) {
        voiceJoiner.fail(`${client.user.tag} failed to stop the player`);
        console.error(e);
      }
      try {
        VoiceConnection.destroy();
      } catch (e) {
        voiceJoiner.fail(`${client.user.tag} failed to destroy the player`);
        console.error(e);
      }
      joinChannel(channel.id);
    });
    voiceJoiner.succeed(`${client.user.tag} is now playing`);
  } catch (err) {
    return (
      voiceJoiner.fail(`${client.user.tag} failed to join`) + console.error(err)
    );
  }

  setInterval(() => {
    if (!channel.guild.members.cache.get(client.user.id).voice?.channelId)
      joinChannel(channelId, stream, client);
  }, 5000);
}

let bot = Bots.get("testing");

const botLoader = ora("Starting Discord.js Client").start();
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});
client.on("ready", async () => {
  setInterval(() => {
    let activities = [
      "AVIORA RADIO",
      "Coded By : Dragon,Ludho",
      `${bot.type} music`,
    ];
    let random = Math.floor(Math.random() * activities.length);
    client.user.setActivity(activities[random], {
      type: "STREAMING",
      url: "https://www.twitch.tv/trikanoid",
    });
  }, 10000);
  botLoader.succeed(`${client.user.tag} 24/7 bot is online! `);
  await joinChannel(bot.channelId, bot.stream, client);
});
client.login(bot.token);
