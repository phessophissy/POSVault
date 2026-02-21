;; POSVault Core - STX Treasury Vault
;; Deposit STX, earn POS-GOV governance tokens as yield
;; Supports deposits with configurable yield rates

;; ==========================================
;; Constants
;; ==========================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-INSUFFICIENT-BALANCE (err u202))
(define-constant ERR-INVALID-AMOUNT (err u203))
(define-constant ERR-ALREADY-DEPOSITED (err u205))
(define-constant ERR-NO-DEPOSIT (err u206))
(define-constant ERR-VAULT-PAUSED (err u207))
(define-constant BLOCKS-PER-REWARD-CYCLE u144) ;; ~1 day of blocks

;; ==========================================
;; Data Variables
;; ==========================================

(define-data-var total-stx-locked uint u0)
(define-data-var total-depositors uint u0)
(define-data-var contract-paused bool false)
(define-data-var reward-rate uint u100) ;; basis points per cycle

;; ==========================================
;; Data Maps
;; ==========================================

;; User deposits
(define-map deposits
  principal
  {
    amount: uint,
    deposit-block: uint,
    last-claim-block: uint,
    total-rewards-claimed: uint
  }
)

;; Vault statistics per user
(define-map user-stats
  principal
  {
    total-deposited: uint,
    total-withdrawn: uint,
    total-rewards: uint,
    deposit-count: uint
  }
)

;; Authorized admin contracts
(define-map authorized-admins principal bool)

;; ==========================================
;; Private Functions
;; ==========================================

(define-private (is-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)

(define-private (is-admin-caller)
  (or (is-owner) (default-to false (map-get? authorized-admins contract-caller)))
)

(define-private (calculate-pending-rewards (depositor principal))
  (match (map-get? deposits depositor)
    deposit-data
      (let (
        (blocks-elapsed (- stacks-block-height (get last-claim-block deposit-data)))
        (cycles-completed (/ blocks-elapsed BLOCKS-PER-REWARD-CYCLE))
        (reward-amount (/ (* (get amount deposit-data) (var-get reward-rate) cycles-completed) u10000))
      )
        reward-amount
      )
    u0
  )
)

;; ==========================================
;; Public Functions - Deposits
;; ==========================================

;; Deposit STX into the vault
(define-public (deposit (amount uint))
  (begin
    (asserts! (not (var-get contract-paused)) ERR-VAULT-PAUSED)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (is-none (map-get? deposits tx-sender)) ERR-ALREADY-DEPOSITED)
    
    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Record deposit
    (map-set deposits tx-sender {
      amount: amount,
      deposit-block: stacks-block-height,
      last-claim-block: stacks-block-height,
      total-rewards-claimed: u0
    })
    
    ;; Update user stats
    (let (
      (current-stats (default-to 
        { total-deposited: u0, total-withdrawn: u0, total-rewards: u0, deposit-count: u0 }
        (map-get? user-stats tx-sender)))
    )
      (map-set user-stats tx-sender {
        total-deposited: (+ (get total-deposited current-stats) amount),
        total-withdrawn: (get total-withdrawn current-stats),
        total-rewards: (get total-rewards current-stats),
        deposit-count: (+ (get deposit-count current-stats) u1)
      })
    )
    
    ;; Update globals
    (var-set total-stx-locked (+ (var-get total-stx-locked) amount))
    (var-set total-depositors (+ (var-get total-depositors) u1))
    
    (print { event: "deposit", depositor: tx-sender, amount: amount, block: stacks-block-height })
    (ok true)
  )
)

;; Withdraw STX from the vault
(define-public (withdraw)
  (let (
    (deposit-data (unwrap! (map-get? deposits tx-sender) ERR-NO-DEPOSIT))
    (amount (get amount deposit-data))
    (pending-rewards (calculate-pending-rewards tx-sender))
    (withdrawer tx-sender)
  )
    (asserts! (not (var-get contract-paused)) ERR-VAULT-PAUSED)
    
    ;; Transfer STX back to user
    (try! (as-contract (stx-transfer? amount tx-sender withdrawer)))
    
    ;; Mint reward tokens if any
    (if (> pending-rewards u0)
      (try! (contract-call? .governance-token mint pending-rewards withdrawer))
      true
    )
    
    ;; Update user stats
    (let (
      (current-stats (default-to
        { total-deposited: u0, total-withdrawn: u0, total-rewards: u0, deposit-count: u0 }
        (map-get? user-stats withdrawer)))
    )
      (map-set user-stats withdrawer {
        total-deposited: (get total-deposited current-stats),
        total-withdrawn: (+ (get total-withdrawn current-stats) amount),
        total-rewards: (+ (get total-rewards current-stats) pending-rewards),
        deposit-count: (get deposit-count current-stats)
      })
    )
    
    ;; Clean up deposit
    (map-delete deposits withdrawer)
    
    ;; Update globals
    (var-set total-stx-locked (- (var-get total-stx-locked) amount))
    (var-set total-depositors (- (var-get total-depositors) u1))
    
    (print { event: "withdraw", depositor: withdrawer, amount: amount, rewards: pending-rewards })
    (ok { stx-returned: amount, rewards-earned: pending-rewards })
  )
)

;; Claim POS-GOV rewards without withdrawing
(define-public (claim-rewards)
  (let (
    (deposit-data (unwrap! (map-get? deposits tx-sender) ERR-NO-DEPOSIT))
    (pending-rewards (calculate-pending-rewards tx-sender))
  )
    (asserts! (not (var-get contract-paused)) ERR-VAULT-PAUSED)
    (asserts! (> pending-rewards u0) ERR-INVALID-AMOUNT)
    
    ;; Mint reward tokens
    (try! (contract-call? .governance-token mint pending-rewards tx-sender))
    
    ;; Update deposit record
    (map-set deposits tx-sender
      (merge deposit-data {
        last-claim-block: stacks-block-height,
        total-rewards-claimed: (+ (get total-rewards-claimed deposit-data) pending-rewards)
      })
    )
    
    ;; Update user stats
    (let (
      (current-stats (default-to
        { total-deposited: u0, total-withdrawn: u0, total-rewards: u0, deposit-count: u0 }
        (map-get? user-stats tx-sender)))
    )
      (map-set user-stats tx-sender
        (merge current-stats {
          total-rewards: (+ (get total-rewards current-stats) pending-rewards)
        })
      )
    )
    
    (print { event: "claim-rewards", depositor: tx-sender, rewards: pending-rewards })
    (ok pending-rewards)
  )
)

;; ==========================================
;; Admin Functions
;; ==========================================

;; Add an authorized admin
(define-public (add-admin (admin principal))
  (begin
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (map-set authorized-admins admin true)
    (ok true)
  )
)

;; Remove an authorized admin
(define-public (remove-admin (admin principal))
  (begin
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (map-delete authorized-admins admin)
    (ok true)
  )
)

;; Set reward rate (basis points)
(define-public (set-reward-rate (new-rate uint))
  (begin
    (asserts! (is-admin-caller) ERR-NOT-AUTHORIZED)
    (var-set reward-rate new-rate)
    (print { event: "set-reward-rate", new-rate: new-rate })
    (ok true)
  )
)

;; Pause/unpause the vault
(define-public (toggle-pause)
  (begin
    (asserts! (is-admin-caller) ERR-NOT-AUTHORIZED)
    (var-set contract-paused (not (var-get contract-paused)))
    (print { event: "toggle-pause", paused: (var-get contract-paused) })
    (ok true)
  )
)

;; Emergency withdraw (owner only)
(define-public (emergency-withdraw)
  (let (
    (balance (var-get total-stx-locked))
  )
    (asserts! (is-owner) ERR-NOT-AUTHORIZED)
    (asserts! (> balance u0) ERR-INSUFFICIENT-BALANCE)
    (try! (as-contract (stx-transfer? balance tx-sender CONTRACT-OWNER)))
    (var-set total-stx-locked u0)
    (print { event: "emergency-withdraw", amount: balance })
    (ok balance)
  )
)

;; ==========================================
;; Read-Only Functions
;; ==========================================

(define-read-only (get-deposit (depositor principal))
  (map-get? deposits depositor)
)

(define-read-only (get-user-stats (user principal))
  (default-to
    { total-deposited: u0, total-withdrawn: u0, total-rewards: u0, deposit-count: u0 }
    (map-get? user-stats user)
  )
)

(define-read-only (get-pending-rewards (depositor principal))
  (ok (calculate-pending-rewards depositor))
)

(define-read-only (get-vault-info)
  (ok {
    total-stx-locked: (var-get total-stx-locked),
    total-depositors: (var-get total-depositors),
    reward-rate: (var-get reward-rate),
    is-paused: (var-get contract-paused),
    current-block: stacks-block-height
  })
)

(define-read-only (get-reward-rate)
  (ok (var-get reward-rate))
)

(define-read-only (is-paused)
  (ok (var-get contract-paused))
)
