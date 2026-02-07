import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
gsap.registerPlugin(Draggable);

import { Navbar, Welcome, Dock, Home } from "#components/index.js";
import { Resume, Finder, Text, Image, Terminal, Contact, Safari, Photos } from "#windows/index.js";

const App = () => {
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
      
    </main>
  )
}

export default App;