import { projectsData } from '@/utils/data/projects-data';
import ProjectCard from './project-card';

const Projects = () => {

  return (
    <section id='projects' className="sw-section sw-section-raised">
      <div className="sw-container">
        <p className="sw-eyebrow">Projects</p>
        <h2 className="sw-head">Selected engineering work.</h2>

        <div className="sw-grid mt-10 grid-cols-1 lg:grid-cols-2">
          {projectsData.slice(0, 4).map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
