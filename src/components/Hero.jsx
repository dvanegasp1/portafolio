import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient.js';
import { useContent } from '@/content/ContentContext.jsx';
import { Button } from '@/components/ui/button';

const iconMap = { Users, Target };

export default function Hero() {
  const { content } = useContent();

  const scrollTo = (selector) => {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const badge = content.hero?.badge || content.role || 'Data Analytics';
  const title = content.hero?.title || 'Turning Data Into Decisions';
  const subtitle = content.hero?.subtitle || 'Clean data, clear dashboards, and compelling stories.';
  const primaryHref = content.hero?.primaryCta?.href || '#projects';
  const primaryLabel = content.hero?.primaryCta?.label || 'View Projects';
  const secondaryHref = content.hero?.secondaryCta?.href || '#contact';
  const secondaryLabel = content.hero?.secondaryCta?.label || 'Contact Me';
  const heroImage = content.hero?.image_path && supabase
    ? supabase.storage.from('portfolio-assets').getPublicUrl(content.hero.image_path).data.publicUrl
    : 'https://images.unsplash.com/photo-1552581234-26160f608093';

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background circles */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content wired to Supabase */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-500/30 mb-6">
              <span className="text-sm font-medium text-blue-300">{badge}</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text block">{title}</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={() => scrollTo(primaryHref)} size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-semibold text-lg pulse-glow group">
                {primaryLabel}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button onClick={() => scrollTo(secondaryHref)} variant="outline" size="lg" className="border-2 border-blue-500 text-blue-300 hover:bg-blue-500/10 px-8 py-4 rounded-full font-semibold text-lg">
                {secondaryLabel}
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-blue-500/30" />
          </motion.div>

          {/* Right visual with overlay cards (wired to whyUs) */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative">
            <img className="w-full h-auto rounded-2xl shadow-2xl" alt="Hero" src={heroImage} />
            {/* Top-left overlay */}
            {(() => { const Icon = iconMap[content.whyUs?.[0]?.icon] || Users; return (
            <div className="absolute -top-6 -left-6 w-64">
              <div className="glass-effect rounded-2xl p-4 border border-white/10 shadow-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
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
            {/* Bottom-right overlay */}
            {(() => { const Icon = iconMap[content.whyUs?.[1]?.icon] || Target; return (
            <div className="absolute -bottom-6 -right-6 w-72">
              <div className="glass-effect rounded-2xl p-4 border border-white/10 shadow-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mr-3">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
