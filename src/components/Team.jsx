import React from 'react';
import { motion } from 'framer-motion';
import { Users, Linkedin, Mail, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
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

const initialsFor = (name = '') =>
  name
    .split(' ')
    .map((part) => part.trim()[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Team = () => {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const teamMembers = Array.isArray(content?.teamMembers) ? content.teamMembers : [];

  const handleContactMember = (memberName) => {
    toast({
      title: 'Funcionalidad no disponible',
      description: `Configura enlaces de contacto para ${memberName} en el panel de admin.`,
    });
  };

  if (!loading && teamMembers.length === 0) {
    return null;
  }

  const cards = loading ? new Array(4).fill(null) : teamMembers;

  return (
    <section id="team" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-500/30 mb-6">
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Equipo</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            {loading ? <SkeletonBlock className="h-10 w-2/3 mx-auto" /> : content?.teamHeading || content?.siteName}
          </h2>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {loading ? <SkeletonBlock className="h-5 w-full" /> : content?.teamSubheading || ''}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {cards.map((member, index) => (
            <motion.div
              key={member?.id || member?.name || index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="glass-effect rounded-2xl p-6 h-full hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20">
                <div className="relative mb-6 flex justify-center">
                  {loading ? (
                    <SkeletonBlock className="w-24 h-24 rounded-full" />
                  ) : (
                    (() => {
                      const avatar = resolveStorageUrl(member?.avatar_path);
                      if (avatar) {
                        return (
                          <img
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/40"
                            alt={member?.name || 'Miembro del equipo'}
                            src={avatar}
                          />
                        );
                      }
                      return (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-semibold">
                          {initialsFor(member?.name)}
                        </div>
                      );
                    })()
                  )}
                  {!loading && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center space-y-3">
                  {loading ? (
                    <SkeletonBlock className="h-5 w-32 mx-auto" />
                  ) : (
                    <h3 className="text-xl font-bold text-white">{member?.name}</h3>
                  )}

                  {loading ? (
                    <SkeletonBlock className="h-4 w-28 mx-auto" />
                  ) : (
                    <p className="text-blue-300 font-medium">{member?.position}</p>
                  )}

                  <div className="text-sm text-gray-400 mb-2">
                    {loading ? (
                      <SkeletonBlock className="h-4 w-24 mx-auto" />
                    ) : (
                      <>
                        {member?.specialization && <div>{member.specialization}</div>}
                        {member?.experience && <div>{member.experience}</div>}
                      </>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed min-h-[3rem]">
                    {loading ? <SkeletonBlock className="h-4 w-full" /> : member?.description}
                  </p>

                  <div className="space-y-1 mb-6">
                    {loading
                      ? [0, 1, 2].map((s) => <SkeletonBlock key={s} className="h-4 w-24 mx-auto" />)
                      : (member?.achievements || []).map((achievement, idx) => (
                          <div key={idx} className="text-xs text-blue-300 bg-blue-500/10 rounded-full px-3 py-1 inline-block mr-1 mb-1">
                            {achievement}
                          </div>
                        ))}
                  </div>

                  {!loading && (
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={() => handleContactMember(member?.name || 'miembro')}
                        size="sm"
                        variant="ghost"
                        className="text-blue-300 hover:text-white hover:bg-blue-600/20 p-2"
                      >
                        <Linkedin className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleContactMember(member?.name || 'miembro')}
                        size="sm"
                        variant="ghost"
                        className="text-blue-300 hover:text-white hover:bg-blue-600/20 p-2"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
