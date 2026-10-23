import SectionHeading from '@/app/components/helper/section-heading';
import { projectsData } from '@/utils/data/projects-data';
import ProjectCard from './project-card';

const Projects = () => {

  return (
    <section id='projects' className="sw-section sw-paper">
      <div className="sw-container">
        <SectionHeading eyebrow="Projects" title="Selected engineering work." />

        <div className="mt-10 border-t border-[var(--sw-rule)]">
          {projectsData.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
