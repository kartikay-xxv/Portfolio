import { useState } from "react";
import {
    Briefcase,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Copy,
    ExternalLink,
    GitPullRequest,
    MapPin,
    MoveRight,
    PanelLeft,
    Plus,
    Rocket,
    Search,
    Share,
    ShieldHalf,
    Wrench,
} from "lucide-react";

import { WindowControls } from "#components/index.js";
import { experiences, profile, socials } from "#constants/index.js";
import WindowWrapper from "#hoc/WindowWrapper.jsx";

const stopDrag = (e) => e.stopPropagation();
const stopDragProps = { onMouseDown: stopDrag, onPointerDown: stopDrag };

const TYPE_STYLES = {
    "Full-Time": { badge: "bg-blue-50 text-blue-700 border-blue-200", Icon: Briefcase },
    Internship: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: Briefcase },
    "Open Source": { badge: "bg-purple-50 text-purple-700 border-purple-200", Icon: GitPullRequest },
    "Bug Fix": { badge: "bg-amber-50 text-amber-700 border-amber-200", Icon: Wrench },
    Freelance: { badge: "bg-cyan-50 text-cyan-700 border-cyan-200", Icon: Wrench },
    "Startup / SaaS": { badge: "bg-pink-50 text-pink-700 border-pink-200", Icon: Rocket },
};

const getTypeMeta = (type) =>
    TYPE_STYLES[type] || {
        badge: "bg-gray-100 text-gray-700 border-gray-200",
        Icon: Briefcase,
    };

const ExperienceCard = ({ item }) => {
    const {
        type,
        role,
        organization,
        logo,
        from,
        to,
        location,
        summary,
        highlights = [],
        tech = [],
        link,
        linkLabel,
    } = item;

    const { badge, Icon } = getTypeMeta(type);
    const duration = [from, to].filter(Boolean).join(" — ");

    return (
        <article className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#262629] p-5 shadow-xs hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            <div className="flex items-start gap-4">
                <div className="size-12 shrink-0 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex-center overflow-hidden">
                    {logo ? (
                        <img
                            src={logo}
                            alt={organization}
                            loading="lazy"
                            className="size-full object-contain p-1.5"
                        />
                    ) : (
                        <Icon className="size-5 text-gray-500" />
                    )}
                </div>

                <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">
                                    {role}
                                </h3>
                                {type && (
                                    <span
                                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${badge}`}
                                    >
                                        {type}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {organization}
                            </p>
                        </div>

                        <div className="flex flex-col items-end text-xs text-gray-500 shrink-0 gap-1">
                            {duration && (
                                <span className="inline-flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300">
                                    <Calendar className="size-3.5" />
                                    {duration}
                                </span>
                            )}
                            {location && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="size-3.5" />
                                    {location}
                                </span>
                            )}
                        </div>
                    </div>

                    {summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {summary}
                        </p>
                    )}

                    {highlights.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            {highlights.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    )}

                    {(tech.length > 0 || link) && (
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex flex-wrap gap-1.5">
                                {tech.map((skill) => (
                                    <span
                                        key={skill}
                                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {link && (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-xs font-medium hover:underline inline-flex items-center gap-1.5 ml-auto"
                                >
                                    {linkLabel || "View Details"}
                                    <MoveRight className="size-3.5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

const Safari = () => {
    const [query, setQuery] = useState("");

    const linkedInUrl =
        socials.find((s) => s.text.toLowerCase() === "linkedin")?.link ||
        "https://www.linkedin.com/in/kartikay-xxv";

    const trimmedQuery = query.trim().toLowerCase();
    const filteredExperiences = trimmedQuery
        ? experiences.filter((item) =>
              [
                  item.role,
                  item.organization,
                  item.type,
                  item.summary,
                  ...(item.tech || []),
              ]
                  .filter(Boolean)
                  .join(" ")
                  .toLowerCase()
                  .includes(trimmedQuery)
          )
        : experiences;

    return (
        <>
            <div id="window-header">
                <WindowControls target="safari" />

                <PanelLeft className="ml-10 icon" />

                <div className="flex items-center gap-1 ml-5">
                    <ChevronLeft className="icon" />
                    <ChevronRight className="icon" />
                </div>

                <div className="flex-1 flex-center gap-3">
                    <ShieldHalf className="icon" />

                    <div
                        className="search"
                        data-clickable="true"
                        {...stopDragProps}
                    >
                        <Search className="icon" />

                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search experience, role, or tech..."
                            className="flex-1 outline-none text-gray-700 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <Share className="icon" />
                    <Plus className="icon" />
                    <Copy className="icon" />
                </div>
            </div>

            <div className="max-h-[62vh] overflow-y-auto" {...stopDragProps}>
                <div className="blog !py-6">
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="!mb-0.5">Experience</h2>
                            <p className="text-xs text-gray-500">
                                Roles, internships, open-source contributions &amp; independent work
                            </p>
                        </div>

                        <a
                            href={linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-medium transition-colors shrink-0"
                        >
                            <img
                                src="/icons/linkedin.svg"
                                alt="LinkedIn"
                                className="size-3.5"
                            />
                            <span>Check out LinkedIn</span>
                            <ExternalLink className="size-3.5" />
                        </a>
                    </div>

                    {experiences.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/15 bg-gray-50/70 dark:bg-white/5 px-6 py-12 text-center space-y-3">
                            <div className="size-12 mx-auto rounded-full bg-white dark:bg-[#262629] border border-gray-200 dark:border-white/10 flex-center text-gray-400">
                                <Briefcase className="size-5" />
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                                    No experience yet
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                    Currently focused on building production-grade projects and
                                    actively open to internships, full-time roles, freelance work,
                                    and open-source collaborations.
                                </p>
                            </div>

                            {profile?.availability && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/15 dark:border-emerald-400/30 px-3 py-1 rounded-full">
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    {profile.availability}
                                </span>
                            )}
                        </div>
                    ) : filteredExperiences.length > 0 ? (
                        <div className="space-y-4">
                            {filteredExperiences.map((item) => (
                                <ExperienceCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-sm text-gray-400">
                            No experience matching &ldquo;{query}&rdquo;
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const SafariWindow = WindowWrapper(Safari, "safari");

export default SafariWindow;