import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp } from 'lucide-react';
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

const Testimonials = () => {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const testimonials = Array.isArray(content?.testimonials) ? content.testimonials : [];

  if (!loading && testimonials.length === 0) {
    return null;
  }

  const cards = loading ? new Array(3).fill(null) : testimonials;

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-full border border-red-500/30 mb-6">
            <Star className="w-4 h-4 mr-2 text-red-400" />
            <span className="text-sm font-medium text-red-300">Testimonios</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            {loading ? <SkeletonBlock className="h-10 w-2/3 mx-auto" /> : content?.testimonialsHeading || content?.siteName}
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {loading ? <SkeletonBlock className="h-5 w-full" /> : content?.testimonialsSubheading || ''}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((testimonial, index) => (
            <motion.div
              key={testimonial?.id || testimonial?.name || index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="glass-effect rounded-2xl p-8 h-full border border-white/10 hover:border-white/20 transition-all relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                <div className="flex items-center mb-4">
                  {loading
                    ? <SkeletonBlock className="h-5 w-24" />
                    : [...Array(Math.max(0, Math.min(5, Number(testimonial?.rating) || 0)))].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed italic min-h-[4rem]">
                  {loading ? <SkeletonBlock className="h-4 w-full" /> : testimonial?.text}
                </p>

                <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 mb-6">
                  {loading ? (
                    <SkeletonBlock className="h-4 w-24" />
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                      <span className="text-sm font-medium text-green-300">{testimonial?.result}</span>
                    </>
                  )}
                </div>

                <div className="border-t border-white/10 pt-6 flex items-center">
                  {loading ? (
                    <SkeletonBlock className="w-12 h-12 rounded-full mr-4" />
                  ) : (
                    (() => {
                      const avatar = resolveStorageUrl(testimonial?.avatar_path);
                      if (avatar) {
                        return (
                          <img
                            className="w-12 h-12 rounded-full object-cover mr-4"
                            alt={testimonial?.name || 'Cliente'}
                            src={avatar}
                          />
                        );
                      }
                      return (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold mr-4">
                          {(testimonial?.name || '').slice(0, 2).toUpperCase()}
                        </div>
                      );
                    })()
                  )}

                  <div>
                    {loading ? (
                      <SkeletonBlock className="h-4 w-28" />
                    ) : (
                      <h4 className="font-semibold text-white">{testimonial?.name}</h4>
                    )}
                    {loading ? (
                      <SkeletonBlock className="h-3 w-20 mt-2" />
                    ) : (
                      <p className="text-sm text-purple-300">{testimonial?.position}</p>
                    )}
                    {!loading && testimonial?.company && (
                      <p className="text-sm text-gray-400">{testimonial.company}</p>
                    )}
                  </div>
                </div>

                {!loading && testimonial?.industry && (
                  <div className="mt-3">
                    <span className="text-xs text-red-300 bg-red-500/10 rounded-full px-3 py-1">
                      {testimonial.industry}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
