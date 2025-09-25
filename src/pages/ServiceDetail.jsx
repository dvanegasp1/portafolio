import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { slugify } from '@/lib/utils.js';
import { Button } from '@/components/ui/button';

const resolveStorageUrl = (storagePath) => {
  if (!storagePath) return null;
  if (/^(https?:|data:|blob:)/i.test(storagePath)) return storagePath;
  if (!supabase) return null;
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

export default function ServiceDetail({ slug }) {
  const { content } = useContent();
  const services = Array.isArray(content?.services) ? content.services : [];
  const normalizedSlug = decodeURIComponent(slug || '').toLowerCase();

  const service = useMemo(() => {
    return services.find((svc, index) => {
      const key = (svc?.slug || slugify(svc?.title || `service-${index + 1}`)).toLowerCase();
      return key === normalizedSlug;
    });
  }, [services, normalizedSlug]);

  const goBack = () => {
    window.location.hash = '#services';
  };

  const goToContact = () => {
    window.location.hash = '#contact';
  };

  if (!service) {
    return (
      <section className="py-20 relative overflow-hidden scroll-mt-40">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">Servicio no encontrado</h1>
            <p className="text-lg text-gray-300 mb-8">
              No pudimos encontrar la informacion solicitada. Regresa al catalogo para explorar otros servicios.
            </p>
            <Button onClick={goBack} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              Volver a servicios
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const longCopy = service.long_description || service.description || '';
  const paragraphs = longCopy
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const highlights = Array.isArray(service.highlights) ? service.highlights : [];
  const thumbnail = resolveStorageUrl(service.icon_path);

  return (
    <section className="py-20 relative overflow-hidden scroll-mt-40">
      <div className="container mx-auto px-6">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Button onClick={goBack} variant="ghost" className="text-blue-300 hover:text-white hover:bg-blue-600/20">
            <ArrowLeft className="mr-2 w-4 h-4" /> Volver a servicios
          </Button>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-12 items-start">
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white">{service.title}</h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">{service.description}</p>
            </motion.div>

            <div className="space-y-6 text-gray-300 leading-relaxed">
              {paragraphs.length > 0 ? (
                paragraphs.map((paragraph, index) => (
                  <motion.p key={index} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    {paragraph}
                  </motion.p>
                ))
              ) : (
                <p>Agrega mas detalles del servicio en Supabase usando el campo long_description para mostrar informacion ampliada aqui.</p>
              )}
            </div>

            {highlights.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-semibold text-white mb-4">Lo que incluye</h2>
                <ul className="space-y-3 text-gray-300">
                  {highlights.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1 block h-2 w-2 rounded-full bg-blue-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-12 flex flex-wrap gap-4">
              <Button onClick={goToContact} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                Solicitar este servicio
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button onClick={goBack} variant="outline" className="border-blue-500 text-blue-300 hover:text-white hover:bg-blue-500/10">
                Ver otros servicios
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-effect rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {thumbnail ? (
                  <img src={thumbnail} alt={service.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold text-white">{service.title?.[0] || '?'}</span>
                )}
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <span className="text-xs uppercase tracking-[0.35em] text-blue-200/70 block mb-1">Resumen</span>
                <span>Amplia este panel con entregables, herramientas y procesos para este servicio desde Supabase.</span>
              </div>
              <div className="pt-3 border-t border-white/10 text-xs text-gray-500">
                Personaliza highlights con una lista (array) o lineas separadas por saltos en la columna highlights.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

