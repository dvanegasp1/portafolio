import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Brain, Settings, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/content/ContentContext.jsx';

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded bg-white/10 ${className}`} />
);

export default function Projects() {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const projects = Array.isArray(content?.projects) ? content.projects : [
    {
      title: "Visualización de Cultura Institucional",
      description: "Dashboard interactivo para medir indicadores de gestión del conocimiento en la Policía Nacional.",
      icon: "BarChart3",
      tags: ["Power BI", "Dashboard", "Gestión del Conocimiento"]
    },
    {
      title: "Modelo Predictivo de Riesgos Ocupacionales",
      description: "Algoritmo en Python para anticipar riesgos laborales y optimizar la seguridad institucional.",
      icon: "Brain",
      tags: ["Python", "Machine Learning", "Seguridad Laboral"]
    },
    {
      title: "Pipeline ETL Automatizado",
      description: "Integración de datos con KNIME y SQL para mantener información actualizada y confiable.",
      icon: "Settings",
      tags: ["KNIME", "SQL", "ETL", "Automatización"]
    },
    {
      title: "Artículo: Rutas de Carrera en la Policía Nacional",
      description: "Investigación publicada en Revista Logos sobre diseño de trayectorias profesionales usando teoría de grafos.",
      icon: "FileText",
      tags: ["Investigación", "Teoría de Grafos", "Carrera Profesional"]
    }
  ];
  const heading = content?.projectsHeading || "Proyectos Destacados" || '';
  const subheading = content?.projectsSubheading || "Soluciones en analítica de datos, automatización y gestión estratégica." || '';
  const badgeText = content?.hero?.badge || "Proyectos" || '';

  if (!loading && projects.length === 0) {
    return null;
  }

  const cards = loading ? new Array(3).fill(null) : projects;

  return (
    <section id="projects" className="py-20 relative overflow-hidden scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {(loading || badgeText) && (
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-500/30 mb-6">
              {loading ? <SkeletonBlock className="h-4 w-24 mx-auto" /> : <span className="text-sm font-medium text-blue-300">{badgeText}</span>}
            </div>
          )}

          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            {loading ? <SkeletonBlock className="h-10 w-2/3 mx-auto" /> : heading}
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {loading ? <SkeletonBlock className="h-5 w-full" /> : subheading}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((project, i) => (
            <motion.div
              key={project?.title || i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="glass-effect rounded-2xl p-6 h-full border border-white/10 hover:border-white/20 hover:shadow-2xl hover:bg-white/5 transition-all duration-300">
                {loading ? (
                  <>
                    <SkeletonBlock className="h-6 w-40 mb-4" />
                    <SkeletonBlock className="h-4 w-full mb-4" />
                    <SkeletonBlock className="h-4 w-5/6 mb-4" />
                    <div className="flex gap-2 flex-wrap">
                      <SkeletonBlock className="h-4 w-20" />
                      <SkeletonBlock className="h-4 w-16" />
                      <SkeletonBlock className="h-4 w-24" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      {project.icon && (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                          {project.icon === 'BarChart3' && <BarChart3 className="w-5 h-5 text-white" />}
                          {project.icon === 'Brain' && <Brain className="w-5 h-5 text-white" />}
                          {project.icon === 'Settings' && <Settings className="w-5 h-5 text-white" />}
                          {project.icon === 'FileText' && <FileText className="w-5 h-5 text-white" />}
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    </div>
                    <p className="text-gray-300 mb-4">{project.description}</p>
                    <div className="mb-6">
                      {project.tags?.map((t) => (
                        <span key={t} className="text-xs text-blue-300 bg-blue-500/10 rounded-full px-3 py-1 inline-block mr-2 mb-2">
                          {t}
                        </span>
                      ))}
                    </div>
                    {project.link && (
                      <Button asChild variant="ghost" className="text-blue-300 hover:text-white hover:bg-blue-600/20">
                        <a href={project.link}>
                          Ver detalle
                          <ArrowRight className="ml-2 w-4 h-4 inline" />
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
