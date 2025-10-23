import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const user1 = accounts.get("wallet_1")!;
const user2 = accounts.get("wallet_2")!;

function u(n: number) { return `u${n}`; }

describe("TikTakTok Coin - points and conversion", () => {
  it("only operator can award points and users can convert 1000:1", () => {
    // Attempt awarding from non-operator should fail
    let res = simnet.callPublicFn("tiktaktok", "award-points", [user1, u(1)], user1);
    expect(res.isOk).toBe(false);

    // Deployer is operator by default
    res = simnet.callPublicFn("tiktaktok", "award-points", [user1, u(1500)], deployer);
    expect(res.isOk).toBe(true);

    // Check points
    let ro = simnet.callReadOnlyFn("tiktaktok", "get-points", [user1], user1);
    expect(ro.result).toBeUint(1500);

    // Cannot convert non-multiple of 1000
    res = simnet.callPublicFn("tiktaktok", "convert-points", [u(500)], user1);
    expect(res.isOk).toBe(false);

    // Convert 1000 -> 1 coin
    res = simnet.callPublicFn("tiktaktok", "convert-points", [u(1000)], user1);
    expect(res.isOk).toBe(true);

    // Remaining points should be 500
    ro = simnet.callReadOnlyFn("tiktaktok", "get-points", [user1], user1);
    expect(ro.result).toBeUint(500);

    // Balance of TTTC should be 1
    ro = simnet.callReadOnlyFn("tiktaktok", "get-tttc-balance", [user1], user1);
    expect(ro.result).toBeUint(1);
  });
});

describe("TikTakTok Coin - liquidity vault", () => {
  it("deposit and withdraw TTTC using LP shares", () => {
    // Give user2 enough points to mint 3 TTTC
    let res = simnet.callPublicFn("tiktaktok", "award-points", [user2, u(3000)], deployer);
    expect(res.isOk).toBe(true);
    res = simnet.callPublicFn("tiktaktok", "convert-points", [u(3000)], user2);
    expect(res.isOk).toBe(true);

    // Deposit 2 TTTC -> receive 2 LP
    res = simnet.callPublicFn("tiktaktok", "deposit-tttc", [u(2)], user2);
    expect(res.isOk).toBe(true);

    let ro = simnet.callReadOnlyFn("tiktaktok", "get-lp-balance", [user2], user2);
    expect(ro.result).toBeUint(2);

    // Withdraw 1 TTTC by burning 1 LP
    res = simnet.callPublicFn("tiktaktok", "withdraw-tttc", [u(1)], user2);
    expect(res.isOk).toBe(true);

    // Check balances post-withdraw
    ro = simnet.callReadOnlyFn("tiktaktok", "get-lp-balance", [user2], user2);
    expect(ro.result).toBeUint(1);
    ro = simnet.callReadOnlyFn("tiktaktok", "get-tttc-balance", [user2], user2);
    // User2 initially 3, deposited 2 (balance 1), withdrew 1 -> balance 2
    expect(ro.result).toBeUint(2);
  });
});