import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient.js';
import { slugify } from '@/lib/utils.js';

// Local storage is intentionally not used anymore; Supabase is the source of truth.

// Helpers used by resume (education/experience)
function parseMultilineList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(/\r?\n|\|/)
    .map((s) => s.trim())
    .filter(Boolean);
}
function joinMultilineList(list) {
  if (!Array.isArray(list)) return null;
  return list.map((s) => String(s || '').trim()).filter(Boolean).join('|');
}
function cloneSeedList(seed) {
  return (seed || []).map((x) => ({ ...x }));
}

function dedupeProjects(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter((proj) => {
    if (!proj || typeof proj !== 'object') return false;
    const title = (proj.title || '').trim();
    const description = (proj.description || '').trim();
    const link = (proj.link || '').trim();
    const cover = (proj.cover_image_path || '').trim();
    if (!title && !description && !link && !cover) return false;
    const key = [title.toLowerCase(), description.toLowerCase(), link.toLowerCase(), cover.toLowerCase()].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const seen = new Set();
  return tags
    .map((tag) => (typeof tag === 'string' ? tag.trim() : String(tag || '').trim()))
    .filter((tag) => {
      if (!tag) return false;
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

const servicesSeed = [
  {
    icon: 'BarChart3',
    title: 'Knime',
    description: 'Design and build dashboards that surface the metrics that matter.',
    icon_path: null,
    slug: 'knime',
    long_description:
      'We configure tailored KNIME workflows to automate data preparation, KPI calculations, and dashboard refreshes so stakeholders always see up-to-date metrics.\n\nFrom data ingestion to visualization, we align every step with business priorities to deliver BI assets that drive decisions.',
    highlights: [
      'Custom KNIME pipelines tailored to your stack',
      'Automated reporting with governed metrics',
      'Dashboard rollout and stakeholder enablement',
    ],
  },
  {
    icon: 'Database',
    title: 'Data Cleaning & Modeling',
    description: 'From messy CSVs to reliable datasets ready for analysis.',
    icon_path: null,
    slug: 'data-cleaning-modeling',
    long_description:
      'We audit your current datasets, identify structural issues, and implement a modeling layer that keeps analytics trustworthy.\n\nOur work covers data quality rules, dimensional modeling, and documentation so teams can reuse the logic with confidence.',
    highlights: [
      'Profiling and anomaly detection',
      'Dimensional models for analytics consistency',
      'Documentation and handover playbooks',
    ],
  },
  {
    icon: 'LineChart',
    title: 'Analysis & Insights',
    description: 'Exploratory analysis, cohorts, funnels, segmentation, and forecasting.',
    icon_path: null,
    slug: 'analysis-insights',
    long_description:
      'Translate business questions into data stories that accelerate growth. We combine exploratory techniques with statistical models to uncover actionable insights across marketing, revenue, and operations.',
    highlights: [
      'Cohort, funnel, and retention analysis',
      'Segmentation and clustering exercises',
      'Experiment readouts and forecasting',
    ],
  },
  {
    icon: 'Workflow',
    title: 'Automation & ETL',
    description: 'Automated pipelines that keep data fresh and trustworthy.',
    icon_path: null,
    slug: 'automation-etl',
    long_description:
      'We design and implement resilient data pipelines with monitoring so your analytics layer is always reliable. From ingestion to orchestration, every job is versioned and observable.',
    highlights: [
      'Modern ETL/ELT architecture',
      'Orchestration and alerting setup',
      'CI/CD for analytics engineering',
    ],
  },
];
// Minimal seed data for resume so the UI is not empty on first run
const educationSeed = [
  {
    institution: 'Upskilled Pty Ltd',
    program: 'Certificate IV in Information Technology',
    location: 'Australia',
    start: '2024',
    end: '2025',
    description: 'Core skills and foundations for IT and data.',
    achievements: ['Developed business requirements', 'Built small web apps'],
    icon_path: null,
  },
];
const experienceSeed = [
  {
    company: 'Freelance',
    role: 'Data Analyst',
    location: 'Remote',
    start: '2023',
    end: 'Present',
    description: 'Dashboards, data cleaning, and automation.',
    achievements: ['Power BI dashboards', 'Data quality checks'],
    icon_path: null,
  },
];
const defaultContent = {
  siteName: '',
  role: '',
  branding: {
    logo_path: null,
  },
  // Short intro for Resume section (shown above Education/Experience)
  resumeSummary: '',
  seo: {
    title: '',
    description: '',
  },
  visibility: {
    services: true,
    projects: true,
    testimonials: false,
    team: false,
    resume: true,
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
  education: [],
  experience: [],
  projects: [],
  teamMembers: [],
  testimonials: [],

  contactHeading: '',
  whyUs: [],
  blogPosts: [],
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
let sourceServices;
const { data: services, error: servicesError } = await supabase
  .from('services')
  .select('icon,title,description,icon_path,sort_order')
  .eq('site_id', 1)
  .order('sort_order', { ascending: true });

if (!servicesError && Array.isArray(services) && services.length) {
  sourceServices = services;
} else {
  const seedRows = servicesSeed.map((svc, idx) => ({
    site_id: 1,
    icon: svc.icon,
    title: svc.title,
    description: svc.description,
    icon_path: svc.icon_path,
    sort_order: (idx + 1) * 10,
  }));
  const { error: seedInsertError } = await supabase.from('services').insert(seedRows);
  if (!seedInsertError) {
    const { data: seeded } = await supabase
      .from('services')
      .select('icon,title,description,icon_path,sort_order')
      .eq('site_id', 1)
      .order('sort_order', { ascending: true });
    sourceServices = Array.isArray(seeded) ? seeded : [];
  } else {
    sourceServices = [];
  }
}

if (Array.isArray(sourceServices) && sourceServices.length) {
  result.services = sourceServices.map((s, idx) => {
    const slug = slugify(s?.title || `service-${idx + 1}`);
    const seed = servicesSeed.find((item) => item.slug === slug) || servicesSeed[idx] || {};
    const baseHighlights = Array.isArray(seed.highlights) ? seed.highlights : [];
    return {
      icon: s.icon ?? seed.icon,
      title: s.title ?? seed.title,
      description: s.description ?? seed.description,
      icon_path: s.icon_path ?? seed.icon_path ?? null,
      slug,
      long_description: seed.long_description || '',
      highlights: baseHighlights,
    };
  });
} else {
  result.services = servicesSeed;
}

// education
const { data: educationRows, error: educationError } = await supabase
  .from('education')
  .select('institution, program, location, start_year, end_year, description, achievements, icon_path, sort_order')
  .eq('site_id', 1)
  .order('sort_order', { ascending: true });

if (!educationError && Array.isArray(educationRows) && educationRows.length) {
  result.education = educationRows.map((row) => ({
    institution: row.institution || '',
    program: row.program || '',
    location: row.location || '',
    start: row.start_year || '',
    end: row.end_year || '',
    description: row.description || '',
    achievements: parseMultilineList(row.achievements),
    icon_path: row.icon_path || null,
  }));
} else {
  result.education = cloneSeedList(educationSeed);
}

// experience
const { data: experienceRows, error: experienceError } = await supabase
  .from('experience')
  .select('company, role, location, start_year, end_year, description, achievements, icon_path, sort_order')
  .eq('site_id', 1)
  .order('sort_order', { ascending: true });

if (!experienceError && Array.isArray(experienceRows) && experienceRows.length) {
  result.experience = experienceRows.map((row) => ({
    company: row.company || '',
    role: row.role || '',
    location: row.location || '',
    start: row.start_year || '',
    end: row.end_year || '',
    description: row.description || '',
    achievements: parseMultilineList(row.achievements),
    icon_path: row.icon_path || null,
  }));
} else {
  result.experience = cloneSeedList(experienceSeed);
}

    // visibility
    const { data: vis } = await supabase.from('visibility').select('*').eq('site_id', 1).maybeSingle();
    if (vis) result.visibility = { services: !!vis.services, projects: !!vis.projects, testimonials: !!vis.testimonials, team: !!vis.team, resume: vis.resume !== false };
    // Projects + tags
    if (result.visibility.projects !== false) {
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
        const normalizedProjects = projects.map((p) => ({
          title: p.title || '',
          description: p.description || '',
          tags: dedupeTags(tagsById[p.id] || []),
          link: p.link || null,
          cover_image_path: p.cover_image_path || null,
        }));
        result.projects = dedupeProjects(normalizedProjects);
      } else {
        result.projects = [];
      }
    }
    // contact
    const { data: contact } = await supabase.from('contact').select('*').eq('site_id', 1).maybeSingle();
    if (contact) result.contact = { email: contact.email || '', location: contact.location || '', scheduleUrl: contact.schedule_url || '', phone: contact.phone || '', hours: contact.hours || '', note: contact.note || '' };
    // why_us
    const { data: why } = await supabase
      .from('why_us')
      .select('icon,title,subtitle,sort_order')
      .eq('site_id', 1)
      .order('sort_order', { ascending: true });
    if (why) result.whyUs = why.map((w) => ({ icon: w.icon, title: w.title, subtitle: w.subtitle }));

    // resume meta (summary)
    const { data: resumeMeta } = await supabase.from('resume_meta').select('*').eq('site_id', 1).maybeSingle();
    if (resumeMeta) result.resumeSummary = resumeMeta.summary || '';

    // blog posts (respect RLS: public sees only published, admins see all)
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('title, slug, excerpt, content_md, cover_image_path, tags, published, published_at, sort_order')
      .eq('site_id', 1)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('sort_order', { ascending: false });
    if (posts) {
      result.blogPosts = posts.map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || '',
        content_md: p.content_md || '',
        cover_image_path: p.cover_image_path || null,
        tags: typeof p.tags === 'string' ? p.tags.split('|').map((s) => s.trim()).filter(Boolean) : Array.isArray(p.tags) ? p.tags : [],
        published: !!p.published,
        published_at: p.published_at || null,
      }));
    }
    if (result.visibility.team) {
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
    }
    if (result.visibility.testimonials) {
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
      const timeout = setTimeout(() => {
        if (!cancelled) setSupaState((s) => ({ ...s, loading: false, error: 'Timeout loading content' }));
      }, 10000);
      try {
        const merged = await fetchNormalized();
        clearTimeout(timeout);
        if (!cancelled && merged) setContent(merged);
        if (!cancelled) setSupaState((s) => ({ ...s, loading: false, error: null }));
      } catch (e) {
        clearTimeout(timeout);
        if (!cancelled) setSupaState((s) => ({ ...s, loading: false, error: e.message || String(e) }));
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Save to normalized schema only (no JSON backup)
  // Optional scoped save: pass an array of section keys to limit DB writes
  // e.g. saveToSupabase(content, ['services']) will only touch services table
  const saveToSupabase = async (payload, scopes = null) => {
    if (!supabase) return { error: 'Supabase no configurado' };
    const c = payload ?? content;
    const errors = [];
    const allow = Array.isArray(scopes) && scopes.length ? new Set(scopes) : null;
    const should = (key) => (allow ? allow.has(key) || allow.has('all') : true);
    // Singletons
    if (should('site')) {
      const siteRow = { id: 1, site_name: c.siteName, role: c.role, updated_at: new Date().toISOString() };
      const lp = c?.branding?.logo_path;
      // Include only storage keys, skip data/http URLs to avoid noisy writes
      const isStorageKey = lp && !/^https?:|^data:|^blob:/i.test(lp);
      if (isStorageKey) siteRow.logo_path = lp;
      const s1 = await supabase.from('site_settings').upsert(siteRow, { onConflict: 'id' });
      if (s1.error) {
        const msg = s1.error.message || '';
        if (!/logo_path/.test(msg)) errors.push(s1.error);
      }
    }
    if (should('seo')) {
      const s2 = await supabase.from('seo').upsert({ site_id: 1, title: c.seo?.title || '', description: c.seo?.description || '' }, { onConflict: 'site_id' });
      if (s2.error) errors.push(s2.error);
    }
    if (should('hero')) {
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
    }
    if (should('about')) {
      const s4 = await supabase.from('about').upsert({ site_id: 1, heading: c.about?.heading || '', description: c.about?.description || '', image_path: c.about?.image_path || null }, { onConflict: 'site_id' });
      if (s4.error) errors.push(s4.error);
      const s5del = await supabase.from('about_highlights').delete().eq('site_id', 1);
      if (s5del.error) errors.push(s5del.error);
      if (Array.isArray(c.about?.highlights) && c.about.highlights.length) {
        const rows = c.about.highlights.map((v, idx) => ({ site_id: 1, value: v, sort_order: (idx + 1) * 10 }));
        const s5ins = await supabase.from('about_highlights').insert(rows);
        if (s5ins.error) errors.push(s5ins.error);
      }
    }
    

    // services
    if (should('services')) {
      const s6del = await supabase.from('services').delete().eq('site_id', 1);
      if (s6del.error) errors.push(s6del.error);
      if (Array.isArray(c.services) && c.services.length) {
        const rows = c.services.map((s, idx) => ({
          site_id: 1,
          icon: s.icon,
          title: s.title,
          description: s.description,
          icon_path: s.icon_path || null,
          sort_order: (idx + 1) * 10,
        }));
        const s6ins = await supabase.from('services').insert(rows);
        if (s6ins.error) errors.push(s6ins.error);
      }
    }
    // Education
    if (should('education')) {
      const eduDel = await supabase.from('education').delete().eq('site_id', 1);
      if (eduDel?.error) errors.push(eduDel.error);
      if (Array.isArray(c.education) && c.education.length) {
        const rows = c.education.map((item, idx) => ({
          site_id: 1,
          institution: item.institution || '',
          program: item.program || '',
          location: item.location || '',
          start_year: item.start || '',
          end_year: item.end || '',
          description: item.description || '',
          achievements: joinMultilineList(item.achievements),
          icon_path: item.icon_path || null,
          sort_order: (idx + 1) * 10,
        }));
        const eduIns = await supabase.from('education').insert(rows);
        if (eduIns?.error) errors.push(eduIns.error);
      }
    }
    // Experience
    if (should('experience')) {
      const expDel = await supabase.from('experience').delete().eq('site_id', 1);
      if (expDel?.error) errors.push(expDel.error);
      if (Array.isArray(c.experience) && c.experience.length) {
        const rows = c.experience.map((item, idx) => ({
          site_id: 1,
          company: item.company || '',
          role: item.role || '',
          location: item.location || '',
          start_year: item.start || '',
          end_year: item.end || '',
          description: item.description || '',
          achievements: joinMultilineList(item.achievements),
          icon_path: item.icon_path || null,
          sort_order: (idx + 1) * 10,
        }));
        const expIns = await supabase.from('experience').insert(rows);
        if (expIns?.error) errors.push(expIns.error);
      }
    }
    // Projects + tags
    if (should('projects')) {
      let existingIds = [];
      const { data: existingProjects, error: existingFetchErr } = await supabase.from('projects').select('id').eq('site_id', 1);
      if (existingFetchErr) {
        errors.push(existingFetchErr);
      } else {
        existingIds = (existingProjects ?? []).map((row) => row.id).filter(Boolean);
        if (existingIds.length) {
          const { error: tagsDelErr } = await supabase.from('project_tags').delete().in('project_id', existingIds);
          if (tagsDelErr) errors.push(tagsDelErr);
        }
      }
      const deleteResult = await supabase.from('projects').delete().eq('site_id', 1);
      if (deleteResult.error) {
        errors.push(deleteResult.error);
      }
      const uniqueProjects = dedupeProjects(Array.isArray(c.projects) ? c.projects : []);
      if (!deleteResult.error && uniqueProjects.length) {
        const rows = uniqueProjects.map((p, idx) => ({
          site_id: 1,
          title: p.title || '',
          description: p.description || '',
          link: p.link || null,
          cover_image_path: p.cover_image_path || null,
          sort_order: (idx + 1) * 10,
        }));
        const ins = await supabase.from('projects').insert(rows).select('id');
        if (ins.error) {
          errors.push(ins.error);
        } else if (ins.data && ins.data.length) {
          const tags = [];
          ins.data.forEach((r, i) => {
            const normalizedTags = dedupeTags(uniqueProjects[i]?.tags);
            normalizedTags.forEach((t) => tags.push({ project_id: r.id, tag: t }));
          });
          if (tags.length) {
            const tIns = await supabase.from('project_tags').insert(tags);
            if (tIns.error) errors.push(tIns.error);
          }
        }
      }
    }
    // Contact, visibility, why_us
    if (should('contact')) {
      const s8 = await supabase.from('contact').upsert({ site_id: 1, email: c.contact?.email || '', location: c.contact?.location || '', schedule_url: c.contact?.scheduleUrl || '' }, { onConflict: 'site_id' });
      if (s8.error) errors.push(s8.error);
    }
    if (should('visibility')) {
      const s9 = await supabase.from('visibility').upsert({ site_id: 1, services: !!c.visibility?.services, projects: !!c.visibility?.projects, testimonials: !!c.visibility?.testimonials, team: !!c.visibility?.team, resume: !!c.visibility?.resume }, { onConflict: 'site_id' });
      if (s9.error) errors.push(s9.error);
    }
    if (should('why_us')) {
      const s10del = await supabase.from('why_us').delete().eq('site_id', 1);
      if (s10del.error) errors.push(s10del.error);
      if (Array.isArray(c.whyUs) && c.whyUs.length) {
        const rows = c.whyUs.map((w, idx) => ({ site_id: 1, icon: w.icon, title: w.title, subtitle: w.subtitle || '', sort_order: (idx + 1) * 10 }));
        const s10ins = await supabase.from('why_us').insert(rows);
        if (s10ins.error) errors.push(s10ins.error);
      }
    }

    // resume meta (summary)
    if (should('resume') || should('resume_meta')) {
      const summary = typeof c.resumeSummary === 'string' ? c.resumeSummary : '';
      const sMeta = await supabase.from('resume_meta').upsert({ site_id: 1, summary }, { onConflict: 'site_id' });
      if (sMeta.error) errors.push(sMeta.error);
    }

    // Blog posts upsert (no destructive delete; AdminPanel handles explicit deletions)
    if (should('blog')) {
      if (Array.isArray(c.blogPosts)) {
        const rows = c.blogPosts.map((p, idx) => ({
          site_id: 1,
          title: p.title || '',
          slug: slugify(p.slug || p.title || `post-${idx + 1}`),
          excerpt: p.excerpt || '',
          content_md: p.content_md || '',
          cover_image_path: p.cover_image_path || null,
          tags: Array.isArray(p.tags) ? p.tags.map((s)=>String(s||'').trim()).filter(Boolean).join('|') : (p.tags || null),
          published: !!p.published,
          published_at: p.published ? (p.published_at || new Date().toISOString()) : null,
          sort_order: (idx + 1) * 10,
        }));
        const sBlog = await supabase.from('blog_posts').upsert(rows, { onConflict: 'site_id,slug' });
        if (sBlog.error) errors.push(sBlog.error);
      }
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




















