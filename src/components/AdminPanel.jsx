import React, { useEffect, useState } from 'react';
import { useContent } from '@/content/ContentContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { toast } from '@/components/ui/use-toast.js';

const Field = ({ label, children }) => (
  <label className="block mb-3">
    <div className="text-sm text-gray-300 mb-1">{label}</div>
    {children}
  </label>
);

export default function AdminPanel() {
  const { content, setContent, resetContent } = useContent();
  const [draft, setDraft] = useState(content);
  const [tab, setTab] = useState('general');

  useEffect(() => setDraft(content), [content]);

  const save = () => {
    try {
      setContent(draft);
      toast({ title: 'Guardado', description: 'Los cambios se han aplicado correctamente.' });
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
                <Button onClick={save} className="bg-red-600 text-white">Save</Button>
                <Button onClick={()=>{ resetContent(); toast({ title:'Restaurado', description:'Valores por defecto aplicados.'}); }} variant="outline">Reset</Button>
                <a href="#" className="ml-auto"><Button variant="ghost">Exit Admin</Button></a>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">Tip: Open admin anytime by adding #admin to the URL.</p>
      </div>
    </div>
  );
}
