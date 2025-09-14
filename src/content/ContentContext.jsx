import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'portfolio_content_v1';

const defaultContent = {
  siteName: 'Beiby Vanegaz',
  role: 'Data Analyst',
  seo: {
    title: 'Beiby Vanegaz — Data Analytics Portfolio',
    description:
      'Data analyst transforming raw data into clear, actionable insights. Dashboards, ETL, and storytelling with data.',
  },
  visibility: {
    services: true,
    projects: true,
    testimonials: false,
    team: false,
  },
  hero: {
    badge: 'Data Analytics',
    title: 'Turning Data Into Decisions',
    subtitle:
      'I help teams uncover insights and drive impact with clean data, clear dashboards, and compelling stories.',
    primaryCta: { label: 'View Projects', href: '#projects' },
    secondaryCta: { label: 'Contact Me', href: '#contact' },
  },
  about: {
    heading: "Hi, I'm Beiby Vanegaz",
    description:
      'Data Analyst focused on transforming raw data into business outcomes. I build clean pipelines, insightful analyses, and intuitive dashboards that help stakeholders act with confidence.',
    highlights: [
      'SQL, Python (pandas), Excel/Google Sheets',
      'Power BI, Tableau, Looker Studio',
      'ETL, data modeling, KPI design',
      'A/B testing, forecasting, cohort analysis',
    ],
  },
  services: [
    {
      icon: 'BarChart3',
      title: 'Dashboarding & BI',
      description: 'Design and build dashboards that surface the metrics that matter.'
    },
    {
      icon: 'Database',
      title: 'Data Cleaning & Modeling',
      description: 'From messy CSVs to reliable datasets ready for analysis.'
    },
    {
      icon: 'LineChart',
      title: 'Analysis & Insights',
      description: 'Exploratory analysis, cohorts, funnels, segmentation, and forecasting.'
    },
    {
      icon: 'Workflow',
      title: 'Automation & ETL',
      description: 'Automated pipelines that keep data fresh and trustworthy.'
    },
  ],
  projects: [
    {
      title: 'E-commerce Sales Dashboard',
      description:
        'Built a Power BI dashboard tracking revenue, CAC, conversion, and LTV with cohort analysis and forecasting.',
      tags: ['Power BI', 'SQL', 'Cohorts', 'Forecasting'],
      link: '#contact',
    },
    {
      title: 'Churn Prediction',
      description:
        'Modeled churn risk and identified key drivers using Python and logistic regression to improve retention.',
      tags: ['Python', 'pandas', 'LogReg', 'Retention'],
      link: '#contact',
    },
    {
      title: 'Marketing Attribution',
      description:
        'Combined ad platform data to attribute revenue and optimize spend across channels.',
      tags: ['SQL', 'ETL', 'Attribution'],
      link: '#contact',
    },
  ],
  contact: {
    email: 'hello@example.com',
    location: 'Remote / Worldwide',
    scheduleUrl: '',
  },
  whyUs: [
    { icon: 'Users', title: 'Equipo Experto', subtitle: 'Consultores Certificados' },
    { icon: 'Target', title: 'Resultados Garantizados', subtitle: 'ROI Comprobado' },
  ],
};

const ContentContext = createContext({
  content: defaultContent,
  setContent: () => {},
  resetContent: () => {},
});

export function ContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...defaultContent, ...JSON.parse(raw) } : defaultContent;
    } catch {
      return defaultContent;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // ignore persistence errors
    }
  }, [content]);

  const value = useMemo(
    () => ({
      content,
      setContent,
      resetContent: () => setContent(defaultContent),
    }),
    [content],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
