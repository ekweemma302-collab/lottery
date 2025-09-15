;; contracts/greenstx.clar
;; GreenStx - Eco Pledge Contract 
;; Simple pledge system where users donate STX to a community eco-fund.

(define-data-var fund-owner principal tx-sender)
(define-data-var total-pledged uint u0)

(define-map pledges
  principal
  uint
)

(define-constant ERR-NOT-OWNER u100)
(define-constant ERR-NO-PLEDGE u101)

;;  Make a pledge (donate STX to the eco fund)
(define-public (pledge (amount uint))
  (begin
    (as-contract (stx-transfer? amount tx-sender (var-get fund-owner)))
    (let ((existing (default-to u0 (map-get? pledges tx-sender))))
      (map-set pledges tx-sender (+ existing amount))
      (var-set total-pledged (+ (var-get total-pledged) amount))
      (ok amount)
    )
  )
)

;; Owner-only: withdraw accumulated funds (already in owner wallet)
(define-public (confirm-withdrawal)
  (begin
    (asserts! (is-eq tx-sender (var-get fund-owner)) (err ERR-NOT-OWNER))
    (ok "Funds already transferred at pledge time")
  )
)

;; --- Views ---
(define-read-only (get-total) (var-get total-pledged))
(define-read-only (get-my-pledge (user principal)) (map-get? pledges user))
(define-read-only (get-owner) (var-get fund-owner))
