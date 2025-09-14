import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Roberto Silva",
      position: "CEO",
      company: "TechCorp Solutions",
      rating: 5,
      text: "Converse Advisory transformó completamente nuestra empresa. En 6 meses aumentamos nuestros ingresos en un 150% y optimizamos todos nuestros procesos. Su enfoque estratégico es excepcional.",
      result: "+150% Ingresos",
      industry: "Tecnología"
    },
    {
      name: "Carmen Ruiz",
      position: "Directora General",
      company: "Innovate Manufacturing",
      rating: 5,
      text: "La transformación digital que implementaron nos posicionó como líderes en nuestra industria. Su equipo es profesional, eficiente y realmente entiende las necesidades del negocio.",
      result: "+200% Eficiencia",
      industry: "Manufactura"
    },
    {
      name: "Miguel Torres",
      position: "Fundador",
      company: "GrowthStart",
      rating: 5,
      text: "Desde startup hasta empresa consolidada en tiempo récord. Su metodología de crecimiento acelerado y su visión estratégica fueron clave para nuestro éxito. Altamente recomendados.",
      result: "10x Crecimiento",
      industry: "Startup"
    },
    {
      name: "Laura Mendoza",
      position: "VP Operaciones",
      company: "RetailMax",
      rating: 5,
      text: "La optimización de procesos que realizaron nos permitió reducir costos en un 40% mientras mejorábamos la calidad del servicio. Un equipo excepcional con resultados comprobados.",
      result: "-40% Costos",
      industry: "Retail"
    },
    {
      name: "Andrés Vega",
      position: "Director Financiero",
      company: "FinanceGroup",
      rating: 5,
      text: "Su análisis financiero y reestructuración nos salvó de una crisis y nos posicionó para un crecimiento sostenible. Profesionalismo y expertise de primer nivel.",
      result: "+300% ROI",
      industry: "Finanzas"
    },
    {
      name: "Patricia Morales",
      position: "CEO",
      company: "HealthTech Innovations",
      rating: 5,
      text: "La consultoría en innovación empresarial nos ayudó a desarrollar 3 nuevos productos que revolucionaron nuestro mercado. Su visión futurista es impresionante.",
      result: "3 Productos Nuevos",
      industry: "HealthTech"
    }
  ];

  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
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
            <Star className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Testimonios</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Historias de
            <span className="gradient-text block">Éxito Real</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubre cómo hemos transformado empresas de diferentes industrias 
            y los resultados extraordinarios que hemos logrado juntos.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border border-white/10 hover:border-white/20 relative">
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                {/* Result Badge */}
                <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 mb-6">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                  <span className="text-sm font-medium text-green-300">{testimonial.result}</span>
                </div>

                {/* Author Info */}
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center">
                    <img 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                      alt={`${testimonial.name} - ${testimonial.position} de ${testimonial.company}`}
                     src="https://images.unsplash.com/photo-1575383596664-30f4489f9786" />
                    
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-purple-300">{testimonial.position}</p>
                      <p className="text-sm text-gray-400">{testimonial.company}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-xs text-purple-300 bg-purple-500/10 rounded-full px-3 py-1">
                      {testimonial.industry}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="glass-effect rounded-2xl p-8 text-center"
        >
          <h3 className="text-3xl font-bold mb-8">
            Resultados que <span className="gradient-text">Hablan por Sí Solos</span>
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">98%</div>
              <div className="text-gray-400">Satisfacción del Cliente</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">2.5x</div>
              <div className="text-gray-400">ROI Promedio</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">6</div>
              <div className="text-gray-400">Meses Tiempo Promedio</div>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-400">Proyectos Exitosos</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;