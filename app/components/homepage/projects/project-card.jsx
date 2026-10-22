"use client";

import CountUp from "@/app/components/motion/count-up";
import DitherImage from "@/app/components/motion/dither-image";
import ScrambleText from "@/app/components/motion/scramble-text";
import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

// The project's visual: its illustration when one is set, otherwise a panel
// built around the one number the project is judged by.
function ProjectVisual({ project, parallax }) {
  const { metric } = project;
  // Long readings like "200–500 Hz" step down a size so they stay on one line.
  const metricLength = metric ? `${metric.prefix ?? ""}${metric.value}${metric.suffix ?? ""}`.length : 0;
  const metricSize = metricLength > 7 ? "text-[clamp(48px,6.4vw,92px)]" : "text-[clamp(64px,9vw,128px)]";

  if (project.image) {
    return (
      <figure className="relative m-0 overflow-hidden border border-[var(--sw-border)]">
        <motion.div style={{ y: parallax, scale: 1.12 }}>
          <DitherImage
            src={project.image}
            width={1600}
            height={1200}
            sizes="(max-width: 1024px) 92vw, 560px"
            alt={project.imageAlt || ""}
            className="aspect-[4/3] w-full"
            imgClassName="sw-mono-img h-full w-full object-cover"
          />
        </motion.div>
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 to-transparent px-5 pb-4 pt-16">
          {metric && (
            <span>
              <span className="block font-[family-name:var(--sw-font-display)] text-[40px] leading-none text-white">
                <CountUp value={metric.value} from={metric.from} prefix={metric.prefix} suffix={metric.suffix} />
              </span>
              <span className="sw-label mt-1 block">{metric.label}</span>
            </span>
          )}
          <span className="sw-label">Illustration</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="sw-bg-grid flex aspect-[4/3] flex-col justify-between border border-[var(--sw-border)] bg-[var(--sw-cell)] p-6 lg:p-8">
      <span className="sw-label">{metric?.label ?? "Key result"}</span>
      {metric && (
        <motion.p
          style={{ y: parallax }}
          className={`whitespace-nowrap font-[family-name:var(--sw-font-display)] ${metricSize} leading-[0.9] tracking-[0.01em] text-white`}
        >
          <CountUp value={metric.value} from={metric.from} prefix={metric.prefix} suffix={metric.suffix} />
        </motion.p>
      )}
      <ul className="flex flex-wrap gap-2">
        {project.tools.slice(0, 3).map((tool) => (
          <li key={tool} className="sw-tag">{tool}</li>
        ))}
      </ul>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallax = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const flip = index % 2 === 1;

  return (
    <article
      ref={ref}
      className="grid grid-cols-1 items-center gap-8 border-b border-[var(--sw-rule)] py-12 lg:grid-cols-2 lg:gap-16 lg:py-16"
    >
      <div className={`min-w-0 ${flip ? "lg:order-2" : ""}`}>
        <ProjectVisual project={project} parallax={parallax} />
      </div>

      <div className="min-w-0">
        <ScrambleText as="p" className="sw-label">{project.role}</ScrambleText>
        <h3 className="mt-4 font-[family-name:var(--sw-font-display)] text-[clamp(32px,3.4vw,44px)] leading-[1.02] tracking-[0.02em] text-white">
          {project.name}
        </h3>
        <p className="sw-cell-body mt-5 max-w-[62ch]">{project.description}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.tools.map((tool) => (
            <li key={tool} className="sw-tag">{tool}</li>
          ))}
        </ul>

        {(project.code || project.demo) && (
          <div className="mt-6 flex gap-6">
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
      </div>
    </article>
  );
};

export default ProjectCard;
