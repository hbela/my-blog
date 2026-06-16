# Privacy Policy

**Effective Date:** May 16, 2026
**Last Updated:** May 16, 2026

This Privacy Policy describes how Elyscom ("we", "us", or "our") collects, uses, and discloses information about you when you use the Standalone Task Manager mobile application (the "App"). By installing or using the App, you agree to the terms of this Privacy Policy.

If you do not agree with this Policy, please do not use the App.

---

## 1. Who We Are

The App is published by **Elyscom**.

- **Application name:** Standalone Task Manager
- **Android package:** `com.standalonetaskmanager.app`
- **Contact:** support@tanarock.hu

For any privacy-related question, request, or complaint, please contact us at the email above.

---

## 2. Information We Collect

We aim to collect only what is necessary to provide and improve the App.

### 2.1 Information you provide directly

- **Account information.** When you sign in with Google, we receive your name, email address, profile picture, and a unique Google account identifier through Firebase Authentication and Google Sign-In.
- **Task data.** Titles, descriptions, priorities, due dates, reminder times, completion status, and any other content you enter into your tasks.
- **Support communications.** When you contact us (e.g., via the in-app support screen or email), we receive the content of your message and your contact details.

### 2.2 Information collected automatically

- **Device and diagnostic data.** Through Sentry, we collect crash reports and error diagnostics, which may include device model, operating system version, app version, locale, and a stack trace of the error. We do not intentionally collect personal content as part of these reports.
- **Locale and timezone.** Used to format dates, times, and currency, and to schedule reminders correctly.
- **In-app purchase status.** Through `react-native-iap`, we receive purchase receipts and entitlement status from Google Play or the Apple App Store to confirm purchases and unlock features.

### 2.3 Information from device permissions

The App requests the following permissions. Each is used only for the stated purpose and only when you actively use the related feature.

| Permission | Purpose |
|---|---|
| Notifications (`POST_NOTIFICATIONS`) | Schedule and display local reminders for your tasks. |
| Exact alarms (`SCHEDULE_EXACT_ALARM`) | Trigger reminders at the exact time you chose. |
| Contacts (`READ_CONTACTS`, `WRITE_CONTACTS`) | Let you attach contacts to tasks. Contact data stays on your device unless you choose to export it. |
| Microphone (`RECORD_AUDIO`) | Enable voice dictation for task input. |
| Speech recognition | Convert your voice into text on-device or via the platform's speech recognition service. |

You may revoke any of these permissions at any time in your device settings; affected features will stop working but the rest of the App will continue to function.

### 2.4 Information we do NOT collect

- We do not collect precise GPS location.
- We do not access your photos, files, or media library except when you explicitly choose to export data.
- We do not sell your personal information.
- We do not run third-party advertising networks inside the App.

---

## 3. How We Use Your Information

We use the information we collect to:

1. Authenticate you and keep your account secure.
2. Store, sync, and display your tasks.
3. Send local notifications and reminders.
4. Provide voice dictation when you tap the microphone.
5. Process in-app purchases and unlock paid features.
6. Diagnose crashes, fix bugs, and improve performance.
7. Respond to your support requests.
8. Comply with legal obligations.

We do not use your task content for advertising, profiling, or training machine learning models.

---

## 4. Where Your Data Is Stored

- **On your device.** Task data, preferences, and authentication tokens are stored locally using SQLite, AsyncStorage, and Expo SecureStore.
- **Firebase Authentication.** Your Google account identity is handled by Google's Firebase service.
- **Google Drive (optional).** If you choose to export or back up your data to Google Drive, the resulting files are stored in your own Google Drive account under your control. We do not retain a copy of those exports.
- **Sentry (Elyscom organization, project "taskmanager").** Crash and error reports are stored by Sentry on our behalf.

We rely on the security measures of these providers (encryption in transit and at rest) and on the device's own protections for locally stored data.

---

## 5. Third-Party Services

The App integrates with the following third-party services. Each service has its own privacy policy that governs its handling of your data.

| Service | Purpose | Privacy Policy |
|---|---|---|
| Google Sign-In / Firebase Authentication | Authentication | https://policies.google.com/privacy |
| Google Drive | Optional user-initiated export/backup | https://policies.google.com/privacy |
| Sentry | Crash and error reporting | https://sentry.io/privacy/ |
| Google Play Billing | In-app purchases on Android | https://policies.google.com/privacy |
| Apple App Store (StoreKit) | In-app purchases on iOS | https://www.apple.com/legal/privacy/ |
| Expo / Expo Application Services | Build, update, and notification infrastructure | https://expo.dev/privacy |

We do not control these services and are not responsible for their practices. We encourage you to read their policies.

---

## 6. Sharing and Disclosure

We do not sell or rent your personal information. We may share information only:

- **With service providers** listed in Section 5, strictly to provide the App.
- **For legal reasons** when required by law, court order, or government request, or to protect rights, property, or safety.
- **In a business transfer** such as a merger, acquisition, or sale of assets, in which case you will be notified before your information becomes subject to a different privacy policy.

---

## 7. Data Retention

- **On-device data** is kept until you delete it from the App or uninstall the App.
- **Authentication data** held by Firebase is retained as long as your account is active.
- **Sentry crash reports** are retained according to Sentry's default retention period (typically 90 days) and then deleted.
- **Purchase records** are retained as long as required by tax and accounting laws.

You can ask us to delete your data at any time (see Section 9).

---

## 8. Children's Privacy

The App is not directed to children under 13 (or under 16 in the EEA/UK). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it.

---

## 9. Your Rights

Depending on where you live (e.g., the EEA, UK, California, Brazil), you may have the right to:

- Access the personal information we hold about you.
- Correct inaccurate information.
- Delete your personal information.
- Object to or restrict certain processing.
- Receive a copy of your data in a portable format.
- Withdraw consent at any time, where processing is based on consent.
- Lodge a complaint with your local data protection authority.

To exercise any of these rights, email us at **support@tanarock.hu**. We will respond within 30 days. We may ask you to verify your identity before fulfilling the request.

You can also delete most of your data directly:

- Delete individual tasks from within the App.
- Sign out and uninstall the App to remove locally stored data.
- Revoke the App's access to your Google account at https://myaccount.google.com/permissions.

---

## 10. International Data Transfers

Our third-party providers (Google, Sentry, Apple, Expo) may process data in countries other than your own, including the United States. Where required, those providers rely on appropriate safeguards such as Standard Contractual Clauses.

---

## 11. Security

We use industry-standard measures to protect your information, including:

- TLS/HTTPS for data in transit.
- Expo SecureStore (Keychain on iOS, EncryptedSharedPreferences on Android) for sensitive tokens.
- Authentication scoped to your own account.

No method of transmission or storage is 100% secure. We cannot guarantee absolute security, but we work to protect your information using reasonable measures.

---

## 12. Changes to This Policy

We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top and, for material changes, notify you in-app or by email. Your continued use of the App after the changes take effect constitutes your acceptance of the revised policy.

---

## 13. Contact Us

If you have questions, concerns, or requests regarding this Privacy Policy or your personal information:

**Elyscom**
Email: **support@tanarock.hu**
