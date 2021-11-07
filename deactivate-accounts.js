require("dotenv").config();
const { ledgerManager, bannedRoles } = require("./util");

const { Client, Intents, TextChannel } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

client.on("ready", async () => {
  const balancer = await client.guilds.fetch("638460494168064021");
  // Baller, core, admin, discord-admin, and fire-eyes roles.
  await ledgerManager.reloadLedger();

  const ledger = ledgerManager.ledger;

  const accounts = ledger.accounts();
  const activeAccounts = accounts.filter((account) => account.active);
  for (let account of activeAccounts) {
    const identity = account.identity;
    const discordAlias = identity.aliases.find((alias) =>
      alias.address.includes("discord")
    );
    if (!discordAlias) {
      continue;
    }
    try {
      const [, , , , , discordId] = discordAlias.address.split("\x00");
      const member = await balancer.members.fetch(discordId);
      let isNotEligible = false;
      for (let roleId of bannedRoles) {
        isNotEligible = member.roles.cache.has(roleId) || isNotEligible;
      }
      if (isNotEligible) {
        ledger.deactivate(account.identity.id);
      }
    } catch (error) {
      console.log(error);
      ledger.deactivate(account.identity.id);
    }
  }

  ledgerManager.persist();
  client.destroy();
});

client.login(process.env.SOURCECRED_DISCORD_TOKEN);
