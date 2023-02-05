const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
});
const config = require("./config.js");
const { readdirSync } = require("fs");
const moment = require("moment");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
let token = config.token;

client.commands = new Collection();

const rest = new REST({ version: "10" }).setToken(token);

const log = (l) => {
  console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`);
};

client.on("ready", async () => {
  log(`${client.user.username} Aktif Edildi!`);
});

//event-handler
readdirSync("./src/events").forEach(async (file) => {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});
//

client.on("ready", () => {
  const connection = joinVoiceChannel({
    channelId: config.kayit.seskanali,
    guildId: config.kayit.sunucuId,
    adapterCreator: client.guilds.cache.get(config.kayit.sunucuId)
      .voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  const resource = createAudioResource("./sesdosyasi.mp3");
  connection.subscribe(player);

  player.play(resource);

  setInterval(() => {
    const player = createAudioPlayer();
    const resource = createAudioResource("./sesdosyasi.mp3");
    connection.subscribe(player);

    player.play(resource);
  }, 1000 * 14); // 14 yerine dosyanızın saniye cinsinden uzunluğu
});

client.on("messageCreate", async (message) => {
  const args = message.content.slice("0").trim().split(/ +/g);
  if (message.author.bot) return;
  if (config.kayit.durum === true) {
    if (message.channel.id == config.kayit.kayitkanali) {
      let isim = args[0];
      let yas = args[1];
      if (!isim) return message.reply("İsminizi girin!");
      if (!yas) return message.reply("Yaşınızı girin!");
      if (yas > 50 || yas < 10) return message.reply("Geçerli bir yaş girin!");

      message.member.roles.add(config.kayit.kayitlirol).catch(() => {});
      message.member.roles.remove(config.kayit.kayitsizrol).catch(() => {});
      message.member.setNickname(isim + " | " + yas).catch(() => {});
      const embed = new EmbedBuilder()
        .setAuthor({
          name: message.author.username + " Başarıyla Kayıt Oldu",
          iconURL: message.author.avatarURL({ dynamic: true }),
        })
        .setDescription(
          `${message.author} başarıyla kayıt oldu sende kayıt olmak için isim yaş belirtebilirsin`
        )
        .setColor(Colors.Blurple);
      message.channel.send({ embeds: [embed] });
      if (config.kayit.sohbetkanali) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: message.author.username + " Aramıza katıldı!",
            iconURL: message.author.avatarURL({ dynamic: true }),
          })
          .setDescription(
            `${message.author} aramıza katıldı hoşgeldin diyin 👋`
          )
          .setColor(Colors.Blurple);

        client.channels.cache
          .get(config.kayit.sohbetkanali)
          .send({ embeds: [embed] });
      }
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  if (config.kayit.durum === true) {
    client.channels.cache
      .get(config.kayit.kayitkanali)
      .send(`${member} İsim yaş belirterek kayıt olabilirsin`);
  }
  member.roles.add(config.kayit.kayitsizrol).catch(() => {});
});

client.login(token);
