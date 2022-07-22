require("dotenv").config();

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const { Client, Intents } = require("discord.js");
const ora = require("ora");

const config = require("./config");

let Bots = new Map();
for (let bt of Object.keys(config.bots)) {
  Bots.set(bt, config.bots[bt]);
}

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

let data = Bots.get("lofi");
if (!data) throw new Error("No bot found, use javan, lofi, pop or custom");

const botLoader = ora("Starting Discord.js Client").start();
const bot = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});
bot.on("ready", async () => {
  setInterval(() => {
    let activities = config.activities;
    let random = Math.floor(Math.random() * activities.length);
    bot.user.setActivity(activities[random], {
      type: "STREAMING",
      url: "https://www.twitch.tv/ludho_mp",
    });
  }, 10000);
  botLoader.succeed(`${bot.user.tag} 24/7 bot is online! `);
  await joinChannel(config.channelId, data.stream, bot);
});
bot.login(config.token);
