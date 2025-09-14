import React from 'react';
import { motion } from 'framer-motion';
import { Users, Linkedin, Mail, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Team = () => {
  const teamMembers = [
    {
      name: "María González",
      position: "CEO & Fundadora",
      specialization: "Estrategia Empresarial",
      experience: "15+ años",
      description: "Experta en transformación empresarial con MBA de Harvard. Ha liderado más de 200 proyectos de consultoría.",
      achievements: ["MBA Harvard", "Certificación PMP", "Speaker Internacional"]
    },
    {
      name: "Carlos Rodríguez",
      position: "Director de Transformación Digital",
      specialization: "Tecnología & Innovación",
      experience: "12+ años",
      description: "Especialista en digitalización empresarial y automatización de procesos con enfoque en IA y Machine Learning.",
      achievements: ["PhD en Informática", "Certificación AWS", "Experto en IA"]
    },
    {
      name: "Ana Martínez",
      position: "Directora de Operaciones",
      specialization: "Optimización de Procesos",
      experience: "10+ años",
      description: "Experta en Lean Six Sigma y mejora continua. Ha optimizado operaciones en más de 150 empresas.",
      achievements: ["Black Belt Six Sigma", "Certificación Lean", "Master en Operaciones"]
    },
    {
      name: "David López",
      position: "Director Financiero",
      specialization: "Análisis Financiero",
      experience: "14+ años",
      description: "CPA con especialización en reestructuración financiera y análisis de inversiones para empresas en crecimiento.",
      achievements: ["CPA Certificado", "Master en Finanzas", "Analista Senior"]
    }
  ];

  const handleContactMember = (memberName) => {
    toast({
      title: "🚧 Esta funcionalidad no está implementada aún",
      description: "¡Pero no te preocupes! Puedes solicitarla en tu próximo prompt! 🚀"
    });
  };

  return (
    <section id="team" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-6">
            <Users className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Nuestro Equipo</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Expertos que
            <span className="gradient-text block">Marcan la Diferencia</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nuestro equipo está formado por consultores de élite con experiencia 
            comprobada en las principales empresas del mundo.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="glass-effect rounded-2xl p-6 h-full hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <img 
                    className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-gradient-to-r from-purple-500 to-pink-500"
                    alt={`${member.name} - ${member.position} en Converse Advisory`}
                   src="https://images.unsplash.com/photo-1686434538579-4723a0cf2890" />
                  
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {member.name}
                  </h3>
                  
                  <p className="text-purple-300 font-medium mb-2">
                    {member.position}
                  </p>
                  
                  <div className="text-sm text-gray-400 mb-4">
                    <div>{member.specialization}</div>
                    <div>{member.experience}</div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {member.description}
                  </p>

                  {/* Achievements */}
                  <div className="space-y-1 mb-6">
                    {member.achievements.map((achievement, idx) => (
                      <div key={idx} className="text-xs text-purple-300 bg-purple-500/10 rounded-full px-3 py-1 inline-block mr-1 mb-1">
                        {achievement}
                      </div>
                    ))}
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex justify-center space-x-2">
                    <Button
                      onClick={() => handleContactMember(member.name)}
                      size="sm"
                      variant="ghost"
                      className="text-purple-300 hover:text-white hover:bg-purple-600/20 p-2"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleContactMember(member.name)}
                      size="sm"
                      variant="ghost"
                      className="text-purple-300 hover:text-white hover:bg-purple-600/20 p-2"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-effect rounded-2xl p-8 text-center"
        >
          <h3 className="text-3xl font-bold mb-6">
            Un Equipo de <span className="gradient-text">Clase Mundial</span>
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">50+</div>
              <div className="text-gray-400">Años de Experiencia Combinada</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">25+</div>
              <div className="text-gray-400">Certificaciones Profesionales</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">10+</div>
              <div className="text-gray-400">Industrias Especializadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-400">Compromiso con la Excelencia</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Team;