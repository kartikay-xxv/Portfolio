import useWindowStore from "#store/window.js";
import { useRef, useLayoutEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

const WindowWrapper = (Component, windowKey) => {
    const Wrapped = (props) => {
        const { focusWindow, windows } = useWindowStore();
        const { isOpen, zIndex } = windows[windowKey];
        const ref = useRef(null);

        useGSAP(() => {
            const el = ref.current;
            if (!el || !isOpen) return;

            el.style.display = "block";
            el.style.top = "45%";
            el.style.left = "50%";

            gsap.fromTo(el, 
                { scale: 0.1, opacity: 0, xPercent: -50, yPercent: -50, x: 0, y: 40 },
                { scale: 1, opacity: 1, xPercent: -50, yPercent: -50, x: 0, y: 0, duration: 0.3, ease: "power3.out" },
            );
        }, [isOpen]);

        useGSAP(() => {
            const el = ref.current;
            if (!el) return;

            const [instance] = Draggable.create(el, { onPress: () => focusWindow(windowKey) });

            return () => instance?.kill();
        }, []);

        useLayoutEffect(() => {
            const el = ref.current;
            if (!el) return;

            el.style.display = isOpen ? "block" : "none";
        }, [isOpen]);

        return (
            <section id={windowKey} ref={ref} style={ {zIndex} }>
                <Component {...props} />
            </section>
        );
    };

    Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;

    return Wrapped;
};

export default WindowWrapper;