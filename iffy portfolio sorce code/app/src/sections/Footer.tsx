import { Heart, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full py-8 border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />

      {/* Content */}
      <div className="relative z-10 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>&copy; {new Date().getFullYear()} Iffy Dev.</span>
              <span>Made with</span>
              <Heart className="w-4 h-4 text-crimson fill-crimson" />
              <span>by Gansallo Samuel</span>
            </div>

            {/* Quick Links */}
            <nav className="flex items-center gap-6">
              {[
                { label: 'Home', href: '#home' },
                { label: 'Skills', href: '#skills' },
                { label: 'Services', href: '#services' },
                { label: 'Projects', href: '#projects' },
                { label: 'Contact', href: '#contact' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-400 text-sm hover:text-crimson transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="w-10 h-10 glass-card rounded-lg flex items-center justify-center text-gray-400 hover:text-crimson hover:border-crimson/50 transition-all duration-300"
              aria-label="Back to top"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
