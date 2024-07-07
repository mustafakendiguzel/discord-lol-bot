const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

const data = {
  name: "5v5",
  description: "5v5",
};

/**
 * @param {Object} param0
 * @param {import('discord.js').ChatInputCommandInteraction} param0.interaction
 */
async function run({ interaction }) {
  const pets = [
    {
      label: "Katılacağım",
      description: "Müsaitim.",
      value: "true",
      emoji: "👍",
    },

    {
      label: "Katılmayacağım",
      description: "Müsait değilim.",
      value: "false",
      emoji: "👎",
    },
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("5v5 durumunu seçin:")
    .setMinValues(0)
    .setMaxValues(1)
    .addOptions(
      pets.map((pet) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(pet.label)
          .setDescription(pet.description)
          .setEmoji(pet.emoji)
          .setValue(pet.value)
      )
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  const reply = await interaction.reply({
    content: "5v5 durumunu seçin:",
    components: [actionRow],
  });

  const collector = reply.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 60_000,
  });

  collector.on("collect", async (interaction) => {
    console.log(interaction.values);
  });
}

module.exports = { data, run };
