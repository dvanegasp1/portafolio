import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';

const TimelineItem = ({ left, item, index }) => {
  const { institution, program, company, role, location, start, end, description, achievements, icon_path } = item;
  const title = institution || company || '';
  const subtitle = program || role || '';

  let iconUrl = null;
  if (icon_path) {
    iconUrl = /^(https?:|data:|blob:)/i.test(icon_path)
      ? icon_path
      : (supabase ? supabase.storage.from('portfolio-assets').getPublicUrl(icon_path).data.publicUrl : icon_path);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.03 }}
      viewport={{ once: true }}
      className={`relative flex ${left ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="flex-1" />
      <div className="w-10 flex items-start justify-center">
        <div className="w-4 bg-white/20 rounded" style={{ minHeight: 24 }} />
      </div>
      <div className="flex-1">
        <div className="glass-effect rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white/10 border border-white/10 shrink-0">
              {iconUrl ? (
                <img src={iconUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">Sin icono</div>
              )}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">{title}</div>
              <div className="text-purple-200/80">{subtitle}</div>
              <div className="text-xs text-gray-300 mt-1">{location ? `${location} - ` : ''}{start}{end ? ` - ${end}` : ''}</div>
            </div>
          </div>
          {description && (<p className="text-gray-300 mt-3">{description}</p>)}
          {Array.isArray(achievements) && achievements.length > 0 && (
            <ul className="list-disc list-inside text-gray-300 mt-3 space-y-1">
              {achievements.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const parseDateValue = (value) => {
  if (!value) return -Infinity;
  const str = String(value).trim();
  if (/actual|curso/i.test(str)) return Number.MAX_SAFE_INTEGER;
  const digits = str.replace(/[^0-9]/g, '');
  if (!digits) return -Infinity;
  return Number(digits.padEnd(8, '0'));
};

const sortEntries = (list) =>
  (Array.isArray(list) ? list : [])
    .map((entry, idx) => ({
      entry,
      idx,
      key: parseDateValue(entry?.end) !== -Infinity ? parseDateValue(entry?.end) : parseDateValue(entry?.start),
    }))
    .sort((a, b) => b.key - a.key)
    .map((item) => item.entry);

export default function Resume() {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const show = content?.visibility?.resume !== false;
  const education = sortEntries(content?.education);
  const experience = sortEntries(content?.experience);
  const summary = typeof content?.resumeSummary === 'string' ? content.resumeSummary.trim() : '';

  if (!show) return null;

  const hasAny = loading || education.length || experience.length;
  if (!hasAny) return null;

  return (
    <section id="resume" className="relative z-20 overflow-hidden scroll-mt-40 pt-6 pb-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
            <span className="text-sm font-medium text-purple-300">Trayectoria</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-2">Experiencia y estudio.</h2>
        </div>

        {/* Summary */}
        {summary && (
          <div className="max-w-3xl mx-auto text-gray-300 text-lg leading-relaxed mb-10">
            {summary}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-10">
            <div className="text-purple-200 uppercase tracking-wide text-sm mb-2">Formación</div>
            <h3 className="text-3xl font-semibold mb-6">Educación.</h3>
            <div className="space-y-6">
              {education.map((item, i) => (
                <TimelineItem key={`edu-${item?.institution || i}`} left={i % 2 === 0} item={item} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="relative">
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent mb-10 shadow-[0_0_24px_rgba(255,255,255,0.25)]" />
            <div className="text-purple-200 uppercase tracking-wide text-sm mb-2">Roles</div>
            <h3 className="text-3xl font-semibold mb-6">Experiencia.</h3>
            <div className="space-y-6">
              {experience.map((item, i) => (
                <TimelineItem key={`exp-${item?.company || i}`} left={i % 2 !== 0} item={item} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
