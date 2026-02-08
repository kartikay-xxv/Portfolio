import { WindowControls } from "#components/index.js";
import { Search } from "lucide-react";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { locations } from "#constants/index.js";
import useLocationStore from "#store/location.js";
import clsx from "clsx";
import useWindowStore from "#store/window.js";

const Finder = () => {
    const { openWindow } = useWindowStore();
    const { activeLocation, setActiveLocation } = useLocationStore();

    const stopDrag = (e) => e.stopPropagation();

    const renderList = (name, items) => (
        <div>
            <h3>{name}</h3>

            <ul>
                {items.map((item) => (
                    <li
                        key={item.id}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveLocation(item);
                        }}
                        className={clsx(
                            item.id === activeLocation?.id ? "active" : "not-active"
                        )}
                    >
                        <img src={item.icon} className="w-4 shrink-0" alt={item.name} />
                        <p className="text-sm font-medium truncate">{item.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );

    const openItem = (e, item) => {
        e.stopPropagation();
        if (item.fileType === "pdf") return openWindow("resume");
        if (item.kind === "folder") return setActiveLocation(item);
        if (["fig", "url"].includes(item.fileType) && item.href)
            return window.open(item.href, "_blank");
        openWindow(`${item.fileType}${item.kind}`, item);
    };

    return (
        <>
            <div id="window-header">
                <WindowControls target="finder" />
                <Search className="icon" />
            </div>

            <div className="bg-white dark:bg-[#1e1e20] flex h-[62vh]">
                <div
                    className="sidebar shrink-0 overflow-y-auto"
                    onMouseDown={stopDrag}
                    onPointerDown={stopDrag}
                >
                    {renderList("Favorites", Object.values(locations))}
                    {renderList("Projects", locations.work.children)}
                </div>

                <ul
                    className="content"
                    onMouseDown={stopDrag}
                    onPointerDown={stopDrag}
                >
                    {activeLocation?.children?.map((item) => (
                        <li
                            key={item.id}
                            onMouseDown={stopDrag}
                            onPointerDown={stopDrag}
                            onClick={(e) => openItem(e, item)}
                        >
                            <img src={item.icon} alt={item.name} />
                            <p>{item.name}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;