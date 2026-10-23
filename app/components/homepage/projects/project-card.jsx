import ScrambleText from "@/app/components/motion/scramble-text";

// One project as a row of the list: its number and role on the left; the
// name, what was done and the tools in the middle; the source link, if any,
// on the right. Every project has the same shape, so the list reads as one.
function ProjectCard({ project, index }) {
  return (
    <article className="grid grid-cols-1 gap-4 border-b border-[var(--sw-rule)] py-10 md:grid-cols-[minmax(0,200px)_1fr] md:gap-10 lg:grid-cols-[minmax(0,220px)_1fr_auto] lg:py-12">
      <div className="flex items-baseline gap-4 md:flex-col md:gap-3">
        <span className="font-[family-name:var(--sw-font-display)] text-[28px] leading-none tracking-[0.02em] text-[var(--sw-white)] tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <ScrambleText as="p" className="sw-label">{project.role}</ScrambleText>
      </div>

      <div className="min-w-0">
        <h3 className="font-[family-name:var(--sw-font-display)] text-[clamp(30px,3.2vw,42px)] leading-[1.02] tracking-[0.02em] text-[var(--sw-white)]">
          {project.name}
        </h3>
        <p className="sw-cell-body mt-4 max-w-[68ch]">{project.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {project.tools.map((tool) => (
            <li key={tool} className="sw-tag">{tool}</li>
          ))}
        </ul>
      </div>

      {(project.code || project.demo) && (
        <div className="flex gap-6 md:col-start-2 lg:col-start-auto lg:flex-col lg:items-end lg:gap-3">
          {project.code && (
            <a href={project.code} target="_blank" rel="noopener noreferrer" className="sw-link">
              Source <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noopener noreferrer" className="sw-link">
              Demo <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}
    </article>
  );
}

export default ProjectCard;
