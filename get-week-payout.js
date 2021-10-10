const { ledgerManager } = require("./util");

const main = async () => {
  let file = "";
  const ledgerResult = await ledgerManager.reloadLedger();
  if (ledgerResult.error) {
    throw {
      type: "FAILURE",
      error: `Error processing ledger events: ${ledgerResult.error}`,
    };
  }
  const distributions = Array.from(ledgerManager.ledger.distributions());
  const { allocations } = distributions[distributions.length - 1];
  for (let { receipts } of allocations) {
    for (let { id } of receipts) {
      const account = ledgerManager.ledger.account(id);
      const amount = ledgerManager.ledger.account(id).balance;
      const address = account.payoutAddresses.get(
        `{"type":"EVM","chainId":"137","tokenAddress":"0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3"}`
      );
      if (address) {
        file += `${address},${amount / 1e18}\n`;
      }
    }
  }
  console.log(file);
};

main();
