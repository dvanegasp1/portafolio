import React, { useEffect, useState } from 'react';
import { useContent } from '@/content/ContentContext.jsx';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button.jsx';
import { toast } from '@/components/ui/use-toast.js';

const Field = ({ label, children }) => (
  <label className="block mb-3">
    <div className="text-sm text-gray-300 mb-1">{label}</div>
    {children}
  </label>
);

const resolveStorageUrl = (path) => {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (!supabase) return null;
  const { data } = supabase.storage.from('portfolio-assets').getPublicUrl(path);
  return data?.publicUrl || null;
};

export default function AdminPanel() {
  const { content, setContent, resetContent, saveToSupabase, supa } = useContent();
  const [draft, setDraft] = useState(content);
  const [tab, setTab] = useState('general');
  const [session, setSession] = useState(null);
  const [auth, setAuth] = useState({ email: '' });
  const [magicSentTo, setMagicSentTo] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroFile, setHeroFile] = useState(null);
  const [projectFiles, setProjectFiles] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [aboutFile, setAboutFile] = useState(null);
  const [serviceFiles, setServiceFiles] = useState({});
  const [testimonialFiles, setTestimonialFiles] = useState({});
  const [educationFiles, setEducationFiles] = useState([]);
  const [openService, setOpenService] = useState(null);
  const [showServiceNav, setShowServiceNav] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const servicesToRender = () => {
    if (openService === null) {
      return (draft.services || []).map((svc, idx) => ({ svc, idx }));
    }
    const svc = draft.services?.[openService];
    return svc ? [{ svc, idx: openService }] : [];
  };

  const parseDateValue = (value) => {
    if (!value) return -Infinity;
    const str = String(value).trim();
    if (/actual|curso/i.test(str)) return Number.MAX_SAFE_INTEGER;
    const digits = str.replace(/[^0-9]/g, '');
    if (!digits) return -Infinity;
    return Number(digits.padEnd(8, '0'));
  };

  const sortResumeEntries = (list) =>
    (Array.isArray(list) ? list : [])
      .map((entry, idx) => ({
        entry,
        idx,
        key: parseDateValue(entry?.end) !== -Infinity ? parseDateValue(entry?.end) : parseDateValue(entry?.start),
      }))
      .sort((a, b) => b.key - a.key);

  // Abrir el primer servicio por defecto
  useEffect(() => {
    if (openService === null && Array.isArray(draft.services) && draft.services.length > 0) {
      setOpenService(0);
    }
  }, [draft.services, openService]);

  useEffect(() => setDraft(content), [content]);

  useEffect(() => {
    if (!supabase) return;
    let sub = null;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
      sub = listener?.subscription ?? null;
    })();
    return () => { if (typeof sub?.unsubscribe === 'function') sub.unsubscribe(); };
  }, []);

  // Check admin status when session changes
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!supabase || !session?.user?.email) { if (!cancelled) setIsAdmin(false); return; }
      const email = session.user.email;
      const { data, error } = await supabase
        .from('app_admins')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      if (!cancelled) setIsAdmin(!!data && !error);
    };
    check();
    return () => { cancelled = true; };
  }, [session]);

  // (Legacy) save full draft – kept for reference; primary flow uses handleSaveScoped
  const save = () => {
    try {
      setContent(draft);
      if (supabase) {
        if (session && isAdmin) {
          saveToSupabase(draft).then(({ error }) => {
            if (error) {
              toast({ title: 'Guardado local', description: 'Sincronización con Supabase falló: ' + error.message, variant: 'default' });
            } else {
              toast({ title: 'Guardado', description: 'Cambios aplicados y sincronizados con Supabase.' });
            }
          });
        } else if (session && !isAdmin) {
          toast({ title: 'Guardado local', description: 'Tu sesión no pertenece al grupo Admin. Pide acceso para sincronizar.', variant: 'default' });
        } else {
          toast({ title: 'Guardado local', description: 'Inicia sesión para sincronizar con Supabase.', variant: 'default' });
        }
      } else {
        toast({ title: 'Guardado', description: 'Cambios aplicados localmente.' });
      }
    } catch (e) {
      console.error('Error al guardar cambios:', e);
      const desc = e?.message ? `No se pudieron guardar los cambios: ${e.message}` : 'No se pudieron guardar los cambios.';
      toast({ title: 'Error', description: desc, variant: 'destructive' });
    }
  };

  // Save current tab only: run uploads via handleSave, then scoped DB write
  const handleSaveScoped = async () => {
    if (isSaving) {
      toast({ title: 'Guardado en progreso', description: 'Por favor espera a que termine antes de guardar nuevamente.', variant: 'default' });
      return;
    }
    setIsSaving(true);
    try {
      const { errors } = await handleSave();
      if (errors && errors.length) {
        toast({ title: 'Error', description: errors.join(' | '), variant: 'destructive' });
        return;
      }
      if (supabase && session && isAdmin) {
        const scopesByTab = {
          general: ['site','seo','contact'],
          branding: ['site'],
          hero: ['hero'],
          about: ['about'],
          services: ['services'],
          projects: ['projects'],
          whyus: ['why_us'],
          visibility: ['visibility'],
          contact: ['contact'],
          resume: ['education','experience','visibility','resume'],
          blog: ['blog'],
        };
        const scopes = scopesByTab[tab] || ['all'];
        const { error } = await saveToSupabase(draft, scopes);
        if (error) {
          toast({ title: 'Sync parcial fall?', description: error.message || String(error), variant: 'destructive' });
        } else {
          toast({ title: 'Guardado', description: 'Se guard? solo la secci?n actual.' });
        }
      }
    } catch (e) {
      // already notified by inner calls
    } finally {
      setIsSaving(false);
    }
  };

  const onChange = (path, value) => {
    setDraft((d) => {
      const next = { ...d };
      const parts = path.split('.');
      let obj = next;
      while (parts.length > 1) {
        const p = parts.shift();
        obj[p] = obj[p] ?? {};
        obj = obj[p];
      }
      obj[parts[0]] = value;
      return next;
    });
  };

  // Upload hero/logo images (if selected) then save changes locally; return errors if any
  const handleSave = async () => {
    const errors = [];
    let next = draft;
    try {
      // Upload logo first so it?s available in the same save
      if (logoFile) {
        let setLocalUrl = false;
        if (supabase) {
          const key = `branding/logo/${Date.now()}-${logoFile.name}`.replace(/\s+/g, '-');
          const { error: upErr } = await supabase.storage.from('portfolio-assets').upload(key, logoFile, { upsert: true });
          if (upErr) {
            setLocalUrl = true;
            errors.push(upErr.message || 'No se pudo subir logo a Supabase');
            toast({ title: 'No se pudo subir a Supabase', description: upErr.message + '. Se usar?a vista local temporal.', variant: 'default' });
          } else {
            next = { ...next, branding: { ...(next.branding||{}), logo_path: key } };
            setDraft(next);
          }
        } else {
          setLocalUrl = true;
        }
        if (setLocalUrl) {
          const fileToDataUrl = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          try {
            const dataUrl = await fileToDataUrl(logoFile);
            next = { ...next, branding: { ...(next.branding||{}), logo_path: String(dataUrl) } };
            setDraft(next);
          } catch (err) {
            errors.push(err?.message || 'No se pudo generar vista local del logo');
          }
        }
        setLogoFile(null);
      }
      if (heroFile && supabase && session && isAdmin) {
        const key = `hero/${Date.now()}-${heroFile.name}`.replace(/\s+/g, '-');
        const { error: upErr } = await supabase.storage.from('portfolio-assets').upload(key, heroFile, { upsert: true });
        if (upErr) {
          errors.push(upErr.message || 'No se pudo subir hero');
          toast({ title: 'Error subiendo imagen', description: upErr.message, variant: 'destructive' });
        } else {
          next = { ...draft, hero: { ...draft.hero, image_path: key } };
          setDraft(next);
        }
        setHeroFile(null);
      }
      if (aboutFile && supabase && session && isAdmin) {
        const key = `about/${Date.now()}-${aboutFile.name}`.replace(/\s+/g, '-');
        const { error: upErr } = await supabase.storage.from('portfolio-assets').upload(key, aboutFile, { upsert: true });
        if (upErr) {
          errors.push(upErr.message || 'No se pudo subir about');
          toast({ title: 'Error subiendo imagen', description: upErr.message, variant: 'destructive' });
        } else {
          next = { ...draft, about: { ...draft.about, image_path: key } };
          setDraft(next);
        }
        setAboutFile(null);
      }
      if (Object.keys(serviceFiles).length > 0 && supabase && session && isAdmin) {
        for (const [idx, file] of Object.entries(serviceFiles)) {
          if (file) {
            const key = `services/icons/${Date.now()}-${file.name}`.replace(/\s+/g, '-');
            const { error: upErr } = await supabase.storage.from('portfolio-assets').upload(key, file, { upsert: true });
            if (upErr) {
              errors.push(upErr.message || 'No se pudo subir icono de servicio');
              toast({ title: 'Error subiendo imagen de icono', description: upErr.message, variant: 'destructive' });
            } else {
              const servicesSafe = Array.isArray(next.services) ? next.services : [];
              next = { ...next, services: servicesSafe.map((s, i) => i == idx ? { ...s, icon_path: key } : s) };
              setDraft(next);
            }
          }
        }
        setServiceFiles({});
      }
      if (educationFiles.length > 0 && supabase && session && isAdmin) {
        for (let idx = 0; idx < educationFiles.length; idx++) {
          const file = educationFiles[idx];
          if (file) {
            const key = `education/logos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const { error: upErr } = await supabase.storage.from('portfolio-assets').upload(key, file, { upsert: true });
            if (upErr) {
              errors.push(upErr.message || 'No se pudo subir logo de educación');
              toast({ title: 'Error subiendo logo', description: upErr.message, variant: 'destructive' });
            } else {
              const educationSafe = Array.isArray(next.education) ? next.education : [];
              next = { ...next, education: educationSafe.map((e, i) => i == idx ? { ...e, icon_path: key } : e) };
              setDraft(next);
            }
          }
        }
        setEducationFiles([]);
      }
      if (testimonialFiles && Object.keys(testimonialFiles).length > 0 && supabase && session && isAdmin) {
        for (const [idx, file] of Object.entries(testimonialFiles)) {
          if (file) {
            const key = `testimonials/avatars/${Date.now()}-${file.name}`.replace(/\s+/g, '-');
            const { error: upErr } = await supabase.storage.from('portfolio-assets').upload(key, file, { upsert: true });
            if (upErr) {
              errors.push(upErr.message || 'No se pudo subir avatar');
              toast({ title: 'Error subiendo avatar del testimonial', description: upErr.message, variant: 'destructive' });
            } else {
              const testimonialsSafe = Array.isArray(next.testimonials) ? next.testimonials : [];
              next = { ...next, testimonials: testimonialsSafe.map((t, i) => i == idx ? { ...t, avatar_path: key } : t) };
              setDraft(next);
            }
          }
        }
        setTestimonialFiles({});
      }
      setContent(next);
      if (!errors.length) {
        toast({ title: 'Cambios preparados', description: 'Los cambios se aplicaron localmente. Pulsa "Guardar" para sincronizar con Supabase.' });
      }
    } catch (e) {
      console.error('Error al guardar cambios:', e);
      errors.push(e?.message || 'Error desconocido al guardar');
    }
    return { errors };
  };



  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="glass-effect rounded-2xl p-0 border border-white/10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="bg-white/5 p-4 border-r border-white/10">
              <div className="text-sm uppercase tracking-wide text-gray-400 mb-3">Secciones</div>

              <button onClick={() => setTab('hero')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='hero'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Hero</button>
              <button onClick={() => setTab('about')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='about'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Sobre Mi</button>

              <div className="mb-1">
                <button
                  onClick={() => { setTab('services'); setShowServiceNav((v) => !v); }}
                  className={`w-full text-left px-3 py-2 rounded ${tab==='services'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                >
                  Servicios {showServiceNav ? '▾' : '▸'}
                </button>
                {showServiceNav && (
                  <div className="mt-1 ml-3 space-y-1">
                    {(draft.services || []).map((svc, i) => (
                      <button
                        key={`svc-nav-${i}-${svc.title || i}`}
                        onClick={() => { setTab('services'); setOpenService(i); }}
                        className={`block w-full text-left px-2 py-1 rounded text-sm ${openService===i ? 'bg-blue-600/20 text-white' : 'text-gray-400 hover:bg-white/10'}`}
                      >
                        {svc.title?.trim() || `Servicio ${i+1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setTab('experience')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='experience'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Experiencia</button>
              <button onClick={() => setTab('education')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='education'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Educación</button>
              <button onClick={() => setTab('contact')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='contact'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Contacto</button>
              <button onClick={() => setTab('projects')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='projects'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Proyectos</button>
              <button onClick={() => setTab('testimonials')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='testimonials'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Testimonios</button>
              <button onClick={() => setTab('general')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='general'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>General</button>
              <button onClick={() => setTab('branding')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='branding'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Branding</button>
              <button onClick={() => setTab('footer')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='footer'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Footer</button>
              <button onClick={() => setTab('visibility')} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab==='visibility'? 'bg-blue-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>Visibilidad</button>

              {/* Auth box */}
              <div className="mt-6 p-3 rounded bg-white/5 border border-white/10">
                <div className="text-xs text-gray-400 mb-2">Supabase</div>
                {!supabase && (
                  <div className="text-xs text-gray-400">No configurado. Añade VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.</div>
                )}
                {supabase && !session && (
                  <div className="space-y-2">
                    <input placeholder="Email" className="w-full bg-transparent border border-white/20 rounded px-2 py-1 text-sm" value={auth.email} onChange={(e)=>setAuth((a)=>({...a,email:e.target.value}))} />
                    <Button onClick={async()=>{
                      const redirectTo = (import.meta?.env?.VITE_SITE_URL || window.location.origin) + '/';
                      const { error } = await supabase.auth.signInWithOtp({
                        email: auth.email,
                        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
                      });
                      if (error) {
                        toast({ title:'No se pudo enviar el Magic Link', description:error.message, variant:'destructive' });
                      } else {
                        setMagicSentTo(auth.email);
                        toast({ title:'Magic Link enviado', description:`Revisa tu bandeja: ${auth.email}` });
                      }
                    }} className="w-full bg-blue-600 text-white">Enviar Magic Link</Button>
                    {magicSentTo && (
                      <div className="text-[11px] text-gray-400">Después de abrir el enlace desde tu correo, regresarás aquí automáticamente.</div>
                    )}
                  </div>
                )}
                {supabase && session && (
                  <div className="text-xs text-gray-300">
                    <div className="flex items-center justify-between gap-2">
                      <span>{session.user?.email}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${isAdmin ? 'bg-blue-600/30 text-blue-200' : 'bg-white/10 text-gray-300'}`}>
                        {isAdmin ? 'Admin' : 'No admin'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">Solo usuarios Admin pueden sincronizar con Supabase.</div>
                    <Button onClick={async()=>{ await supabase.auth.signOut(); }} variant="outline" className="w-full mt-2">Sign Out</Button>
                  </div>
                )}
              </div>
            </aside>

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Admin — Portfolio Settings</h2>

              {tab === 'hero' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Field label="Título Principal">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.title} onChange={(e)=>onChange('hero.title', e.target.value)} />
                      </Field>
                      <Field label="Subtítulo">
                        <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.subtitle} onChange={(e)=>onChange('hero.subtitle', e.target.value)} />
                      </Field>
                      <Field label="Badge">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.badge} onChange={(e)=>onChange('hero.badge', e.target.value)} />
                      </Field>
                    </div>
                    <div>
                      <Field label="Texto Descriptivo">
                        <textarea rows={4} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.description || ''} onChange={(e)=>onChange('hero.description', e.target.value)} />
                      </Field>
                      <Field label="Imagen Principal (sube para reemplazar)">
                        <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=>setHeroFile(e.target.files?.[0] || null)} />
                        {draft.hero?.image_path && (
                          <div className="mt-2 space-y-2 text-[11px] text-gray-400">
                            <div>Actual: {draft.hero.image_path}</div>
                            {resolveStorageUrl(draft.hero.image_path) ? (
                              <img src={resolveStorageUrl(draft.hero.image_path)} alt="Vista hero" className="w-36 h-24 object-cover rounded border border-white/10" />
                            ) : (
                              <div className="w-36 h-24 rounded border border-dashed border-white/20 flex items-center justify-center text-gray-500">Sin vista</div>
                            )}
                          </div>
                        )}
                      </Field>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Botón Primario</h4>
                      <Field label="Texto del Botón">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.primaryCta.label} onChange={(e)=>onChange('hero.primaryCta.label', e.target.value)} />
                      </Field>
                      <Field label="Enlace del Botón">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.primaryCta.href} onChange={(e)=>onChange('hero.primaryCta.href', e.target.value)} />
                      </Field>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Botón Secundario</h4>
                      <Field label="Texto del Botón">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.secondaryCta.label} onChange={(e)=>onChange('hero.secondaryCta.label', e.target.value)} />
                      </Field>
                      <Field label="Enlace del Botón">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.secondaryCta.href} onChange={(e)=>onChange('hero.secondaryCta.href', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'about' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Field label="Título de la Sección">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.about.heading} onChange={(e)=>onChange('about.heading', e.target.value)} />
                      </Field>
                      <Field label="Texto de Presentación">
                        <textarea rows={8} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.about.description} onChange={(e)=>onChange('about.description', e.target.value)} />
                      </Field>
                    </div>
                    <div>
                      <Field label="Foto de Perfil (sube para reemplazar)">
                        <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=>setAboutFile(e.target.files?.[0] || null)} />
                        {draft.about?.image_path && (
                          <div className="text-[11px] text-gray-400 mt-1">Actual: {draft.about.image_path}</div>
                        )}
                      </Field>
                      <div className="text-sm text-gray-300 mb-2">Vista previa</div>
                      <div className="glass-effect rounded-xl p-4 border border-white/10">
                        {resolveStorageUrl(draft.about?.image_path) ? (
                          <img src={resolveStorageUrl(draft.about?.image_path)} alt="Vista previa about" className="w-24 h-24 object-contain" />
                        ) : (
                          <div className="w-24 h-24 bg-white/10 rounded flex items-center justify-center text-gray-400 text-xs">Sin imagen</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Lista de Habilidades y Herramientas</h4>
                    <Field label="Habilidades (separadas por coma)">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={(draft.about?.skills || []).join(', ')} onChange={(e)=>onChange('about.skills', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
                    </Field>
                    <Field label="Herramientas (separadas por coma)">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={(draft.about?.tools || []).join(', ')} onChange={(e)=>onChange('about.tools', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
                    </Field>
                  </div>
                </div>
              )}

                            
              
              {tab === 'services' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Servicios</h3>
                  <div className="space-y-3">
                    {servicesToRender().map(({ svc, idx }) => {
                      const isOpen = openService === idx || (openService === null && idx === 0);
                      const title = svc.title?.trim() || `Servicio ${idx + 1}`;
                      const visible = svc.visible !== false;
                      const iconPreview = resolveStorageUrl(svc.icon_path);
                      return (
                        <div key={idx} className="glass-effect rounded-xl border border-white/10 overflow-hidden">
                          <div className="px-4 py-3 flex items-center gap-3 justify-between">
                            <div className="text-left">
                              <div className="font-semibold text-white">{title}</div>
                              <div className="text-xs text-gray-400 flex items-center gap-2">
                                <span>{visible ? 'Visible' : 'Oculto'}</span>
                                {iconPreview ? (
                                  <img src={iconPreview} alt="Icono" className="w-6 h-6 object-contain rounded border border-white/10" />
                                ) : (
                                  <span className="text-[10px] text-gray-500">Sin icono</span>
                                )}
                                {svc.description && <span className="truncate max-w-[220px] text-gray-400">{svc.description}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 text-xs text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={visible}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    setDraft((d) => {
                                      const arr = [...d.services];
                                      arr[idx] = { ...arr[idx], visible: val };
                                      return { ...d, services: arr };
                                    });
                                  }}
                                />
                                <span>Mostrar</span>
                              </label>
                              <Button variant="ghost" size="sm" onClick={() => setOpenService(isOpen ? null : idx)}>
                                {isOpen ? 'Cerrar' : 'Editar'}
                              </Button>
                            </div>
                          </div>
                          {isOpen && (
                            <div className="p-4 space-y-4 border-t border-white/10">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <Field label="Título del Servicio">
                                    <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={svc.title}
                                      onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.services]; arr[idx]={...arr[idx], title:v}; return {...d, services:arr};}); }} />
                                  </Field>
                                  <Field label="Descripción">
                                    <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={svc.description}
                                      onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.services]; arr[idx]={...arr[idx], description:v}; return {...d, services:arr};}); }} />
                                  </Field>
                                </div>
                                <div>
                                  <Field label="Ícono">
                                    <select className="w-full bg-transparent border border-white/20 rounded px-3 py-2"
                                      value={svc.icon}
                                      onChange={(e)=>{
                                        const v=e.target.value; setDraft(d=>{ const arr=[...d.services]; arr[idx]={...arr[idx], icon:v}; return {...d, services:arr};});
                                      }}>
                                      {['BarChart3','Database','LineChart','Workflow','Zap','Shield','Brain','Settings'].map(opt=> <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                  </Field>
                                  <Field label="Imagen de ícono (opcional, sube para reemplazar)">
                                    <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=> setServiceFiles(prev=> ({...prev, [idx]: e.target.files?.[0]||null}))} />
                                    {svc.icon_path && <div className="text-[11px] text-gray-400 mt-1">Actual: {svc.icon_path}</div>}
                                    {resolveStorageUrl(svc.icon_path) ? (
                                      <img src={resolveStorageUrl(svc.icon_path)} alt="Vista icono" className="w-16 h-16 object-contain rounded border border-white/10 mt-2" />
                                    ) : (
                                      <div className="w-16 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-gray-500 mt-2">Sin vista</div>
                                    )}
                                  </Field>
                                </div>
                              </div>
                              <div className="text-right">
                                <Button variant="outline" onClick={()=> setDraft(d=>({ ...d, services: d.services.filter((_,sIdx)=>sIdx!==idx) }))}>Eliminar Servicio</Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" onClick={()=> setDraft(d=>({ ...d, services:[...d.services,{ icon:'BarChart3', title:'', description:''}] }))}>Agregar Servicio</Button>
                  </div>
                </div>
              )}

              {tab === 'experience' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Experiencia</h3>
                  <div className="space-y-4">
                    {sortResumeEntries(draft.experience).map(({ entry: item, idx: i }) => (
                      <div key={`${item.company || 'exp'}-${i}`} className="glass-effect rounded-xl p-4 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Field label="Empresa">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.company || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], company:v}; return {...d, experience:arr};}); }} />
                            </Field>
                            <Field label="Cargo">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.role || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], role:v}; return {...d, experience:arr};}); }} />
                            </Field>
                            <Field label="Ubicación">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.location || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], location:v}; return {...d, experience:arr};}); }} />
                            </Field>
                          </div>
                          <div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <Field label="Año inicio">
                                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.start || ''}
                                  onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], start:v}; return {...d, experience:arr};}); }} />
                              </Field>
                              <Field label="Año fin">
                                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.end || ''}
                                  onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], end:v}; return {...d, experience:arr};}); }} />
                              </Field>
                            </div>
                            <Field label="Descripción">
                              <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.description || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], description:v}; return {...d, experience:arr};}); }} />
                            </Field>
                          </div>
                        </div>
                        <Field label="Logros (uno por línea)">
                          <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={(item.achievements || []).join('\n')}
                            onChange={(e)=>{ const lines=e.target.value.split('\n').map(s=>s.trim()).filter(Boolean); setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], achievements:lines}; return {...d, experience:arr};}); }} />
                        </Field>
                        <Field label="Icono/Imagen (ruta opcional)">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.icon_path || ''}
                            onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.experience||[])]; arr[i]={...arr[i], icon_path:v || null}; return {...d, experience:arr};}); }} placeholder="assets/experience/logo.png" />
                        </Field>
                        <div className="text-right">
                          <Button variant="outline" onClick={()=> setDraft(d=>({ ...d, experience:(d.experience||[]).filter((_,idx)=>idx!==i) }))}>Eliminar Experiencia</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" onClick={()=> setDraft(d=>({ ...d, experience:[...(d.experience||[]), { company:'', role:'', location:'', start:'', end:'', description:'', achievements:[], icon_path:null }] }))}>Agregar Experiencia</Button>
                  </div>
                </div>
              )}

              {tab === 'education' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Educación</h3>
                  <div className="space-y-4">
                    {sortResumeEntries(draft.education).map(({ entry: item, idx: i }) => (
                      <div key={`${item.institution || 'edu'}-${i}`} className="glass-effect rounded-xl p-4 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Field label="Institución">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.institution || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], institution:v}; return {...d, education:arr};}); }} />
                            </Field>
                            <Field label="Programa">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.program || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], program:v}; return {...d, education:arr};}); }} />
                            </Field>
                            <Field label="Ubicación">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.location || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], location:v}; return {...d, education:arr};}); }} />
                            </Field>
                          </div>
                          <div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <Field label="Año inicio">
                                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.start || ''}
                                  onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], start:v}; return {...d, education:arr};}); }} />
                              </Field>
                              <Field label="Año fin">
                                <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.end || ''}
                                  onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], end:v}; return {...d, education:arr};}); }} />
                              </Field>
                            </div>
                            <Field label="Descripción">
                              <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.description || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], description:v}; return {...d, education:arr};}); }} />
                            </Field>
                          </div>
                        </div>
                        <Field label="Logros (uno por línea)">
                          <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={(item.achievements || []).join('\n')}
                            onChange={(e)=>{ const lines=e.target.value.split('\n').map(s=>s.trim()).filter(Boolean); setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], achievements:lines}; return {...d, education:arr};}); }} />
                        </Field>
                        <Field label="Icono/Imagen (ruta opcional)">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={item.icon_path || ''}
                            onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...(d.education||[])]; arr[i]={...arr[i], icon_path:v || null}; return {...d, education:arr};}); }} placeholder="assets/education/logo.png" />
                        </Field>
                        <Field label="Imagen del logo (sube para reemplazar)">
                          <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=> setEducationFiles(prev => { const newArr = [...prev]; newArr[i] = e.target.files?.[0] || null; return newArr; })} />
                          {item.icon_path && <div className="text-[11px] text-gray-400 mt-1">Actual: {item.icon_path}</div>}
                          {resolveStorageUrl(item.icon_path) ? (
                            <img src={resolveStorageUrl(item.icon_path)} alt="Logo actual" className="w-16 h-16 object-contain rounded border border-white/10 mt-2" />
                          ) : (
                            <div className="w-16 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-gray-500 mt-2">Sin vista</div>
                          )}
                        </Field>
                        <div className="text-right">
                          <Button variant="outline" onClick={()=> setDraft(d=>({ ...d, education:(d.education||[]).filter((_,idx)=>idx!==i) }))}>Eliminar Educación</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" onClick={()=> setDraft(d=>({ ...d, education:[...(d.education||[]), { institution:'', program:'', location:'', start:'', end:'', description:'', achievements:[], icon_path:null }] }))}>Agregar Educación</Button>
                  </div>
                </div>
              )}

              {tab === 'projects' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Proyectos</h3>
                  <div className="space-y-4">
                    {draft.projects.map((p, i) => (
                      <div key={i} className="glass-effect rounded-xl p-4 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Field label="Título del Proyecto">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={p.title}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], title:v}; return {...d, projects:arr};}); }} />
                            </Field>
                            <Field label="Descripción">
                              <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={p.description}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], description:v}; return {...d, projects:arr};}); }} />
                            </Field>
                            <Field label="Enlace (opcional)">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={p.link||''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], link:v}; return {...d, projects:arr};}); }} />
                            </Field>
                          </div>
                          <div>
                            <Field label="Etiquetas (separadas por coma)">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={(p.tags||[]).join(', ')}
                                onChange={(e)=>{ const arrTags=e.target.value.split(',').map(s=>s.trim()).filter(Boolean); setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], tags:arrTags}; return {...d, projects:arr};}); }} />
                            </Field>
                            <Field label="Ícono Representativo">
                              <select className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={p.icon || 'BarChart3'}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], icon:v}; return {...d, projects:arr};}); }}>
                                {['BarChart3','Brain','Settings','FileText','Code','Database','LineChart','Workflow'].map(opt=> <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </Field>
                            <Field label="Imagen de Portada (opcional)">
                              <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=> setProjectFiles(prev=> ({...prev, [i]: e.target.files?.[0]||null}))} />
                              {p.cover_image_path && <div className="text-[11px] text-gray-400 mt-1">Actual: {p.cover_image_path}</div>}
                              {resolveStorageUrl(p.cover_image_path) ? (
                                <img src={resolveStorageUrl(p.cover_image_path)} alt="Portada actual" className="w-24 h-16 object-cover rounded border border-white/10 mt-2" />
                              ) : (
                                <div className="w-24 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-gray-500 mt-2">Sin vista</div>
                              )}
                            </Field>
                          </div>
                        </div>
                        <div className="text-right mt-2">
                          <Button variant="outline" onClick={()=> setDraft(d=>({ ...d, projects: d.projects.filter((_,idx)=>idx!==i) }))}>Eliminar Proyecto</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" onClick={()=> setDraft(d=>({ ...d, projects:[...d.projects,{ title:'', description:'', tags:[], link:'', icon:'BarChart3', cover_image_path:null}] }))}>Agregar Proyecto</Button>
                  </div>
                </div>
              )}

              {tab === 'testimonials' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Testimonios</h3>
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <Field label="Título de la Sección">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.testimonialsHeading || ''} onChange={(e)=>onChange('testimonialsHeading', e.target.value)} />
                    </Field>
                    <Field label="Subtítulo">
                      <textarea rows={2} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.testimonialsSubheading || ''} onChange={(e)=>onChange('testimonialsSubheading', e.target.value)} />
                    </Field>
                  </div>
                  <div className="space-y-4">
                    {(draft.testimonials || []).map((testimonial, i) => (
                      <div key={i} className="glass-effect rounded-xl p-4 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Field label="Nombre">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={testimonial.name || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.testimonials]; arr[i]={...arr[i], name:v}; return {...d, testimonials:arr};}); }} />
                            </Field>
                            <Field label="Posición">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={testimonial.position || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.testimonials]; arr[i]={...arr[i], position:v}; return {...d, testimonials:arr};}); }} />
                            </Field>
                            <Field label="Empresa">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={testimonial.company || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.testimonials]; arr[i]={...arr[i], company:v}; return {...d, testimonials:arr};}); }} />
                            </Field>
                            <Field label="Industria">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={testimonial.industry || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.testimonials]; arr[i]={...arr[i], industry:v}; return {...d, testimonials:arr};}); }} />
                            </Field>
                            <Field label="Rating (1-5)">
                              <input type="number" min="1" max="5" className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={testimonial.rating || 5}
                                onChange={(e)=>{ const v=parseInt(e.target.value)||5; setDraft(d=>{ const arr=[...d.testimonials]; arr[i]={...arr[i], rating:v}; return {...d, testimonials:arr};}); }} />
                            </Field>
                          </div>
                          <div>
                            <Field label="Texto del Testimonio">
                              <textarea rows={4} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={testimonial.text || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.testimonials]; arr[i]={...arr[i], text:v}; return {...d, testimonials:arr};}); }} />
                            </Field>
                            <Field label="Resultado">
                              <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={testimonial.result || ''}
                                onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.testimonials]; arr[i]={...arr[i], result:v}; return {...d, testimonials:arr};}); }} />
                            </Field>
                            <Field label="Avatar (sube imagen)">
                              <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=> setTestimonialFiles(prev=> ({...prev, [i]: e.target.files?.[0]||null}))} />
                              {testimonial.avatar_path && <div className="text-[11px] text-gray-400 mt-1">Actual: {testimonial.avatar_path}</div>}
                            </Field>
                          </div>
                        </div>
                        <div className="text-right mt-2">
                          <Button variant="outline" onClick={()=> setDraft(d=>({ ...d, testimonials: d.testimonials.filter((_,idx)=>idx!==i) }))}>Eliminar Testimonio</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" onClick={()=> setDraft(d=>({ ...d, testimonials:[...(d.testimonials||[]),{ name:'', position:'', company:'', industry:'', rating:5, text:'', result:'' }] }))}>Agregar Testimonio</Button>
                  </div>
                </div>
              )}

              {tab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Field label="Título de la Sección">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contactHeading||''} onChange={(e)=>onChange('contactHeading', e.target.value)} />
                      </Field>
                      <Field label="Email de Contacto">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.email||''} onChange={(e)=>onChange('contact.email', e.target.value)} />
                      </Field>
                      <Field label="Teléfono">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.phone||''} onChange={(e)=>onChange('contact.phone', e.target.value)} />
                      </Field>
                      <Field label="Ubicación">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.location||''} onChange={(e)=>onChange('contact.location', e.target.value)} />
                      </Field>
                    </div>
                    <div>
                      <Field label="Horario de Atención">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.hours||''} onChange={(e)=>onChange('contact.hours', e.target.value)} />
                      </Field>
                      <Field label="Nota Descriptiva">
                        <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.note||''} onChange={(e)=>onChange('contact.note', e.target.value)} />
                      </Field>
                      <Field label="URL de Agendamiento (Calendly, etc.)">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.scheduleUrl||''} onChange={(e)=>onChange('contact.scheduleUrl', e.target.value)} placeholder="https://calendly.com/usuario/llamada" />
                      </Field>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Placeholders del Formulario</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Placeholder Nombre">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.placeholders?.name || 'Escribe tu nombre'} onChange={(e)=>onChange('contact.placeholders.name', e.target.value)} />
                      </Field>
                      <Field label="Placeholder Email">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.placeholders?.email || 'tu@email.com'} onChange={(e)=>onChange('contact.placeholders.email', e.target.value)} />
                      </Field>
                      <Field label="Placeholder Empresa">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.placeholders?.company || 'Nombre de tu empresa'} onChange={(e)=>onChange('contact.placeholders.company', e.target.value)} />
                      </Field>
                      <Field label="Placeholder Teléfono">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.placeholders?.phone || '+57 300 123 4567'} onChange={(e)=>onChange('contact.placeholders.phone', e.target.value)} />
                      </Field>
                      <Field label="Placeholder Mensaje">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.placeholders?.message || 'Cuéntame cómo puedo ayudarte'} onChange={(e)=>onChange('contact.placeholders.message', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Botones del Formulario</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Texto Botón Enviar">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.buttons?.submit || 'Enviar Mensaje'} onChange={(e)=>onChange('contact.buttons.submit', e.target.value)} />
                      </Field>
                      <Field label="Texto Botón Agendar">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.buttons?.schedule || 'Agendar Llamada'} onChange={(e)=>onChange('contact.buttons.schedule', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'general' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Field label="Name (siteName)">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.siteName} onChange={(e)=>onChange('siteName', e.target.value)} />
                    </Field>
                    <Field label="Role">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.role} onChange={(e)=>onChange('role', e.target.value)} />
                    </Field>
                    <Field label="Contact Email">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.email||''} onChange={(e)=>onChange('contact.email', e.target.value)} />
                    </Field>
                    <Field label="Location">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.location||''} onChange={(e)=>onChange('contact.location', e.target.value)} />
                    </Field>
                  </div>
                  <div>
                    <Field label="SEO Title">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.seo.title} onChange={(e)=>onChange('seo.title', e.target.value)} />
                    </Field>
                    <Field label="SEO Description">
                      <textarea rows={4} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.seo.description} onChange={(e)=>onChange('seo.description', e.target.value)} />
                    </Field>
                    <Field label="Hero Title">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.title} onChange={(e)=>onChange('hero.title', e.target.value)} />
                    </Field>
                    <Field label="Hero Subtitle">
                      <textarea rows={3} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.subtitle} onChange={(e)=>onChange('hero.subtitle', e.target.value)} />
                    </Field>
                  </div>
                </div>
              )}

              {tab === 'hero' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Field label="Badge">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.badge} onChange={(e)=>onChange('hero.badge', e.target.value)} />
                    </Field>
                    <Field label="Primary CTA Label">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.primaryCta.label} onChange={(e)=>onChange('hero.primaryCta.label', e.target.value)} />
                    </Field>
                    <Field label="Primary CTA Href">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.primaryCta.href} onChange={(e)=>onChange('hero.primaryCta.href', e.target.value)} />
                    </Field>
                  </div>
                  <div>
                    <Field label="Secondary CTA Label">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.secondaryCta.label} onChange={(e)=>onChange('hero.secondaryCta.label', e.target.value)} />
                    </Field>
                    <Field label="Secondary CTA Href">
                      <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.hero.secondaryCta.href} onChange={(e)=>onChange('hero.secondaryCta.href', e.target.value)} />
                    </Field>
                    <Field label="Hero Image (upload to replace)">
                      <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=>setHeroFile(e.target.files?.[0] || null)} />
                      {draft.hero?.image_path && (
                        <div className="space-y-2 text-[11px] text-gray-400 mt-1">
                          <div>Actual: {draft.hero.image_path}</div>
                          {resolveStorageUrl(draft.hero.image_path) ? (
                            <img src={resolveStorageUrl(draft.hero.image_path)} alt="Vista hero" className="w-36 h-24 object-cover rounded border border-white/10" />
                          ) : (
                            <div className="w-36 h-24 rounded border border-dashed border-white/20 flex items-center justify-center text-gray-500">Sin vista</div>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>
                </div>
              )}

              {tab === 'branding' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Field label="Logo (sube una imagen para reemplazar)">
                      <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=> setLogoFile(e.target.files?.[0] || null)} />
                      {draft.branding?.logo_path && (
                        <div className="space-y-2 mt-1 text-[11px] text-gray-400">
                          <div>Actual: {draft.branding.logo_path}</div>
                          {resolveStorageUrl(draft.branding.logo_path) ? (
                            <img src={resolveStorageUrl(draft.branding.logo_path)} alt="Logo actual" className="w-20 h-20 object-contain rounded border border-white/10" />
                          ) : (
                            <div className="w-20 h-20 rounded border border-dashed border-white/20 flex items-center justify-center text-gray-500">Sin vista</div>
                          )}
                        </div>
                      )}
                      <div className="text-[11px] text-gray-500 mt-1">Si no estás autenticado como admin, se mostrará una vista local temporal que no persiste tras recargar.</div>
                    </Field>
                    <Field label="Logo URL (opcional)">
                      <input
                        placeholder="https://... o data:URI"
                        className="w-full bg-transparent border border-white/20 rounded px-3 py-2"
                        value={draft.branding?.logo_path || ''}
                        onChange={(e)=> setDraft(d=> ({...d, branding: { ...(d.branding||{}), logo_path: e.target.value || null }}))}
                      />
                      <div className="text-[11px] text-gray-500 mt-1">También puedes pegar un enlace directo al logo. Guardar lo sincroniza si estás en Admin.</div>
                    </Field>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={()=> setDraft(d=> ({...d, branding: { ...(d.branding||{}), logo_path: null }}))}>Quitar logo</Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-300 mb-2">Vista previa</div>
                    <div className="glass-effect rounded-xl p-4 border border-white/10">
                      {resolveStorageUrl(draft.branding?.logo_path) ? (
                        <img src={resolveStorageUrl(draft.branding?.logo_path)} alt="Logo preview" className="w-24 h-24 object-contain" />
                      ) : (
                        <div className="w-24 h-24 bg-white/10 rounded flex items-center justify-center text-gray-400 text-xs">Sin logo</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'footer' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Texto Principal</h4>
                    <Field label="Descripción del Footer">
                      <textarea rows={4} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.description || 'Analítica de datos para decisiones estratégicas: información confiable, dashboards claros y resultados medibles.'} onChange={(e)=>onChange('footer.description', e.target.value)} />
                    </Field>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Links de Navegación</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Empresa</h5>
                        <Field label="Link 1">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.company?.[0]?.label || 'Sobre mí'} onChange={(e)=>onChange('footer.company.0.label', e.target.value)} />
                        </Field>
                        <Field label="Enlace 1">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.company?.[0]?.href || '#/about'} onChange={(e)=>onChange('footer.company.0.href', e.target.value)} />
                        </Field>
                        <Field label="Link 2">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.company?.[1]?.label || 'Proyectos'} onChange={(e)=>onChange('footer.company.1.label', e.target.value)} />
                        </Field>
                        <Field label="Enlace 2">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.company?.[1]?.href || '#/projects'} onChange={(e)=>onChange('footer.company.1.href', e.target.value)} />
                        </Field>
                        <Field label="Link 3">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.company?.[2]?.label || 'Contacto'} onChange={(e)=>onChange('footer.company.2.label', e.target.value)} />
                        </Field>
                        <Field label="Enlace 3">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.company?.[2]?.href || '#/contact'} onChange={(e)=>onChange('footer.company.2.href', e.target.value)} />
                        </Field>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-300 mb-2">Recursos</h5>
                        <Field label="Link 1">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.resources?.[0]?.label || 'Artículos'} onChange={(e)=>onChange('footer.resources.0.label', e.target.value)} />
                        </Field>
                        <Field label="Enlace 1">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.resources?.[0]?.href || '#/articles'} onChange={(e)=>onChange('footer.resources.0.href', e.target.value)} />
                        </Field>
                        <Field label="Link 2">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.resources?.[1]?.label || 'Publicaciones'} onChange={(e)=>onChange('footer.resources.1.label', e.target.value)} />
                        </Field>
                        <Field label="Enlace 2">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.resources?.[1]?.href || '#/publications'} onChange={(e)=>onChange('footer.resources.1.href', e.target.value)} />
                        </Field>
                        <Field label="Link 3">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.resources?.[2]?.label || 'Casos de Estudio'} onChange={(e)=>onChange('footer.resources.2.label', e.target.value)} />
                        </Field>
                        <Field label="Enlace 3">
                          <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.resources?.[2]?.href || '#/case-studies'} onChange={(e)=>onChange('footer.resources.2.href', e.target.value)} />
                        </Field>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Redes Sociales</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <Field label="LinkedIn URL">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.social?.linkedin || 'https://linkedin.com/in/tu-perfil'} onChange={(e)=>onChange('footer.social.linkedin', e.target.value)} />
                      </Field>
                      <Field label="Twitter URL">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.social?.twitter || '#'} onChange={(e)=>onChange('footer.social.twitter', e.target.value)} />
                      </Field>
                      <Field label="Instagram URL">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.social?.instagram || '#'} onChange={(e)=>onChange('footer.social.instagram', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Suscripción al Newsletter</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Texto de la Suscripción">
                        <textarea rows={2} className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.newsletter?.description || 'Recibe ideas y recursos exclusivos sobre analítica directamente en tu correo.'} onChange={(e)=>onChange('footer.newsletter.description', e.target.value)} />
                      </Field>
                      <Field label="Texto del Botón">
                        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.footer?.newsletter?.buttonText || 'Quiero recibir novedades'} onChange={(e)=>onChange('footer.newsletter.buttonText', e.target.value)} />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {tab === 'visibility' && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.services} onChange={(e)=>onChange('visibility.services', e.target.checked)} /> <span>Show Services</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.projects} onChange={(e)=>onChange('visibility.projects', e.target.checked)} /> <span>Show Projects</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.testimonials} onChange={(e)=>onChange('visibility.testimonials', e.target.checked)} /> <span>Show Testimonials</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.resume} onChange={(e)=>onChange('visibility.resume', e.target.checked)} /> <span>Show Resume</span></label>
                </div>
              )}

              {tab === 'projects' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Projects</h3>
                  <div className="space-y-4">
                    {draft.projects.map((p, i) => (
                      <div key={i} className="glass-effect rounded-xl p-4 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-3">
                          <Field label="Title">
                            <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={p.title}
                              onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], title:v}; return {...d, projects:arr};}); }} />
                          </Field>
                          <Field label="Link">
                            <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={p.link||''}
                              onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], link:v}; return {...d, projects:arr};}); }} />
                          </Field>
                          <Field label="Description">
                            <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={p.description}
                              onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], description:v}; return {...d, projects:arr};}); }} />
                          </Field>
                          <Field label="Tags (comma-separated)">
                            <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={(p.tags||[]).join(', ')}
                              onChange={(e)=>{ const arrTags=e.target.value.split(',').map(s=>s.trim()).filter(Boolean); setDraft(d=>{ const arr=[...d.projects]; arr[i]={...arr[i], tags:arrTags}; return {...d, projects:arr};}); }} />
                          </Field>
                          <Field label="Cover Image">
                            <input type="file" accept="image/*" className="w-full text-sm" onChange={(e)=> setProjectFiles(prev=> ({...prev, [i]: e.target.files?.[0]||null}))} />
                            {p.cover_image_path && <div className="text-[11px] text-gray-400 mt-1">Actual: {p.cover_image_path}</div>}
                              {resolveStorageUrl(p.cover_image_path) ? (
                                <img src={resolveStorageUrl(p.cover_image_path)} alt="Portada actual" className="w-24 h-16 object-cover rounded border border-white/10 mt-2" />
                              ) : (
                                <div className="w-24 h-16 rounded border border-dashed border-white/20 flex items-center justify-center text-gray-500 mt-2">Sin vista</div>
                              )}
                          </Field>
                        </div>
                        <div className="text-right mt-2">
                          <Button variant="outline" onClick={()=> setDraft(d=>({ ...d, projects: d.projects.filter((_,idx)=>idx!==i) }))}>Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" onClick={()=> setDraft(d=>({ ...d, projects:[...d.projects,{ title:'', description:'', tags:[], link:'', cover_image_path:null}] }))}>Add Project</Button>
                  </div>
                </div>
              )}

              {tab === 'contact' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Field label="Contact Email"><input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.email||''} onChange={(e)=>onChange('contact.email', e.target.value)} /></Field>
                  <Field label="Location"><input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.location||''} onChange={(e)=>onChange('contact.location', e.target.value)} /></Field>
                  <Field label="Schedule URL (Calendly, etc.)"><input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={draft.contact?.scheduleUrl||''} onChange={(e)=>onChange('contact.scheduleUrl', e.target.value)} placeholder="https://calendly.com/usuario/llamada" /></Field>
                </div>
              )}

              {tab === 'whyus' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Why Us</h3>
                  <div className="space-y-4">
                    {draft.whyUs.map((w, i) => (
                      <div key={i} className="glass-effect rounded-xl p-4 border border-white/10">
                        <div className="grid md:grid-cols-3 gap-3">
                          <Field label="Icon">
                            <select className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={w.icon}
                              onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.whyUs]; arr[i]={...arr[i], icon:v}; return {...d, whyUs:arr};}); }}>
                              {['Users','Target'].map(opt=> <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </Field>
                          <Field label="Title">
                            <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={w.title}
                              onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.whyUs]; arr[i]={...arr[i], title:v}; return {...d, whyUs:arr};}); }} />
                          </Field>
                          <Field label="Subtitle">
                            <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2" value={w.subtitle}
                              onChange={(e)=>{ const v=e.target.value; setDraft(d=>{ const arr=[...d.whyUs]; arr[i]={...arr[i], subtitle:v}; return {...d, whyUs:arr};}); }} />
                          </Field>
                        </div>
                        <div className="text-right mt-2">
                          <Button variant="outline" onClick={()=> setDraft(d=>({ ...d, whyUs: d.whyUs.filter((_,idx)=>idx!==i) }))}>Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Button variant="ghost" onClick={()=> setDraft(d=>({ ...d, whyUs:[...d.whyUs,{ icon:'Users', title:'', subtitle:''}] }))}>Add Item</Button>
                  </div>
                </div>
              )}

              {session && (
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleSaveScoped}
                    disabled={isSaving}
                    className="bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={()=>{ resetContent(); toast({ title:'Restaurado', description:'Valores por defecto aplicados.'}); }} variant="outline">Reset</Button>
                  <a href="#" className="ml-auto"><Button variant="ghost">Exit Admin</Button></a>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Tip: Open admin anytime by adding #admin to the URL. {supa.loading ? 'Syncing with Supabase...' : ''} {supa.error ? `(Supabase error: ${supa.error})` : ''}</p>
      </div>
    </div>
  );
}
