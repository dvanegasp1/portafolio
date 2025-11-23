import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Target, Code, Database, BarChart3, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient.js';
import { useContent } from '@/content/ContentContext.jsx';
import { Button } from '@/components/ui/button';

const iconMap = { Users, Target };

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

export default function Hero() {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const hero = content?.hero ?? {};
  const badge = hero.badge?.trim() || content?.role?.trim() || '';
  const title = hero.title?.trim() || content?.siteName?.trim() || '';
  const subtitle = hero.subtitle?.trim() || '';
  const primaryCta = hero.primaryCta;
  const secondaryCta = hero.secondaryCta;
  const heroImage = resolveStorageUrl(hero.image_path);
  const educationCards = Array.isArray(content?.education) ? content.education : [];
  const highlightCards = (() => {
    const primary = Array.isArray(content?.whyUs) && content.whyUs.length ? content.whyUs : educationCards;
    return Array.isArray(primary) ? primary.filter(Boolean) : [];
  })();

  const scrollTo = (selector) => {
    if (!selector || typeof window === 'undefined') return;
    const raw = String(selector).trim();
    if (raw.startsWith('#')) {
      const target = raw.replace(/^#+/, '').trim().toLowerCase();
      const normalized = '#' + target;
      const el = document.querySelector(normalized);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = normalized;
      }
      return;
    }
    window.open(raw, '_blank', 'noopener');
  };

  const renderCtaButton = (cta, type) => {
    if (!cta?.label) return null;
    const href = cta.href || '';
    const handleClick = () => scrollTo(href);
    if (type === 'primary') {
      return (
        <Button
          onClick={handleClick}
          size="lg"
          disabled={!href}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full font-semibold text-xl group"
        >
          {cta.label}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      );
    }
    return (
      <Button
        onClick={handleClick}
        variant="outline"
        size="lg"
        disabled={!href}
        className="border-2 border-blue-500 text-blue-300 hover:bg-blue-500/10 px-8 py-4 rounded-full font-semibold text-xl"
      >
        {cta.label}
      </Button>
    );
  };

  const renderWhyCard = (item, fallbackIcon, positionClass) => {
    if (loading) {
      return (
        <div className={`absolute ${positionClass || 'top-6 left-6'} w-[24rem] md:w-[28rem]`}>
          <div className="glass-effect rounded-2xl p-8 border border-white/10 shadow-xl">
            <div className="flex items-center space-x-4">
              <SkeletonBlock className="w-20 h-20" />
              <div className="flex-1 space-y-3">
                <SkeletonBlock className="h-6 w-56" />
                <SkeletonBlock className="h-4 w-40" />
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (!item) return null;
    if (item.icon_path) {
      // Display image for education icons
      const url = resolveStorageUrl(item.icon_path);
      if (url) {
        return (
          <div className={`absolute ${positionClass || 'top-6 left-6'} w-24 h-24 md:w-32 md:h-32`}>
            <img src={url} alt={item.institution || item.title} className="w-full h-full rounded-lg object-contain shadow-xl" />
          </div>
        );
      }
      return null;
    } else {
      // Use Lucide icon for whyUs
      const Icon = iconMap[item.icon] || fallbackIcon;
      return (
        <div className={`absolute ${positionClass || 'top-6 left-6'} w-[100rem] md:w-[100rem]`}>
          <div className="glass-effect rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center">
              <div className="w-16 h-16 md:w-40 md:h-40 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-4">
                <Icon className="w-100 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold leading-tight text-lg md:text-2xl">{item.title}</div>
                <div className="text-gray-300 text-md md:text-lg">{item.subtitle}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pb-16 md:pb-24">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 floating-animation" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {(loading || badge) && (
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-500/30 mb-6">
                {loading ? <SkeletonBlock className="h-4 w-24" /> : <span className="text-sm font-medium text-blue-300">{badge}</span>}
              </div>
            )}

            <h1 className="font-bold mb-6 leading-tight">
              {loading ? (
                <span className="block space-y-4">
                  <SkeletonBlock className="h-12 w-3/4 mx-auto lg:mx-0" />
                  <SkeletonBlock className="h-12 w-1/2 mx-auto lg:mx-0" />
                </span>
              ) : (
                <div className="gradient-text drop-shadow-lg">
                  {title.split('. ').map((part, index) => (
                    <span key={index} className={`block tracking-wide ${index === 0 ? 'text-4xl lg:text-6xl' : 'text-3xl lg:text-5xl'}`}>
                      {part}{index === 0 ? '.' : ''}
                    </span>
                  ))}
                </div>
              )}
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              {loading ? <SkeletonBlock className="h-5 w-full" /> : subtitle.split('. ').map((line, index) => <span key={index}>{line}{index === 0 ? '. ' : ''}{index === 0 ? <br /> : ''}</span>)}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {loading ? (
                <>
                  <SkeletonBlock className="h-50 w-40" />
                  <SkeletonBlock className="h-12 w-40" />
                </>
              ) : (
                <>
                  {renderCtaButton(primaryCta, 'primary')}
                  {renderCtaButton(secondaryCta, 'secondary')}
                </>
              )}
            </div>

            <div className="mt-8 text-center lg:text-left">
              <p className="text-lg text-gray-400">+5 años transformando datos en decisiones estratégicas</p>
              <div className="mt-4 flex justify-center lg:justify-start space-x-4">
                <Code className="w-8 h-8 text-blue-400" title="Python" />
                <Database className="w-8 h-8 text-blue-400" title="SQL" />
                <BarChart3 className="w-8 h-8 text-blue-400" title="Power BI" />
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-blue-500/30" />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative">
            {heroImage ? (
              <img className="w-full h-auto rounded-2xl shadow-2xl object-cover" alt="Imagen principal del sitio" src={heroImage} />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-900/60 to-cyan-900/40 border border-blue-500/20 shadow-2xl" />
            )}
            {renderWhyCard(highlightCards[0], Users, '-top-6 -left-6')}
            {renderWhyCard(highlightCards[1], Target, '-bottom-6 -right-6')}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
        onClick={() => scrollTo('#projects')}
      >
        <ChevronDown className="w-8 h-8 text-blue-300 animate-bounce" />
      </motion.div>
    </section>
  );
}
