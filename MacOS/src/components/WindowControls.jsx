import useWindowStore from "#store/window.js";
import { useWindowLayout } from "#hoc/WindowWrapper.jsx";

const WindowControls = ({ target }) => {
    const { closeWindow } = useWindowStore();
    const { maximizeWindow, restoreWindow } = useWindowLayout();

    const stopDrag = (e) => e.stopPropagation();

    return (
        <div
            id="window-controls"
            onMouseDown={stopDrag}
            onPointerDown={stopDrag}
        >
            <div
                className="close"
                title="Close"
                onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(target);
                }}
            />
            <div
                className="minimize"
                title="Restore Original Size"
                onClick={(e) => {
                    e.stopPropagation();
                    restoreWindow();
                }}
            />
            <div
                className="maximize"
                title="Full Screen"
                onClick={(e) => {
                    e.stopPropagation();
                    maximizeWindow();
                }}
            />
        </div>
    );
};

export default WindowControls;