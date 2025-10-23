# TikTakTok Coin (TTTC) – Clarity Contracts

Contract: `tiktaktok.clar`

Features:
- On-chain points per player (`award-points`, `get-points`)
- Conversion: 1000 points -> 1 TTTC coin (`convert-points`)
- Fungible tokens: `tttc` (coin) and `tttc-lp` (vault share)
- Simple liquidity vault (`deposit-tttc`, `withdraw-tttc`)
- Admin controls (`set-operator`)

Security notes:
- Only the `operator` can award points; set via `set-operator` by `owner`.
- Conversion enforces exact multiples of 1000 and sufficient points.
- Vault uses 1:1 shares and safe checked transfers/mints/burns.

Read-only helpers:
- `get-points`, `get-tttc-balance`, `get-lp-balance`, `get-owner`, `get-operator`

Testing:
- `npm test` runs Vitest with Clarinet simnet; see `tests/TikTakTok.test.ts`.