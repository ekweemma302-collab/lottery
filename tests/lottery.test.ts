import { Clarinet, Tx, Chain, Account, types } from "clarinet";

Clarinet.test({
  name: "Users can enter the lottery and owner can draw a winner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let alice = accounts.get("wallet_1")!;
    let bob = accounts.get("wallet_2")!;

    // Alice enters
    let block = chain.mineBlock([
      Tx.contractCall("lottery", "enter", [], alice.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(1);

    // Bob enters
    block = chain.mineBlock([
      Tx.contractCall("lottery", "enter", [], bob.address),
    ]);
    block.receipts[0].result.expectOk().expectUint(2);

    // Check pot = 2 STX
    let pot = chain.callReadOnlyFn("lottery", "get-total-pot", [], deployer.address);
    pot.result.expectUint(2_000_000);

    // Owner draws winner
    block = chain.mineBlock([
      Tx.contractCall("lottery", "draw", [], deployer.address),
    ]);
    block.receipts[0].result.expectOk();
  },
});
