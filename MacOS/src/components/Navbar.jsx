import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { navLinks, navIcons } from "#constants/index.js";

const LiveTime = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <time>{currentTime.format("ddd MMM DD hh:mm:ss A")}</time>;
};

const Navbar = () => {
  return (
    <nav>
        <div>
            <img src="/images/logo.svg" alt="Logo" />
            <p className="font-bold">Kartikay's Portfolio</p>
            <ul>
                { navLinks.map( ( {id, name} ) => (
                        <li key={id}>
                            <p>{name}</p>
                        </li>
                    )
                )}
            </ul>
        </div>

        <div>
            <ul>
                { navIcons.map( ( {id, img} ) => (
                    <li key={id}>
                        <img src={img} className="icon-hover" alt={`icon-${id}`} />
                    </li>
                ) )}
            </ul>
            <LiveTime />
        </div>
    </nav>
  )
}

export default Navbar;