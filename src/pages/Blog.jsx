import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';

const resolveStorageUrl = (storagePath) => {
  if (!storagePath) return null;
  if (/^(https?:|data:|blob:)/i.test(storagePath)) return storagePath;
  if (!supabase) return null;
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

export default function Blog() {
  const { content } = useContent();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        const email = data?.session?.user?.email;
        if (!email) return;
        const { data: row, error } = await supabase.from('app_admins').select('email').eq('email', email).maybeSingle();
        if (!cancelled) setIsAdmin(!!row && !error);
      } catch (_) {}
    })();
    return () => { cancelled = true; };
  }, []);

  const all = Array.isArray(content?.blogPosts) ? content.blogPosts : [];
  const posts = isAdmin ? all : all.filter(p => p.published);

  const openPost = (slug) => {
    window.location.hash = `#/blog/${encodeURIComponent(slug)}`;
  };

  return (
    <section className="py-20 relative overflow-hidden scroll-mt-40">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-white">Blog</h1>
          <p className="text-lg text-gray-300">Notas y aprendizajes sobre análisis de datos.</p>
        </div>

        {posts.length === 0 && (
          <p className="text-gray-400">Aún no hay artículos publicados.</p>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p, i) => (
            <motion.article key={p.slug || i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.03 }} className="glass-effect rounded-2xl p-4 border border-white/10 hover:border-blue-500/40">
              <button onClick={() => openPost(p.slug)} className="text-left w-full">
                {p.cover_image_path && (
                  <img src={resolveStorageUrl(p.cover_image_path)} alt={p.title} className="w-full h-40 object-cover rounded-xl mb-3" />
                )}
                <h3 className="text-xl font-semibold text-white">{p.title}</h3>
                <p className="text-gray-300 mt-2">{p.excerpt}</p>
                {Array.isArray(p.tags) && p.tags.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {p.tags.map((t, ti) => (
                      <span key={ti} className="text-xs bg-white/10 text-gray-200 px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                )}
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

