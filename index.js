const {
  Client,
  Events,
  GatewayIntentBits,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  ActionRowBuilder,
} = require("discord.js");
require("dotenv").config();

const DOORBELL_TOKEN = process.env["DOORBELL_TOKEN"];
const ACTION_CHANNEL_ID = process.env["ACTION_CHANNEL_ID"];
const LOG_CHANNEL_ID = process.env["LOG_CHANNEL_ID"];

var player = require("play-sound")((opts = {}));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const cooldowns = new Map();
const COOLDOWN = 60 * 1000;

async function send_doorbell_message() {
  const channel = await client.channels.fetch(ACTION_CHANNEL_ID);

  // Build the button
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("trigger_doorbell").setLabel("🛎️").setStyle(ButtonStyle.Primary)
  );

  // Send the message with the button
  await channel.send({
    content: "Press the button below to ring the doorbell:",
    components: [row],
  });
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  send_doorbell_message();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "trigger_doorbell") return;

  const userId = interaction.user.id;
  const userTag = interaction.user.tag;
  const displayName = interaction.user.displayName;
  const now = Date.now();

  // Rate limiting per user
  if (cooldowns.has(userId) && now - cooldowns.get(userId) < COOLDOWN) {
    const remaining = Math.ceil((COOLDOWN - (now - cooldowns.get(userId))) / 1000);
    await interaction.reply({
      content: `Please wait ${remaining}s before clicking again.`,
      flags: ["Ephemeral"],
    });
    return;
  }

  cooldowns.set(userId, now);

  await interaction.reply({ content: "Doorbell pressed", flags: ["Ephemeral"] });
  player.play("./bell.wav");

  const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
  if (logChannel) {
    await logChannel.send(`${userTag} - ${displayName} ${userId} pressed the button.`);
  }
});

client.login(DOORBELL_TOKEN);
