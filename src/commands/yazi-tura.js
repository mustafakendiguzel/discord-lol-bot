/** @type {import('commandkit').CommandData} */
const data = {
  name: "yazi-tura",
  description: "Pong!",
};

/** @param {import('commandkit').SlashCommandProps} param0 */
function run({ interaction, client }) {
  const result = Math.random() < 0 ? "yazı" : "tura";

  interaction.reply(`<:${result}:1259980160824905740>`);
}

/** @type {import('commandkit').CommandOptions} */
const options = {};

module.exports = { data, run, options };


