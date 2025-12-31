import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Code, BarChart3, Zap } from 'lucide-react';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';

const resolveStorageUrl = (storagePath) => {
  if (!storagePath) return null;
  if (/^(https?:|data:|blob:)/i.test(storagePath)) return storagePath;
  if (!supabase) return null;
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded bg-white/10 ${className}`} />
);

export default function About() {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const about = content?.about ?? {};
  const highlights = Array.isArray(about.highlights) ? about.highlights.filter(item => !['SQL', 'Python (pandas)', 'Sheets', 'Power BI', 'Tableau', 'Looker Studio'].includes(item)) : [];
  const imageUrl = resolveStorageUrl(about.image_path);
  const primaryHighlight = highlights[0] || content?.role || '';
  const secondaryHighlight = highlights[1] || '';

  const goTo = (hash) => {
    if (!hash) return;
    if (hash.startsWith('#')) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.location.hash = hash;
  };

  const renderHighlight = (value, index) => (
    <motion.div
      key={value || index}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex items-center"
    >
      <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
      <span className="text-gray-300">{value}</span>
    </motion.div>
  );

  return (
    <section id="about" className="relative z-20 overflow-hidden scroll-mt-40 -mt-20 md:-mt-28 pt-6 md:pt-8 pb-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
<<<<<<< HEAD
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-full border border-red-500/30 mb-6">
              <Award className="w-4 h-4 mr-2 text-red-400" />
              <span className="text-sm font-medium text-red-300">About</span>
=======
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
              <Award className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Sobre mí</span>
>>>>>>> dev
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              {loading ? <SkeletonBlock className="h-10 w-3/4" /> : about.heading}
            </h2>
<p className="text-xl text-gray-300 mb-8 leading-relaxed">
  {loading ? <SkeletonBlock className="h-5 w-full" /> : about.description}
</p>

<div className="space-y-4 mb-8">
  <div className="flex items-center">
    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
    <span className="text-gray-300"><span className="text-blue-400 font-semibold">+21 años</span> entendiendo necesidades institucionales</span>
  </div>
  <div className="flex items-center">
    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
    <span className="text-gray-300">Maestría en <span className="text-blue-400 font-semibold">Analítica de Datos</span></span>
  </div>
  <div className="flex items-center">
    <div className="flex items-center mr-3">
      <Code className="w-5 h-5 text-blue-400 mr-1" title="Python" />
      <BarChart3 className="w-5 h-5 text-blue-400 mr-1" title="Power BI" />
      <Zap className="w-5 h-5 text-blue-400" title="KNIME" />
    </div>
    <span className="text-gray-300">Experiencia en <span className="text-blue-400 font-semibold">Python, Power BI, KNIME</span></span>
  </div>
  <div className="flex items-center">
    <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
    <span className="text-gray-300">Enfoque en <span className="text-blue-400 font-semibold">analítica ética</span> y <span className="text-blue-400 font-semibold">automatización</span> de procesos</span>
  </div>
</div>


<div className="flex flex-col sm:flex-row gap-4">
  <button onClick={() => goTo('#projects')} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-full font-semibold transition-colors">
    Conoce más sobre mi experiencia
  </button>
  <button onClick={() => goTo('#contact')} className="border-2 border-blue-500 text-blue-300 hover:bg-blue-500/10 px-6 py-3 rounded-full font-semibold transition-colors">
    Trabajemos juntos
  </button>
</div>

            
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 relative"
          >
            <div className="relative group max-w-[520px] w-full mx-auto">
              <div className="relative rounded-[20px] overflow-hidden border border-white/10 group-hover:border-white/20 transition duration-500 shadow-2xl flex items-center justify-center bg-white/5 aspect-[4/5]">
                {imageUrl ? (
                  <img
                    className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-[1.02]"
                    alt={about.heading || 'Imagen de la sección Sobre mí'}
                    src={imageUrl}
                  />
                ) : (
                  <div className="w-full aspect-[4/3] bg-gradient-to-br from-purple-900/70 to-blue-900/40 flex items-center justify-center">
                    {loading ? <SkeletonBlock className="h-10 w-24" /> : <span className="text-white/60 tracking-[0.3em] uppercase text-[11px]">Imagen pendiente</span>}
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {/* Floating overlay cards (restored style) */}
              {(() => { const Icon = iconMap[content.whyUs?.[0]?.icon] || Users; return (
                <div className="absolute -top-6 -left-6 w-64">
                  <div className="glass-effect rounded-2xl p-4 border border-white/10 shadow-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center mr-3">
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
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-rose-500 to-red-500 flex items-center justify-center mr-3">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold leading-tight">{content.whyUs?.[1]?.title || 'Resultados Garantizados'}</div>
                        <div className="text-gray-300 text-sm">{content.whyUs?.[1]?.subtitle || 'ROI Comprobado'}</div>
                      </div>
                    </div>
=======
              <div className="absolute -top-4 -left-4 hidden lg:block">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-transparent blur-xl" />
              </div>

              {loading ? (
                <div className="hidden lg:block absolute -bottom-6 -right-6">
                  <div className="glass-effect rounded-xl px-3 py-2.5 border border-white/10 shadow-lg backdrop-blur-xl">
                    <SkeletonBlock className="h-3 w-16 mb-2" />
                    <SkeletonBlock className="h-4 w-14" />
                    <SkeletonBlock className="h-3 w-16 mt-1" />
                  </div>
                </div>
              ) : (
                <div className="hidden lg:block absolute -bottom-6 -right-6">
                  <div className="glass-effect rounded-xl px-3 py-2.5 border border-white/10 shadow-lg backdrop-blur-xl">
                    <p className="text-[20px] tracking-[0.35em] uppercase text-blue-200/80">Hallazgos</p>
                    <p className="text-[16px] font-semibold text-white mt-1.5 leading-tight">{primaryHighlight}</p>
                    {secondaryHighlight && <p className="text-[14px] text-gray-300 mt-1">{secondaryHighlight}</p>}
>>>>>>> dev
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
