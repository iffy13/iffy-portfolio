import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Github, ShoppingCart, Globe, Bot, Code2 } from 'lucide-react';

interface Project {
  title: string;
  category: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

const projects: Project[] = [
  {
    title: 'Lumina Fashion',
    category: 'Shopify',
    description: 'A premium fashion e-commerce store with custom Liquid theme, advanced filtering, and seamless checkout experience.',
    image: '/project1.jpg',
    icon: <ShoppingCart className="w-5 h-5" />,
    technologies: ['Liquid', 'Shopify', 'JavaScript', 'SCSS'],
    liveUrl: '#',
    githubUrl: '#'
  },
  {
    title: 'Hydrogen Analytics',
    category: 'Headless Commerce',
    description: 'Modern headless commerce dashboard built with Shopify Hydrogen and React for real-time analytics.',
    image: '/project2.jpg',
    icon: <Code2 className="w-5 h-5" />,
    technologies: ['Hydrogen', 'React', 'TypeScript', 'GraphQL'],
    liveUrl: '#',
    githubUrl: '#'
  },
  {
    title: 'AutoFlow AI',
    category: 'Automation',
    description: 'Intelligent workflow automation system connecting multiple services with AI-powered decision making.',
    image: '/project3.jpg',
    icon: <Bot className="w-5 h-5" />,
    technologies: ['n8n', 'OpenAI', 'Node.js', 'Python'],
    liveUrl: '#',
    githubUrl: '#'
  },
  {
    title: 'Corporate Pro',
    category: 'WordPress',
    description: 'Custom WordPress theme for a corporate client with advanced custom fields and performance optimization.',
    image: '/project4.jpg',
    icon: <Globe className="w-5 h-5" />,
    technologies: ['WordPress', 'PHP', 'ACF', 'Webpack'],
    liveUrl: '#',
    githubUrl: '#'
  }
];

const Projects = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="projects" 
      ref={sectionRef}
      className="relative w-full py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark" />

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <span 
                className={`inline-block text-crimson font-montserrat font-semibold text-sm uppercase tracking-widest mb-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Portfolio
              </span>
              <h2 
                className={`heading-lg text-white transition-all duration-700 delay-100 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Selected <span className="text-crimson">Works</span>
              </h2>
            </div>
            <p 
              className={`body-md max-w-md mt-4 md:mt-0 transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              A showcase of my recent projects, demonstrating expertise across various technologies and industries.
            </p>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      hoveredIndex === index ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent transition-opacity duration-500 ${
                    hoveredIndex === index ? 'opacity-90' : 'opacity-70'
                  }`} />

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 glass-card rounded-full">
                    {project.icon}
                    <span className="text-xs font-semibold text-white">{project.category}</span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-montserrat font-bold text-white mb-2 group-hover:text-crimson transition-colors">
                      {project.title}
                    </h3>
                    <p className={`text-gray-300 text-sm mb-4 transition-all duration-500 ${
                      hoveredIndex === index ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'
                    } overflow-hidden`}>
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <span 
                          key={tech} 
                          className="px-2 py-1 text-xs bg-white/10 text-gray-300 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className={`flex gap-4 transition-all duration-500 ${
                      hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}>
                      {project.liveUrl && (
                        <a 
                          href={project.liveUrl}
                          className="flex items-center gap-2 text-crimson font-semibold text-sm hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl}
                          className="flex items-center gap-2 text-gray-400 font-semibold text-sm hover:text-white transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          <div 
            className={`text-center mt-12 transition-all duration-700 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 glass-card text-white font-montserrat font-semibold rounded-lg hover:bg-crimson hover:border-crimson transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              View All Projects
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
