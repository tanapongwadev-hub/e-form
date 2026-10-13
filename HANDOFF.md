# Handoff — E-Form TFAC (for Codex)

Written 2026-10-13 at the end of a Claude Code session. Read this together with `AGENTS.md`
(**Next.js 16.4 — APIs differ from what you know; read `node_modules/next/dist/docs/` before using any Next API**).

## 1. Where things stand

| Area | Status |
|---|---|
| New visual style (blue `#0868e8`, soft-sky canvas, rounded cards) | Done on every page |
| Dashboard `/`, forms list `/forms`, requests `/submissions`, request detail `/submissions/[id]` (approve/reject server action), reports `/reports` | Done |
| Form **TFAC-68-001-3** (renewal) | Done, refactored onto the shared modules below |
| Form **TFAC-68-001-5** (stop service) | Done, tested end to end |
| Form **TFAC-68-001-4** (change collateral type) | Done, tested end to end |
| Form **TFAC-68-001-2** (collateral details) | **Not started in code** — analysis in §5 |
| Form **TFAC-68-001-1** (edit juristic data) | **Not started** — notes in §6 |

`npx tsc --noEmit` and `npx eslint src` are clean as of this handoff. Everything is mock data (no backend yet).

The user writes in Thai; reply in Thai. All UI text is Thai.

## 2. Original forms

`src/forms/tfac-68-001-{1..5}.html` are the original BizPortal/Bootstrap e-forms (huge: markup + one inline
`<script>` with all logic). Two helper scripts (kept in `scripts/`) make them readable:

```bash
node scripts/eform-outline.js src/forms/tfac-68-001-2.html > /tmp/o2.txt   # condensed markup: headings, labels, inputs (name/type/required), options, data-* attrs
node scripts/eform-script.js src/forms/tfac-68-001-2.html                   # list functions + line numbers of the logic script
node scripts/eform-script.js src/forms/tfac-68-001-2.html 723 812           # print a line range of that script
```

Port rules from the script's `start1()` (submit validation), `getJurData()` (API → fields),
`setupAllOldAndNewValue()` (defaults), `checkTheRadioAccountType()` / `checkServiceType()` (visibility).
**Keep the original payload field names exactly — including typos** (e.g. `Old_Deposit_RunnginNo`,
`Olb_BillCorp_*`, `New_Deposit_Duraion`): the backend contract depends on them.

## 3. Architecture (shared code lives in `src/features/eform/`)

```
features/eform/
  api.ts              Types + mock fetchers: getJuristicProfile(), getTfacCorporate(id, serviceType?), submitApplication(formCode, payload)
  mock-data.ts        Fictional profile + TFAC corporate data (address, person, employee, guarantee)
  constants.ts        SERVICE_TYPES, TITLE_OPTIONS/OTHER_TITLE, NATIONALITY/WORKING options, file limits, COMMON_TEXT (addressNote, warning, terms, confirm)
  utils.ts            bahtText, parseAmount, formatMoney, sanitizeAmountInput, digitsOnly, isValidThaiCitizenId, formatThaiDate, toIsoDate, EMAIL_PATTERN …
  form-wizard.tsx     <FormWizard>: stepper, per-step validation (form.trigger(step.fields)), sticky action bar,
                      browser drafts (save/restore/discard), cancel dialog, success panel. Also WizardStep<T>, firstStepWithError
  draft.ts            localStorage drafts (key eform-draft:<formCode>:<scope>, attachments excluded)
  success-panel.tsx   Confirmation screen after submit
  form-page.tsx       FormPageHeader, FormSkeleton, todayThai()
  applicant.ts        Applicant contact schema/validation/defaults/payload (Email, OfficeEmail, Mobile, Telephone + receipt address Address_Type_ID 4)
  attachments.ts      AttachmentSpec, attachmentsSchema/checkAttachments/emptyAttachments/attachmentsPayload
  collateral.ts       5 collateral types (Deposit/Card/BillGov/BillCorp/Policy), BANKS, generic CollateralRow + per-type fields,
                      row schema (deposit ≥12 months, due date ≥ today), rowsFromGuarantee(API)
  sections/
    juristic-profile-section.tsx  read-only "ข้อมูลนิติบุคคล" (+ children slot for extra fields)
    juristic-section.tsx          step 1 used by 68-001-1…4: profile + receipt address + contact fields
    attachments-section.tsx       upload cards bound to attachments.<code>
    certification-section.tsx     confirm_1 + legal warning (+ children for extra declarations)
    collateral-list.tsx           ListEditor for one collateral type (readOnly mode for API data)
    review.tsx                    ReviewCard/ReviewRow/ReviewStatus/ReviewAttachments/TermsCheckbox/DevPayload
  topics/             "หัวข้อที่ขอแก้ไข" shared by 68-001-1/2/3 (identical field names in all three originals)
    schema.ts         row schemas, topicsShape (spread into a form schema), topicVisibility(serviceType), checkTopics(), deriveManagerConditions …
    defaults.ts       topicDefaults(profile, corporate), topicsPayload(values)
    text.ts           TOPIC_TEXT
    topic-block / manager-section / people-sections (Accountant, HeadOffice, Examiner) / beyond-section
```

A form = `features/tfac-68-001-N/` with `constants.ts` (FORM_CODE, FORM_TITLE, ATTACHMENTS, TEXT),
`schema.ts` (zod + defaults + STEPS), optional `payload.ts`, and `tfac-68-001-N-form.tsx` that renders
`<FormWizard form steps applicant draftScope submit success renderStep>`. Page: `src/app/(dashboard)/forms/tfac-68-001-N/page.tsx`
(copy 68-001-4's page). When a form is done, add `href` to its entry in `src/config/forms.ts`.

**Best templates:** 68-001-4 (collateral + certification + payload mapping) and 68-001-3 (topics + income).

Shared UI pieces: `components/form/fields.tsx` (TextField, TextareaField, SelectField, RadioField, CheckboxField,
TitleField, ReadonlyField, `INPUT_CLASS`), `components/form/list-editor.tsx` (table ≥xl / cards below, row dialog, `readOnly`),
`components/form/file-field.tsx` (drag & drop), `components/form/form-section.tsx` (FormSection with `tag`, FormGrid, FormNote tones amber/info/danger/muted).

## 4. Gotchas (all hit during this session)

- **Cache Components is on** (`next.config.ts: cacheComponents`). Reading `searchParams`/`params`/`new Date()`/runtime data must be
  inside `<Suspense>`; form pages call `await connection()` (from `next/server`) in the loader before `new Date()`.
  Dynamic routes without `generateStaticParams`: `usePathname()` in layouts suspends → sidebar menu and breadcrumb are already wrapped in Suspense.
- After adding a route, run `npx next typegen` so `PageProps<"/route">` types exist.
- Server actions are public: check `getCurrentUser()` inside them (see `src/lib/submission-actions.ts`). Use `refresh()` from `next/cache` after mutations.
- React Compiler lint: don't read refs during render; don't call setState directly in effects (use `useSyncExternalStore` like the drafts do);
  use `form.subscribe` instead of `form.watch(callback)`.
- Never import plain constants from a `"use client"` file into a server component (you get a client reference) — put shared constants in non-client modules.
- The dev server sometimes keeps stale Tailwind CSS for new class names; restart `npm run dev` if new classes don't apply (a `next build` confirms they compile).
- Scrollbars are hidden app-wide (`globals.css`); anything that scrolls horizontally needs a visible hint (see the reports table).
- Mobile overflow: check the inner scroll container (`main div[overflow-y:auto]`.scrollWidth), not `document.documentElement` — grid items need `min-w-0`.
- Mock login for local testing: `admin` / `Admin123` (`src/lib/auth/mock-users.ts`).
- In the Claude browser pane the document was often `visibilityState: hidden`, which freezes CSS transitions and React's streamed Suspense reveal — not an app bug.

Verification loop used for every form: fill steps via the browser, confirm blocked steps show errors, drop dummy files on upload cards
(`DragEvent` with a `DataTransfer`), check the payload in the review step's "สำหรับนักพัฒนา: ดูข้อมูล JSON" block, submit, see the success panel.

## 5. Next: TFAC-68-001-2 — "การแจ้งรายละเอียดเกี่ยวกับหลักประกันเพื่อประกันความรับผิดต่อบุคคลที่สาม"

Findings so far (script line numbers refer to `node scripts/eform-script.js src/forms/tfac-68-001-2.html`):

1. **General info** — same as 68-001-3/4 → `JuristicSection` + `applicantContactSchema`.
2. **รายละเอียดคำขอ**
   - `AccountTypeJuristic` radio: ห้างหุ้นส่วนสามัญนิติบุคคล / ห้างหุ้นส่วนจำกัด / บริษัทจำกัด / บริษัทมหาชนจำกัด — **locked** to the corporate business type (`_Corporate_Business_Type`, l.1220–1235) → show read-only.
   - `AccountTypeService` radio: ทำบัญชี / สอบบัญชี / ทำบัญชีและสอบบัญชี — **locked** to `corporate.data.Corporate_Service_Name` (l.1237–1250) → read-only; it drives topic visibility (`topicVisibility`) and which income column shows (ทำบัญชี hides column 3, สอบบัญชี hides column 2; l.268ff `checkServiceType`).
3. **Change topics** — Manager/Accountant/HeadOffice/Examiner/Beyond: identical to 68-001-3 → reuse `features/eform/topics` (`...topicsShape`, `topicDefaults`, `checkTopics`, `topicsPayload`, section components, `TOPIC_TEXT.changeTopicsNote`).
4. **Financial** (`Financial[...]`, `AssetDetail[...]`):
   - `Financial[StatementType]` radio (required): "ตัวเลขจากงบการเงินที่ตรวจสอบและแสดงความเห็น โดยผู้สอบบัญชีแล้ว" / "ตัวเลขคาดการณ์ ในกรณีที่งบการเงินล่าสุดยังไม่ได้ตรวจสอบและแสดงความเห็น โดยผู้สอบบัญชี".
   - `Financial[TotalIncomeDate]` date (required), `Financial[Capital]` read-only = corporate Capital (ช่องที่ 1).
   - Column 2 ทำบัญชี: `Financial[Number2RegisterAmount|Number2RegisterIncome|Number2UnRegisterAmount|Number2UnRegisterIncome]` (บริษัทจดทะเบียน / ไม่ใช่บริษัทจดทะเบียน, จำนวนราย + รายได้ (บาท)), totals `Number2Total` + `Number2TotalText` = RegisterIncome + UnRegisterIncome.
   - Column 3 สอบบัญชี: same with `Number3*`.
   - Defaults from API (l.895–917): `data.Accounting_Customer_Income/Amount`, `Accounting_Customer_None_Income/Amount`, `Auditoring_Customer_Income/Amount`, `Auditoring_Customer_None_Income/Amount` → **add these fields to `TfacCorporate.data` + mock**.
   - `AssetDetail[Number1]` = capital; `AssetDetail[Number23]` = Number2Total + Number3Total.
   - Assets: `AssetDetail[Current]`, `AssetDetail[NonCurrent]` (required amounts) → `AssetDetail[CurrentTotalNumber]` + `CurrentTotalText`.
   - `callLastValue()` (l.725): if Number1 > Number23 → show **CapitalRegister** block (`CapitalRegister_Check` forced on, `CapitalRegister[Date]` required date, `CapitalRegister[MoneyNumber|MoneyText]`), else **LastEndIncome** block (`LastEndIncome_Check` forced on, `LastEndIncome[MoneyNumber|MoneyText]`). Amount = **3% of max(Number1, Number23)**; also written to `sumOldGuarantee` / `sumOldGuaranteeText` (the required collateral amount).
   - Texts: content_160 ("ข้าพเจ้าได้ดําเนินการจัดให้มีหลักประกัน…") and content_190 ("*“ทุน” หมายความว่า…") — extract with the outline/strip helpers.
5. **Collateral** (`AccountSavingType` radio, one of the 5 types, + `NewGuarantee_Type_ID`): lists `Deposit[]`, `Card[]`, `BillGov[]`, `BillCorp[]`, `Policy[]`
   with row keys **without prefix**: `Deposit_RunningNo, Deposit_MonthDuration, Deposit_BankName, Deposit_BankBranch, Deposit_AccountName, Deposit_AccountNumber, Deposit_DueDate, Deposit_MoneyNumber, Deposit_MoneyText`;
   `Card_RunningNo, Card_BankName, Card_BankBranch, Card_AccountName, Card_AccountNumber, Card_DueDate, Card_MoneyNumber, Card_MoneyText`;
   `BillGov_RunningNo, BillGov_Number, BillGov_StartDate, BillGov_DueDate, BillGov_MoneyNumber, BillGov_MoneyText` (no CreateBy in the original; header shows ออกโดย — add `BillGov_CreateBy`);
   `BillCorp_RunningNo, BillCorp_CreateBy, BillCorp_Number, BillCorp_StartDate, BillCorp_DueDate, BillCorp_MoneyNumber, BillCorp_MoneyText`;
   `Policy_RunningNo, Policy_Company, Policy_Number, Policy_DueDate, Policy_MoneyNumber, Policy_MoneyText`.
   Reuse `CollateralList` + a key map like `features/tfac-68-001-4/payload.ts`. Sum of the chosen list vs the required 3% amount: see `compareConditionSum` (l.1271) and `conGuarantee` in the required list at l.1669 — **read these before deciding the rule** (probably "sum must be ≥ required").
6. **Declarations**: `Confirm_DueDate_Check`, `Confirm_Change_Check` (required; same texts as 68-001-4 `TEXT.confirmDueDate/confirmChange`), `confirm_1` → `CertificationSection` with children.
7. **Attachments**: get codes/labels with `grep -o 'data-file-field-name-value="[^"]*"\|data-file-field-label-value="[^"]*"'` on the outline; check `start1()` for which are required.

Suggested steps: ข้อมูลทั่วไป → รายละเอียดคำขอ & หัวข้อที่แก้ไข → งบการเงิน & หลักประกัน → เอกสารและรับรอง → ตรวจสอบและส่ง.
Use the service type from the TFAC API (the form page for 68-001-3 has a mock service-type switcher banner you can copy).

## 6. Then: TFAC-68-001-1 — "การแก้ไขข้อมูลนิติบุคคล" (largest)

Same topics module plus extra topic checkboxes: `Capital_Check`, `IssueBook_Check`, `JurLocation_Check` (old/new location, receipt address,
`JurLocation_Other[]` list = other branches), `Modify_Check`, `ServiceType_Check` (old/new service type — when ticked, it **locks** topic checkboxes on per
`checkManagerChecked()` l.194), `Transformation_Check`. Script functions: `checkManagerChecked`, `checkServiceType`, `reCheckNewServiceTypeRadio`,
`showCodeBranch`, `setupAllOldAndNewValue` (l.874–1445, large), `func_LIST_group*`, `start1` (l.1719). Start with
`node scripts/eform-outline.js src/forms/tfac-68-001-1.html` and the `<h2>/<h4>` headings (ที่ตั้งนิติบุคคลเดิม/ใหม่, ที่อยู่สำหรับออกใบเสร็จรับเงิน,
สำนักงานสาขาอื่น, ประเภทการบริการเดิม/ใหม่, ข้อมูลเดิม/ข้อมูลใหม่ …).

## 7. Other open items

- Requests/reports data are separate mocks (`src/lib/mock/dashboard.ts`, `src/lib/mock/reports.ts`); approve/reject decisions live in server memory only.
- Dashboard "คำขอล่าสุด" is prerendered in production builds (won't reflect decisions) — fine until a real API exists.
- `src/app/(dashboard)/users` and `settings` are still `ComingSoon` placeholders.
- No git repository yet in this folder.
