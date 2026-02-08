import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components/index.js";
import useWindowStore from "#store/window.js";

const Text = () => {
    const { windows } = useWindowStore();
    const data = windows.txtfile?.data;
    if (!data) return null;

    const { name, image, subtitle, description } = data;
    const stopDrag = (e) => e.stopPropagation();

    return (
        <>
            <div id="window-header">
                <WindowControls target="txtfile" />
                <h2>{name}</h2>
            </div>

            <div
                className="p-5 space-y-5 bg-white dark:bg-[#1e1e20] max-h-[60vh] overflow-y-auto"
                onMouseDown={stopDrag}
                onPointerDown={stopDrag}
            >
                {image ? (
                    <div className="w-full flex justify-center">
                        <img
                            src={image}
                            alt={name}
                            className="max-h-56 w-auto object-contain rounded-lg"
                        />
                    </div>
                ) : null}

                {subtitle ? (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{subtitle}</h3>
                ) : null}

                {Array.isArray(description) && description.length > 0 ? (
                    <div className="space-y-3 leading-relaxed text-sm text-gray-800 dark:text-gray-300">
                        {description.map((para, idx) => (
                            <p key={idx}>{para}</p>
                        ))}
                    </div>
                ) : null}
            </div>
        </>
    );
};

const TextWindow = WindowWrapper(Text, "txtfile");

export default TextWindow;