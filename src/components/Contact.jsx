import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Calendar, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useContent } from '@/content/ContentContext.jsx';

const SkeletonBlock = ({ className }) => (
  <div className={`animate-pulse rounded bg-white/10 ${className}`} />
);

export default function Contact() {
  const { content, supa } = useContent();
  const loading = supa.loading;
  const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', service: '', message: '' });
  const [errors, setErrors] = useState({});

  const headingText = content.contactHeading || content.siteName || '';
  const serviceOptions = (content.services || []).map((s) => s.title).filter(Boolean);
  const defaultDescription = content.contact?.note || '';

  const infoBlocks = [
    content.contact?.email ? { icon: Mail, title: 'Correo', details: content.contact.email, description: defaultDescription, link: `mailto:${content.contact.email}` } : null,
    content.contact?.phone ? { icon: Phone, title: 'Teléfono', details: content.contact.phone, description: content.contact?.hours || defaultDescription } : null,
    content.contact?.location ? { icon: MapPin, title: 'Ubicacion', details: content.contact.location, description: defaultDescription } : null,
    content.contact?.hours && !content.contact?.phone ? { icon: Clock, title: 'Horario', details: content.contact.hours, description: defaultDescription } : null,
    { icon: Linkedin, title: 'LinkedIn', details: 'Conecta conmigo', description: 'Perfil profesional', link: 'https://linkedin.com/in/tu-perfil' },
  ].filter(Boolean);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));

    // Real-time validation
    if (name === 'email' && value && !validateEmail(value)) {
      setErrors((p) => ({ ...p, email: 'Correo inválido' }));
    } else if (name === 'email') {
      setErrors((p) => ({ ...p, email: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'Correo es requerido';
    else if (!validateEmail(formData.email)) newErrors.email = 'Correo inválido';
    if (!formData.message.trim()) newErrors.message = 'Mensaje es requerido';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      toast({ title: '¡Gracias!', description: 'Mensaje enviado. Te responderé pronto.' });
      setFormData({ name: '', email: '', company: '', phone: '', service: '', message: '' });
      setErrors({});
    }
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
          {loading ? (
            <SkeletonBlock className="h-8 w-60" />
          ) : (
            <h2 className="text-3xl lg:text-4xl font-bold">{headingText}</h2>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-8">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-effect rounded-2xl p-8 bg-white/5">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">Nombre *</label>
                <input className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2" name="name" value={formData.name} onChange={handleInputChange} placeholder="Escribe tu nombre" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-300">Correo *</label>
                <input className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2" name="email" value={formData.email} onChange={handleInputChange} placeholder="tu@email.com" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-300">Empresa</label>
                <input className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2" name="company" value={formData.company} onChange={handleInputChange} placeholder="Nombre de tu empresa" />
              </div>
              <div>
                <label className="text-sm text-gray-300">Teléfono</label>
                <input className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+57 300 123 4567" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Servicio</label>
                <select className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2" name="service" value={formData.service} onChange={handleInputChange}>
                  <option value="">Selecciona un servicio</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-300">Mensaje *</label>
                <textarea className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2" rows={6} name="message" value={formData.message} onChange={handleInputChange} placeholder="Cuéntame cómo puedo ayudarte" />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
              </div>
              <div className="md:col-span-2 flex gap-4">
<<<<<<< HEAD
                <Button type="submit" className="bg-gradient-to-r from-red-600 to-rose-600 text-white">
=======
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Send className="w-4 h-4 mr-2" />
>>>>>>> dev
                  Enviar Mensaje
                </Button>
                <Button type="button" variant="outline" onClick={handleScheduleCall} className="border-2 border-blue-500 text-blue-300 hover:bg-blue-500/10 hover:border-blue-400 transition-all duration-300">
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Llamada
                </Button>
              </div>
            </form>
          </motion.div>

<<<<<<< HEAD
          {/* Right: info cards */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            {contactInfo.map((c) => (
              <div key={c.title} className="glass-effect rounded-2xl p-6 border border-white/10">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center mr-3">
                    <c.icon className="w-5 h-5 text-white" />
=======
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            {loading
              ? [0, 1, 2].map((i) => (
                  <div key={i} className="glass-effect rounded-2xl p-6 border border-white/10">
                    <SkeletonBlock className="h-6 w-40 mb-2" />
                    <SkeletonBlock className="h-4 w-32" />
>>>>>>> dev
                  </div>
                ))
              : infoBlocks.map((c) => (
                  <div key={c.title} className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                        <c.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{c.title}</div>
                        {c.link ? (
                          <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-blue-400 transition-colors">
                            {c.details}
                          </a>
                        ) : (
                          <div className="text-gray-300">{c.details}</div>
                        )}
                        {c.description && <div className="text-gray-500 text-sm">{c.description}</div>}
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
