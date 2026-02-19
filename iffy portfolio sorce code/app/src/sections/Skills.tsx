import { useEffect, useRef, useState } from 'react';
import { 
  ShoppingBag, 
  Globe, 
  Cpu, 
  Zap, 
  Code2, 
  Layers,
  Sparkles,
  Workflow
} from 'lucide-react';

interface Skill {
  name: string;
  icon: React.ReactNode;
  category: string;
}

const skills: Skill[] = [
  { name: 'Shopify', icon: <ShoppingBag className="w-6 h-6" />, category: 'E-Commerce' },
  { name: 'Liquid', icon: <Code2 className="w-6 h-6" />, category: 'Templating' },
  { name: 'Hydrogen', icon: <Layers className="w-6 h-6" />, category: 'Framework' },
  { name: 'Storefront API', icon: <Globe className="w-6 h-6" />, category: 'API' },
  { name: 'WordPress', icon: <Globe className="w-6 h-6" />, category: 'CMS' },
  { name: 'React', icon: <Code2 className="w-6 h-6" />, category: 'Frontend' },
  { name: 'TypeScript', icon: <Code2 className="w-6 h-6" />, category: 'Language' },
  { name: 'Node.js', icon: <Cpu className="w-6 h-6" />, category: 'Backend' },
  { name: 'AI Agents', icon: <Sparkles className="w-6 h-6" />, category: 'AI/ML' },
  { name: 'n8n', icon: <Workflow className="w-6 h-6" />, category: 'Automation' },
  { name: 'Zapier', icon: <Zap className="w-6 h-6" />, category: 'Automation' },
  { name: 'Wix', icon: <Globe className="w-6 h-6" />, category: 'CMS' },
];

const Skills = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      id="skills" 
      ref={sectionRef}
      className="relative w-full py-24 overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark" />
      
      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span 
              className={`inline-block text-crimson font-montserrat font-semibold text-sm uppercase tracking-widest mb-4 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Expertise
            </span>
            <h2 
              className={`heading-lg text-white mb-4 transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Tech Stack & <span className="text-crimson">Skills</span>
            </h2>
            <p 
              className={`body-md max-w-2xl mx-auto transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Mastering the latest technologies to deliver cutting-edge solutions 
              for your business needs
            </p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className={`group glass-card-hover p-6 rounded-xl text-center cursor-pointer transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${300 + index * 50}ms` }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-crimson/10 flex items-center justify-center text-crimson group-hover:bg-crimson group-hover:text-white transition-all duration-300">
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-montserrat font-semibold text-sm group-hover:text-crimson transition-colors">
                      {skill.name}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1">{skill.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div 
            className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 delay-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {[
              { value: '50+', label: 'Projects Completed' },
              { value: '30+', label: 'Happy Clients' },
              { value: '5+', label: 'Years Experience' },
              { value: '100%', label: 'Client Satisfaction' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-montserrat font-bold text-crimson mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
