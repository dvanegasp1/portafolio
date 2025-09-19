import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useContent } from '@/content/ContentContext.jsx';

export default function Contact() {
  const { content } = useContent();
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', service: '', message: '' });

  const services = ['Dashboarding & BI', 'Limpieza de Datos', 'Análisis & Insights', 'ETL / Automatización', 'Consulta General'];

  const contactInfo = [
    { icon: Mail, title: 'Email', details: content.contact.email, description: 'Respuesta en 24 horas' },
    { icon: Phone, title: 'Teléfono', details: '+1 (555) 123-4567', description: 'Lun - Vie, 9:00 - 18:00' },
    { icon: MapPin, title: 'Oficina Principal', details: content.contact.location, description: 'Cita previa requerida' },
    { icon: Clock, title: 'Horario', details: '9:00 - 18:00', description: 'Zona horaria CET' },
  ];

  const handleInputChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: 'Campos requeridos', description: 'Por favor completa nombre, email y mensaje.', variant: 'destructive' });
      return;
    }
    toast({ title: '¡Gracias!', description: 'Mensaje enviado. Te responderé pronto.' });
    setFormData({ name: '', email: '', company: '', phone: '', service: '', message: '' });
  };

  const handleScheduleCall = () => {
    const url = content.contact?.scheduleUrl;
    if (url) {
      window.open(url, '_blank', 'noopener');
    } else {
      toast({ title: 'Configura tu enlace', description: 'Agrega un Schedule URL en Admin > Contacto.' });
    }
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden scroll-mt-24">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} className="mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold">Solicita tu Consulta Gratuita</h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          {/* Left: form */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-effect rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">Nombre *</label>
                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" name="name" value={formData.name} onChange={handleInputChange} placeholder="Tu nombre completo" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Email *</label>
                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" name="email" value={formData.email} onChange={handleInputChange} placeholder="tu@email.com" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Empresa</label>
                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" name="company" value={formData.company} onChange={handleInputChange} placeholder="Nombre de tu empresa" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Teléfono</label>
                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 123-4567" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Servicio de Interés</label>
                <select className="w-full bg-transparent border border-white/20 rounded px-3 py-2" name="service" value={formData.service} onChange={handleInputChange}>
                  <option value="">Selecciona un servicio</option>
                  {services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Mensaje *</label>
                <textarea className="w-full bg-transparent border border-white/20 rounded px-3 py-2" rows={6} name="message" value={formData.message} onChange={handleInputChange} placeholder="Cuéntanos cómo podemos ayudarte..." />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  Enviar Mensaje
                  <Send className="w-4 h-4 ml-2" />
                </Button>
                <Button type="button" variant="outline" onClick={handleScheduleCall}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Llamada
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Right: info cards */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            {contactInfo.map((c) => (
              <div key={c.title} className="glass-effect rounded-2xl p-6 border border-white/10">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                    <c.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{c.title}</div>
                    <div className="text-gray-300">{c.details}</div>
                    <div className="text-gray-500 text-sm">{c.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
