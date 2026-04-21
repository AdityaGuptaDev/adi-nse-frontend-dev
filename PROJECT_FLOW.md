# Vedant Asset — Project Flow & Ready Reckoner

A one-stop guide for anyone onboarding onto this codebase. Covers the full
portfolio → MFU transaction pipeline, module layout, data contracts, and the
gotchas we have already paid for.

---

## 1. Top-level architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                      BROWSER  (Next.js frontend)                     │
│  adi-nse-frontend-dev  — http://localhost:3000                       │
│                                                                      │
│  Pages (app router)  →  Components  →  /api/* helpers  →  axios      │
│                               │                                      │
│                               ▼                                      │
└──────────────────────────────────────────────────────────────────────┘
                                │  encrypted JSON over HTTPS
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   NODE / EXPRESS  (backend gateway)                  │
│  adi-nse-backend-dev  — http://localhost:<port>                      │
│                                                                      │
│  routes/*  →  controllers/*  →  services/*  →  Sequelize (Postgres)  │
│                                    │                                 │
│                                    ▼                                 │
│                            External APIs:                            │
│                              • MFU  (mutual fund utility)            │
│                              • NSE  (NSE MFSS exchange)              │
│                              • Decentro, Signzy, Cashfree, SMS, etc  │
└──────────────────────────────────────────────────────────────────────┘
```

- **Frontend** – Next.js 14 app-router. `src/app/(modules)/(main)/<page>`
  defines a route; the real UI lives in `src/components/<feature>`.
- **Backend** – Express service that encrypts/decrypts payloads, persists
  state in Postgres (via Sequelize models), and proxies all external calls.
- **Store** – Zustand (`src/store/*`) for cross-page state like
  `useFundStore` (scheme + investor context for the order form).
- **Encryption** – every response from the backend goes through
  `encryptResponse-service.ts`; the frontend decrypts in `api/*` helpers
  before handing to components.

---

## 2. Directory map (what lives where)

### Frontend — `adi-nse-frontend-dev/src`

| Folder         | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `app/`         | Next.js routes. `(modules)/(main)/*/page.tsx` mounts a UI.     |
| `components/`  | All feature UIs grouped by domain.                             |
| `api/`         | Thin axios wrappers grouped by domain: `transaction.ts`, `holder.ts`, `fund-picker.ts`, `kyc.ts`. |
| `services/`    | Cross-cutting logic: `mfuTransactionService.ts`, `bankService.ts`, `portfolioService.ts`, etc. |
| `store/`       | Zustand stores. `useFundStore` carries scheme+investor between pages. |
| `context/`     | React contexts: `AccountContext` (cart counter), `pageTitleContext`. |
| `commonUI/`    | Reusable form primitives: `Select`, `ReactSelect`, `Input`, `Button`, `Loader`. |
| `utils/`       | Constants (`constants.ts`), helpers (`helpers.ts`), MFU payload builders (`utils/mfu/*`). |

### Backend — `adi-nse-backend-dev/src`

| Folder         | Purpose                                                        |
| -------------- | -------------------------------------------------------------- |
| `routes/`      | Express routers grouped by domain: `mfu`, `nse`, `investor`, `user`, `cart`, … |
| `controllers/` | Request handlers that glue routes → services.                  |
| `services/`    | Business logic. Key ones: `mfu.scheme.service.ts`, `mfu.transaction.service.ts`, `nse.service.ts`, `investor.service.ts`. |
| `db/`          | Sequelize init + connection setup.                             |
| `middlewares/` | `tokenMiddleWare`, rate limiters, encryption wrapper.          |
| `validations/` | Joi / Zod schemas per route.                                   |

---

## 3. Route cheat-sheet (the pages users actually open)

| URL                              | Component                                      | Purpose                              |
| -------------------------------- | ---------------------------------------------- | ------------------------------------ |
| `/login`                         | `components/login`                             | Auth + OTP                           |
| `/dashboard`                     | `components/dashboards`                        | Role-based landing page              |
| `/portfolio`                     | `components/portfolio/portfolio.tsx`           | Holdings list with **Transact** btn  |
| `/mutual-fund`                   | `components/mutual-fund/index.tsx`             | Fund explorer landing                |
| `/mutual-fund/new-order`         | `components/mutual-fund/new-order.tsx`         | New-purchase flow                    |
| `/mutual-fund/portfolio-order`   | `components/mutual-fund/portfolio-order.tsx`   | **Order Application Form** (focus)   |
| `/fund-explore`                  | `components/fund-explore/*`                    | Search / filter fund picker          |
| `/my-cart`                       | `components/my-cart`                           | Cart + checkout                      |
| `/account-holding`               | `components/account-holding`                   | Bank / mandate management            |
| `/can-onboarding`                | `components/can-onboarding`                    | MFU CAN registration                 |
| `/nse-*`                         | `components/nse-*`                             | NSE MFSS pipeline (separate from MFU)|

---

## 4. Transaction pipeline (the part we've been fixing)

### 4.1 End-to-end flow

```
┌──────────────────────┐
│ 1. /portfolio        │  User searches by investor → sees holdings table.
│  portfolio.tsx       │  Clicks the ⇄ Transact button on a row.
└──────────┬───────────┘
           │ handleTransactClick()
           │   • Stores scheme + investor in useFundStore
           │   • Persists to localStorage (survives refresh)
           │   • router.push('/mutual-fund/portfolio-order')
           ▼
┌──────────────────────┐
│ 2. /mutual-fund/     │  Reads useFundStore → schemeData, investorList.
│    portfolio-order   │  User picks Transaction Type, fills fields.
│  portfolio-order.tsx │  Two-step confirm: [Transact Now] → [Order Now].
└──────────┬───────────┘
           │ handleTransact()
           ▼
┌──────────────────────┐
│ 3. Helper builders   │  transaction.ts   → paySec / payOutSec / schList /
│  (pure functions)    │                     sysSchList / subSeqSec
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 4. Service           │  mfuTransactionService.executeMfuTransaction()
│  mfuTransactionService│   picks Normal vs Systematic endpoint based on
│                      │   payload.txnType:
│                      │     B / R / S → ApiFinTechNormalTxnService
│                      │     V / Y / E / J / O → ApiFinTechSystematicTxn
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 5. Backend           │  /mfu/fintech-normal  or  /mfu/fintech-systematic
│  routes/mfu          │  → services/mfu.transaction.service.ts
│                      │  → signs & forwards to live MFU gateway
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│ 6. MFU response      │  Success  → respBody.ordDtl.appLinkPri (open URL)
│                      │  Failure  → respBody.secWisErrorList[].secErrorMsg
│                      │             respHeader.errorMsg / errorCode
└──────────────────────┘
```

### 4.2 Transaction type code map

| Label    | `transactionType` | `txnType` on wire | MFU endpoint       | Bank leg?          |
| -------- | ----------------- | ----------------- | ------------------ | ------------------ |
| Lumpsum  | `B`               | `B`               | Normal             | debit from investor|
| SIP      | `V`               | `V`               | Systematic         | mandate debit      |
| STP      | `Y`               | `E`               | Systematic         | none (scheme→scheme)|
| SWP      | `J`               | `J`               | Systematic         | credit to investor |
| Switch   | `O` (some use `S`)| `O`               | Systematic         | none (scheme→scheme)|
| Redeem   | `R`               | `R`               | Normal             | credit to investor |

Source of truth: [src/utils/constants.ts](src/utils/constants.ts) (`orderTypes`, `arrTransactionType`, `transactionTypeList`).

### 4.3 Per-type decision tree (inside `handleTransact`)

```
transactionType
│
├── B (Lumpsum) ───── needs: paymentMode + bank (accNo / ifsc / micr / accType)
│                     mandateRefNo ONLY if payMode === "DM" (PayEezz)
│                     schList   = getSchList("B", …)
│                     paySec    = getPaySec("B", …)
│
├── V (SIP) ───────── needs: paymentMode + mandate + frequency + start date
│                     relatedMandates = mandateList ∩ selectedBank.account_no
│                     sysSchList= getSysSchList(…, txnType)
│                     paySec    = getPaySec("V", …)
│                     subSeqSec = getSubSeqSec("V", "DM", …, mandateRefNo)
│
├── O (Switch) ───── needs: target scheme. No bank leg.
│                     schList   = getSchList("O", …)
│                     paySec    = getPaySec("O", …)   → empty section
│
├── Y (STP) ──────── needs: target scheme + frequency + start date.
│                     Sent as txnType "E" on the wire.
│                     sysSchList= getSysSchList(…, "E")
│                     paySec    = getPaySec("E", …)   → empty section
│                     Mandate optional (used only to seed endMonth/endYear;
│                     otherwise falls back to startDate + 10 years).
│
├── J (SWP) ──────── needs: frequency + start date + payout bank.
│                     payout bank = bankByFolio[0]  ||  investorBanks[0]
│                     sysSchList= getSysSchList(…, "J")
│                     paySec    = getPaySec("J", …)   → empty section
│
└── R (Redeem) ──── needs: amount / unit / all-units + payout bank.
                      payout bank = bankByFolio[0]  ||  investorBanks[0]
                      schList   = getSchList("R", …)
                      paySec    = getPaySec("R", …)   → carries folio bank
```

### 4.4 Helper functions (`src/components/mutual-fund/transaction.ts`)

All five helpers are **pure** — they return a fresh object/array each call.
(They used to cache at module scope which leaked Lumpsum paySec into the
next Switch/STP/SWP attempt. Never reintroduce module-level state here.)

```
getPaySec(txnType, paymentMode, micr, ifsc, accType, accNo,
          amount, beneVan, selectedMandate)
    B  → debit section. mandateRefNo only when paymentMode === "DM".
    V  → debit section with mandate.
    R  → payout section using investor bank.
    E/Y/O/J → empty section (no bank leg).

getPayOutSec(txnType, micr, ifsc, accType, accNo)
    → { invAccNo, micr, ifsc }

getSchList(txnType, entUnqItrn, rtaAmcCode, rtaSchCode, outRtaSchCode,
           folioSelectionMode, selectedFolio, option, amount,
           payOutFlag, payOutDtl, txnVolTyp)
    Only populated for B, O, R, J.

getSysSchList(entUnqItrn, rtaAmcCode, rtaSchCode, outRtaSchCode,
              folioSelectionMode, selectedFolio, option, amount,
              frequency, day, startMonth, startYear, endMonth, endYear,
              payOutDtl, txnType)
    Only populated for V, Y (→ "E"), J.

getSubSeqSec(transactionType, payMode, micr, ifsc, accType, accNo,
             mandateRefNo)
    Returns { payMode, invAccType, invAccNo, micr, ifsc, paymentRefNo, mandateRefNo }.
```

---

## 5. Supporting data fetches (in order)

When `portfolio-order.tsx` mounts, these fire on mount and on folio change:

```
useEffect [] once:
  • searchByISIN(schemeISIN)          → sipData (frequencies, min amt, etc)
  • getBankByFolio(folio, folio/XX)   → bankByFolio  (may be empty → fallback)
  • getSchemeByName(name)             → finalScheme (Growth / IDCW variants)
  • getInvestorPortfolio(investorId)  → investorPortfolio (folio dropdown)
  • getBankAccount(investorId)        → investorBanks (payout fallback)
  • setOrderOptions(orderTypes)       → Transaction-Type dropdown items

useEffect [selectedFolio, selectedFolioRaw]:
  • getBankByFolio(...)               → refresh bankByFolio
```

Whenever you add a new transaction type, double-check each of these
sources feeds the branch you're building.

---

## 6. Gotchas already paid for (do not re-break)

1. **Folio format** — MFU wants the *base* digits only (`41007859`), the DB
   `search_by_folio` sometimes only indexes the raw form (`41007859/68`).
   Always keep both (`selectedFolio` and `selectedFolioRaw`) and try both
   when calling `getBankByFolio`.
2. **`mandateRefNo` must be empty for non-DM payments** — Net Banking,
   NEFT, RTGS, UPI must send `""`. Sending the PRN crashes MFU with
   `mandateRefNo should be empty`.
3. **`getPaySec` must handle every txnType explicitly** — any missing
   branch used to return a stale cached object from the previous call.
4. **`folioBank` fallback** — Redeem and SWP must fall back to
   `investorBanks[0]` when `search_by_folio` returns empty, otherwise
   every new folio blocks with "Bank details not available yet".
5. **STP / SWP end date** — if no mandate matches the folio bank, we
   synthesize `endMonth/endYear` from `sipMonth/sipYear + 10 years`.
   Don't re-introduce the hard "No mandate found" block.
6. **`onClose` prop** — the popup component is reused by the route page;
   the page must pass `open={true}` and a real `onClose` (router.back),
   otherwise clicking the × button dereferences `undefined`.
7. **Stale exception banners** — clear `exeptions` and `transactionError`
   at the start of `handleTransact`, otherwise "Please select Payment
   Method?" keeps showing after the user has already picked one.
8. **Two-step submit is by design** — `[Transact Now] → [Order Now]`.
   Clicking Transact Now only validates client-side; Order Now actually
   calls MFU. Don't collapse these into one button.
9. **Duplicated "copy" files** — `portfolio-order copy.tsx`,
   `new-order copy.tsx`, `index copy.tsx` etc are historic snapshots.
   Only edit the non-copy file; the copies are not imported anywhere.

---

## 7. Key constants / magic values

| Constant              | Where                              | Meaning                                 |
| --------------------- | ---------------------------------- | --------------------------------------- |
| `orderTypes`          | `utils/constants.ts`               | UI dropdown items with `label`/`value`. |
| `arrTransactionType`  | `utils/constants.ts`               | Maps `value` → `txnVolTyp`, `vol`.      |
| `transactionTypeList` | `utils/constants.ts`               | Cart-table ID ↔ txn letter.             |
| `payMode`             | `utils/constants.ts`               | OT / NE / RT / DM / UP / IU.            |
| `dividendOptions`     | `utils/constants.ts`               | N / P / R for div-opt code.             |
| `NEXT_PUBLIC_VEDANT_ARN` | `.env`                          | ARN code sent on every MFU txn.         |
| `NEXT_PUBLIC_VEDANT_EUIN`| `.env`                          | EUIN sent on every MFU txn (blank for J).|

---

## 8. Debug playbook

When a transaction fails, always check in this order:

1. **Browser console** — `Transaction Payload:` log from
   `mfuTransactionService.ts:89` shows the exact JSON we sent.
2. **`[portfolio-order] MFU response:`** — the decoded MFU response.
   - `respBody.secWisErrorList[].secErrorMsg` = scheme-level reject.
   - `respHeader.errorMsg` / `errorCode` = header-level reject.
3. **Backend logs** — `mfu.transaction.service.ts` logs the signed MFU
   request and raw reply.
4. **Common MFU rejections**
   - `mandateRefNo should be empty` → payment mode is not DM (see §6.2).
   - `Invalid folio (100427)` → folio slashed, strip to base digits.
   - `endMonth is required (100625)` → sysSchList missing `endMonth` /
     `endYear`; see §6.5.
   - `Invalid CAN` → `selectedCan` didn't get picked up; verify
     `investorList[0].InvestorAccountHolding[0].CAN_Id`.

---

## 9. Minimum mental model for a new dev

> "Portfolio shows holdings. Clicking **Transact** drops a scheme +
> investor into Zustand and navigates to `/mutual-fund/portfolio-order`.
> That page builds an MFU payload using pure helpers in `transaction.ts`,
> validates bank/mandate based on the transaction type, and hits one of
> two MFU endpoints through `mfuTransactionService`. On success we open
> the payment link MFU returns; on failure we show `secErrorMsg` /
> `errorMsg`. Everything else (cart, new-order, fund-explore, my-cart)
> reuses the same helpers and the same two endpoints."

Once that sentence makes sense, this module is no longer scary.
