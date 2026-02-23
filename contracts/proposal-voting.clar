;; POSVault Proposal Voting (DAO Governance)
;; Token-weighted voting for protocol governance
;; POS-GOV holders can create and vote on proposals

;; ==========================================
;; Constants
;; ==========================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-PROPOSAL-NOT-FOUND (err u301))
(define-constant ERR-ALREADY-VOTED (err u302))
(define-constant ERR-VOTING-ENDED (err u303))
(define-constant ERR-VOTING-NOT-ENDED (err u304))
(define-constant ERR-PROPOSAL-EXECUTED (err u305))
(define-constant ERR-INSUFFICIENT-TOKENS (err u306))
(define-constant ERR-QUORUM-NOT-MET (err u307))
(define-constant ERR-INVALID-PROPOSAL (err u308))
(define-constant ERR-VOTING-ACTIVE (err u309))

(define-constant VOTING-PERIOD u1008) ;; ~7 days in blocks
(define-constant MIN-PROPOSAL-TOKENS u1000000) ;; 1 POS-GOV token minimum to propose
(define-constant QUORUM-PERCENTAGE u10) ;; 10% of total supply must vote

;; ==========================================
;; Data Variables
;; ==========================================

(define-data-var proposal-count uint u0)
(define-data-var total-proposals-executed uint u0)

;; ==========================================
;; Data Maps
;; ==========================================

;; Proposal data
(define-map proposals
  uint  ;; proposal-id
  {
    proposer: principal,
    title: (string-utf8 100),
    description: (string-utf8 500),
    proposal-type: (string-ascii 20),  ;; "reward-rate", "pause", "general"
    value: uint,                        ;; numeric value for parameter changes
    start-block: uint,
    end-block: uint,
    votes-for: uint,
    votes-against: uint,
    total-voters: uint,
    executed: bool,
    passed: bool
  }
)

;; Track individual votes
(define-map voter-records
  { proposal-id: uint, voter: principal }
  { amount: uint, support: bool }
)

;; Track if user has an active proposal
(define-map active-proposals
  principal
  uint
)

;; ==========================================
;; Private Functions
;; ==========================================

(define-private (is-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)

(define-private (is-proposal-active-by-id (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal
      (and
        (<= stacks-block-height (get end-block proposal))
        (not (get executed proposal))
      )
    false
  )
)

(define-private (has-active-proposal (proposer principal))
  (match (map-get? active-proposals proposer)
    proposal-id (is-proposal-active-by-id proposal-id)
    false
  )
)

(define-private (is-valid-proposal (proposal-type (string-ascii 20)) (value uint))
  (if (is-eq proposal-type "general")
    (is-eq value u0)
    (if (is-eq proposal-type "pause")
      (is-eq value u0)
      (if (is-eq proposal-type "reward-rate")
        (> value u0)
        false
      )
    )
  )
)

;; ==========================================
;; Public Functions - Proposals
;; ==========================================

;; Create a new proposal
(define-public (create-proposal 
  (title (string-utf8 100))
  (description (string-utf8 500))
  (proposal-type (string-ascii 20))
  (value uint)
)
  (let (
    (proposer-balance (unwrap-panic (contract-call? .governance-token get-balance tx-sender)))
    (new-id (+ (var-get proposal-count) u1))
  )
    ;; Must hold minimum tokens to propose
    (asserts! (>= proposer-balance MIN-PROPOSAL-TOKENS) ERR-INSUFFICIENT-TOKENS)
    (asserts! (is-valid-proposal proposal-type value) ERR-INVALID-PROPOSAL)
    (asserts! (not (has-active-proposal tx-sender)) ERR-VOTING-ACTIVE)
    
    ;; Create proposal
    (map-set proposals new-id {
      proposer: tx-sender,
      title: title,
      description: description,
      proposal-type: proposal-type,
      value: value,
      start-block: stacks-block-height,
      end-block: (+ stacks-block-height VOTING-PERIOD),
      votes-for: u0,
      votes-against: u0,
      total-voters: u0,
      executed: false,
      passed: false
    })
    
    ;; Track active proposal for user
    (map-set active-proposals tx-sender new-id)
    
    ;; Update counter
    (var-set proposal-count new-id)
    
    (print { 
      event: "proposal-created", 
      id: new-id, 
      proposer: tx-sender, 
      title: title,
      type: proposal-type,
      end-block: (+ stacks-block-height VOTING-PERIOD)
    })
    (ok new-id)
  )
)

;; Vote on a proposal
(define-public (vote (proposal-id uint) (support bool))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    (voter-balance (unwrap-panic (contract-call? .governance-token get-balance tx-sender)))
  )
    ;; Validations
    (asserts! (> voter-balance u0) ERR-INSUFFICIENT-TOKENS)
    (asserts! (<= stacks-block-height (get end-block proposal)) ERR-VOTING-ENDED)
    (asserts! (not (get executed proposal)) ERR-PROPOSAL-EXECUTED)
    (asserts! (is-none (map-get? voter-records { proposal-id: proposal-id, voter: tx-sender })) ERR-ALREADY-VOTED)
    
    ;; Record vote
    (map-set voter-records
      { proposal-id: proposal-id, voter: tx-sender }
      { amount: voter-balance, support: support }
    )
    
    ;; Update proposal tallies
    (map-set proposals proposal-id
      (merge proposal {
        votes-for: (if support (+ (get votes-for proposal) voter-balance) (get votes-for proposal)),
        votes-against: (if (not support) (+ (get votes-against proposal) voter-balance) (get votes-against proposal)),
        total-voters: (+ (get total-voters proposal) u1)
      })
    )
    
    (print { 
      event: "vote-cast", 
      proposal-id: proposal-id, 
      voter: tx-sender, 
      support: support, 
      weight: voter-balance 
    })
    (ok true)
  )
)

;; Execute a passed proposal
(define-public (execute-proposal (proposal-id uint))
  (let (
    (proposal (unwrap! (map-get? proposals proposal-id) ERR-PROPOSAL-NOT-FOUND))
    (total-supply (unwrap-panic (contract-call? .governance-token get-total-supply)))
    (quorum-needed (/ (* total-supply QUORUM-PERCENTAGE) u100))
    (total-votes (+ (get votes-for proposal) (get votes-against proposal)))
  )
    ;; Validations
    (asserts! (> stacks-block-height (get end-block proposal)) ERR-VOTING-NOT-ENDED)
    (asserts! (not (get executed proposal)) ERR-PROPOSAL-EXECUTED)
    (asserts! (>= total-votes quorum-needed) ERR-QUORUM-NOT-MET)
    
    (let (
      (did-pass (> (get votes-for proposal) (get votes-against proposal)))
    )
      ;; Execute based on proposal type if passed
      (if did-pass
        (begin
          ;; Handle specific proposal types
          (if (is-eq (get proposal-type proposal) "reward-rate")
            (try! (contract-call? .vault-core set-reward-rate (get value proposal)))
            (if (is-eq (get proposal-type proposal) "pause")
              (try! (contract-call? .vault-core toggle-pause))
              true  ;; General proposals just get recorded
            )
          )
          true
        )
        true
      )
      
      ;; Mark proposal as executed
      (map-set proposals proposal-id
        (merge proposal {
          executed: true,
          passed: did-pass
        })
      )

      ;; Clear proposer's active proposal marker if this is the tracked one
      (match (map-get? active-proposals (get proposer proposal))
        active-id
          (if (is-eq active-id proposal-id)
            (map-delete active-proposals (get proposer proposal))
            true
          )
        true
      )
      
      (var-set total-proposals-executed (+ (var-get total-proposals-executed) u1))
      
      (print { 
        event: "proposal-executed", 
        proposal-id: proposal-id, 
        passed: did-pass,
        votes-for: (get votes-for proposal),
        votes-against: (get votes-against proposal)
      })
      (ok did-pass)
    )
  )
)

;; ==========================================
;; Read-Only Functions
;; ==========================================

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id)
)

(define-read-only (get-vote-record (proposal-id uint) (voter principal))
  (map-get? voter-records { proposal-id: proposal-id, voter: voter })
)

(define-read-only (get-proposal-count)
  (ok (var-get proposal-count))
)

(define-read-only (get-total-executed)
  (ok (var-get total-proposals-executed))
)

(define-read-only (get-user-active-proposal (user principal))
  (match (map-get? active-proposals user)
    proposal-id
      (if (is-proposal-active-by-id proposal-id)
        (some proposal-id)
        none
      )
    none
  )
)

(define-read-only (get-voting-period)
  (ok VOTING-PERIOD)
)

(define-read-only (get-min-proposal-tokens)
  (ok MIN-PROPOSAL-TOKENS)
)

(define-read-only (is-voting-active (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal (ok (and 
      (<= stacks-block-height (get end-block proposal))
      (not (get executed proposal))
    ))
    ERR-PROPOSAL-NOT-FOUND
  )
)

(define-read-only (get-proposal-result (proposal-id uint))
  (match (map-get? proposals proposal-id)
    proposal (ok {
      passed: (> (get votes-for proposal) (get votes-against proposal)),
      votes-for: (get votes-for proposal),
      votes-against: (get votes-against proposal),
      total-voters: (get total-voters proposal),
      executed: (get executed proposal),
      voting-ended: (> stacks-block-height (get end-block proposal))
    })
    ERR-PROPOSAL-NOT-FOUND
  )
)
