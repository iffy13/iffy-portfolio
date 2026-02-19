import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Mail, Phone } from 'lucide-react';

const Hero = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = ((e.clientY - centerY) / centerY) * -15;
      const rotateY = ((e.clientX - centerX) / centerX) * 15;
      setMousePosition({ x: rotateY, y: rotateX });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="home" className="relative min-h-screen w-full flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/80 to-dark/60" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-crimson/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full section-padding py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="order-2 lg:order-1 space-y-6">
              {/* Greeting */}
              <div 
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card transition-all duration-700 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <span className="w-2 h-2 bg-crimson rounded-full animate-pulse" />
                <span className="text-sm text-gray-300 font-medium">Hello, I'm available for work</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-2">
                <h1 
                  className={`heading-xl text-white transition-all duration-700 delay-100 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                >
                  <span className="block text-2xl sm:text-3xl md:text-4xl font-montserrat font-light text-gray-400 mb-2">
                    Hello!
                  </span>
                  <span className="block">
                    I'M <span className="text-crimson glow-text">Iffy Dev</span>
                  </span>
                </h1>
                
                {/* Red Accent Line */}
                <div 
                  className={`red-accent-line mt-4 transition-all duration-700 delay-200 ${
                    isLoaded ? 'opacity-100 w-20' : 'opacity-0 w-0'
                  }`}
                />
              </div>

              {/* Subheading */}
              <h2 
                className={`text-xl sm:text-2xl md:text-3xl font-montserrat font-semibold text-gray-200 transition-all duration-700 delay-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                Shopify & WordPress Developer
              </h2>

              {/* Description */}
              <p 
                className={`body-lg max-w-xl transition-all duration-700 delay-400 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                I specialize in building high-converting e-commerce experiences and intelligent 
                automation solutions. From custom Liquid themes to AI-driven workflows, I turn 
                complex problems into elegant digital reality.
              </p>

              {/* CTA Buttons */}
              <div 
                className={`flex flex-wrap gap-4 pt-4 transition-all duration-700 delay-500 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <a
                  href="#projects"
                  className="group relative px-8 py-4 bg-crimson text-white font-montserrat font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:shadow-glow-lg hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    View My Work
                    <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                  </span>
                </a>
                <a
                  href="#contact"
                  className="px-8 py-4 glass-card text-white font-montserrat font-semibold rounded-lg transition-all duration-300 hover:bg-white/10 hover:border-crimson/50"
                >
                  Get In Touch
                </a>
              </div>

              {/* Quick Contact */}
              <div 
                className={`flex flex-wrap gap-6 pt-6 transition-all duration-700 delay-600 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <a 
                  href="mailto:ganzzydeveloper@gmail.com" 
                  className="flex items-center gap-2 text-gray-400 hover:text-crimson transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">ganzzydeveloper@gmail.com</span>
                </a>
                <a 
                  href="tel:07061438188" 
                  className="flex items-center gap-2 text-gray-400 hover:text-crimson transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">07061438188</span>
                </a>
              </div>
            </div>

            {/* Right Content - Profile Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div
                ref={imageRef}
                className={`relative perspective-1000 transition-all duration-1000 delay-300 ${
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{
                  transform: `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                {/* Glow Effect Behind Image */}
                <div className="absolute inset-0 bg-crimson/20 rounded-3xl blur-3xl scale-110 animate-pulse-glow" />
                
                {/* Image Container */}
                <div className="relative w-72 h-80 sm:w-80 sm:h-96 md:w-96 md:h-[28rem] lg:w-[28rem] lg:h-[32rem]">
                  <img
                    src="/profile.png"
                    alt="Iffy Dev - Shopify & WordPress Developer"
                    className="w-full h-full object-contain object-center animate-float"
                    style={{ animationDuration: '6s' }}
                  />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-crimson/30 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute -bottom-8 -left-8 w-16 h-16 border border-crimson/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                
                {/* Floating Badge */}
                <div className="absolute -bottom-4 right-8 glass-card px-4 py-2 rounded-lg animate-float" style={{ animationDelay: '1s' }}>
                  <span className="text-crimson font-bold text-lg">5+</span>
                  <span className="text-gray-400 text-sm ml-1">Years Exp.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <a href="#skills" className="flex flex-col items-center gap-2 text-gray-500 hover:text-crimson transition-colors">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ArrowDown className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
