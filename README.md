# Lost & Found

A location-based community platform that helps people actually get their lost stuff back. Built this because losing things sucks and there wasn't a good way to match lost items with found ones in real-time.

The core idea: when someone reports a lost item, the system automatically scans existing "found" reports (and vice versa) using a matching engine that looks at titles, descriptions, location, and timing. If confidence is high enough, both parties get notified.

---

## What it does

- **Smart matching** — Not just keyword search. Uses Jaccard + Containment similarity on tokenized text, plus location proximity and timeline validation. Scores ≥30% trigger notifications.
- **Two flows** — Report lost items OR report found items. Both support photos, categories, location, dates.
- **Recovery claims** — Found something? Someone claims it? Built-in messaging and status tracking (Pending → Accepted/Rejected).
- **Real-time alerts** — WebSocket notifications the moment a potential match lands.
- **Feed with actual filters** — Search + multi-select dropdowns for category, status, location, sort. Not a fake filter UI.
- **Admin dashboard** — Metrics, recovery rates, category breakdowns. Mostly for debugging but kept it.
- **Light/dark mode** — CSS variables, respects system preference, persists choice.

---

## Stack

| Layer | What's running |
|-------|----------------|
| Frontend | React 19, Vite, React Router 7, Lucide Icons, vanilla CSS (no framework) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

## Project structure

```
The_Bug/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Navbar, CustomSelect, Toast, etc.
│   │   ├── context/            # Auth, Theme, Notifications, Toast
│   │   ├── pages/              # Feed, AdminDashboard, Auth, RecoveryRequests
│   │   ├── styles/             # Modular CSS files
│   │   └── App.jsx             # Routes
│   └── package.json
└── server/                     # Express API
    ├── config/                 # DB config
    ├── controllers/            # Route handlers
    ├── models/                 # User, Item, Notification, RecoveryRequest
    ├── routes/                 # Express routes
    ├── services/               # Matching algorithm lives here
    ├── scripts/                # DB reset, seed scripts
    └── server.js               # Entry point
```

---

## How the matching actually works

This is the part I spent way too long on. When a new item comes in (say, "lost: black backpack"), it gets scored against every opposite-type item in the same category:

1. **Date check** — Hard fail if `dateFound` < `dateLost`. No point continuing.
2. **Category** — Must match exactly. No cross-category matches.
3. **Title similarity (40 pts)** — Tokenize, strip punctuation, drop stop words, then hybrid Jaccard/Containment with substring support. Catches "backpack" vs "black backpack" etc.
4. **Description similarity (35 pts)** — Overlapping attribute keywords: colors, brands, unique identifiers (serial numbers, stickers, damage marks).
5. **Location similarity (25 pts)** — Token-based geolocation name matching.
6. **Threshold** — ≥30% total = notification pair created for both users.

The weights came from trial and error. Could probably tune them more but it works well enough.

---

## Data models (TL;DR)

**User** — username, email, hashed password, profile pic, location, role (user/admin), contact method + value

**Item** — userId, type (lost/found), title, description, image (base64), location, dateLost/dateFound, status (active/resolved)

**RecoveryRequest** — item ref, claimant ref, finder ref, status (pending/accepted/rejected), optional message

---

## Getting running

### Need
- Node 18+
- MongoDB (local or Atlas)

### Backend
```bash
cd server
npm install
# create .env in server/
PORT=5001
MONGODB_URI=mongodb://localhost:27017/lost_and_found
JWT_SECRET=something_long_and_random
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
# opens at http://localhost:5173
```

---

## Things I'd improve if I had more time

- Image storage: base64 in Mongo is fine for demo, terrible for production. Would move to S3/Cloudinary.
- Matching could use embeddings for semantic similarity, not just token overlap.
- No email/SMS fallback for notifications yet — only in-app.
- Admin dashboard is pretty bare bones.
- Tests... there are basically none.

---

## License

MIT — do whatever.

---

Built by [Aarjal](https://github.com/Aarjal) — feedback welcome, PRs even more welcome.