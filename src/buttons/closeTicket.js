const {
  ButtonInteraction,
  Client,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  customId: "closeTicket",

  /**
   *
   * @param { Client } client
   * @param { ButtonInteraction } interaction
   */
  run: async (client, interaction) => {
    const modal = new ModalBuilder()
      .setCustomId("closeReason")
      .setTitle("Close Channel");

    const reasonInput = new TextInputBuilder()
      .setCustomId("reasonInput")
      .setLabel("Reason for closing")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const actionRow = new ActionRowBuilder().addComponents(reasonInput);
    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  },
};

// Handler for modal submission
module.exports = {
  customId: "closeReason",

  /**
   *
   * @param { Client } client
   * @param { ModalSubmitInteraction } interaction
   */
  run: async (client, interaction) => {
    const reason = interaction.fields.getTextInputValue("reasonInput");

    await interaction.channel.delete();

    console.log(
      `Channel closed by ${interaction.user.tag} for reason: ${reason}`
    );
  },
};
