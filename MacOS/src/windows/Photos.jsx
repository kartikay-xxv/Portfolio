import { useState } from "react";
import { ChevronLeft, Folder, Mail, Search } from "lucide-react";

import WindowWrapper from "#hoc/WindowWrapper.jsx";
import WindowControls from "#components/WindowControls.jsx";
import { gallery, galleryFolders, photosLinks } from "#constants/index.js";
import useWindowStore from "#store/window.js";
import galleryManifest from "virtual:gallery-folders";

const stopDrag = (e) => e.stopPropagation();
const stopDragProps = { onMouseDown: stopDrag, onPointerDown: stopDrag };

const getFileName = (path = "") =>
    decodeURIComponent(path.split("/").pop() || "");

const getItemName = (item) => item?.name || getFileName(item?.img);

const resolveGalleryItems = (entries = []) => {
    const seen = new Set();
    const items = [];

    for (const entry of entries) {
        if (!entry) continue;

        if (galleryManifest[entry]) {
            for (const photo of galleryManifest[entry]) {
                if (!seen.has(photo.img)) {
                    seen.add(photo.img);
                    items.push(photo);
                }
            }
            continue;
        }

        const normalized = entry
            .replace(/\\/g, "/")
            .replace(/^\/+/, "")
            .replace(/^public\//i, "");

        const fullPath = normalized.startsWith("images/Gallery/")
            ? `/${normalized}`
            : `/images/Gallery/${normalized}`;

        const encodedImg = fullPath
            .split("/")
            .map((seg, i) => {
                if (i === 0) return seg;
                try {
                    return encodeURIComponent(decodeURIComponent(seg));
                } catch {
                    return encodeURIComponent(seg);
                }
            })
            .join("/");

        if (!seen.has(encodedImg)) {
            seen.add(encodedImg);
            items.push({
                name: getFileName(encodedImg),
                img: encodedImg,
            });
        }
    }

    return items;
};

const EmptyState = ({ message }) => (
    <div className="h-full flex items-center justify-center text-sm text-gray-400">
        {message}
    </div>
);

const Photos = () => {
    const { openWindow } = useWindowStore();
    const [activeTab, setActiveTab] = useState("Library");
    const [selectedFolder, setSelectedFolder] = useState(null);

    const isFolderTab = Object.prototype.hasOwnProperty.call(
        galleryFolders,
        activeTab
    );

    const visibleFolders = isFolderTab
        ? galleryFolders[activeTab].filter((name) => galleryManifest[name])
        : [];

    const visiblePhotos = selectedFolder
        ? [...(galleryManifest[selectedFolder] || [])].sort((a, b) =>
              getItemName(a).localeCompare(getItemName(b), undefined, {
                  numeric: true,
                  sensitivity: "base",
              })
          )
        : resolveGalleryItems(gallery[activeTab]);

    const handleTabChange = (e, title) => {
        e.stopPropagation();
        setActiveTab(title);
        setSelectedFolder(null);
    };

    const handleOpenImage = (e, item) => {
        e.stopPropagation();

        openWindow("imgfile", {
            id: item.id ?? item.img,
            name: getItemName(item),
            icon: "/images/image.png",
            kind: "file",
            fileType: "img",
            imageUrl: item.img,
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
                    {...stopDragProps}
                >
                    <h2>Gallery</h2>

                    <ul>
                        {photosLinks.map(({ id, icon, title }) => {
                            const isActive = activeTab === title;
                            return (
                                <li
                                    key={id}
                                    onClick={(e) => handleTabChange(e, title)}
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
                    {...stopDragProps}
                >
                    {isFolderTab && !selectedFolder ? (
                        visibleFolders.length > 0 ? (
                            <ul className="grid grid-cols-3 gap-4 content-start">
                                {visibleFolders.map((folderName) => {
                                    const photos = galleryManifest[folderName] || [];
                                    const cover = photos[0]?.img;

                                    return (
                                        <li
                                            key={folderName}
                                            className="group cursor-pointer flex flex-col gap-1.5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFolder(folderName);
                                            }}
                                        >
                                            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                {cover ? (
                                                    <img
                                                        src={cover}
                                                        alt={folderName}
                                                        loading="lazy"
                                                        className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    />
                                                ) : (
                                                    <Folder className="size-10 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="px-0.5">
                                                <p className="text-sm font-medium text-gray-800 truncate">
                                                    {folderName}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {photos.length}{" "}
                                                    {photos.length === 1 ? "photo" : "photos"}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <EmptyState message={`No folders in ${activeTab} yet`} />
                        )
                    ) : (
                        <>
                            {selectedFolder && (
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFolder(null);
                                        }}
                                        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                                    >
                                        <ChevronLeft className="size-4" />
                                        <span>{activeTab}</span>
                                    </button>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {selectedFolder}{" "}
                                        <span className="font-normal text-gray-400">
                                            ({visiblePhotos.length})
                                        </span>
                                    </p>
                                </div>
                            )}

                            {visiblePhotos.length > 0 ? (
                                <ul className="grid grid-cols-3 gap-3 content-start">
                                    {visiblePhotos.map((item) => (
                                        <li
                                            key={item.id ?? item.img}
                                            className="aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
                                            onClick={(e) => handleOpenImage(e, item)}
                                        >
                                            <img
                                                src={item.img}
                                                alt={getItemName(item)}
                                                loading="lazy"
                                                className="size-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <EmptyState
                                    message={`No photos in ${selectedFolder || activeTab} yet`}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const PhotosWindow = WindowWrapper(Photos, "photos");
PhotosWindow.displayName = "Photos";

export default PhotosWindow;