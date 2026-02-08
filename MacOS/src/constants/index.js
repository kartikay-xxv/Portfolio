const navLinks = [
  {
    id: 1,
    name: "Projects",
    type: "finder",
  },
  {
    id: 3,
    name: "Contact",
    type: "contact",
  },
  {
    id: 4,
    name: "Resume",
    type: "resume",
  },
];

const navIcons = [
  {
    id: 1,
    img: "/icons/wifi.svg",
  },
  {
    id: 2,
    img: "/icons/search.svg",
  },
  {
    id: 3,
    img: "/icons/user.svg",
    type: "contact",
  },
  {
    id: 4,
    img: "/icons/mode.svg",
  },
];

const dockApps = [
  {
    id: "finder",
    name: "Portfolio", 
    icon: "finder.png",
    canOpen: true,
  },
  {
    id: "terminal",
    name: "Skills", 
    icon: "terminal.png",
    canOpen: true,
  },
  {
    id: "contact",
    name: "Contact", 
    icon: "contact.png",
    canOpen: true,
  },
  {
    id: "safari",
    name: "Experience", 
    icon: "safari.png",
    canOpen: true,
  },
  {
    id: "photos",
    name: "Gallery", 
    icon: "photos.png",
    canOpen: true,
  },
  {
    id: "trash",
    name: "Trash", 
    icon: "trash.png",
    canOpen: true,
  },
];

const experiences = [
  // Uncomment and duplicate this object whenever you add an experience:
  // {
  //   id: 1,
  //   type: "Open Source", // "Internship" | "Full-Time" | "Open Source" | "Freelance" | "Startup / SaaS" | "Bug Fix"
  //   role: "Open Source Contributor",
  //   organization: "Project / Company Name",
  //   logo: "/images/company-logo.png", // optional — shows a fallback icon if omitted
  //   from: "Jan 2026",
  //   to: "Present", // or "Mar 2026"
  //   location: "Remote", // optional (e.g., "Bengaluru, India" or "GitHub")
  //   summary:
  //     "Short 1–2 line overview of what you built, fixed, or shipped.",
  //   highlights: [
  //     "Resolved a critical race condition reducing API latency by 40%.",
  //     "Merged PR #142 with full unit test coverage.",
  //   ],
  //   tech: ["React", "TypeScript", "Node.js"], // optional
  //   link: "https://github.com/...", // optional (PR, live app, company site, or certificate)
  //   linkLabel: "View Pull Request", // optional (defaults to "View Details")
  // },
  // {
  //   id: 1,
  //   type: "Full-Time",
  //   role: "Software Development Engineer",
  //   organization: "Acme Cloud Systems",
  //   logo: "/icons/github.svg", // sample icon to test logo rendering
  //   from: "Aug 2026",
  //   to: "Present",
  //   location: "Bengaluru, India • Hybrid",
  //   summary:
  //     "Building scalable full-stack web services and automated cloud infrastructure for high-throughput customer dashboards.",
  //   highlights: [
  //     "Architected a Next.js and TypeScript dashboard reducing initial page load times by 35%.",
  //     "Containerized backend microservices with Docker and automated zero-downtime deployments via GitHub Actions.",
  //   ],
  //   tech: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS"],
  //   link: "https://github.com/kartikay-xxv",
  //   linkLabel: "View Company",
  // },
  // {
  //   id: 2,
  //   type: "Internship",
  //   role: "Full-Stack Developer Intern",
  //   organization: "NovaTech Labs",
  //   // logo omitted to test the automatic fallback Briefcase icon
  //   from: "Jan 2026",
  //   to: "Jun 2026",
  //   location: "Remote",
  //   summary:
  //     "Developed internal developer tools and REST/WebSocket APIs for real-time telemetry monitoring.",
  //   highlights: [
  //     "Implemented JWT authentication and rate-limiting middleware across 15+ Express.js endpoints.",
  //     "Collaborated with senior engineers to optimize MongoDB aggregation queries by 50%.",
  //   ],
  //   tech: ["React", "Express.js", "MongoDB", "Tailwind CSS", "Redis"],
  //   link: "https://www.linkedin.com/in/kartikay-xxv",
  //   linkLabel: "View Certificate",
  // },
];

const techStack = [
  {
    category: "Languages",
    items: ["Java", "C++", "SQL", "HTML", "CSS", "JavaScript", "TypeScript", "Bash"],
  },
  {
    category: "Frameworks & Libraries",
    items: ["C++ STL", "Tailwind CSS", "Express.js", "EJS", "Mongoose", "React.js", "Vite", "Redux Toolkit", "Next.js", "GSAP", "Zustand"],
  },
  {
    category: "Databases, Authentication & Security",
    items: ["MySQL", "PostgreSQL", "MongoDB", "NextAuth.js", "JWT"],
  },
  {
    category: "DevOps, Cloud & CI/CD",
    items: ["AWS", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "Docker", "Kubernetes"],
  },
  // {
  //   category: "AI",
  //   items: [],
  // },
  {
    category: "Platforms, Monitoring & Tools",
    items: ["Figma", "Git", "GitHub", "Postman", "Hostinger", "Apache", "Nginx", "PM2", "Vercel", "Render", "CodeRabbit", "Cloudflare", "n8n", "Linux System Administration"],
  },
];

const profile = {
    name: "Kartikay Singh",
    email: "kartikay.workspace@gmail.com",
    workMode: "Remote / Hybrid / On-site • Relocation Ready",
    availability: "Available Immediately", // or "3 Months Notice • Service Bond"
    company: "No Company",
    location: "India • IST (UTC+5:30)",
};

const socials = [
  {
  id: 1,
  text: "Gmail",
  icon: "/icons/gmail.svg",
  bg: "#EA4335",
  link: "https://mail.google.com/mail/?view=cm&to=kartikay.workspace@gmail.com",
  },
  {
    id: 2,
    text: "Github",
    icon: "/icons/github.svg",
    bg: "#24292F",
    link: "https://github.com/kartikay-xxv",
  },
  {
    id: 3,
    text: "LinkedIn",
    icon: "/icons/linkedin.svg",
    bg: "#0A66C2",
    link: "https://www.linkedin.com/in/kartikay-xxv",
  },
  {
    id: 4,
    text: "Portfolio",
    icon: "/icons/macos.svg",
    bg: "#007AFF",
    link: "https://kartikay.dev",
  },
  {
    id: 5,
    text: "Instagram",
    icon: "/icons/instagram.svg",
    bg: "#D300C5",
    link: "https://www.instagram.com/kartikay_xxv",
  },
  {
    id: 6,
    text: "Twitter/X",
    icon: "/icons/twitter.svg",
    bg: "#000000",
    link: "https://x.com/kartikay_xxv",
  },
];

const photosLinks = [
  {
    id: 1,
    icon: "/icons/library.svg",
    title: "Library",
  },
  {
    id: 2,
    icon: "/icons/memories.svg",
    title: "Memories",
  },
  {
    id: 3,
    icon: "/icons/places.svg",
    title: "Places",
  },
  {
    id: 4,
    icon: "/icons/people.svg",
    title: "People",
  },
  {
    id: 5,
    icon: "/icons/favorites.svg",
    title: "Favorites",
  },
];

const galleryFolders = {
  Library: [
    "College",
    "Home",
  ],
  Places: [
    "Hyderabad",
    "Gurugram",
    "Mysuru",
    "Bengaluru",
    "Udaipur",
    "Jaipur",
    "Delhi",
    "Pondicherry",
    "Tirupati",
    "Mumbai",
  ],
};

const gallery = {
  Memories: [
    "Gurugram/4) Yum Yum Cha (Aburi Salmon Nigiri).jpeg",
    "Home/Gifted sister camera.jpeg",

    "Mysuru/1) Airbnb.jpeg",
    "Bengaluru/Cafe.jpeg",

    "Udaipur/Udaipur view.jpg",
    "Udaipur/Bahubali lake.jpg",
    "Jaipur/Fort.jpeg",
    "Delhi/Qutub Minar.jpeg",

    "College/7) Bowling (Siuuu !).jpeg",
    "College/8) Trekking.jpeg",
    
    "Pondicherry/7) Leave.jpeg",
    "Pondicherry/5) Restaurant.jpeg",
    "Pondicherry/4) Beach.jpeg",
    "Pondicherry/1) Airbnb.jpeg",
    "Tirupati/1) Hostel stay.jpeg",
    "Tirupati/2) Tirumala Hills.jpeg",

    "College/4) Go-Karting.jpeg",
    "College/5) Go-Karting.jpeg",
    "College/1) Desk setup.jpeg",

    "Mumbai/Beach.jpeg",
  ],
  People: [
    "Home/Gifted sister camera.jpeg",
  ],
  Favorites: [
    "Gurugram/4) Yum Yum Cha (Aburi Salmon Nigiri).jpeg",
    "Home/Gifted sister camera.jpeg",

    "Udaipur/Udaipur view.jpg",
    "Udaipur/Bahubali lake.jpg",

    "College/7) Bowling (Siuuu !).jpeg",
    "College/8) Trekking.jpeg",
    
    "Pondicherry/5) Restaurant.jpeg",
    "Pondicherry/1) Airbnb.jpeg",

    "College/4) Go-Karting.jpeg",
    "College/5) Go-Karting.jpeg",
    "College/1) Desk setup.jpeg",


  ],
};

export {
  navLinks,
  navIcons,
  dockApps,
  experiences,
  techStack,
  profile,
  socials,
  photosLinks,
  galleryFolders,
  gallery,
};

const WORK_LOCATION = {
  id: 1,
  type: "work",
  name: "Work",
  icon: "/icons/work.svg",
  kind: "folder",
  children: [
    // ▶ Project 1
    {
      id: 5,
      name: "Nike Ecommerce Website Application",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        {
          id: 1,
          name: "Nike Project.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          description: [
            "The Nike eCommerce website is a sleek and modern platform designed for shopping the latest Nike collections.",
            "Instead of a simple online store, it delivers an immersive experience with bold visuals, interactive product displays, and smooth navigation.",
            "Think of it like walking into a flagship Nike store—but right from your phone or laptop.",
            "It's built with Next.js and Tailwind, ensuring fast performance, responsive design, and a clean, premium look.",
          ],
        },
        {
          id: 2,
          name: "nike.com",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://youtu.be/fZdTYswuZjU?si=Awjl-pIst9e09_UU",
        },
        {
          id: 4,
          name: "nike.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          imageUrl: "/images/project-1.png",
        },
        {
          id: 5,
          name: "Design.fig",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "fig",
          href: "https://google.com",
        },
      ],
    },

    // ▶ Project 2
    {
      id: 6,
      name: "AI Resume Analyzer",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        {
          id: 1,
          name: "AI Resume Analyzer Project.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          description: [
            "AI Resume Analyzer is a smart tool that helps you perfect your resume with instant feedback.",
            "Instead of guessing what recruiters want, you get AI-powered insights on keywords, formatting, and overall impact.",
            "Think of it like having a career coach—pointing out strengths, fixing weaknesses, and boosting your chances of landing interviews.",
            "It's built with Next.js and Tailwind, so it runs fast, looks professional, and works seamlessly on any device.",
          ],
        },
        {
          id: 2,
          name: "ai-resume-analyzer.com",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://youtu.be/iYOz165wGkQ?si=R1hs8Legl200m0Cl",
        },
        {
          id: 4,
          name: "ai-resume-analyzer.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          imageUrl: "/images/project-2.png",
        },
        {
          id: 5,
          name: "Design.fig",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "fig",
          href: "https://google.com",
        },
      ],
    },

    // ▶ Project 3
    {
      id: 7,
      name: "Food Delivery App",
      icon: "/images/folder.png",
      kind: "folder",
      children: [
        {
          id: 1,
          name: "Food Delivery App Project.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          description: [
            "Our Food Delivery App is a fast and convenient way to order meals from your favorite restaurants.",
            "Instead of making calls or waiting in line, you can browse menus, customize orders, and track deliveries in real time.",
            "Think of it like having your favorite restaurants in your pocket—ready to deliver anytime, anywhere.",
            "It’s built with React Native, so it works smoothly on both iOS and Android with a clean, modern design.",
          ],
        },
        {
          id: 2,
          name: "food-delivery-app.com",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://youtu.be/LKrX390fJMw?si=cExkuVhf2DTV9G2-",
        },
        {
          id: 4,
          name: "food-delivery-app.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          imageUrl: "/images/project-3.png",
        },
        {
          id: 5,
          name: "Design.fig",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "fig",
          href: "https://google.com",
        },
      ],
    },
  ],
};

const ABOUT_LOCATION = {
  id: 2,
  type: "about",
  name: "About me",
  icon: "/icons/info.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      imageUrl: "/images/kartikay.jpg",
    },
    {
      id: 2,
      name: "casual_me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      imageUrl: "/images/kartikay_2.jpeg",
    },
    {
      id: 3,
      name: "conference_me.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      imageUrl: "/images/kartikay_3.jpg",
    },
    {
      id: 4,
      name: "about_me.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      subtitle: "Meet the Developer Behind the Code",
      image: "/images/kartikay.jpg",
      description: [
        "Hey! I’m Kartikay 👋, a full-stack developer and CSE grad who enjoys building scalable web apps, cloud-native systems, and practical AI tools that actually hold up in production.",
        "I specialize in TypeScript, React, Next.js, and Node.js—backed by AWS, Docker, Kubernetes, and applied GenAI pipelines.",
        "I’m big on clean architecture, low-latency performance, and writing reliable code—from ACID-compliant ledgers to real-time WebSocket engines—that doesn’t need a search party to debug.",
        "Outside of shipping code, you’ll find me tweaking layouts at 2AM, automating workflows I could’ve done manually in five minutes, or exploring new tech stacks just to see how they tick 😅",
      ],
    },
  ],
};

const RESUME_LOCATION = {
  id: 3,
  type: "resume",
  name: "Resume",
  icon: "/icons/file.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "Resume.pdf",
      icon: "/images/pdf.png",
      kind: "file",
      fileType: "pdf",
      // you can add `href` if you want to open a hosted resume
      // href: "/your/resume/path.pdf",
    },
  ],
};

const TRASH_LOCATION = {
  id: 4,
  type: "trash",
  name: "Trash",
  icon: "/icons/trash.svg",
  kind: "folder",
  children: [
    {
      id: 1,
      name: "trash_portfolio_1.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      imageUrl: "/images/trash-1.png",
    },
    {
      id: 2,
      name: "generic_portfolio_1.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      imageUrl: "/images/trash-2.png",
    },
    {
      id: 3,
      name: "generic_portfolio_2.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      imageUrl: "/images/trash-3.png",
    },
  ],
};

export const locations = {
  work: WORK_LOCATION,
  about: ABOUT_LOCATION,
  resume: RESUME_LOCATION,
  trash: TRASH_LOCATION,
};

const INITIAL_Z_INDEX = 1000;

const WINDOW_CONFIG = {
  finder: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  contact: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  resume: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  safari: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  photos: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  terminal: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  txtfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  imgfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG };