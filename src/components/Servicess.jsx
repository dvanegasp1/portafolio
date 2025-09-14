import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Database, LineChart, Workflow, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/content/ContentContext.jsx';

const iconMap = { BarChart3, Database, LineChart, Workflow };

const Services = () => {
  const { content } = useContent();
  const services = content.services || [];

  const handleLearnMore = () => {
    const el = document.querySelector('#projects');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

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
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-full border border-red-500/30 mb-6">
            <span className="text-sm font-medium text-red-300">Services</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Data Analytics
            <span className="gradient-text block leading-[1.2]">Capabilities</span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Practical services that take you from raw data to clear decisions.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || BarChart3;
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
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{service.title}</h3>
                  <p className="text-gray-300 mb-6 leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA removed as requested */}
      </div>
    </section>
  );
};

export default Services;
