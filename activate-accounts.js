require("dotenv").config();
const { ledgerManager, bannedRoles } = require("./util");

const { Client, Intents, TextChannel, User, Message } = require("discord.js");
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
  let allMessages = [];
  let doneDownloading = false;
  let before = undefined;
  while (!doneDownloading) {
    let messages = await channel.messages.fetch(
      { limit: 100, before },
      { cache: false }
    );
    /**
     * @type {Message[]}
     */
    let messagesArray = Array.from(messages.values());
    messagesArray = messagesArray.sort((a, b) => a.createdAt - b.createdAt);
    before = messagesArray[0].id;
    console.log(messagesArray[0].content);
    const saveWalletMessages = messages.filter((message) =>
      message.content.includes("!bal save-wallet 0x")
    );
    allMessages = [...Array.from(saveWalletMessages.values()), ...allMessages];
    doneDownloading = messages.size < 100;
    console.log(messages.size);
    // doneDownloading = true;
  }

  const saveWalletMessages = allMessages.filter((message) =>
    message.content.includes("!bal save-wallet 0x")
  );
  for (let msg of saveWalletMessages) {
    /**
     * @type {User}
     */
    const author = msg.author;
    try {
      const member = await stacks.members.fetch(author.id);
      let isNotEligible = false;
      for (let roleId of bannedRoles) {
        isNotEligible = member.roles.cache.has(roleId) || isNotEligible;
      }
      const discordAccount = ledgerManager.ledger.accountByAddress(
        `N\u0000sourcecred\u0000discord\u0000MEMBER\u0000user\u0000${author.id}\u0000`
      );
      if (!discordAccount.active && !isNotEligible) {
        const address = msg.content.split(" ")[2];
        ledger.setPayoutAddress(
          discordAccount.identity.id,
          address,
          "137",
          "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3"
        );
        ledger.activate(discordAccount.identity.id);
      }
    } catch (e) {
      console.log(e);
    }
  }

  ledgerManager.persist();
  client.destroy();
});

client.login(process.env.SOURCECRED_DISCORD_TOKEN);
