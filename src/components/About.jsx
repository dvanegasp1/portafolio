import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Users, Target } from 'lucide-react';
import { useContent } from '@/content/ContentContext.jsx';

const iconMap = { Users, Target };

export default function About() {
  const { content } = useContent();
  const { heading, description, highlights } = content.about;

  return (
    <section id="about" className="relative z-20 overflow-hidden scroll-mt-40 -mt-20 md:-mt-28 pt-6 md:pt-8 pb-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
              <Award className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">About</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              {heading}
            </h2>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">{description}</p>

            <div className="space-y-4 mb-8">
              {highlights.map((value, index) => (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative">
              <img
                className="w-full h-auto rounded-2xl shadow-2xl"
                alt="Data visuals and analytics dashboard"
                src="https://images.unsplash.com/photo-1552581234-26160f608093"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-2xl" />

              {/* Floating overlay cards (restored style) */}
              {(() => { const Icon = iconMap[content.whyUs?.[0]?.icon] || Users; return (
                <div className="absolute -top-6 -left-6 w-64">
                  <div className="glass-effect rounded-2xl p-4 border border-white/10 shadow-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold leading-tight">{content.whyUs?.[0]?.title || 'Equipo Experto'}</div>
                        <div className="text-gray-300 text-sm">{content.whyUs?.[0]?.subtitle || 'Consultores Certificados'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ); })()}

              {(() => { const Icon = iconMap[content.whyUs?.[1]?.icon] || Target; return (
                <div className="absolute -bottom-6 -right-6 w-72">
                  <div className="glass-effect rounded-2xl p-4 border border-white/10 shadow-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold leading-tight">{content.whyUs?.[1]?.title || 'Resultados Garantizados'}</div>
                        <div className="text-gray-300 text-sm">{content.whyUs?.[1]?.subtitle || 'ROI Comprobado'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ); })()}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
