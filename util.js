const { sourcecred } = require("sourcecred");
const fs = require("fs");
const path = require("path");
const { Ledger } = sourcecred.ledger.ledger;

const createLedgerDiskStorage = (ledgerFilePath) => ({
  read: async () => {
    return Ledger.parse(fs.readFileSync(ledgerFilePath).toString());
  },
  write: async (ledger) => {
    fs.writeFileSync(ledgerFilePath, ledger.serialize());
  },
});
const { LedgerManager } = sourcecred.ledger.manager;

const diskStorage = createLedgerDiskStorage(path.resolve("data/ledger.json"));

const ledgerManager = new LedgerManager({
  storage: diskStorage,
});

const bannedRoles = [
  "638465162654908416",
  "752527211961122838",
  "746733789895721060",
  "806572268742246420",
  "771356924033105961",
];

module.exports = {
  ledgerManager,
  bannedRoles,
};
