<div align="center">

<h1 align="center">
  <img src="./public/macbook.png" alt="MacFolio" width="36" align="center" />
  MacFolio — Interactive macOS Developer Portfolio
</h1>

An interactive, macOS-inspired desktop portfolio built with **React**, **GSAP**, **Tailwind CSS**, **Zustand**, **Cloudflare Pages Functions**, and **Cloudflare D1**.  
Explore projects, skills, contact, experience, gallery, trash and a downloadable resume inside draggable, resizable OS windows — backed by real-time edge analytics, a Google OAuth Trash window trap, and a live Discord webhook & slash-command bot.

[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/d1/)
[![Discord Bot](https://img.shields.io/badge/Discord_Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/developers/docs/intro)

[Live Demo](https://kartikay.dev) · [Report Bug](https://github.com/kartikay-xxv/Portfolio/issues)

</div>

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Tailwind CSS (`@tailwindcss/vite`), `clsx` |
| **Animations & Dragging** | GSAP, `@gsap/react`, GSAP `Draggable` |
| **State Management** | Zustand, Immer |
| **UI & Utilities** | `lucide-react`, `react-tooltip`, `react-pdf`, `dayjs` |
| **Backend & Database** | Cloudflare Pages Functions, Cloudflare D1 (SQLite) |
| **Auth & Notifications** | Google OAuth (Identity Services), Discord Webhooks & Interactions API |
| **Hosting & Domain** | Cloudflare Pages (Free Tier) + Custom Domain (`kartikay.dev`) |

---

## 📁 Project Structure

```text
MacFolio/
├── functions/
│   ├── _lib/
│   │   └── analytics.js    # Bot detection, UA/geo parsing, Discord webhook & Ed25519 verification
│   └── api/
│       ├── log.js          # Visitor/visit logging (POST), live unique count (GET) & Discord alerts
│       ├── gmail-login.js  # Google OAuth token verification, D1 logging & Discord alert
│       └── discord.js      # Ed25519-verified Discord slash-command handler (D1 queries)
├── public/
│   ├── files/              # resume.pdf
│   ├── icons/              # macOS & UI icons
│   └── images/             # Light/dark wallpapers, dock icons, project previews, gallery
├── src/
│   ├── components/         # Navbar, Welcome, Dock, Home, WindowControls
│   ├── constants/          # Portfolio data, projects, socials, nav/dock/window configs
│   ├── hoc/                # WindowWrapper HOC (GSAP Draggable, focus & window controls)
│   ├── store/              # Zustand stores (window.js, location.js, theme.js)
│   ├── windows/            # Finder, Resume, Text, Image, Terminal, Contact, Safari, Photos, Trash
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── register-discord.mjs    # One-time script to register Discord guild slash commands
└── vite.config.js
```

---

## ✨ Features

### Desktop, Menu Bar & Theme
- **Fully Functional Menu Bar** — Every navbar item is wired to an action:
  - **`whoami`** brand button resets/reloads the desktop.
  - **Navigation Links** act as interactive window-toggle buttons.
  - **Wi-Fi Icon** opens a live **Unique Visitors** popover powered by `/api/log` and Cloudflare D1.
  - **Search Icon** launches Finder directly.
  - **Contact Icon** toggles the Contact window.
  - **Appearance Icon** switches between **Light**, **Dark**, and **System** themes (`useThemeStore`) with smooth wallpaper and UI transitions.
  - **Live System Clock** powered by Day.js.
- **Mobile Responsive** — Adapts seamlessly to mobile and tablet viewports with accessible navbar icons, inward-aligned popovers, responsive dock sizing, and touch-friendly window layouts.
- **Kinetic Typography Welcome Screen** — Variable font-weight hover animation where each character responds to cursor proximity via a Gaussian intensity curve in GSAP.
- **Magnifying Dock** — Physics-based icon scaling, vertical lift, and tooltips (`react-tooltip`) mirroring the native macOS Dock.

### Window Management & Built-in Apps
- **Working Traffic-Light Window Controls** — All three macOS controls (**Close**, **Minimize**, and **Maximize**) work across every window with dynamic `z-index` focusing and GSAP transitions.
- **Improved Dock & Desktop Applications:**
  - **Finder** — Multi-folder file explorer (`Work`, `About Me`, `Resume`, `Trash`) with clickable project directories, external links, and file previews.
  - **Resume, Text & Image Viewers** — In-window PDF preview (`react-pdf`) with one-click download, plus dedicated `.txt` and `.png` preview windows.
  - **Terminal** — CLI-styled tech stack showcase categorized by domain.
  - **Contact** — Quick-access social cards and email details.
  - **Safari** — Browser-styled developer's experience related information.
  - **Photos** — Interactive image gallery window with responsive sidebar navigation.
- **Interactive Trash Window (Google OAuth Trap)** — Styled as a retro hacker/terminal prank window integrated with **Google Sign-In (OAuth)**. Signing in unlocks the prank screen, persists the session across refreshes, logs the Google profile to Cloudflare D1, and triggers a real-time Discord embed in `#gmail-captures` with the user's Google profile thumbnail (tracking both first-time captures and returning logins).

### Edge Analytics (Cloudflare D1) & Discord Bot
- **Cloudflare D1 Database (`portfolio-logs`)** — Serverless SQLite logging via Cloudflare Pages Functions across three indexed tables:
  - `visits` — Raw visit logs with referral/UTM tags (`?ref=...`), duration, bot filtering, geo/ISP metadata, and device/screen info.
  - `visitors` — Deduplicated unique visitor profiles (`visitor_id`), visit counts, first/last seen timestamps, and linked Gmail accounts.
  - `gmail_users` — Captured Google OAuth profiles (`google_sub`, email, name, login count, and visitor context).
- **Smart Deduplication** — Delayed visitor upsertion and refresh deduplication prevent duplicate alerts on page reloads.
- **Live Discord Webhooks & Slash Commands** — Organized into dedicated private channels with Ed25519 signature verification (`/api/discord`) and User ID + channel access locks:
  - Dedicated real-time embed feeds in **`#visits`** (raw hits), **`#visitors`** (new & returning human visitors), and **`#gmail-captures`** (new & returning Google OAuth logins).
  - On-demand database queries inside **`#commands`**: `/commands`, `/stats`, `/visitors [count]`, `/visits [count]`, `/gmails [count]`, `/bots [count]`, and `/search <query>`.

---

## 🏗️ Architecture Highlights

- **Window Management HOC (`WindowWrapper`)** — Encapsulates GSAP `Draggable`, open/close/minimize/maximize behavior, and `z-index` focus in a single Higher-Order Component.
- **Decoupled State (`Zustand` + `Immer`)** — Modular stores for window lifecycle (`window.js`), Finder directory state (`location.js`), and Light/Dark/System theme persistence (`theme.js`).
- **Edge Full-Stack on Cloudflare Pages** — Zero-cost deployment & hosting both the Vite React frontend and `/api/*` Cloudflare Pages Functions, bound directly to Cloudflare D1 and linked to a custom domain (`kartikay.dev`).
- **Path Aliases** — Configured in `vite.config.js` and `jsconfig.json` (`#components`, `#constants`, `#store`, `#hoc`, `#windows`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20.6+ recommended for native `--env-file` support)
- **npm**
- A **Cloudflare** account (for Pages + D1) and a **Discord** server/bot application (optional for local UI-only development)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/kartikay-xxv/Portfolio.git
   cd Portfolio/MacFolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in `MacFolio/` for frontend variables (and local Discord command registration):
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   DISCORD_APPLICATION_ID=your_discord_application_id
   DISCORD_MACFOLIO_SERVER_ID=your_discord_server_id
   DISCORD_BOT_TOKEN=your_discord_bot_token
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for production**
   ```bash
   npm run build
   ```

---

## ☁️ Deployment (Cloudflare Pages + D1 + Discord)

1. **Cloudflare Pages Build Settings**
   - **Root directory:** `MacFolio`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`

2. **D1 Database & Binding**
   - Create a D1 database (`portfolio-logs`) and initialize the `visits`, `visitors`, and `gmail_users` tables.
   - Bind the database to your Pages project under **Settings → Bindings** with variable name **`DB`**.

3. **Environment Variables & Secrets (Production)**
   - `VITE_GOOGLE_CLIENT_ID` — Google OAuth Client ID (Text)
   - `DISCORD_WEBHOOK_VISITS` — Incoming Webhook URL for `#visits` (Secret)
   - `DISCORD_WEBHOOK_VISITORS` — Incoming Webhook URL for `#visitors` (Secret)
   - `DISCORD_WEBHOOK_GMAIL` — Incoming Webhook URL for `#gmail-captures` (Secret)
   - `DISCORD_PUBLIC_KEY` — Public Key from Discord Developer Portal → General Information (Secret)
   - `DISCORD_USER_ID` — Your personal numeric Discord User ID (Text)
   - `DISCORD_COMMANDS_CHANNEL_ID` — Your `#commands` Channel ID (Text)

4. **Register Discord Slash Commands & Interactions Endpoint**
   - Run the guild command registration script once from `MacFolio/`:
     ```bash
     node --env-file=.env register-discord.mjs
     ```
   - In **Discord Developer Portal → General Information**, set **Interactions Endpoint URL** to:
     ```text
     https://kartikay.dev/api/discord
     ```

5. **Custom Domain**
   - Connect your custom domain under **Cloudflare Pages → Custom domains** for automatic SSL and global edge delivery.

---

## 🎨 Customization

- **Projects, Skills, Blogs & Socials:** Edit `src/constants/index.js`.
- **Wallpapers & Icons:** Replace assets inside `public/images/` (`wallpaper-light.jpg`, `wallpaper-dark.jpg`, etc.).
- **Resume:** Replace `public/files/resume.pdf` with your own PDF.
- **Branding & Metadata:** Update the page title and favicon in `index.html`.