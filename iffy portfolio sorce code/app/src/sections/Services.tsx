import { useEffect, useRef, useState } from 'react';
import { 
  ShoppingCart, 
  Globe, 
  Bot, 
  Code2, 
  Search, 
  Settings,
  ArrowRight
} from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}

const services: Service[] = [
  {
    icon: <ShoppingCart className="w-8 h-8" />,
    title: 'Shopify Development',
    description: 'Complete Shopify solutions from theme customization to headless commerce implementations.',
    features: [
      'Custom Theme Development',
      'Liquid Templating',
      'Hydrogen & Oxygen',
      'Storefront API Integration',
      'App Development',
      'SEO Optimization'
    ]
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'WordPress Solutions',
    description: 'Custom WordPress websites and plugins tailored to your specific business requirements.',
    features: [
      'Custom Theme Design',
      'Plugin Development',
      'WooCommerce Integration',
      'Headless WordPress',
      'Performance Optimization',
      'Security Hardening'
    ]
  },
  {
    icon: <Bot className="w-8 h-8" />,
    title: 'AI & Automation',
    description: 'Intelligent automation solutions that streamline workflows and boost productivity.',
    features: [
      'AI Agent Development',
      'n8n Workflow Automation',
      'Zapier Integration',
      'Chatbot Development',
      'Process Automation',
      'API Integrations'
    ]
  },
  {
    icon: <Code2 className="w-8 h-8" />,
    title: 'Custom Development',
    description: 'Bespoke web applications built with modern technologies and best practices.',
    features: [
      'React & Next.js Apps',
      'TypeScript Development',
      'Node.js Backend',
      'Database Design',
      'API Development',
      'Cloud Deployment'
    ]
  },
  {
    icon: <Search className="w-8 h-8" />,
    title: 'SEO & Performance',
    description: 'Optimize your digital presence for search engines and user experience.',
    features: [
      'Technical SEO Audit',
      'Page Speed Optimization',
      'Schema Markup',
      'Core Web Vitals',
      'Analytics Setup',
      'Conversion Tracking'
    ]
  },
  {
    icon: <Settings className="w-8 h-8" />,
    title: 'Maintenance & Support',
    description: 'Ongoing support and maintenance to keep your digital assets running smoothly.',
    features: [
      '24/7 Monitoring',
      'Security Updates',
      'Backup Management',
      'Bug Fixes',
      'Feature Updates',
      'Technical Support'
    ]
  }
];

const Services = () => {
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
      id="services" 
      ref={sectionRef}
      className="relative w-full py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-crimson/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-crimson/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

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
              What I Do
            </span>
            <h2 
              className={`heading-lg text-white mb-4 transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              My <span className="text-crimson">Services</span>
            </h2>
            <p 
              className={`body-md max-w-2xl mx-auto transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Comprehensive digital solutions tailored to elevate your business 
              and drive measurable results
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`group relative glass-card p-8 rounded-2xl transition-all duration-500 cursor-pointer ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${hoveredIndex === index ? 'border-crimson/50 shadow-glow scale-[1.02]' : ''}`}
                style={{ transitionDelay: `${300 + index * 100}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-crimson/10 flex items-center justify-center text-crimson mb-6 group-hover:bg-crimson group-hover:text-white transition-all duration-300">
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-montserrat font-bold text-white mb-3 group-hover:text-crimson transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {service.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-1.5 h-1.5 bg-crimson rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-crimson font-semibold text-sm group-hover:gap-4 transition-all">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </div>

                {/* Hover Glow */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-crimson/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
