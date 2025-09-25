import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient.js';
import { useContent } from '@/content/ContentContext.jsx';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { content } = useContent();
  const logoUrl = (() => {
    const lp = content?.branding?.logo_path;
    if (!lp) return null;
    if (/^(https?:|data:|blob:)/i.test(lp)) return lp;
    if (supabase) return supabase.storage.from('portfolio-assets').getPublicUrl(lp).data.publicUrl;
    return null;
  })();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home', show: true },
    { name: 'Services', href: '#services', show: content.visibility.services },
    { name: 'Projects', href: '#projects', show: content.visibility.projects },
    { name: 'Sobre Mi', href: '#about', show: true },
    { name: 'Team', href: '#team', show: content.visibility.team },
    { name: 'Testimonials', href: '#testimonials', show: content.visibility.testimonials },
    { name: 'Contact', href: '#contact', show: true },
  ].filter(i => i.show);

  const handleNavClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate home with anchor so App can handle scroll after render
      window.location.hash = href;
    }
    setIsMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-effect shadow-2xl' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt={content.siteName + ' logo'} className="w-10 h-10 object-contain rounded" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{content.siteName?.[0] || 'B'}</span>
              </div>
            )}
            <span className="text-2xl font-bold gradient-text">{content.siteName}</span>
          </motion.div>

          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="text-white hover:text-blue-300 transition-colors duration-300 font-medium"
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          <div className="hidden lg:block">
            <Button
              onClick={() => handleNavClick('#contact')}
              className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-black text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 pulse-glow"
            >
              Contact
            </Button>
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-white p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 glass-effect rounded-lg p-4"
          >
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className="block w-full text-left py-3 text-white hover:text-blue-300 transition-colors duration-300"
              >
                {item.name}
              </button>
            ))}
            <Button
              onClick={() => handleNavClick('#contact')}
              className="w-full mt-4 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-black text-white py-2 rounded-full font-semibold"
            >
              Contact
            </Button>
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
}
