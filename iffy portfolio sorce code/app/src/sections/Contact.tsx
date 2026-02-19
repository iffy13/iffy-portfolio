import { useEffect, useRef, useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Github, 
  Linkedin, 
  Twitter,
  Send,
  ArrowUpRight
} from 'lucide-react';

const Contact = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
    alert('Thank you for your message! I will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      className="relative w-full py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-crimson/5 rounded-full blur-3xl" />

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
              Get In Touch
            </span>
            <h2 
              className={`heading-lg text-white mb-4 transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Let's Build Something <span className="text-crimson">Amazing</span>
            </h2>
            <p 
              className={`body-md max-w-2xl mx-auto transition-all duration-700 delay-200 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Have a project in mind? Let's discuss how I can help bring your vision to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div 
              className={`space-y-8 transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
              }`}
            >
              {/* Contact Cards */}
              <div className="space-y-4">
                <a 
                  href="mailto:ganzzydeveloper@gmail.com"
                  className="group flex items-center gap-4 p-6 glass-card rounded-xl hover:border-crimson/50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-lg bg-crimson/10 flex items-center justify-center text-crimson group-hover:bg-crimson group-hover:text-white transition-all duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-400 text-sm mb-1">Email</h3>
                    <p className="text-white font-semibold group-hover:text-crimson transition-colors">
                      ganzzydeveloper@gmail.com
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-crimson transition-colors" />
                </a>

                <a 
                  href="tel:07061438188"
                  className="group flex items-center gap-4 p-6 glass-card rounded-xl hover:border-crimson/50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-lg bg-crimson/10 flex items-center justify-center text-crimson group-hover:bg-crimson group-hover:text-white transition-all duration-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-400 text-sm mb-1">Phone</h3>
                    <p className="text-white font-semibold group-hover:text-crimson transition-colors">
                      07061438188
                    </p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-crimson transition-colors" />
                </a>

                <div className="flex items-center gap-4 p-6 glass-card rounded-xl">
                  <div className="w-14 h-14 rounded-lg bg-crimson/10 flex items-center justify-center text-crimson">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-gray-400 text-sm mb-1">Location</h3>
                    <p className="text-white font-semibold">
                      Available Worldwide (Remote)
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-white font-montserrat font-semibold mb-4">Follow Me</h3>
                <div className="flex gap-4">
                  {[
                    { icon: <Facebook className="w-5 h-5" />, url: 'https://www.facebook.com/profile.php?id=61587000095360', label: 'Facebook' },
                    { icon: <Github className="w-5 h-5" />, url: 'https://github.com', label: 'GitHub' },
                    { icon: <Linkedin className="w-5 h-5" />, url: 'https://linkedin.com', label: 'LinkedIn' },
                    { icon: <Twitter className="w-5 h-5" />, url: 'https://twitter.com', label: 'Twitter' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 glass-card rounded-lg flex items-center justify-center text-gray-400 hover:text-crimson hover:border-crimson/50 transition-all duration-300"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Availability Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-full">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-gray-300 text-sm">Available for new projects</span>
              </div>
            </div>

            {/* Contact Form */}
            <div 
              className={`transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-6">
                <h3 className="text-xl font-montserrat font-bold text-white mb-6">
                  Send a Message
                </h3>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-dark-lighter border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Your Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-dark-lighter border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-dark-lighter border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson transition-colors"
                    placeholder="Project Inquiry"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-dark-lighter border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-crimson transition-colors resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-crimson text-white font-montserrat font-semibold rounded-lg hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-300"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
