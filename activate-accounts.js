require("dotenv").config();
const { ledgerManager, bannedRoles } = require("./util");

const { Client, Intents, TextChannel } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", async () => {
  const stacks = await client.guilds.fetch("638460494168064021");
  await ledgerManager.reloadLedger();
  const ledger = ledgerManager.ledger;
  /**
   * @type {TextChannel}
   */
  const channel = await stacks.channels.fetch("889656094618681464");
  const messages = await channel.messages.fetch();
  const saveWalletMessages = messages.filter((message) =>
    message.content.includes("!bal save-wallet 0x")
  );
  saveWalletMessages.forEach((msg) => {
    const author = msg.author;
    const discordAccount = ledgerManager.ledger.accountByAddress(
      `N\u0000sourcecred\u0000discord\u0000MEMBER\u0000user\u0000${author.id}\u0000`
    );
    const address = msg.content.split(" ")[2];
    ledger.setPayoutAddress(
      discordAccount.identity.id,
      address,
      "137",
      "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3"
    );
    ledger.activate(discordAccount.identity.id);
  });

  ledgerManager.persist();
  client.destroy();
});

client.login(process.env.SOURCECRED_DISCORD_TOKEN);
