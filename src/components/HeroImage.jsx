import React from 'react';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';

const resolveStorageUrl = (storagePath) => {
  if (!storagePath) return null;
  if (/^(https?:|data:|blob:)/i.test(storagePath)) return storagePath;
  if (!supabase) return null;
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

const HeroImage = () => {
  const { content } = useContent();
  const heroImage = resolveStorageUrl(content?.hero?.image_path);
  if (!heroImage) {
    return null;
  }
  return (
    <div className="flex justify-center items-center">
      <img
        src={heroImage}
        alt={content?.hero?.title || 'Hero image'}
        className="rounded-2xl shadow-2xl object-cover"
      />
    </div>
  );
};

export default HeroImage;
