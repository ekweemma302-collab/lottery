;; contracts/lottery.clar
;; Simple STX Lottery (Raffle Draw)
;; - Users enter by sending STX
;; - Owner can pick a random winner
;; - Winner receives the pot

(define-data-var owner principal tx-sender)
(define-data-var ticket-price uint u1000000) ;; 1 STX
(define-data-var total-pot uint u0)
(define-data-var player-count uint u0)

(define-map players
    { id: uint }
    { user: principal }
)

(define-constant ERR-NOT-OWNER u100)
(define-constant ERR-INVALID-AMOUNT u101)
(define-constant ERR-NO-PLAYERS u102)

;; --- join the lottery ---
(define-public (enter)
    (begin
        (try! (stx-transfer? (var-get ticket-price) tx-sender (contract-of self)))
        (let ((id (+ u1 (var-get player-count))))
            (map-set players { id: id } { user: tx-sender })
            (var-set player-count id)
            (var-set total-pot (+ (var-get total-pot) (var-get ticket-price)))
            (ok id)
        )
    )
)

;; --- draw a winner (only owner) ---
(define-public (draw)
    (begin
        (asserts! (is-eq tx-sender (var-get owner)) (err ERR-NOT-OWNER))
        (asserts! (> (var-get player-count) u0) (err ERR-NO-PLAYERS))
        (let (
                (rand (+ block-height (var-get total-pot)))
                (winner-id (+ u1 (mod rand (var-get player-count))))
                (winner (unwrap-panic (get user (map-get? players { id: winner-id }))))
            )
            (try! (stx-transfer? (var-get total-pot) (contract-of self) winner))
            (var-set total-pot u0)
            (ok winner)
        )
    )
)

;; --- views ---
(define-read-only (get-ticket-price)
    (var-get ticket-price)
)
(define-read-only (get-total-pot)
    (var-get total-pot)
)
(define-read-only (get-player-count)
    (var-get player-count)
)