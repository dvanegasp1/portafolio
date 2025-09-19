import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContent } from '@/content/ContentContext.jsx';

export default function Projects() {
  const { content } = useContent();
  const projects = content.projects || [];

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
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-500/30 mb-6">
            <span className="text-sm font-medium text-blue-300">Projects</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Selected
            <span className="gradient-text block">Case Studies</span>
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A few highlights showing how I turn data into clear business outcomes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p, i) => (
            <motion.div
              key={p.title + i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <div className="glass-effect rounded-2xl p-6 h-full border border-white/10 hover:border-white/20 transition-all">
                <h3 className="text-2xl font-bold text-white mb-3">{p.title}</h3>
                <p className="text-gray-300 mb-4">{p.description}</p>
                <div className="mb-6">
                  {p.tags?.map((t) => (
                    <span key={t} className="text-xs text-blue-300 bg-blue-500/10 rounded-full px-3 py-1 inline-block mr-2 mb-2">
                      {t}
                    </span>
                  ))}
                </div>
                {p.link && (
                  <Button asChild variant="ghost" className="text-blue-300 hover:text-white hover:bg-blue-600/20">
                    <a href={p.link}>
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 inline" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
