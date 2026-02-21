;; POSVault Governance Token (POS-GOV)
;; SIP-010 Fungible Token Standard Implementation
;; Used for governance voting and vault yield rewards

;; ==========================================
;; Token Definition
;; ==========================================

(define-fungible-token pos-gov)

;; ==========================================
;; Constants
;; ==========================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant MAX-SUPPLY u100000000000000) ;; 100M tokens with 6 decimals

;; ==========================================
;; Data Variables
;; ==========================================

(define-data-var token-uri (optional (string-utf8 256)) (some u"https://posvault.io/token-metadata.json"))
(define-data-var total-minted uint u0)
(define-data-var minting-enabled bool true)

;; ==========================================
;; Data Maps
;; ==========================================

;; Authorized minters (vault-core can mint rewards)
(define-map authorized-minters principal bool)

;; ==========================================
;; Authorization Checks
;; ==========================================

(define-private (is-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)

(define-private (is-authorized-minter (account principal))
  (default-to false (map-get? authorized-minters account))
)

;; ==========================================
;; SIP-010 Functions
;; ==========================================

;; Transfer tokens
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (ft-transfer? pos-gov amount sender recipient))
    (match memo to-print (print to-print) 0x)
    (ok true)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok "POSVault Governance Token")
)

;; Get token symbol
(define-read-only (get-symbol)
  (ok "POS-GOV")
)

;; Get decimals
(define-read-only (get-decimals)
  (ok u6)
)

;; Get balance
(define-read-only (get-balance (account principal))
  (ok (ft-get-balance pos-gov account))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (ft-get-supply pos-gov))
)

;; Get token URI
(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; ==========================================
;; Minting Functions
;; ==========================================

;; Mint tokens (owner or authorized minter only)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (or (is-owner) (is-authorized-minter tx-sender)) ERR-NOT-AUTHORIZED)
    (asserts! (var-get minting-enabled) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= (+ (var-get total-minted) amount) MAX-SUPPLY) ERR-INVALID-AMOUNT)
    (try! (ft-mint? pos-gov amount recipient))
    (var-set total-minted (+ (var-get total-minted) amount))
    (ok true)
  )
)

;; Burn tokens
(define-public (burn (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (ft-burn? pos-gov amount tx-sender))
    (ok true)
  )
)

;; ==========================================
;; Admin Functions
;; ==========================================

;; Add authorized minter (e.g., vault-core contract)
(define-public (add-minter (minter principal))
  (begin
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (map-set authorized-minters minter true)
    (ok true)
  )
)

;; Remove authorized minter
(define-public (remove-minter (minter principal))
  (begin
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (map-delete authorized-minters minter)
    (ok true)
  )
)

;; Set token URI
(define-public (set-token-uri (new-uri (optional (string-utf8 256))))
  (begin
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (var-set token-uri new-uri)
    (ok true)
  )
)

;; Toggle minting
(define-public (toggle-minting)
  (begin
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (var-set minting-enabled (not (var-get minting-enabled)))
    (ok true)
  )
)

;; ==========================================
;; Read-Only Helpers
;; ==========================================

(define-read-only (get-total-minted)
  (ok (var-get total-minted))
)

(define-read-only (is-minter (account principal))
  (ok (is-authorized-minter account))
)

(define-read-only (get-minting-status)
  (ok (var-get minting-enabled))
)
