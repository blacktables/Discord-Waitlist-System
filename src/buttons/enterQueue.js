const { ButtonInteraction, Client, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const Queue = require("../schemas/queue");

module.exports = {
  customId: "enterQueue",

  /**
   * @param { Client } client
   * @param { ButtonInteraction } interaction
   */
  run: async (client, interaction) => {
    const queue = await Queue.findOne({ messageId: interaction.message.id });
    console.log(queue)

    if (!queue) {
      return interaction.reply({
        content: "Queue not found.",
        ephemeral: true,
      });
    }

    if (queue.members.length >= queue.size) {
      return interaction.reply({
        content: "The queue is full.",
        ephemeral: true,
      });
    }

    if (queue.members.includes(interaction.user.id)) {
      return interaction.reply({
        content: "You are already in the queue.",
        ephemeral: true,
      });
    }

    queue.members.push(interaction.user.id);
    await interaction.member.roles.add("1254589688950292510");
    await queue.save();

    const queueEmbed = new EmbedBuilder()
      .setTitle(`Queue: ${queue.name}`)
      .setDescription(
        "Slots:\n" +
          queue.members
            .map((id, index) => `${index + 1}. <@${id}>`)
            .join("\n") +
          "\n" +
          Array(queue.size - queue.members.length)
            .fill()
            .map((_, index) => `${queue.members.length + index + 1}.`)
            .join("\n")
      )
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`enterQueue`)
        .setLabel("Enter Queue")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`leaveQueue`)
        .setLabel("Leave Queue")
        .setStyle(ButtonStyle.Secondary)
    );

    const queueMessage = await interaction.channel.messages.fetch(
      queue.messageId
    );
    await queueMessage.edit({ embeds: [queueEmbed], components: [row] });

    await interaction.reply({
      content: "You have entered the queue.",
      ephemeral: true,
    });
  },
};
