require("dotenv").config();
const { ledgerManager } = require("./util");

const { Client, Intents, TextChannel } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
});

client.on("ready", async () => {
  const balancer = await client.guilds.fetch("638460494168064021");
  // Baller, core, admin, discord-admin, and fire-eyes roles.
  const bannedRoles = [
    "638465162654908416",
    "752527211961122838",
    "746733789895721060",
    "806572268742246420",
    "771356924033105961",
  ];
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
    const [, , , , , discordId] = discordAlias.address.split("\x00");
    const member = await balancer.members.fetch(discordId);
    let isNotEligible = false;
    for (let roleId of bannedRoles) {
      isNotEligible = member.roles.cache.has(roleId) || isNotEligible;
    }
    if (isNotEligible) {
      ledger.deactivate(account.identity.id);
    }
  }

  ledgerManager.persist();
  client.destroy();
});

client.login(process.env.SOURCECRED_DISCORD_TOKEN);