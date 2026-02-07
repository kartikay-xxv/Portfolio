<div align="center">

#  macOS Developer Portfolio

An interactive, macOS-inspired desktop portfolio built with **React**, **GSAP**, **Tailwind CSS**, and **Zustand**.  
Explore projects, skills, articles, and a downloadable resume inside draggable, stackable OS windows.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

[Live Demo](https://kartikay.dev) · [Report Bug](https://github.com/kartikay-xxv/Portfolio/issues)

</div>

---

## ✨ Features

- **macOS Desktop & Menu Bar** — Glassmorphic top navigation bar with quick-launch links and a live system clock powered by Day.js.
- **Kinetic Typography Welcome Screen** — Variable font-weight hover animation where each character responds to cursor proximity via a Gaussian intensity curve in GSAP.
- **Magnifying Dock** — Physics-based icon scaling, vertical lift, and tooltips (`react-tooltip`) mirroring the native macOS Dock.
- **Draggable & Stackable Windows** — Every application opens inside a draggable window with dynamic `z-index` focusing and smooth GSAP transitions.
- **Built-in Desktop Applications:**
  - **Finder** — Multi-folder file explorer (`Work`, `About Me`, `Resume`, `Trash`) with clickable project directories, external links, and file previews.
  - **Terminal** — CLI-styled tech stack showcase categorized by domain.
  - **Safari** — Browser-styled developer blog and articles reader.
  - **Resume Viewer** — In-window PDF preview and one-click download powered by `react-pdf`.
  - **Text & Image Viewers** — Dedicated preview windows for `.txt` project briefs and `.png` screenshots.
  - **Contact** — Quick-access social cards and email details.
  - **Photos** — Interactive image gallery window.
- **Draggable Desktop Shortcuts** — Project folders positioned directly on the desktop that open straight into their corresponding Finder directory.

---

## 🏗️ Architecture Highlights

- **Window Management HOC (`WindowWrapper`)** — Encapsulates GSAP `Draggable`, open/close animations, visibility toggling, and `z-index` focus in a single Higher-Order Component so individual windows stay focused on UI.
- **Decoupled State (`Zustand` + `Immer`)** — Split into `useWindowStore` (window lifecycle, stacking order, payloads) and `useLocationStore` (Finder directory navigation that persists across window closes).
- **Path Aliases** — Configured in `vite.config.js` and `jsconfig.json` (`#components`, `#constants`, `#store`, `#hoc`, `#windows`).

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Core** | React, Vite |
| **Styling** | Tailwind CSS (`@tailwindcss/vite`), `clsx` |
| **Animations & Dragging** | GSAP, `@gsap/react`, GSAP `Draggable` |
| **State Management** | Zustand, Immer |
| **UI & Utilities** | `lucide-react`, `react-tooltip`, `react-pdf`, `dayjs` |

---

## 📁 Project Structure

```text
MacOS/
├── public/
│   ├── files/          # resume.pdf
│   ├── icons/          # macOS & UI icons
│   └── images/         # Wallpaper, dock icons, project previews
└── src/
    ├── components/     # Navbar, Welcome, Dock, Home, WindowControls
    ├── constants/      # Portfolio data, projects, socials, window configs
    ├── hoc/            # WindowWrapper HOC (GSAP Draggable + focus logic)
    ├── store/          # Zustand stores (window.js, location.js)
    ├── windows/        # Resume, Finder, Text, Image, Terminal, Contact, Safari, Photos
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm**

### Local Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/kartikay-xxv/Portfolio.git](https://github.com/kartikay-xxv/Portfolio.git)
   cd Portfolio/MacOS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 🎨 Customization

- **Projects, Skills, Blogs & Socials:** Edit `src/constants/index.js`.
- **Resume:** Replace `public/files/resume.pdf` with your own PDF.
- **Branding & Metadata:** Update the page title and favicon in `index.html`.

> **Note:** Designed for desktop and tablet viewports to preserve the windowed OS experience.