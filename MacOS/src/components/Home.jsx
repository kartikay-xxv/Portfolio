import { locations } from "#constants/index.js";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import useWindowStore from "#store/window";
import useLocationStore from "#store/location";

const projects = locations.work?.children ?? [];

const Home = () => {
    const { setActiveLocation } = useLocationStore();
    const { openWindow } = useWindowStore();

    const handleOpenProjectFinder = (project) => {
        setActiveLocation(project);
        openWindow("finder");
    };

    useGSAP(() => {
        if (window.innerWidth < 768) return;
        const instances = Draggable.create(".folder");
        return () => instances.forEach((i) => i.kill());
    }, []);

    return (
        <section id="home" className="pointer-events-none">
            <ul className="grid grid-cols-3 gap-3 p-4 m-0 sm:flex sm:flex-col sm:flex-wrap sm:content-start sm:gap-y-3.5 sm:gap-x-3 sm:h-[calc(100vh-140px)] pointer-events-none">
                {projects.map((project) => (
                    <li
                        key={project.id}
                        className="group folder static w-full sm:w-[136px] flex flex-col items-center gap-1 pointer-events-auto"
                        onClick={() => handleOpenProjectFinder(project)}
                    >
                        <img
                            src="/images/folder.png"
                            alt={project.name}
                            className="w-14 h-auto shrink-0 block"
                        />
                        <p className="w-full text-center text-xs leading-tight break-words">
                            {project.name}
                        </p>
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default Home;