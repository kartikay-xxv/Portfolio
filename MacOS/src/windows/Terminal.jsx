import { techStack } from "#constants/index.js";
import { Check, Flag } from "lucide-react";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { WindowControls } from "#components/index.js";

const Terminal = () => {
    return <>
        <div id="window-header">
            <WindowControls target="terminal" />
            <h2>Tech Stack</h2>
        </div>

        <div className="techstack">
            <p>
                <span className="font-bold">@kartikay % </span>
                show tech stack
            </p>

            <div className="label grid grid-cols-[20px_210px_1fr] gap-x-4 items-center">
                <span />
                <p>Category</p>
                <p>Technologies</p>
            </div>

            <ul className="content divide-y divide-dashed divide-gray-200">
                {techStack.map( ({ category, items }) => (
                    <li key={category} className="grid grid-cols-[20px_210px_1fr] gap-x-4 items-start py-3 first:pt-0 last:pb-0">
                        <Check className="check mt-0.5 shrink-0" size={18}/>
                        <h3 className="leading-snug">{category}</h3>
                        <ul className="flex flex-wrap gap-x-2 gap-y-1">
                            {items.map( (item, i) => (
                                <li key={i} className="whitespace-nowrap">
                                    {item}
                                    {i < items.length - 1 ? "," : ""}
                                </li>
                            ) )}
                        </ul>
                    </li>
                ) )}
            </ul>

            <div className="footnote">
                <p>
                    <Check size={20} /> {techStack.length} of {techStack.length} stacks loaded successfully
                </p>

                <p className="text-black">
                    <Flag size={15} fill="black" />
                    Render time: 5ms
                </p>
            </div>
        </div>
    </>;
}

const TerminalWindow = WindowWrapper(Terminal, "terminal");

export default TerminalWindow;