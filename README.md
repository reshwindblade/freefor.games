# freefor.games
– Game Scheduling Made Easy**

## 💻 **Tech Stack**
* **Frontend**: React.js
* **Backend**: Node.js + Express
* **Database**: MongoDB
* **Authentication**: JWT or OAuth
* **Hosting**: (Optional suggestion: Vercel for frontend, Render/Heroku for backend)

---

## 📘 **Project Description**
**freefor.games** is a social availability-sharing platform designed for gamers to easily showcase when they’re free to play. Each user has a shareable profile displaying their availability without revealing sensitive details.

---

## 📌 **Core Features**
### 🔐 **User Authentication**

* Sign up and login using email/password or third-party providers (e.g., Google).
* Upon signup, each user is given a unique profile URL:
  `freefor.games/username`

---

### 👤 **User Profile Page**
* Publicly viewable by anyone.
* Displays a clear weekly calendar or timetable showing when the user is **available for games**.
* Option to include a short bio, avatar, preferred games, and platforms (PC, Switch, etc).

---

### 📅 **Availability Calendar**
* Users can **sync their external calendars** (e.g., Google Calendar, Outlook).
* Only **non-available** (busy) times are imported to **automatically mark them as unavailable**—preserving privacy.
* User can manually override or add recurring availability slots (e.g., "Every Friday 8–10 PM").

---

### 🏠 **Homepage**
* Landing page that explains:
  * The purpose of the app.
  * How to use it in 3 simple steps.
  * A few example profiles or screenshots.
  * Call-to-action to sign up or explore.

---

### 🔎 **Explore Page**
* Public directory listing all users (with filters by:
  * Game preference,
  * Platform,
  * Region/time zone,
  * Availability overlaps).
* Useful for discovering others with matching free time.

---

## 🚧 **Optional Stretch Features**
* Friend requests / messaging
* Group scheduling (team coordination)
* Calendar widget embed code for Discord servers or stream overlays
* Mobile responsiveness
