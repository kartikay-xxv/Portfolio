import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

import { Navbar, Welcome, Dock, Home } from "#components/index.js";
import { Resume, Finder, Text, Image, Terminal, Contact, Safari, Photos, Trash } from "#windows/index.js";

import useVisitorLog from "./hooks/useVisitorLog";

const App = () => {
  useVisitorLog();

  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />
      <Home />

      <Resume />

      <Finder />
      <Text />
      <Image />

      <Terminal />
      <Contact />
      <Safari />
      <Photos />
      <Trash />
    </main>
  );
};

export default App;