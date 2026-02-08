import { useState } from "react";
import { WindowControls } from "#components/index.js";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import { Download, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

const Resume = () => {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const zoomOut = () => setScale((s) => Math.max(0.7, +(s - 0.15).toFixed(2)));
    const zoomIn = () => setScale((s) => Math.min(2, +(s + 0.15).toFixed(2)));
    const resetZoom = () => setScale(1);
    const handleDownload = () => {
        window.open("files/resume.pdf", "_blank", "noopener,noreferrer");
        const link = document.createElement("a");
        link.href = "files/resume.pdf";
        link.download = "Kartikay_Resume.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stopDrag = (e) => e.stopPropagation();

    return (
        <>
            <div id="window-header" className="relative z-20">
                <WindowControls target="resume" />
                <h2>Resume.pdf</h2>

                <div
                    className="flex items-center gap-2"
                    data-clickable="true"
                    onMouseDown={stopDrag}
                    onPointerDown={stopDrag}
                >
                    <button
                        type="button"
                        onClick={zoomOut}
                        className="cursor-pointer"
                        title="Zoom out"
                    >
                        <ZoomOut className="icon" />
                    </button>

                    <button
                        type="button"
                        onClick={resetZoom}
                        className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center cursor-pointer hover:text-black dark:hover:text-white"
                        title="Reset zoom to 100%"
                    >
                        {Math.round(scale * 100)}%
                    </button>

                    <button
                        type="button"
                        onClick={zoomIn}
                        className="cursor-pointer"
                        title="Zoom in"
                    >
                        <ZoomIn className="icon" />
                    </button>

                    <button
                        type="button"
                        onClick={handleDownload}
                        className="cursor-pointer ml-1"
                        title="Download & open resume"
                    >
                        <Download className="icon" />
                    </button>
                </div>
            </div>

            <div
                className="relative z-10 isolate max-h-[70vh] max-w-[85vw] overflow-auto"
                onMouseDown={stopDrag}
                onPointerDown={stopDrag}
            >
                <Document
                    file="files/resume.pdf"
                    onLoadSuccess={onDocumentLoadSuccess}
                    externalLinkTarget="_blank"
                    externalLinkRel="noopener noreferrer"
                    className="flex flex-col items-center gap-4 bg-gray-100 dark:bg-[#161618] p-4 w-max min-w-full"
                >
                    {Array.from({ length: numPages || 0 }, (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            scale={scale}
                            renderTextLayer
                            renderAnnotationLayer
                            className="shadow-md"
                        />
                    ))}
                </Document>
            </div>
        </>
    );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;