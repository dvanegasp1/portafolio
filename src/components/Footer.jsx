import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient.js';
import { useContent } from '@/content/ContentContext.jsx';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'Carreras', href: '#/careers' },
      { label: 'Blog', href: '#/blog' },
    ],
    resources: [
      { label: 'Recursos Gratuitos', href: '#/resources' },
      { label: 'Webinars', href: '#/webinars' },
      { label: 'Whitepapers', href: '#/whitepapers' },
      { label: 'Newsletter', href: '#/newsletter' },
      { label: 'Centro de Ayuda', href: '#/help' },
    ],
    legal: ['Política de Privacidad', 'Términos de Servicio', 'Cookies', 'Aviso Legal'],
  };

  const socialLinks = [
    { icon: Linkedin, name: 'LinkedIn', href: '#' },
    { icon: Twitter, name: 'Twitter', href: '#' },
    { icon: Instagram, name: 'Instagram', href: '#' },
  ];

  const navigate = (href) => {
    if (!href) return;
    window.location.hash = href;
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const { content } = useContent();
  const logoUrl = (() => {
    const lp = content?.branding?.logo_path;
    if (!lp) return null;
    if (/^(https?:|data:|blob:)/i.test(lp)) return lp;
    if (supabase) return supabase.storage.from('portfolio-assets').getPublicUrl(lp).data.publicUrl;
    return null;
  })();
  return (
    <footer className="relative bg-gradient-to-t from-black/50 to-transparent border-t border-white/10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12 mb-12">
          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              {logoUrl ? (
                <img src={logoUrl} alt={content.siteName + ' logo'} className="w-10 h-10 object-contain rounded" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{content.siteName?.[0] || 'B'}</span>
                </div>
              )}
              <span className="text-2xl font-bold gradient-text">{content.siteName}</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Data analytics que convierte información en acción: datos limpios, dashboards claros y decisiones con confianza.
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-3 text-blue-400" />
                <span>{content.contact?.email || 'hello@example.com'}</span>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="w-5 h-5 mr-3 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                <span>{content.contact?.location || 'Remote / Worldwide'}</span>
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <Button key={social.name} onClick={() => navigate('#/about')} variant="ghost" size="sm" className="w-10 h-10 p-0 text-gray-400 hover:text-white hover:bg-blue-600/20 rounded-full">
                  <social.icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Removed Services column to avoid duplicating main nav sections */}

          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
            <h3 className="text-lg font-semibold text-white mb-6">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.href)} className="text-gray-400 hover:text-blue-300 transition-colors text-left">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} viewport={{ once: true }}>
            <h3 className="text-lg font-semibold text-white mb-6">Recursos</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <button onClick={() => navigate(link.href)} className="text-gray-400 hover:text-blue-300 transition-colors text-left">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="glass-effect rounded-2xl p-8 mb-12 border border-white/10">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Mantente <span className="gradient-text">Actualizado</span></h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Recibe ideas y recursos de analítica directamente en tu bandeja de entrada.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input type="email" placeholder="tu@email.com" className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors" />
              <Button onClick={() => navigate('#/newsletter')} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold">Suscribirse</Button>
            </div>
          </div>
        </motion.div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">© {currentYear} {content.siteName}. Todos los derechos reservados.</div>
            <div className="flex flex-wrap gap-6 text-sm">
              {footerLinks.legal.map((link) => (
                <button key={link} onClick={() => navigate('#/legal')} className="text-gray-400 hover:text-blue-300 transition-colors">
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.button onClick={scrollToTop} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 z-40">
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      </div>
    </footer>
  );
};

export default Footer;
