import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Projects from '@/components/Projects';
import About from '@/components/About';
import Team from '@/components/Team';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { ContentProvider, useContent } from '@/content/ContentContext.jsx';
import AdminPanel from '@/components/AdminPanel.jsx';
import SimplePage from '@/pages/SimplePage.jsx';

function AppInner() {
  const { content } = useContent();
  const getHash = () => (typeof window !== 'undefined' ? window.location.hash : '');
  const [hash, setHash] = useState(getHash());
  const isAdmin = hash === '#admin';

  useEffect(() => {
    const onHash = () => setHash(window.location.hash || '');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const route = useMemo(() => {
    if (isAdmin) return 'admin';
    if (hash.startsWith('#/')) return hash.slice(2); // e.g. services, projects
    return 'home';
  }, [hash, isAdmin]);

  // Smooth-scroll to anchors when hash is a section id (e.g. #services)
  useEffect(() => {
    if (!hash || hash.startsWith('#/')) return;
    const id = hash;
    // Defer to ensure home sections are mounted
    const t = setTimeout(() => {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <>
      <Helmet>
        <title>{content.seo.title}</title>
        <meta name="description" content={content.seo.description} />
      </Helmet>
      {isAdmin && <AdminPanel />}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <Header />
        {route === 'home' && (
          <>
            <Hero />
            <About />
            {content.visibility.services && <Services />}
            {content.visibility.projects && <Projects />}
            {content.visibility.team && <Team />}
            {content.visibility.testimonials && <Testimonials />}
            <Contact />
          </>
        )}

        {route === 'services' && <Services />}
        {route === 'projects' && <Projects />}
        {route === 'about' && <About />}
        {route === 'blog' && (
          <SimplePage title="Blog" subtitle="Notas y aprendizajes sobre análisis de datos.">
            <p>Próximamente: artículos sobre BI, modelado de datos, visualización, y automatización.</p>
          </SimplePage>
        )}
        {route === 'careers' && (
          <SimplePage title="Carreras" subtitle="Colaboraciones y oportunidades de proyecto.">
            <p>¿Tienes un reto de datos? Escríbeme en la sección de contacto con detalles de objetivos y plazos.</p>
          </SimplePage>
        )}
        {route === 'resources' && (
          <SimplePage title="Recursos Gratuitos" subtitle="Plantillas, snippets y guías rápidas de analítica.">
            <ul>
              <li>Checklist de calidad de datos</li>
              <li>Guía de KPIs para e‑commerce</li>
              <li>Snippet SQL de cohorts</li>
            </ul>
          </SimplePage>
        )}
        {route === 'webinars' && (
          <SimplePage title="Webinars">
            <p>Agenda de sesiones en vivo sobre dashboards, ETL y storytelling con datos. Próximamente.</p>
          </SimplePage>
        )}
        {route === 'whitepapers' && (
          <SimplePage title="Whitepapers">
            <p>Documentos técnicos con metodologías y casos de estudio. Próximamente.</p>
          </SimplePage>
        )}
        {route === 'newsletter' && (
          <SimplePage title="Newsletter" subtitle="Recibe ideas útiles de analítica en tu correo.">
            <p>Suscripción próximamente. Mientras tanto, usa el formulario de contacto para solicitarla.</p>
          </SimplePage>
        )}
        {route === 'help' && (
          <SimplePage title="Centro de Ayuda">
            <p>¿Dudas sobre el portfolio o servicios? Envíame un mensaje desde Contacto y te respondo en 24h.</p>
          </SimplePage>
        )}

        <Footer />
        <Toaster />
      </div>
    </>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <AppInner />
    </ContentProvider>
  );
}
