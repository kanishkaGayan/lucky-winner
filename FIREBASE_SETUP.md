# Firebase Setup

This project uses Firebase Firestore for participant storage and the live winner announcement.

## 1. Create the Firebase Project

1. Open the Firebase Console.
2. Create or select the project `lucky-winner-pm`.
3. Enable Firestore Database.
4. If Firebase asks for the Cloud Firestore API, enable `firestore.googleapis.com` in Google Cloud for the same project.

## 2. Add the Web App Config to `.env`

Create or update the project root `.env` file with these values:

```bash
VITE_FIREBASE_API_KEY=AIzaSyDXxNv7ZWTPo0l653ecy6qr41sW3-ijhPE
VITE_FIREBASE_AUTH_DOMAIN=lucky-winner-pm.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lucky-winner-pm
VITE_FIREBASE_STORAGE_BUCKET=lucky-winner-pm.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=473473504283
VITE_FIREBASE_APP_ID=1:473473504283:web:07ff4beb171e4dd925d4be
```

The app reads these values from `import.meta.env` in `src/firebase/config.js`.

## 3. Firestore Collections and Documents

### `participants` collection

Each registered student is stored as a document using their 4-digit UID as the document ID.

```json
{
  "uid": "4827",
  "name": "string",
  "telephone": "string",
  "department": "string",
  "registeredAt": "Timestamp"
}
```

### `config/announcement` document

Create this document manually before the jackpot draw.

Fields:

- `announcementDate`: Firestore Timestamp for the draw date and time
- `winnerId`: empty string initially, filled automatically when the draw starts

## 4. Set the Announcement Time

1. Open Firestore in the Firebase Console.
2. Create the `config` collection if it does not exist.
3. Create a document with ID `announcement`.
4. Set `announcementDate` to the exact date and time for the draw.
5. Leave `winnerId` as an empty string.

When the current time reaches `announcementDate`, the winner page will automatically start the countdown/reveal flow and save the selected winner UID back to Firestore.

## 5. Admin Login Values

The registration portal is protected with a session-based admin login.

Add these values to `.env`:

```bash
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=luckywinner2025
```

When the credentials match, the app stores `lw_admin_authenticated=true` in `sessionStorage` for the current browser session.

## 6. Local Development

```bash
npm install
npm run dev
```

## 7. Notes

- Keep `.env` out of Git.
- Do not change the Firestore collection names unless you also update `src/firebase/config.js`.
- The `/register` route is admin-only, while `/winner` stays public.
