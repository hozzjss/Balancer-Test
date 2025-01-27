const { ledgerManager } = require("./util");

const main = async () => {
  try {
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
    let total = 0;
    for (let { receipts } of allocations) {
      console.log(receipts);
      receipts = receipts.sort((a, b) => +b.amount - +a.amount);
      for (let { id } of receipts) {
        const account = ledgerManager.ledger.account(id);
        const amount = ledgerManager.ledger.account(id).balance;
        const address = account.payoutAddresses.get(
          `{"type":"EVM","chainId":"137","tokenAddress":"0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3"}`
        );
        if (address && amount > 0) {
          total += Number((amount / 1e18).toFixed(18)) * 1e18;
          file += `${address},${(amount / 1e18).toFixed(18)}\n`;
        }
      }
    }
    console.log(file);
    console.log(total);
  } catch (error) {
    console.log(error);
  }
};

main();
