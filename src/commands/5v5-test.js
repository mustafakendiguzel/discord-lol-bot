const {
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

const data = {
  name: "5v5-test",
  description: "5v5-test",
};

/**
 * @param {Object} param0
 * @param {import('discord.js').ChatInputCommandInteraction} param0.interaction
 */
async function run({ interaction }) {
  const options = [
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
    {
      label: "Eksik varsa gelirim",
      description: "Eğer eksik oyuncu olursa katılırım.",
      value: "maybe",
      emoji: "❔",
    },
  ];

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("5v5-select")
    .setPlaceholder("5v5 durumunu seçin:")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      options.map((option) =>
        new StringSelectMenuOptionBuilder()
          .setLabel(option.label)
          .setDescription(option.description)
          .setEmoji(option.emoji)
          .setValue(option.value)
      )
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  const message = await interaction.reply({
    content: "5v5 durumunu seçin:",
    components: [actionRow],
    fetchReply: true,
  });

  const userSelections = {};
  let resultMessage = null;
  let maybePlayers = [];
  let yesPlayers = [];

  const generalVoiceChannelId = "842155759622160384"; // Genel ses kanalının ID'si
  const generalVoiceChannel = interaction.guild.channels.cache.get(
    generalVoiceChannelId
  );

  // Genel ses kanalındaki kullanıcıları kontrol et
  generalVoiceChannel.members.forEach((member) => {
    if (!userSelections[member.id]) {
      userSelections[member.id] = "true"; // Otomatik olarak "Katılacağım" seçeneğini işaretleyin
    }
  });

  // Genel ses kanalındaki kullanıcıları izlemek için event handler
  interaction.client.on("voiceStateUpdate", async (oldState, newState) => {
    const generalVoiceChannelMembers = generalVoiceChannel.members;

    // Eğer genel ses kanalında bir değişiklik varsa
    if (
      generalVoiceChannelMembers.size > 0 &&
      (oldState.channelID === generalVoiceChannelId ||
        newState.channelID === generalVoiceChannelId)
    ) {
      // Genel ses kanalındaki kullanıcıları güncelle
      generalVoiceChannelMembers.forEach((member) => {
        if (!userSelections[member.id]) {
          userSelections[member.id] = "true"; // Otomatik olarak "Katılacağım" seçeneğini işaretleyin
        }
      });

      // Güncel oyuncu listesini oluşturma
      let updatedPlayerList =
        "Toplama süresi devam ediyor. Şu anki katılan oyuncular:\n";
      for (const userId of Object.keys(userSelections)) {
        const user = interaction.guild.members.cache.get(userId);
        if (
          user &&
          (userSelections[userId] === "true" || yesPlayers.includes(user))
        ) {
          updatedPlayerList += `- <@${userId}>\n`;
        }
      }

      // Kanaldaki mesajı güncelleme
      await interaction.channel.messages
        .fetch({ limit: 100 })
        .then((messages) => {
          const botMessages = messages.filter(
            (msg) => msg.author.id === interaction.client.user.id
          );
          if (botMessages.size > 0) {
            const lastBotMessage = botMessages.last();
            lastBotMessage.edit(updatedPlayerList);
          }
        });

      if (!resultMessage) {
        resultMessage = await interaction.followUp({
          content: `Toplama süresi devam ediyor. Katılacak oyuncu sayısı: ${
            Object.keys(userSelections).filter(
              (key) => userSelections[key] === "true"
            ).length
          }\n\n${updatedPlayerList}`,
        });
      } else {
        await resultMessage.edit({
          content: `Toplama süresi devam ediyor. Katılacak oyuncu sayısı: ${
            Object.keys(userSelections).filter(
              (key) => userSelections[key] === "true"
            ).length
          }\n\n${updatedPlayerList}`,
        });
      }
    }
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.StringSelect,
    time: 10_000 * 6 * 10,
  });

  collector.on("collect", async (i) => {
    userSelections[i.user.id] = i.values[0];

    const joinedPlayerCount = Object.values(userSelections).filter(
      (value) => value === "true"
    ).length;

    // Güncel oyuncu listesini oluşturma
    let updatedPlayerList =
      "Toplama süresi devam ediyor. Şu anki katılan oyuncular:\n";
    for (const userId of Object.keys(userSelections)) {
      const user = interaction.guild.members.cache.get(userId);
      if (
        user &&
        (userSelections[userId] === "true" || yesPlayers.includes(user))
      ) {
        updatedPlayerList += `- <@${userId}>\n`;
      }
    }

    // Kanaldaki mesajı güncelleme
    await interaction.channel.messages
      .fetch({ limit: 100 })
      .then((messages) => {
        const botMessages = messages.filter(
          (msg) => msg.author.id === interaction.client.user.id
        );
        if (botMessages.size > 0) {
          const lastBotMessage = botMessages.last();
          lastBotMessage.edit(updatedPlayerList);
        }
      });

    if (!resultMessage) {
      resultMessage = await interaction.followUp({
        content: `Toplama süresi devam ediyor. Katılacak oyuncu sayısı: ${joinedPlayerCount}\n\n${updatedPlayerList}`,
      });
    } else {
      await resultMessage.edit({
        content: `Toplama süresi devam ediyor. Katılacak oyuncu sayısı: ${joinedPlayerCount}\n\n${updatedPlayerList}`,
      });
    }

    if (i.values[0] === "maybe") {
      maybePlayers.push(i.user);
      await i.deferUpdate();
    } else if (i.values[0] === "true") {
      // Katılacağım seçeneği için kullanıcıyı yesPlayers listesine ekle
      try {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("additional-select")
          .setPlaceholder("Katılma şansın var mı?")
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions([
            new StringSelectMenuOptionBuilder()
              .setLabel("Evet")
              .setValue("yes")
              .setDescription("Katılmak istiyorum.")
              .setEmoji("👍"),
            new StringSelectMenuOptionBuilder()
              .setLabel("Hayır")
              .setValue("no")
              .setDescription("Katılmak istemiyorum.")
              .setEmoji("👎"),
          ]);

        const actionRow = new ActionRowBuilder().addComponents(selectMenu);

        const dmMessage = await i.user.send({
          content: "Katılma şansını seç:",
          components: [actionRow],
        });

        const dmCollector = dmMessage.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          time: 900_000, // 15 dakika
        });

        dmCollector.on("collect", async (dmInteraction) => {
          if (dmInteraction.values[0] === "yes") {
            yesPlayers.push(i.user);
            await dmInteraction.deferUpdate();

            // Güncellenmiş mesajı kanala gönderme
            let updatedMessage = `Toplama süresi sona erdi. Katılacak oyuncu sayısı: ${
              joinedPlayerCount + yesPlayers.length
            }\n\nKatılan Oyuncular:\n`;
            for (const userId of Object.keys(userSelections)) {
              const user = interaction.guild.members.cache.get(userId);
              if (
                user &&
                (userSelections[userId] === "true" || yesPlayers.includes(user))
              ) {
                updatedMessage += `- <@${userId}>\n`;
              }
            }

            // Yeni katılacak oyuncuları da ekleyin
            updatedMessage += "\n**Yeni Katılacak Oyuncular:**\n";
            for (const user of yesPlayers) {
              updatedMessage += `- <@${user.id}>\n`;
            }

            await resultMessage.edit({
              content: updatedMessage,
            });

            // Kanaldaki mesajı da güncelleme
            await interaction.channel.messages
              .fetch({ limit: 100 })
              .then((messages) => {
                const botMessages = messages.filter(
                  (msg) => msg.author.id === interaction.client.user.id
                );
                if (botMessages.size > 0) {
                  const lastBotMessage = botMessages.last();
                  lastBotMessage.edit(updatedMessage);
                }
              });
          }
        });

        dmCollector.on("end", async () => {
          // Eğer 10 kişiye ulaşılmamışsa ve maybe seçeneği seçilmişse
          if (joinedPlayerCount < 10) {
            // Maybe seçeneğini seçen kullanıcılara mesaj gönderme
            if (maybePlayers.length > 0) {
              let mentionList = maybePlayers
                .map((user) => `<@${user.id}>`)
                .join(", ");
              await interaction.channel.send(
                `${mentionList}, 10 kişi olamadık, 15 dakika içinde dönüş bekliyoruz! 🕒`
              );
            }
          }
        });
      } catch (error) {
        console.error(`Could not send DM to user ${i.user.id}:`, error);
      }

      await i.deferUpdate();
    } else if (i.values[0] === "false") {
      // Katılmayacağım seçeneği için direkt olarak toplu mesajı güncelle
      let updatedMessage = `Toplama süresi devam ediyor. Katılacak oyuncu sayısı: ${joinedPlayerCount}\n\n${updatedPlayerList}`;
      await resultMessage.edit({
        content: updatedMessage,
      });

      // Kanaldaki mesajı da güncelleme
      await interaction.channel.messages
        .fetch({ limit: 100 })
        .then((messages) => {
          const botMessages = messages.filter(
            (msg) => msg.author.id === interaction.client.user.id
          );
          if (botMessages.size > 0) {
            const lastBotMessage = botMessages.last();
            lastBotMessage.edit(updatedMessage);
          }
        });

      await i.deferUpdate();
    } else {
      await i.deferUpdate();
    }
  });

  collector.on("end", async () => {
    const joinedPlayerCount = Object.values(userSelections).filter(
      (value) => value === "true"
    ).length;

    const joinedPlayers = Object.entries(userSelections)
      .filter(([_, value]) => value === "true")
      .map(([userId]) => `<@${userId}>`);

    if (resultMessage) {
      resultMessage.edit({
        content: `Toplama süresi sona erdi. Katılacak oyuncu sayısı: ${joinedPlayerCount}\n\nKatılan Oyuncular:\n${joinedPlayers.join(
          "\n"
        )}`,
      });
    }

    // Toplam katılan oyuncu sayısı 10'a ulaşırsa
    if (joinedPlayerCount >= 10) {
      // Yeni kullanıcıları "Katılacağım" listesine eklemek
      let updatedMessage = `Toplama süresi sona erdi. Katılacak oyuncu sayısı: ${joinedPlayerCount}\n\nKatılan Oyuncular:\n${joinedPlayers.join(
        "\n"
      )}\n\n`;

      // Eğer daha önce "Eksik varsa gelirim" seçeneğiyle katılmak isteyen kullanıcılar varsa
      if (maybePlayers.length > 0) {
        updatedMessage += `Eksik varsa gelirim seçeneğiyle katılmak isteyen kullanıcılar:\n${maybePlayers
          .map((user) => `<@${user.id}>`)
          .join("\n")}\n`;
      }

      // Mesajı ve kanaldaki mesajı güncelle
      await resultMessage.edit({
        content: updatedMessage,
      });

      // Kanaldaki mesajı da güncelleme
      await interaction.channel.messages
        .fetch({ limit: 100 })
        .then((messages) => {
          const botMessages = messages.filter(
            (msg) => msg.author.id === interaction.client.user.id
          );
          if (botMessages.size > 0) {
            const lastBotMessage = botMessages.last();
            lastBotMessage.edit(updatedMessage);
          }
        });

      // Oyunculara mesaj gönderme
      let mentionList = joinedPlayers
        .concat(maybePlayers.map((user) => `<@${user.id}>`))
        .join(" ");
      await interaction.channel.send(
        `${mentionList}, 10 kişi bir araya geldi! Maça hazırlanın! 🎮`
      );
    }
  });
}

module.exports = { data, run };
