import { techStack } from "#constants/index.js";
import { Check, Flag } from "lucide-react";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components/index.js";

const Terminal = () => {
    return (
        <>
            <div id="window-header">
                <WindowControls target="terminal" />
                <h2>Tech Stack</h2>
            </div>

            <div className="techstack text-[13px]">
                <p>
                    <span className="font-bold">kartikay@MacBook-Pro ~ % </span>
                    show tech stack
                </p>

                <div className="label grid grid-cols-[16px_185px_1fr] gap-x-3 items-center text-xs">
                    <span />
                    <p>Category</p>
                    <p>Technologies</p>
                </div>

                <ul className="content divide-y divide-dashed divide-gray-200 dark:divide-white/15">
                    {techStack.map(({ category, items }) => (
                        <li
                            key={category}
                            className="grid grid-cols-[16px_185px_1fr] gap-x-3 items-start py-1.5 first:pt-0 last:pb-0"
                        >
                            <Check className="check mt-0.5 shrink-0" size={15} />
                            <h3 className="leading-snug">{category}</h3>
                            <ul className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                                {items.map((item, i) => (
                                    <li key={i} className="whitespace-nowrap">
                                        {item}
                                        {i < items.length - 1 ? "," : ""}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>

                <div className="footnote text-xs">
                    <p>
                        <Check size={16} /> {techStack.length} of {techStack.length} categories loaded successfully
                    </p>

                    <p className="text-black dark:text-gray-200">
                        <Flag className="fill-current" size={13} />
                        Render time: 5ms
                    </p>
                </div>
            </div>
        </>
    );
};

const TerminalWindow = WindowWrapper(Terminal, "terminal");

export default TerminalWindow;