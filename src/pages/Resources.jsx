import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, FileText, Layers } from 'lucide-react';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';

const resolveStorageUrl = (storagePath) => {
  if (!storagePath) return null;
  if (/^(https?:|data:|blob:)/i.test(storagePath)) return storagePath;
  if (!supabase) return null;
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

const typeLabel = {
  articulo: 'Artículo',
  publicacion: 'Publicación',
  caso: 'Caso de Estudio',
};

const typeIcon = {
  articulo: BookOpen,
  publicacion: FileText,
  caso: Layers,
};

export default function Resources({ filter = null } = {}) {
  const { content } = useContent();
  const posts = Array.isArray(content?.blogPosts) ? content.blogPosts : [];

  const resources = useMemo(
    () =>
      posts
        .filter((p) => p.published && p.resource_type && (!filter || p.resource_type === filter))
        .map((p) => ({
          ...p,
          cover: resolveStorageUrl(p.cover_image_path),
        })),
    [posts, filter],
  );

  return (
    <section className="py-20 relative overflow-hidden scroll-mt-40">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-4xl lg:text-6xl font-bold mb-2 text-white">
            {filter ? (typeLabel[filter] || 'Recursos') : 'Recursos'}
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            {filter
              ? `Explora ${String(typeLabel[filter] || 'recursos').toLowerCase()} publicados.`
              : 'Artículos, publicaciones y casos de estudio destacados.'}
          </p>
        </div>

        {resources.length === 0 && <p className="text-gray-400">Aún no hay recursos publicados.</p>}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((p, i) => {
            const Icon = typeIcon[p.resource_type] || FileText;
            return (
              <motion.article
                key={p.slug || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="glass-effect rounded-2xl p-4 border border-white/10 hover:border-blue-500/40 flex flex-col h-full"
              >
                {p.cover && <img src={p.cover} alt={p.cover_alt || p.title} className="w-full h-32 object-cover rounded-xl mb-3" />}
                <div className="flex items-center gap-2 text-xs text-blue-200 mb-2">
                  <Icon className="w-4 h-4" />
                  <span>{typeLabel[p.resource_type] || 'Recurso'}</span>
                </div>
                <h3 className="text-xl font-semibold text-white">{p.title}</h3>
                <p className="text-gray-300 mt-2 flex-1">{p.excerpt}</p>
                <button
                  onClick={() => {
                    window.location.hash = `#/blog/${encodeURIComponent(p.slug)}`;
                  }}
                  className="mt-4 text-blue-300 hover:text-white inline-flex items-center gap-2"
                >
                  Ver detalle <ArrowRight className="w-4 h-4" />
                </button>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
