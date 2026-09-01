# Debugging Guide

Practical debugging for **this** framework (B2B / B2X / GreenPan / API).

## 1. Reproduce with the smallest command

```bash
# one file
ENV=dev npx playwright test tests/greenpan/homePage.spec.ts --project=greenpan

# one title
ENV=staging npx playwright test --project=b2b --grep "home page is visible"

# no retries (faster signal)
ENV=dev npx playwright test --project=greenpan --retries=0

# headed
ENV=dev npx playwright test tests/greenpan/homePage.spec.ts --project=greenpan --headed

# Playwright UI mode
ENV=dev npx playwright test --project=greenpan --ui
```

Always set `ENV` explicitly.

## 2. Read the failure artifacts

On failure Playwright writes:

| Artifact      | Location                            |
| ------------- | ----------------------------------- |
| Screenshot    | `test-results/**/test-failed-*.png` |
| Error context | `test-results/**/error-context.md`  |
| HTML report   | `playwright-report/`                |

Open the report:

```bash
npx playwright show-report
```

## 3. Product-specific failure patterns

### B2B / B2X stuck on `/auth`

Cause: setup storageState missing/expired or auth redirect failed.

Check:

1. Did `setup` project run? (`b2b`/`b2x` depend on it)
2. Do `playwright/.auth/user.json` and `token.json` exist?
3. Are `ADMIN_EMAIL` / `ADMIN_PASSWORD` correct for that `ENV`?

Fix locally:

```bash
ENV=staging npx playwright test --project=setup
ENV=staging npx playwright test --project=b2b --grep @smoke
```

Specs also assert `await expect(page).not.toHaveURL(/\/auth/)`.

### GreenPan “Oops!” / phone form missing

`dev-greenpan` can return blank/Oops pages. `greenpanHomePage.open()` retries; project has `retries: 2`.

Debug tips:

- Run with `--retries=0` to see the first failure clearly
- Open headed and watch the first navigation
- Prefer stable phones from `testdata.json` for existing-user paths
- Use `randomPhoneNumber()` when you need the address step

### GreenPan skipped address step

Existing phones often already have an address → flow jumps to send-request. For address tests, use a fresh phone.

### API `errors` on GraphQL response

Inspect:

- Saved file from `saveApiResponse(...)` under `test-results/api/responses/`
- Token validity (`getAuthToken` / admin credentials)
- Whether builder payload matches current schema (`src/api/b2b/testData.ts`)

## 4. Auth / token debugging

```bash
# force fresh login by removing cached auth (local only)
rm -rf playwright/.auth
ENV=staging npx playwright test --project=setup
```

Token path: `playwright/.auth/token.json`  
Browser state: `playwright/.auth/user.json`

Never commit these files.

## 5. Locator debugging

In UI mode or headed debug:

```bash
ENV=dev npx playwright test --project=greenpan --debug
```

Prefer checking:

- Accessible name (Arabic text may have changed)
- Whether the control is inside a sheet/dialog
- Whether animation/hidden counters need `attached` instead of `visible` (see gifts remaining points)

## 6. Flake vs real bug

| Signal                                 | Likely flake            | Likely real bug |
| -------------------------------------- | ----------------------- | --------------- |
| Passes on retry, fails on Oops/network | Yes                     |                 |
| Fails every run on same assertion      |                         | Yes             |
| Only fails when workers > 1            | Shared state / env load |                 |
| Only fails for one phone/branch        | Data                    | or locator      |

GreenPan intentionally retries failed tests (`retries: 2`). Passing tests are not retried.

## 7. Lint / commit hook failures

If `git commit` fails:

```bash
npx lint-staged
npm run validate
```

Common causes:

- Unused imports/vars
- Import sort (`simple-import-sort`)
- Accidentally staging `node_modules` (should be gitignored / untracked)

## 8. CI differences

CI workflows select:

- `--project=<platform>`
- `--grep "@<suite>"`

Reproduce CI locally with the same project + tag. Ensure secrets/env match the workflow environment.

## 9. Quick decision tree

```text
Failure?
 ├─ Auth URL / storageState → re-run setup, check ADMIN_* env
 ├─ GreenPan home/Oops → headed run, retries=0, check env health
 ├─ Wrong step (address vs send) → phone data
 ├─ API GraphQL errors → token + payload + saved response JSON
 └─ Locator timeout → screenshot + role/name drift
```
