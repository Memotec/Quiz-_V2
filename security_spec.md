# Security Specification - VCCS Quiz 4G Firebase Security

## 1. Data Invariants
- **User Profiles (/users/{userId})**:
  - `id` must be a valid string, matching the authenticated user ID (`request.auth.uid`).
  - `email` must be a valid email string.
  - A user can only read and write their own profile information (`request.auth.uid == userId`).
  - No user is allowed to modify system configurations or shadow variables of other users.

- **Exam History (/users/{userId}/history/{historyId})**:
  - Each item must belong to the user (`request.auth.uid == userId`).
  - `mode` must be one of `practice` or `exam`.
  - `score` must be between `0.0` and `10.0`.
  - `timeSpentSeconds` and `correctAnswersCount` must be non-negative integers.
  - Timestamps like `createdAt` must match `request.time`.
  - `id` must match `historyId`.
  - Identity verification: It must be structurally impossible for an authenticated user to write history data into another user's path.

---

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads demonstrating identity intrusion, type inconsistency, value poisoning, or state shortcutting, all of which must return `PERMISSION_DENIED`.

### Payload 1: Spoofed OAuth Identity (Identity Hijack)
- **Path**: `/users/attacker-uid`
- **Attempt**: Spoofing another user's UID to read or create their profile when logged in with a different credentials.
- **Payload**: `{ "id": "target-uid", "email": "innocent@vccs.vn", "displayName": "Innocent User", "createdAt": "2026-05-29T15:20:00.000Z", "updatedAt": "2026-05-29T15:20:00.000Z" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 2: Write history item to another user's subcollection (Cross-User Write)
- **Path**: `/users/victim-uid/history/session-1234`
- **Attempt**: Writing test session statistics into another user's history collection.
- **Payload**: `{ "id": "session-1234", "userId": "attacker-uid", "date": "2026-05-29T15:20:00.000Z", "mode": "exam", "categoryName": "TCP/IP Căn bản", "totalQuestions": 30, "correctAnswersCount": 30, "score": 10.0, "timeSpentSeconds": 1500, "passed": true, "createdAt": "2026-05-29T15:20:00.000Z" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 3: Spoofed Server Timestamp (Temporal Violation)
- **Path**: `/users/user-123/history/item-999`
- **Attempt**: Forging the `createdAt` timestamp with a historical date.
- **Payload**: `{ "id": "item-999", "userId": "user-123", "date": "2026-05-29T15:20:00.000Z", "mode": "practice", "categoryName": "Tất cả", "totalQuestions": 10, "correctAnswersCount": 5, "score": 5.0, "timeSpentSeconds": 100, "passed": false, "createdAt": "2020-01-01T00:00:00.000Z" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 4: Invalid Scale Score (Value Poisoning)
- **Path**: `/users/user-123/history/item-101`
- **Attempt**: Submitting an impossible score of `15.5` on a `10.0` max scale to poison stats.
- **Payload**: `{ "id": "item-101", "userId": "user-123", "date": "2026-05-29T15:20:00.000Z", "mode": "exam", "categoryName": "TCP/IP Căn bản", "totalQuestions": 30, "correctAnswersCount": 30, "score": 15.5, "timeSpentSeconds": 450, "passed": true, "createdAt": "request.time" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 5: Negative Question Counts (Resource Exhaustion/Boundary Break)
- **Path**: `/users/user-123/history/item-invalid-count`
- **Attempt**: Submitting negative numbers for questions.
- **Payload**: `{ "id": "item-invalid-count", "userId": "user-123", "date": "2026-05-29T15:20:00.000Z", "mode": "practice", "categoryName": "TCP/IP Căn bản", "totalQuestions": -10, "correctAnswersCount": 10, "score": 10.0, "timeSpentSeconds": 200, "passed": true, "createdAt": "request.time" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 6: Ghost Fields insertion (Shadow Field Injection)
- **Path**: `/users/user-123`
- **Attempt**: Injecting an unrequested administrative override variable `isAdmin: true` into the user node.
- **Payload**: `{ "id": "user-123", "email": "user@vccs.vn", "displayName": "Normal User", "isAdmin": true, "createdAt": "request.time", "updatedAt": "request.time" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 7: Invalid Mode Enum (Constraint Bypass)
- **Path**: `/users/user-123/history/item-invalid-enum`
- **Attempt**: Setting the `mode` field to a custom value outside the allowed practice/exam enum.
- **Payload**: `{ "id": "item-invalid-enum", "userId": "user-123", "date": "2026-05-29T15:20:00.000Z", "mode": "hack-mode", "categoryName": "Phần cứng", "totalQuestions": 10, "correctAnswersCount": 8, "score": 8.0, "timeSpentSeconds": 300, "passed": true, "createdAt": "request.time" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 8: Immutable Field Update (Modification of original creation dates)
- **Path**: `/users/user-123/history/item-999`
- **Attempt**: Maliciously modifying the original session record and retroactively declaring that they passed.
- **Payload/Diff**: `{ "passed": true, "correctAnswersCount": 10, "score": 10.0, "createdAt": "2020-01-01T00:00:00.000Z" }` (Updating `createdAt` to something other than existing value)
- **Verdict**: `PERMISSION_DENIED`

### Payload 9: Denial of Wallet Length Inject (Large string attack)
- **Path**: `/users/user-123`
- **Attempt**: Generating a huge displayName of 500KB to inflate resource and index storage costs.
- **Payload**: `{ "id": "user-123", "email": "user@vccs.vn", "displayName": "[500KB-String]", "createdAt": "request.time", "updatedAt": "request.time" }`
- **Verdict**: `PERMISSION_DENIED`

### Payload 10: Anonymous Read Attempt on Users Collection (PII Blanket read)
- **Path**: `/users/some-user-id`
- **Attempt**: Attempting to read another user's email address and private info.
- **Verdict**: `PERMISSION_DENIED`

### Payload 11: Invalid ID Path Parameter with control character Injection (Resource poisoning)
- **Path**: `/users/user-123/history/../../../malicious-document-id`
- **Attempt**: Using control characters or relative operators in paths.
- **Verdict**: `PERMISSION_DENIED`

### Payload 12: Updating identity mapping field (Owner hijacking)
- **Path**: `/users/user-123/history/item-1`
- **Attempt**: Pointing an existing history element to a different victim user ID so they take credit.
- **Payload/Diff**: `{ "userId": "victim-user-id" }`
- **Verdict**: `PERMISSION_DENIED`

---

## 3. The Test Runner Structure

```typescript
// firestore.rules.test.ts
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "onyx-yarn-1cf5x",
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8')
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("VCCS Quiz 4G Security rules", () => {
  it("rejects unauthorized cross-user profile write", async () => {
    const context = testEnv.authenticatedContext("attacker-uid");
    const db = context.firestore();
    const docRef = db.collection("users").doc("target-uid");
    await assertFails(docRef.set({
      id: "target-uid",
      email: "victim@vccs.vn"
    }));
  });
});
```
