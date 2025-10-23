;; contracts/tiktaktok.clar
;; Tic-Tac-Toe Coin (TTTC)
;; - Players earn on-chain points when the authorized game-operator records a win
;; - 1000 points convert to 1 TTTC coin
;; - Simple liquidity vault: deposit TTTC to mint LP shares and withdraw later

(define-constant ERR-NOT-OWNER u100)
(define-constant ERR-NOT-OPERATOR u101)
(define-constant ERR-INSUFFICIENT-POINTS u102)
(define-constant ERR-NOT-MULTIPLE u103)
(define-constant ERR-INVALID-ARG u104)
(define-constant ERR-INSUFFICIENT-LP u105)
(define-constant POINTS-PER-COIN u1000)

(define-data-var owner principal tx-sender)
(define-data-var operator principal tx-sender) ;; can be reassigned by owner

;; On-chain points per user
(define-map points
  principal
  uint
)

;; TTTC fungible token and LP token for the vault
(define-fungible-token tttc)
(define-fungible-token tttc-lp)

;; --- Admin functions ---
(define-public (set-operator (who principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-OWNER))
    (asserts! (is-some (some who)) (err ERR-INVALID-ARG))
    (var-set operator who)
    (ok who)
  )
)

;; --- Game scoring ---
;; Only the operator can award points for a win. Typically called by a backend/referee.
(define-public (award-points (player principal) (count uint))
  (begin
    (asserts! (is-eq tx-sender (var-get operator)) (err ERR-NOT-OPERATOR))
    (asserts! (> count u0) (err ERR-INVALID-ARG))
    (let ((current (default-to u0 (map-get? points player))))
      (map-set points player (+ current count))
      (ok (map-get? points player))
    )
  )
)

(define-read-only (get-points (player principal))
  (default-to u0 (map-get? points player))
)

;; Convert points to TTTC coins at a fixed rate of 1000 points = 1 coin
(define-public (convert-points (point-amount uint))
  (let (
        (my-points (default-to u0 (map-get? points tx-sender)))
      )
    (begin
      (asserts! (> point-amount u0) (err ERR-INVALID-ARG))
      (asserts! (<= point-amount my-points) (err ERR-INSUFFICIENT-POINTS))
      (asserts! (is-eq (mod point-amount POINTS-PER-COIN) u0) (err ERR-NOT-MULTIPLE))
      (let ((coins (/ point-amount POINTS-PER-COIN)))
        (map-set points tx-sender (- my-points point-amount))
        (unwrap! (ft-mint? tttc coins tx-sender) (err ERR-INVALID-ARG))
        (ok coins)
      )
    )
  )
)

;; --- Simple TTTC liquidity vault ---
;; Users deposit TTTC and receive 1:1 LP shares. Withdraw burns LP and returns TTTC.
;; This is not a full AMM - just a vault for demonstrating deposit/withdraw flows.

(define-read-only (get-operator) (var-get operator))
(define-read-only (get-owner) (var-get owner))

(define-read-only (get-tttc-balance (who principal))
  (ft-get-balance tttc who)
)

(define-read-only (get-lp-balance (who principal))
  (ft-get-balance tttc-lp who)
)

(define-public (deposit-tttc (amount uint))
  (begin
    (asserts! (> amount u0) (err ERR-INVALID-ARG))
    ;; user must transfer TTTC to the vault
    (unwrap! (ft-transfer? tttc amount tx-sender (as-contract tx-sender)) (err ERR-INVALID-ARG))
    ;; mint LP shares 1:1 to depositor
    (unwrap! (ft-mint? tttc-lp amount tx-sender) (err ERR-INVALID-ARG))
    (ok amount)
  )
)

(define-public (withdraw-tttc (shares uint))
  (begin
    (asserts! (> shares u0) (err ERR-INVALID-ARG))
    (let ((bal (ft-get-balance tttc-lp tx-sender)))
      (asserts! (>= bal shares) (err ERR-INSUFFICIENT-LP))
      (unwrap! (ft-burn? tttc-lp shares tx-sender) (err ERR-INVALID-ARG))
      (unwrap! (as-contract (ft-transfer? tttc shares (as-contract tx-sender) tx-sender)) (err ERR-INVALID-ARG))
      (ok shares)
    )
  )
)