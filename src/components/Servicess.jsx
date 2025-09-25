import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Database, LineChart, Workflow, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';

const iconMap = { BarChart3, Database, LineChart, Workflow };

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded bg-white/10 ${className}`} />
);

const Services = () => {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const services = Array.isArray(content?.services) ? content.services : [];
  const heading = content?.servicesHeading || content?.siteName || '';
  const subheading = content?.servicesSubheading || content?.hero?.subtitle || '';
  const badgeText = content?.hero?.badge || content?.role || '';

  const handleLearnMore = () => {
    const el = document.querySelector('#projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!loading && services.length === 0) {
    return null;
  }

  const cards = loading ? new Array(4).fill(null) : services;

  return (
    <section
      id="services"
      className="relative z-20 overflow-hidden scroll-mt-40 -mt-16 md:-mt-24 pt-10 md:pt-12 pb-16"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {(loading || badgeText) && (
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
              {loading ? <SkeletonBlock className="h-4 w-24 mx-auto" /> : <span className="text-sm font-medium text-purple-300">{badgeText}</span>}
            </div>
          )}

          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            {loading ? <SkeletonBlock className="h-10 w-2/3 mx-auto" /> : heading}
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {loading ? <SkeletonBlock className="h-5 w-full" /> : subheading}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((service, index) => {
            if (loading) {
              return (
                <motion.div
                  key={index}
                  className="glass-effect rounded-2xl p-8 h-full border border-white/10"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <SkeletonBlock className="w-16 h-16 mb-6 mx-auto" />
                  <SkeletonBlock className="h-6 w-32 mx-auto mb-4" />
                  <SkeletonBlock className="h-4 w-full" />
                  <SkeletonBlock className="h-4 w-5/6 mt-2" />
                </motion.div>
              );
            }

            let iconElement;
            if (service.icon_path) {
              let url = service.icon_path;
              if (supabase && !/^https?:/i.test(url)) {
                url = supabase.storage.from('portfolio-assets').getPublicUrl(service.icon_path).data.publicUrl;
              }
              iconElement = <img src={url} alt="Service icon" className="w-8 h-8 object-contain" />;
            } else {
              const Icon = iconMap[service.icon] || BarChart3;
              iconElement = <Icon className="w-8 h-8 text-white" />;
            }
            return (
              <motion.div
                key={service.title + index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {iconElement}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{service.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {(!loading && services.length > 0) && (
          <div className="mt-12 flex justify-center">
            <Button onClick={handleLearnMore} variant="ghost" className="text-purple-300 hover:text-white hover:bg-purple-500/10">
              Ver proyectos relacionados
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;
