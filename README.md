# 🔍 Lost & Found

A location-based community platform designed to help people recover lost belongings efficiently. This application matches lost and found reports in real-time using title/description keyword similarity (Jaccard and Containment algorithms), location proximity, and timeline validation.

---

## 🚀 Key Features

*   **Real-time Intelligent Matching Engine**: Automatically calculates confidence scores between lost and found items.
*   **Dual-role Flow**: Report lost items or report found items with pictures, category, location, and date details.
*   **Interactive Recovery Claims System**: Submit claims, message finders, and track request statuses (Pending, Accepted, Rejected).
*   **Real-time Notifications**: Alert system for item owners when potential matches are identified.
*   **Interactive Feed**: Powerful search and custom select filters (Category, Status, Location, Sort).
*   **Admin Dashboard**: Performance monitoring dashboard showing system metrics, recovery rates, and category statistics.
*   **Dual Theme Support**: Modern, accessible light and dark modes.

---

## 🛠 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (v19), Vite, React Router (v7), Lucide Icons, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |

---

## 📂 Project Architecture

```
The_Bug/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Navbar, CustomSelect, etc.)
│   │   ├── context/            # Auth, Theme, Notification, and Toast Contexts
│   │   ├── pages/              # Feed, AdminDashboard, Auth Pages, RecoveryRequests
│   │   ├── styles/             # Modular CSS stylesheet files
│   │   └── App.jsx             # React Routes config
│   └── package.json
└── server/                     # Backend API (Node + Express)
    ├── config/                 # Database configurations
    ├── controllers/            # Route handler logic
    ├── models/                 # Mongoose schemas (User, Item, Notification, RecoveryRequest)
    ├── routes/                 # Express API routes
    ├── services/               # Core matching algorithm service
    ├── scripts/                # Database reset and mock scripts
    └── server.js               # Entry point
```

---

## 🧠 Matching Engine Logic

The core feature is the **Confidence Matching Engine** which evaluates newly posted items against opposite-type items (e.g., matching a new "lost" item against existing "found" candidates):

1.  **Date Validation**: A match is immediately invalidated if `dateFound` is before `dateLost`.
2.  **Category Filtering**: Items must belong to the exact same category.
3.  **Title Similarity (40 Points)**: Text is tokenized, stripped of punctuation, filtered for stop words, and scored using a hybrid of Jaccard and Containment similarity metrics (supporting substring matching).
4.  **Description Similarity (35 Points)**: Scored dynamically based on overlapping keyword attributes (colors, brand, unique details).
5.  **Location Similarity (25 Points)**: Geolocation name token mapping.
6.  **Confidence Threshold**: Any score $\ge 30\%$ triggers a notification pair for both users.

---

## 📊 Database Models

### User
*   `username` (unique, min 3 chars)
*   `email` (unique, formatted)
*   `password` (securely hashed with bcrypt)
*   `profilePicture` / `location`
*   `role` ("user", "admin")
*   `contactMethod` ("WhatsApp", "Email", etc.) / `contactValue`

### Item
*   `userId` (reference to User)
*   `type` ("lost" or "found")
*   `title` / `description` / `image` (Base64) / `location`
*   `dateLost` / `dateFound`
*   `status` ("active" or "resolved")

### Recovery Request (Claims)
*   `item` (reference to Item)
*   `claimant` (reference to User)
*   `finder` (reference to User)
*   `status` ("pending", "accepted", "rejected")
*   `message` (optional message to finder)

---

## 💻 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or MongoDB Atlas)

### Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/lost-and-found.git
    cd lost-and-found
    ```

2.  **Backend Setup**:
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file inside the `server/` directory:
    ```env
    PORT=5001
    MONGODB_URI=mongodb://localhost:27017/lost_and_found
    JWT_SECRET=your_jwt_secret_key
    ```
    Start the server:
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd ../client
    npm install
    ```
    Start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📄 License

Distributed under the ISC License. See `LICENSE` for details.
