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
        Draggable.create(".folder");
    }, []);

    return (
        <section id="home" className="pointer-events-none">
            <ul className="flex flex-col flex-wrap content-start gap-y-3.5 gap-x-3 h-[calc(100vh-140px)] p-4 m-0 pointer-events-none">
                {projects.map((project) => (
                    <li
                        key={project.id}
                        className="group folder static w-[136px] flex flex-col items-center gap-1 pointer-events-auto"
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