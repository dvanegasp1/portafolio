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

export default function AdminPanel() {
  const { content, setContent, resetContent, saveToSupabase, supa } = useContent();
  const [draft, setDraft] = useState(content);
  const [tab, setTab] = useState('general');
  const [session, setSession] = useState(null);
  const [auth, setAuth] = useState({ email: '' });
  const [magicSentTo, setMagicSentTo] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroFile, setHeroFile] = useState(null);

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

  const save = () => {
    try {
      setContent(draft);
      // Try saving to Supabase if configured
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
      toast({ title: 'Error', description: 'No se pudieron guardar los cambios.', variant: 'destructive' });
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

  // Upload hero image (if selected) then save changes (including Supabase sync)
  const handleSave = async () => {
    try {
      let next = draft;
      if (heroFile && supabase && session && isAdmin) {
        const key = `hero/${Date.now()}-${heroFile.name}`.replace(/\s+/g, '-');
        const { error: upErr } = await supabase.storage.from('portfolio-assets').upload(key, heroFile, { upsert: true });
        if (upErr) {
          toast({ title: 'Error subiendo imagen', description: upErr.message, variant: 'destructive' });
        } else {
          next = { ...draft, hero: { ...draft.hero, image_path: key } };
          setDraft(next);
        }
        setHeroFile(null);
      }
      setContent(next);
      if (supabase) {
        if (session && isAdmin) {
          const { error } = await saveToSupabase(next);
          if (error) toast({ title: 'Guardado local', description: 'Sincronización con Supabase falló: ' + error.message, variant: 'default' });
          else toast({ title: 'Guardado', description: 'Cambios aplicados y sincronizados con Supabase.' });
        } else if (session && !isAdmin) {
          toast({ title: 'Guardado local', description: 'Tu sesión no pertenece al grupo Admin. Pide acceso para sincronizar.', variant: 'default' });
        } else {
          toast({ title: 'Guardado local', description: 'Inicia sesión para sincronizar con Supabase.', variant: 'default' });
        }
      } else {
        toast({ title: 'Guardado', description: 'Cambios aplicados localmente.' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudieron guardar los cambios.', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur overflow-auto">
      <div className="max-w-6xl mx-auto p-6">
        <div className="glass-effect rounded-2xl p-0 border border-white/10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
            {/* Sidebar */}
            <aside className="bg-white/5 p-4 border-r border-white/10">
              <div className="text-sm uppercase tracking-wide text-gray-400 mb-3">Secciones</div>
              {[
                ['general','General'],
                ['hero','Hero'],
                ['visibility','Visibilidad'],
                ['services','Services JSON'],
                ['projects','Projects JSON'],
                ['whyus','Why Us JSON'],
                ['contact','Contacto'],
              ].map(([key,label]) => (
                <button key={key} onClick={() => setTab(key)} className={`block w-full text-left px-3 py-2 rounded mb-1 ${tab===key? 'bg-red-600/30 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{label}</button>
              ))}

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
                    }} className="w-full bg-red-600 text-white">Enviar Magic Link</Button>
                    {magicSentTo && (
                      <div className="text-[11px] text-gray-400">Después de abrir el enlace desde tu correo, regresarás aquí automáticamente.</div>
                    )}
                  </div>
                )}
                {supabase && session && (
                  <div className="text-xs text-gray-300">
                    <div className="flex items-center justify-between gap-2">
                      <span>{session.user?.email}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${isAdmin ? 'bg-red-600/30 text-red-200' : 'bg-white/10 text-gray-300'}`}>
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
                        <div className="text-[11px] text-gray-400 mt-1">Actual: {draft.hero.image_path}</div>
                      )}
                    </Field>
                  </div>
                </div>
              )}

              {tab === 'visibility' && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.services} onChange={(e)=>onChange('visibility.services', e.target.checked)} /> <span>Show Services</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.projects} onChange={(e)=>onChange('visibility.projects', e.target.checked)} /> <span>Show Projects</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.testimonials} onChange={(e)=>onChange('visibility.testimonials', e.target.checked)} /> <span>Show Testimonials</span></label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={draft.visibility.team} onChange={(e)=>onChange('visibility.team', e.target.checked)} /> <span>Show Team</span></label>
                </div>
              )}

              {tab === 'services' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Services JSON</h3>
                  <textarea spellCheck="false" wrap="off" className="w-full bg-transparent border border-white/20 rounded px-3 py-2 font-mono text-sm resize-y min-h-[360px]" rows={18} value={JSON.stringify(draft.services, null, 2)} onChange={(e)=>{ try{ onChange('services', JSON.parse(e.target.value||'[]')); } catch{} }} />
                  <p className="text-xs text-gray-400 mt-1">Fields: icon (BarChart3|Database|LineChart|Workflow), title, description</p>
                </div>
              )}

              {tab === 'projects' && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Projects JSON</h3>
                  <textarea spellCheck="false" wrap="off" className="w-full bg-transparent border border-white/20 rounded px-3 py-2 font-mono text-sm resize-y min-h-[360px]" rows={18} value={JSON.stringify(draft.projects, null, 2)} onChange={(e)=>{ try{ onChange('projects', JSON.parse(e.target.value||'[]')); } catch{} }} />
                  <p className="text-xs text-gray-400 mt-1">Fields: title, description, tags[], link</p>
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
                  <h3 className="text-lg font-semibold mb-2">Why Us JSON</h3>
                  <textarea spellCheck="false" wrap="off" className="w-full bg-transparent border border-white/20 rounded px-3 py-2 font-mono text-sm resize-y min-h-[280px]" rows={14} value={JSON.stringify(draft.whyUs, null, 2)} onChange={(e)=>{ try{ onChange('whyUs', JSON.parse(e.target.value||'[]')); } catch{} }} />
                  <p className="text-xs text-gray-400 mt-1">Fields: icon (Users|Target), title, subtitle</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} className="bg-red-600 text-white">Save</Button>
                <Button onClick={()=>{ resetContent(); toast({ title:'Restaurado', description:'Valores por defecto aplicados.'}); }} variant="outline">Reset</Button>
                <a href="#" className="ml-auto"><Button variant="ghost">Exit Admin</Button></a>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Tip: Open admin anytime by adding #admin to the URL. {supa.loading ? 'Syncing with Supabase…' : ''} {supa.error ? `(Supabase error: ${supa.error})` : ''}</p>
      </div>
    </div>
  );
}
