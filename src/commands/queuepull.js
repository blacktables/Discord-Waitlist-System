const { SlashCommandBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const Queue = require("../../schemas/queue");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue-pull")
    .setDescription("Pull the next user from the queue")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of the queue")
        .setRequired(true)
    )
    .toJSON(),
  userPermissions: [],
  botPermissions: [],

  run: async (client, interaction) => {
    const name = interaction.options.getString("name");
    const queue = await Queue.findOne({ name });

    if (!queue) {
      return interaction.reply({
        content: `No queue found with the name "${name}".`,
        ephemeral: true,
      });
    }

    if (queue.members.length === 0) {
      return interaction.reply({
        content: "The queue is empty.",
        ephemeral: true,
      });
    }

    const memberId = queue.members.shift();
    const member = await interaction.guild.members.fetch(memberId);

    const category = await interaction.guild.channels.fetch(queue.categoryId);
    const channel = await category.children.create({
      name: `${name}-${member.user.username}`,
      type: "0",
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    await Queue.updateOne({ name }, { $pull: { members: memberId } });

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

    try {
      const queueMessage = await interaction.channel.messages.fetch(
        queue.messageId
      );
      await queueMessage.edit({ embeds: [queueEmbed], components: [row] });
      await interaction.reply({
        content: `Pulled <@${member.user.id}> from the queue and created a channel for them. Here: <#${channel.id}>`,
        ephemeral: true,
      });

      const pulledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`closeChannel`)
          .setLabel("Close")
          .setStyle(ButtonStyle.Danger),
      );

      const pulledEmbed = new EmbedBuilder()
      .setAuthor({ name: `${member.user.username}`, iconURL: member.displayAvatarURL() })
      .setTitle('Hello!')
      .setDescription(`Hello <@${member.user.id}> you have been pulled off #1 from the waitlist, please respond soon! Otherwise this channel will be deleted!`)
      .setColor('Green')
      .setFooter({ text: "Waitlist System"})

      channel.send({ content: `<@${member.user.id}>`, embeds: [pulledEmbed], components: [pulledRow]})
    } catch (error) {
      console.error("Failed to fetch or edit the queue message:", error);
      return interaction.reply({
        content:
          "An error occurred while updating the queue. Please try again later.",
        ephemeral: true,
      });
    }
  },
};
