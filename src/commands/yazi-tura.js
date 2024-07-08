/** @type {import('commandkit').CommandData} */
const data = {
  name: "yazi-tura",
  description: "Pong!",
};

/** @param {import('commandkit').SlashCommandProps} param0 */
function run({ interaction, client }) {
  const random = Math.floor(Math.random() * 2);
  const result = random === 0 ? "yazi" : "tura";

  interaction.reply(`<:${result}:1259980160824905740>`);
}

/** @type {import('commandkit').CommandOptions} */
const options = {};

module.exports = { data, run, options };
