import React, { useMemo } from 'react';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { slugify } from '@/lib/utils.js';

const resolveStorageUrl = (storagePath) => {
  if (!storagePath) return null;
  if (/^(https?:|data:|blob:)/i.test(storagePath)) return storagePath;
  if (!supabase) return null;
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

function SimpleMarkdown({ text = '' }) {
  // Minimal markdown: converts blank-line separated paragraphs and code blocks ```
  const lines = String(text || '').split(/\r?\n/);
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      i++;
      const code = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) { code.push(lines[i]); i++; }
      if (i < lines.length) i++; // skip closing ```
      elements.push(<pre key={elements.length} className="bg-black/30 rounded p-3 overflow-x-auto text-sm"><code className={`language-${lang}`}>{code.join('\n')}</code></pre>);
      continue;
    }
    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '') { para.push(lines[i]); i++; }
    // skip empty line
    while (i < lines.length && lines[i].trim() === '') i++;
    const textPara = para.join('\n');
    elements.push(<p key={elements.length} className="text-gray-300 leading-relaxed">{textPara}</p>);
  }
  return <div className="space-y-4">{elements}</div>;
}

export default function BlogPost({ slug }) {
  const { content } = useContent();
  const posts = Array.isArray(content?.blogPosts) ? content.blogPosts : [];
  const normalizedSlug = decodeURIComponent(slug || '').toLowerCase();
  const post = useMemo(() => posts.find(p => (p.slug || slugify(p.title)).toLowerCase() === normalizedSlug), [posts, normalizedSlug]);

  if (!post) {
    return (
      <section className="py-20 relative overflow-hidden scroll-mt-40">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Entrada no encontrada</h1>
            <p className="text-lg text-gray-300 mb-8">Verifica el enlace o regresa al blog.</p>
            <button onClick={()=>{ window.location.hash = '#/blog'; }} className="px-4 py-2 rounded border border-blue-500 text-blue-300 hover:text-white hover:bg-blue-500/10">Volver al Blog</button>
          </div>
        </div>
      </section>
    );
  }

  const cover = resolveStorageUrl(post.cover_image_path);

  return (
    <section className="py-20 relative overflow-hidden scroll-mt-40">
      <div className="container mx-auto px-6 max-w-3xl">
        <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-white">{post.title}</h1>
        {post.excerpt && <p className="text-lg text-gray-300 mb-6">{post.excerpt}</p>}
        {cover && <img src={cover} alt={post.title} className="w-full rounded-2xl border border-white/10 mb-8" />}
        <SimpleMarkdown text={post.content_md || ''} />
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex gap-2 mt-8 flex-wrap">
            {post.tags.map((t, i) => <span key={i} className="text-xs bg-white/10 text-gray-200 px-2 py-0.5 rounded">{t}</span>)}
          </div>
        )}
      </div>
    </section>
  );
}

