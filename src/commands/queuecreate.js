const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Queue = require("../../schemas/queue");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue-create")
    .setDescription("Create a new queue")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the queue message")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("The category for the ticket channels")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the queue")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("size")
        .setDescription("The size of the queue (max 20)")
        .setRequired(true)
    )
    .toJSON(),
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    const channel = interaction.options.getChannel("channel");
    const category = interaction.options.getChannel("category");
    const name = interaction.options.getString("name");
    const size = interaction.options.getInteger("size");

    if (size > 20) {
      return interaction.reply({
        content: "Queue size cannot be greater than 20.",
        ephemeral: true,
      });
    }

    const existingQueue = await Queue.findOne({ name });
    if (existingQueue) {
      return interaction.reply({
        content: `A queue with the name "${name}" already exists.`,
        ephemeral: true,
      });
    }

    const queueEmbed = new EmbedBuilder()
      .setTitle(`Queue: ${name}`)
      .setDescription(
        "Slots:\n" +
          Array(size)
            .fill("Empty")
            .map((slot, index) => `${index + 1}. ${slot}`)
            .join("\n")
      )
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("enterQueue")
        .setLabel("Enter Queue")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("leaveQueue")
        .setLabel("Leave Queue")
        .setStyle(ButtonStyle.Secondary)
    );

    const queueMessage = await channel.send({
      embeds: [queueEmbed],
      components: [row],
      fetchReply: true
    });

    const queue = new Queue({
      name,
      messageId: queueMessage.id,
      channelId: channel.id,
      categoryId: category.id,
      size,
      members: [],
    });

    await queue.save();

    await interaction.reply({
      content: `Queue "${name}" created successfully.`,
      ephemeral: true,
    });
  },
};
