import { useEffect, useRef, useState } from "react";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components/index.js";
import useWindowStore from "#store/window.js";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.25;
const INITIAL_POSITION = { x: 0, y: 0 };

const bindListeners = (target, entries) => {
    if (!target) return () => {};
    entries.forEach(([event, handler, options]) =>
        target.addEventListener(event, handler, options)
    );
    return () =>
        entries.forEach(([event, handler, options]) =>
            target.removeEventListener(event, handler, options)
        );
};

const ControlButton = ({ onClick, disabled, title, icon: Icon, iconClass = "size-4" }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="p-1 rounded hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
    >
        <Icon className={iconClass} />
    </button>
);

const ImageWindowContent = () => {
    const { windows, focusWindow } = useWindowStore();
    const data = windows.imgfile?.data;

    const [scale, setScale] = useState(MIN_SCALE);
    const [position, setPosition] = useState(INITIAL_POSITION);
    const [isDragging, setIsDragging] = useState(false);

    const bodyRef = useRef(null);
    const containerRef = useRef(null);
    const controlsRef = useRef(null);
    const dragStartRef = useRef(INITIAL_POSITION);
    const scaleRef = useRef(MIN_SCALE);
    const positionRef = useRef(INITIAL_POSITION);

    scaleRef.current = scale;
    positionRef.current = position;

    const imageUrl = data?.imageUrl;
    const name = data?.name;

    const resetView = () => {
        setScale(MIN_SCALE);
        setPosition(INITIAL_POSITION);
        setIsDragging(false);
    };

    const clampPosition = (x, y, currentScale) => {
        if (currentScale <= MIN_SCALE || !containerRef.current) return INITIAL_POSITION;
        const { width, height } = containerRef.current.getBoundingClientRect();
        const maxX = ((currentScale - 1) * width) / 2;
        const maxY = ((currentScale - 1) * height) / 2;
        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y)),
        };
    };

    useEffect(() => {
        resetView();
    }, [imageUrl]);

    useEffect(() => {
        const stopWindowDrag = (e) => e.stopPropagation();

        const handleBodyPointerDown = (e) => {
            e.stopPropagation();
            focusWindow?.("imgfile");
        };

        const handleContainerPointerDown = (e) => {
            e.stopPropagation();
            focusWindow?.("imgfile");

            if (e.button !== 0 || scaleRef.current <= MIN_SCALE) return;

            e.preventDefault();
            setIsDragging(true);
            dragStartRef.current = {
                x: e.clientX - positionRef.current.x,
                y: e.clientY - positionRef.current.y,
            };
        };

        const targets = [
            [bodyRef.current, handleBodyPointerDown],
            [containerRef.current, handleContainerPointerDown],
            [controlsRef.current, stopWindowDrag],
        ];

        const cleanups = targets.map(([el, onPointerDown]) =>
            bindListeners(el, [
                ["pointerdown", onPointerDown],
                ["mousedown", stopWindowDrag],
                ["touchstart", stopWindowDrag, { passive: true }],
            ])
        );

        return () => cleanups.forEach((cleanup) => cleanup());
    }, [imageUrl, focusWindow]);

    useEffect(() => {
        if (!isDragging) return;

        const handleWindowPointerMove = (e) => {
            const nextX = e.clientX - dragStartRef.current.x;
            const nextY = e.clientY - dragStartRef.current.y;
            setPosition(clampPosition(nextX, nextY, scaleRef.current));
        };

        const handleWindowPointerUp = () => setIsDragging(false);

        return bindListeners(window, [
            ["pointermove", handleWindowPointerMove],
            ["pointerup", handleWindowPointerUp],
            ["pointercancel", handleWindowPointerUp],
            ["blur", handleWindowPointerUp],
        ]);
    }, [isDragging]);

    if (!data) return null;

    const updateScale = (nextScale) => {
        const clamped = Math.min(
            MAX_SCALE,
            Math.max(MIN_SCALE, Number(nextScale.toFixed(2)))
        );
        setScale(clamped);
        setPosition((prev) => clampPosition(prev.x, prev.y, clamped));
    };

    const handleWheel = (e) => {
        e.preventDefault();
        updateScale(scale + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
    };

    const handleDoubleClick = () => (scale > MIN_SCALE ? resetView() : updateScale(2));

    const cursorClass =
        scale > MIN_SCALE
            ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
            : "cursor-zoom-in";

    return (
        <>
            <div id="window-header" className="flex items-center justify-between gap-3">
                <WindowControls target="imgfile" />
                <h2 className="truncate flex-1 text-center">{name}</h2>

                <div ref={controlsRef} className="flex items-center gap-1 text-gray-600">
                    <ControlButton
                        onClick={() => updateScale(scale - ZOOM_STEP)}
                        disabled={scale <= MIN_SCALE}
                        title="Zoom Out"
                        icon={ZoomOut}
                    />

                    <span className="text-xs font-medium w-10 text-center select-none">
                        {Math.round(scale * 100)}%
                    </span>

                    <ControlButton
                        onClick={() => updateScale(scale + ZOOM_STEP)}
                        disabled={scale >= MAX_SCALE}
                        title="Zoom In"
                        icon={ZoomIn}
                    />

                    <ControlButton
                        onClick={resetView}
                        disabled={scale === MIN_SCALE}
                        title="Reset Zoom"
                        icon={RotateCcw}
                        iconClass="size-3.5"
                    />
                </div>
            </div>

            <div ref={bodyRef} className="p-4 bg-white">
                {imageUrl ? (
                    <div
                        ref={containerRef}
                        onWheel={handleWheel}
                        onDoubleClick={handleDoubleClick}
                        className={`w-full h-[56vh] overflow-hidden rounded bg-gray-50 flex items-center justify-center select-none touch-none ${cursorClass}`}
                    >
                        <img
                            src={imageUrl}
                            alt={name}
                            draggable={false}
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                            }}
                            className={`max-w-full max-h-full object-contain pointer-events-none ${
                                isDragging
                                    ? "transition-none"
                                    : "transition-transform duration-150 ease-out"
                            }`}
                        />
                    </div>
                ) : null}
            </div>
        </>
    );
};

const ImageWindow = WindowWrapper(ImageWindowContent, "imgfile");

export default ImageWindow;