# Lucky Winner

Lucky Winner is a university fundraising competition web app with two portals:

- Registration Portal at `/register`
- Winner Announcement Portal at `/winner`

Built with React, Vite, Tailwind CSS, React Router v6, and Firebase Firestore.

## 1. Firebase Setup

1. Create a Firebase project in the Firebase Console.
2. Enable Firestore Database.
3. Copy your web app config values into a local `.env` file in the project root.

Example variables:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

The app reads these values from `import.meta.env` in `src/firebase/config.js`.

### Admin Session Login

The registration portal is protected with a simple session-based admin login.

Add these values to `.env`:

```bash
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=luckywinner2025
```

When the credentials match, the app stores `lw_admin_authenticated=true` in `sessionStorage`. The flag lasts for the current browser session only and is cleared when the tab or browser closes.

## 2. Firestore Structure

### `participants` collection

Each document is stored using the 4-digit UID as the Firestore document ID.

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

Create this document manually in Firestore before the draw.

Fields:

- `announcementDate`: Firestore Timestamp for the draw date and time
- `winnerId`: empty string initially, filled automatically when the draw starts

## 3. How to Set the Announcement Time

1. Open Firestore in the Firebase Console.
2. Create the `config` collection if it does not exist.
3. Create a document with ID `announcement`.
4. Set `announcementDate` to the exact date and time for the draw.
5. Leave `winnerId` as an empty string.

When the current time reaches `announcementDate`, the winner page will automatically select a random participant and write that UID to `config/announcement.winnerId`.

## 4. Automatic Winner Selection

- Registration generates a random unique 4-digit UID.
- The winner page loads participant UIDs from Firestore.
- If there are 20 or more participants, the live display cycles through real participant UIDs.
- If there are fewer than 20 participants, it cycles through random 4-digit numbers.
- At the scheduled announcement time, the system chooses one registered participant at random and stores the winning UID in Firestore.
- If `winnerId` already exists, the page skips the spinning phase and shows the winner card immediately.

## 5. Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

## 6. Build and Deploy

### Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the `VITE_FIREBASE_*` environment variables in the Vercel project settings.
4. Deploy the app.

### Firebase Hosting

1. Install Firebase CLI.
2. Run `firebase login` and `firebase init hosting`.
3. Set the build output directory to `dist`.
4. Add the same `VITE_FIREBASE_*` variables to your deployment environment.
5. Run `npm run build`, then deploy with `firebase deploy`.

## 7. Notes

- The app uses a dark gold/neon visual style for both portals.
- The draw notice is shown on both pages.
- Tailwind CSS and Google Fonts are configured for the intended look and feel.
- The `/register` route is admin-only and shows a login modal when the session flag is missing.
