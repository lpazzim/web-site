import type { Profile } from "./types";

// Source of truth: linkedin.com/in/lpazzim.
export const profile: Profile = {
  headline: {
    en: "Senior Frontend Engineer · React / Next.js / TypeScript · Scalable apps, Web Performance, SEO, A11y",
    "pt-BR": "Engenheiro Frontend Sênior · React / Next.js / TypeScript · Apps escaláveis, Web Performance, SEO, A11y",
  },
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Zustand",
    "Zod",
    "Redux",
    "styled-components",
    "SCSS",
    "Design Systems",
    "i18n",
    "Accessibility (WCAG)",
    "Core Web Vitals",
    "Technical SEO",
    "REST / GraphQL",
    "Jest",
    "Vitest",
    "Playwright",
    "Vite",
    "Docker",
    "pnpm / Monorepos",
    "CI/CD",
    "AWS Amplify",
  ],
  languages: [
    { name: { en: "Portuguese", "pt-BR": "Português" }, level: { en: "Native", "pt-BR": "Nativo" } },
    { name: { en: "English", "pt-BR": "Inglês" }, level: { en: "Full professional", "pt-BR": "Profissional completo" } },
  ],
  education: [
    {
      institution: "Universidade Cruzeiro do Sul",
      course: { en: "Information Technology", "pt-BR": "Tecnologia da Informação" },
      period: "2018 — 2020",
    },
    {
      institution: "ETEC — Escola Técnica Estadual de São Paulo",
      course: { en: "Associate's degree, Information Technology", "pt-BR": "Técnico em Tecnologia da Informação" },
      period: "2007 — 2008",
    },
  ],
  certifications: [
    "JavaScript Algorithms and Data Structures Masterclass",
    "Curso de Inteligência Artificial para Devs",
    "Testando JavaScript e React com Jest e Enzyme",
    "Testes Automatizados na prática",
  ],
};
