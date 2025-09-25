import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

// Local storage is intentionally not used anymore; Supabase is the source of truth.

const defaultContent = {
  siteName: '',
  role: '',
  branding: {
    logo_path: null,
  },
  seo: {
    title: '',
    description: '',
  },
  visibility: {
    services: true,
    projects: true,
    testimonials: false,
    team: false,
  },
  hero: {
    badge: '',
    title: '',
    subtitle: '',
    primaryCta: { label: '', href: '' },
    secondaryCta: { label: '', href: '' },
    image_path: null,
  },
  servicesHeading: '',
  servicesSubheading: '',
  projectsHeading: '',
  projectsSubheading: '',
  teamHeading: '',
  teamSubheading: '',
  testimonialsHeading: '',
  testimonialsSubheading: '',
  about: {
    heading: '',
    description: '',
    highlights: [],
    image_path: null,
  },
  services: [],
  projects: [],
  teamMembers: [],
  testimonials: [],

  contactHeading: '',
  whyUs: [],
};
const ContentContext = createContext({
  content: defaultContent,
  setContent: () => {},
  resetContent: () => {},
  saveToSupabase: async () => {},
  supa: { available: false, loading: true, error: null },
});

export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [supaState, setSupaState] = useState({ available: !!supabase, loading: true, error: null });

  // No localStorage persistence; Supabase is authoritative.

  // Helpers to assemble from normalized schema
  const fetchNormalized = async () => {
    const result = { ...defaultContent };
    // site_settings
    const { data: site } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (site) {
      result.siteName = site.site_name ?? result.siteName;
      result.role = site.role ?? result.role;
      if (typeof site.logo_path !== 'undefined' && site.logo_path) {
        result.branding = { ...(result.branding || {}), logo_path: site.logo_path };
      }
    }
    // seo
    const { data: seo } = await supabase.from('seo').select('*').eq('site_id', 1).maybeSingle();
    if (seo) result.seo = { title: seo.title ?? '', description: seo.description ?? '' };
    // hero
    const { data: hero } = await supabase.from('hero').select('*').eq('site_id', 1).maybeSingle();
    if (hero) {
      result.hero = {
        badge: hero.badge ?? '',
        title: hero.title ?? '',
        subtitle: hero.subtitle ?? '',
        primaryCta: hero.primary_cta_label || hero.primary_cta_href ? { label: hero.primary_cta_label || '', href: hero.primary_cta_href || '' } : result.hero.primaryCta,
        secondaryCta: hero.secondary_cta_label || hero.secondary_cta_href ? { label: hero.secondary_cta_label || '', href: hero.secondary_cta_href || '' } : result.hero.secondaryCta,
        image_path: hero.image_path || undefined,
      };
    }
    // about + highlights
    const { data: about } = await supabase.from('about').select('*').eq('site_id', 1).maybeSingle();
    if (about) {
      result.about = { heading: about.heading ?? '', description: about.description ?? '', highlights: [], image_path: about.image_path || undefined };
      const { data: highlights } = await supabase
        .from('about_highlights')
        .select('value, sort_order')
        .eq('site_id', 1)
        .order('sort_order', { ascending: true });
      result.about.highlights = (highlights ?? []).map((h) => h.value);
    }
    // services
    const { data: services } = await supabase
      .from('services')
      .select('icon,title,description,icon_path,sort_order')
      .eq('site_id', 1)
      .order('sort_order', { ascending: true });
    if (services) result.services = services.map((s) => ({ icon: s.icon, title: s.title, description: s.description, icon_path: s.icon_path }));
    // projects + tags
    const { data: projects } = await supabase
      .from('projects')
      .select('id,title,description,link,cover_image_path,sort_order')
      .eq('site_id', 1)
      .order('sort_order', { ascending: true });
    if (projects) {
      const ids = projects.map((p) => p.id);
      let tagsById = {};
      if (ids.length) {
        const { data: tags } = await supabase.from('project_tags').select('project_id, tag').in('project_id', ids);
        tagsById = (tags ?? []).reduce((acc, t) => {
          (acc[t.project_id] = acc[t.project_id] || []).push(t.tag);
          return acc;
        }, {});
      }
      result.projects = projects.map((p) => ({ title: p.title, description: p.description, tags: tagsById[p.id] || [], link: p.link }));
    }
    // contact
    const { data: contact } = await supabase.from('contact').select('*').eq('site_id', 1).maybeSingle();
    if (contact) result.contact = { email: contact.email || '', location: contact.location || '', scheduleUrl: contact.schedule_url || '', phone: contact.phone || '', hours: contact.hours || '', note: contact.note || '' };
    // visibility
    const { data: vis } = await supabase.from('visibility').select('*').eq('site_id', 1).maybeSingle();
    if (vis) result.visibility = { services: !!vis.services, projects: !!vis.projects, testimonials: !!vis.testimonials, team: !!vis.team };
    // why_us
    const { data: why } = await supabase
      .from('why_us')
      .select('icon,title,subtitle,sort_order')
      .eq('site_id', 1)
      .order('sort_order', { ascending: true });
    if (why) result.whyUs = why.map((w) => ({ icon: w.icon, title: w.title, subtitle: w.subtitle }));
    const { data: teamMembers, error: teamErr } = await supabase
      .from('team_members')
      .select('id,name,position,specialization,experience,description,achievements,avatar_path,sort_order')
      .eq('site_id', 1)
      .order('sort_order', { ascending: true });
    if (!teamErr && teamMembers) {
      result.teamMembers = teamMembers.map((member) => ({
        name: member.name,
        position: member.position,
        specialization: member.specialization,
        experience: member.experience,
        description: member.description,
        achievements: Array.isArray(member.achievements)
          ? member.achievements
          : (typeof member.achievements === 'string'
              ? member.achievements.split('|').map((s) => s.trim()).filter(Boolean)
              : []),
        avatar_path: member.avatar_path || null,
        id: member.id || null,
      }));
    }
    const { data: testimonials, error: testimonialsErr } = await supabase
      .from('testimonials')
      .select('id,name,position,company,rating,text,result,industry,avatar_path,sort_order')
      .eq('site_id', 1)
      .order('sort_order', { ascending: true });
    if (!testimonialsErr && testimonials) {
      result.testimonials = testimonials.map((t) => ({
        name: t.name,
        position: t.position,
        company: t.company,
        rating: typeof t.rating === 'number' ? t.rating : Number.parseInt(t.rating, 10) || 0,
        text: t.text,
        result: t.result,
        industry: t.industry,
        avatar_path: t.avatar_path || null,
        id: t.id || null,
      }));
    }
    return result;
  };

  // Load content from Supabase (normalized only). If unavailable, keep defaults.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!supabase) {
        setSupaState((s) => ({ ...s, loading: false }));
        return;
      } // not configurado
      setSupaState((s) => ({ ...s, loading: true, error: null }));
      try {
        const merged = await fetchNormalized();
        if (!cancelled && merged) setContent(merged);
        if (!cancelled) setSupaState((s) => ({ ...s, loading: false, error: null }));
      } catch (e) {
        if (!cancelled) setSupaState((s) => ({ ...s, loading: false, error: e.message || String(e) }));
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Save to normalized schema only (no JSON backup)
  const saveToSupabase = async (payload) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const c = payload ?? content;
    const errors = [];
    // Singletons
    const siteRow = { id: 1, site_name: c.siteName, role: c.role, updated_at: new Date().toISOString() };
    const lp = c?.branding?.logo_path;
    // Include only storage keys, skip data/http URLs to avoid noisy writes
    const isStorageKey = lp && !/^https?:|^data:|^blob:/i.test(lp);
    if (isStorageKey) siteRow.logo_path = lp;
    const s1 = await supabase.from('site_settings').upsert(siteRow, { onConflict: 'id' });
    if (s1.error) {
      const msg = s1.error.message || '';
      // Ignore missing column error gracefully; advise user to add column in UI
      if (!/logo_path/.test(msg)) {
        errors.push(s1.error);
      }
    }
    const s2 = await supabase.from('seo').upsert({ site_id: 1, title: c.seo?.title || '', description: c.seo?.description || '' }, { onConflict: 'site_id' });
    if (s2.error) errors.push(s2.error);
    const s3 = await supabase.from('hero').upsert({
      site_id: 1,
      badge: c.hero?.badge || '',
      title: c.hero?.title || '',
      subtitle: c.hero?.subtitle || '',
      primary_cta_label: c.hero?.primaryCta?.label || null,
      primary_cta_href: c.hero?.primaryCta?.href || null,
      secondary_cta_label: c.hero?.secondaryCta?.label || null,
      secondary_cta_href: c.hero?.secondaryCta?.href || null,
      image_path: c.hero?.image_path || null,
    }, { onConflict: 'site_id' });
    if (s3.error) errors.push(s3.error);
    const s4 = await supabase.from('about').upsert({ site_id: 1, heading: c.about?.heading || '', description: c.about?.description || '', image_path: c.about?.image_path || null }, { onConflict: 'site_id' });
    if (s4.error) errors.push(s4.error);
    const s5del = await supabase.from('about_highlights').delete().eq('site_id', 1);
    if (s5del.error) errors.push(s5del.error);
    if (Array.isArray(c.about?.highlights) && c.about.highlights.length) {
      const rows = c.about.highlights.map((v, idx) => ({ site_id: 1, value: v, sort_order: (idx + 1) * 10 }));
      const s5ins = await supabase.from('about_highlights').insert(rows);
      if (s5ins.error) errors.push(s5ins.error);
    }
    // Services
    const s6del = await supabase.from('services').delete().eq('site_id', 1);
    if (s6del.error) errors.push(s6del.error);
    if (Array.isArray(c.services) && c.services.length) {
      const rows = c.services.map((s, idx) => ({ site_id: 1, icon: s.icon, title: s.title, description: s.description, icon_path: s.icon_path || null, sort_order: (idx + 1) * 10 }));
      const s6ins = await supabase.from('services').insert(rows);
      if (s6ins.error) errors.push(s6ins.error);
    }
    // Projects + tags
    const s7del = await supabase.from('projects').delete().eq('site_id', 1);
    if (s7del.error) errors.push(s7del.error);
    if (Array.isArray(c.projects) && c.projects.length) {
      const rows = c.projects.map((p, idx) => ({ site_id: 1, title: p.title, description: p.description, link: p.link || null, cover_image_path: p.cover_image_path || null, sort_order: (idx + 1) * 10 }));
      const ins = await supabase.from('projects').insert(rows).select('id');
      if (ins.error) errors.push(ins.error);
      else if (ins.data && ins.data.length) {
        const tags = [];
        ins.data.forEach((r, i) => {
          const ts = Array.isArray(c.projects[i]?.tags) ? c.projects[i].tags : [];
          ts.forEach((t) => tags.push({ project_id: r.id, tag: t }));
        });
        if (tags.length) {
          const tIns = await supabase.from('project_tags').insert(tags);
          if (tIns.error) errors.push(tIns.error);
        }
      }
    }
    // Contact, visibility, why_us
    const s8 = await supabase.from('contact').upsert({ site_id: 1, email: c.contact?.email || '', location: c.contact?.location || '', schedule_url: c.contact?.scheduleUrl || '' }, { onConflict: 'site_id' });
    if (s8.error) errors.push(s8.error);
    const s9 = await supabase.from('visibility').upsert({ site_id: 1, services: !!c.visibility?.services, projects: !!c.visibility?.projects, testimonials: !!c.visibility?.testimonials, team: !!c.visibility?.team }, { onConflict: 'site_id' });
    if (s9.error) errors.push(s9.error);
    const s10del = await supabase.from('why_us').delete().eq('site_id', 1);
    if (s10del.error) errors.push(s10del.error);
    if (Array.isArray(c.whyUs) && c.whyUs.length) {
      const rows = c.whyUs.map((w, idx) => ({ site_id: 1, icon: w.icon, title: w.title, subtitle: w.subtitle || '', sort_order: (idx + 1) * 10 }));
      const s10ins = await supabase.from('why_us').insert(rows);
      if (s10ins.error) errors.push(s10ins.error);
    }

    return { error: errors[0] || null, errors };
  };

  const value = useMemo(
    () => ({
      content,
      setContent,
      resetContent: () => setContent(defaultContent),
      saveToSupabase,
      supa: supaState,
    }),
    [content, supaState],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}














