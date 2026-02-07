import { useState } from "react";
import { Mail, Search } from "lucide-react";

import WindowWrapper from "#hoc/WindowWrapper.jsx";
import WindowControls from "#components/WindowControls.jsx";
import { gallery, photosLinks } from "#constants/index.js";
import useWindowStore from "#store/window.js";

const Photos = () => {
    const { openWindow } = useWindowStore();
    const [activeTab, setActiveTab] = useState("Library");

    const stopDrag = (e) => e.stopPropagation();

    const filteredGallery =
        activeTab === "Library"
            ? gallery
            : gallery.filter((item) => item.categories?.includes(activeTab));

    const handleOpenImage = (e, { id, img, title }) => {
        e.stopPropagation();

        openWindow("imgfile", {
            id,
            name: title || `Gallery image ${id}`,
            icon: "/images/image.png",
            kind: "file",
            fileType: "img",
            imageUrl: img,
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const imgEl = document.getElementById("imgfile");
                if (!imgEl) return;

                const isLeft = Math.random() < 0.5;
                const randomLeft = isLeft
                    ? 32 + Math.floor(Math.random() * 7)
                    : 62 + Math.floor(Math.random() * 7);
                const randomTop = 40 + Math.floor(Math.random() * 8);

                imgEl.style.left = `${randomLeft}%`;
                imgEl.style.top = `${randomTop}%`;
            });
        });
    };

    return (
        <>
            <div id="window-header">
                <WindowControls target="photos" />

                <div className="w-full flex justify-end items-center gap-3 text-gray-500">
                    <Mail className="icon" />
                    <Search className="icon" />
                </div>
            </div>

            <div className="flex w-full h-[62vh]">
                <div
                    className="sidebar shrink-0 overflow-y-auto"
                    onMouseDown={stopDrag}
                    onPointerDown={stopDrag}
                >
                    <h2>Gallery</h2>

                    <ul>
                        {photosLinks.map(({ id, icon, title }) => {
                            const isActive = activeTab === title;
                            return (
                                <li
                                    key={id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTab(title);
                                    }}
                                    className={
                                        isActive
                                            ? "!bg-blue-100 !text-blue-600 cursor-pointer"
                                            : "!bg-transparent !text-gray-700 hover:!bg-gray-100 cursor-pointer"
                                    }
                                >
                                    <img src={icon} alt={title} />
                                    <p>{title}</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div
                    className="gallery flex-1 overflow-y-auto"
                    onMouseDown={stopDrag}
                    onPointerDown={stopDrag}
                >
                    {filteredGallery.length > 0 ? (
                        <ul>
                            {filteredGallery.map((item) => (
                                <li
                                    key={item.id}
                                    className="cursor-pointer"
                                    onMouseDown={stopDrag}
                                    onPointerDown={stopDrag}
                                    onClick={(e) => handleOpenImage(e, item)}
                                >
                                    <img
                                        src={item.img}
                                        alt={item.title || `Gallery image ${item.id}`}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-gray-400">
                            No photos in {activeTab} yet
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const PhotosWindow = WindowWrapper(Photos, "photos");
PhotosWindow.displayName = "Photos";

export default PhotosWindow;