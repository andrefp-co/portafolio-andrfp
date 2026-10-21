// @flow strict

import Link from 'next/link';

function ProjectCard({ project, index }) {

  return (
    <article className="sw-cell flex flex-col">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <span className="sw-cell-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="sw-label text-right">{project.role}</span>
      </div>

      <h3 className="font-[family-name:var(--sw-font-display)] text-[28px] leading-[1.05] tracking-[0.02em] text-white lg:text-[32px]">
        {project.name}
      </h3>

      <p className="sw-cell-body mt-4">{project.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tools.map((tool) => (
          <span key={tool} className="sw-tag">{tool}</span>
        ))}
      </div>

      {(project.code || project.demo) && (
        <div className="mt-auto flex gap-6 pt-6">
          {project.code && (
            <Link href={project.code} target="_blank" className="sw-link">
              Source <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
          )}
          {project.demo && (
            <Link href={project.demo} target="_blank" className="sw-link">
              Demo <span className="sw-link-arrow" aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      )}
    </article>
  );
};

export default ProjectCard;
