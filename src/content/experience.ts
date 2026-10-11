import type { Experience, Localized } from "./types";

// Source of truth: linkedin.com/in/lpazzim. Keep entries in sync with it,
// most recent first.

const seniorFrontend: Localized = {
  en: "Senior Frontend Software Engineer",
  "pt-BR": "Engenheiro de Software Frontend Sênior",
};

const coFounder: Localized = { en: "Co-founder", "pt-BR": "Cofundador" };
const developer: Localized = { en: "Developer", "pt-BR": "Desenvolvedor" };

// Zends and Embracon share the same scope of work on LinkedIn.
const reactConsulting: Pick<Experience, "summary" | "highlights" | "stack"> = {
  summary: {
    en: "Built a React application, from capturing business requirements to design, development and testing.",
    "pt-BR":
      "Construí uma aplicação em React, do levantamento de requisitos de negócio ao design, desenvolvimento e testes.",
  },
  highlights: {
    en: [
      "Analyzed system and functional requirements and documentation.",
      "Designed, developed and tested with HTML5, CSS3, Bootstrap, JavaScript, jQuery and React to meet accessibility and web browser standards.",
      "Designed CSS templates used across every page of the website.",
    ],
    "pt-BR": [
      "Analisei requisitos de sistema, requisitos funcionais e documentação.",
      "Projetei, desenvolvi e testei com HTML5, CSS3, Bootstrap, JavaScript, jQuery e React, atendendo a padrões de acessibilidade e de navegadores.",
      "Criei templates CSS usados em todas as páginas do site.",
    ],
  },
  stack: ["React", "TypeScript", "JavaScript", "SCSS", "LESS", "Bootstrap", "GitLab"],
};

const earlyStartup: Pick<Experience, "summary" | "highlights" | "stack"> = {
  summary: {
    en: "Analyzed business requirements, then designed, developed and tested web applications.",
    "pt-BR": "Analisei requisitos de negócio e projetei, desenvolvi e testei aplicações web.",
  },
  highlights: {
    en: [
      "Designed and developed UIs using HTML, CSS3, JavaScript and JSON.",
      "Built responsive websites with JavaScript, jQuery, HTML5, CSS and Bootstrap components.",
    ],
    "pt-BR": [
      "Projetei e desenvolvi interfaces com HTML, CSS3, JavaScript e JSON.",
      "Construí sites responsivos com JavaScript, jQuery, HTML5, CSS e componentes Bootstrap.",
    ],
  },
  stack: ["JavaScript", "jQuery", "HTML5", "CSS3", "Bootstrap"],
};

const allExperience: Experience[] = [
  {
    company: "Treeunfe",
    role: seniorFrontend,
    start: "2026-03",
    location: "Maringá, BR",
    summary: {
      en: "Frontend development and scaling of a complex invoice generation SaaS.",
      "pt-BR": "Desenvolvimento frontend e escala de um SaaS complexo de emissão de notas fiscais.",
    },
    highlights: {
      en: [
        "Collaborated on a critical core technology migration of a high-throughput invoice generation platform with near-zero downtime, modernizing the stack and improving maintainability.",
        "Architected and implemented high-concurrency features supporting 1,000+ simultaneous users.",
        "Configured and managed automated CI/CD pipelines and cloud deployments on AWS Amplify.",
        "Built scalable web components, enforcing strict code standards, performance optimizations and robust state management.",
      ],
      "pt-BR": [
        "Colaborei em uma migração crítica de tecnologia core de uma plataforma de emissão de notas de alto volume, com downtime praticamente zero, modernizando a stack e melhorando a manutenibilidade.",
        "Projetei e implementei funcionalidades de alta concorrência com suporte a mais de 1.000 usuários simultâneos.",
        "Configurei e mantive pipelines de CI/CD automatizados e deploys em nuvem com AWS Amplify.",
        "Construí componentes web escaláveis, com padrões de código rigorosos, otimizações de performance e gerenciamento de estado robusto.",
      ],
    },
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Zustand", "Zod", "AWS Amplify"],
  },
  {
    company: "UPX",
    role: seniorFrontend,
    start: "2023-11",
    end: "2026-02",
    location: "São Paulo, BR",
    summary: {
      en: "Scalable web applications with React, Next.js and TypeScript in enterprise environments.",
      "pt-BR": "Aplicações web escaláveis com React, Next.js e TypeScript em ambientes corporativos.",
    },
    highlights: {
      en: [
        "Led frontend architecture decisions, including component design and design systems.",
        "Optimized Web Performance and Core Web Vitals, improving Lighthouse metrics and load times.",
        "Implemented technical SEO strategies, including dynamic metadata and canonical optimization.",
        "Designed multi-language (i18n) architectures with dynamic routing.",
        "Applied code splitting, lazy loading and bundle optimization techniques.",
        "Developed automated tests with Jest, Vitest and Playwright, and managed deployments through CI/CD pipelines.",
      ],
      "pt-BR": [
        "Liderei decisões de arquitetura frontend, incluindo design de componentes e design systems.",
        "Otimizei Web Performance e Core Web Vitals, melhorando as métricas do Lighthouse e os tempos de carregamento.",
        "Implementei estratégias de SEO técnico, incluindo metadados dinâmicos e otimização de canonical.",
        "Projetei arquiteturas multi-idioma (i18n) com roteamento dinâmico.",
        "Apliquei code splitting, lazy loading e técnicas de otimização de bundle.",
        "Desenvolvi testes automatizados com Jest, Vitest e Playwright e gerenciei deploys via pipelines de CI/CD.",
      ],
    },
    stack: ["React", "Next.js", "TypeScript", "REST", "Jest", "Vitest", "Playwright"],
  },
  {
    company: "Jestor",
    role: seniorFrontend,
    start: "2022-06",
    end: "2023-08",
    summary: {
      en: "Created and maintained complex components that let users build applications effortlessly in a no-code platform.",
      "pt-BR":
        "Criei e mantive componentes complexos que permitem aos usuários construir aplicações sem esforço em uma plataforma no-code.",
    },
    highlights: {
      en: [
        "Continuously improved the application with optimizations, performance gains and new features.",
        "Worked with DevOps on frontend integration using Docker, Vite (fast development and HMR) and pnpm.",
        "Implemented and enforced coding standards and best practices with Prettier.",
        "Built reusable UI components with styled-components.",
      ],
      "pt-BR": [
        "Evoluí continuamente a aplicação com otimizações, ganhos de performance e novas funcionalidades.",
        "Trabalhei com DevOps na integração do frontend usando Docker, Vite (desenvolvimento rápido e HMR) e pnpm.",
        "Implementei e garanti padrões de código e boas práticas com Prettier.",
        "Construí componentes de UI reutilizáveis com styled-components.",
      ],
    },
    stack: ["React", "TypeScript", "styled-components", "Docker", "Vite", "pnpm", "Prettier"],
  },
  {
    company: "Zends Soluções Tecnológicas",
    role: seniorFrontend,
    start: "2021-06",
    end: "2022-06",
    location: "São Paulo, BR",
    ...reactConsulting,
  },
  {
    company: "Embracon",
    role: seniorFrontend,
    start: "2021-01",
    end: "2021-06",
    location: "Santana de Parnaíba, BR",
    ...reactConsulting,
  },
  {
    company: "Webmotors",
    role: seniorFrontend,
    start: "2019-08",
    end: "2021-01",
    location: "São Paulo, BR",
    summary: {
      en: "Member of the tech financial team, maintaining and shipping features with a constant focus on performance, usability and presentation.",
      "pt-BR":
        "Integrante do time de tecnologia financeira, mantendo e entregando funcionalidades com foco constante em performance, usabilidade e apresentação.",
    },
    highlights: {
      en: [
        "SEO was critical: the product needed to rank highly in Google searches.",
        "Upheld quality standards with coding best practices, ESLint and Google Analytics.",
      ],
      "pt-BR": [
        "SEO era crítico: o produto precisava ranquear bem nas buscas do Google.",
        "Mantive padrões de qualidade com boas práticas de código, ESLint e Google Analytics.",
      ],
    },
    stack: ["React", "Next.js", "Redux", "TypeScript", "SCSS", "Bitbucket"],
  },
  {
    company: "UnitedHealth Group",
    role: { en: "Frontend Software Engineer", "pt-BR": "Engenheiro de Software Frontend" },
    start: "2017-11",
    end: "2019-08",
    location: "São Paulo, BR",
    summary: {
      en: "Developed efficient, reusable and dependable frontend code.",
      "pt-BR": "Desenvolvi código frontend eficiente, reutilizável e confiável.",
    },
    highlights: {
      en: ["Helped the team create a new product used by hundreds of doctors in their daily consultations."],
      "pt-BR": ["Ajudei o time a criar um novo produto usado por centenas de médicos em suas consultas diárias."],
    },
    stack: ["React", "Redux", "TypeScript", "SCSS", "GitHub"],
  },
  { company: "Class T", role: coFounder, start: "2015-05", end: "2017-11", location: "São Paulo, BR", ...earlyStartup },
  { company: "Iunity", role: coFounder, start: "2015-01", end: "2017-10", location: "São Paulo, BR", ...earlyStartup },
  {
    company: "Sol Automação Comercial",
    role: developer,
    start: "2011",
    end: "2012",
    location: "São Paulo, BR",
    summary: {
      en: "Built and maintained a Delphi 7 application.",
      "pt-BR": "Construí e mantive uma aplicação em Delphi 7.",
    },
    highlights: {
      en: ["Analyzed system and functional requirements and documentation."],
      "pt-BR": ["Analisei requisitos de sistema, requisitos funcionais e documentação."],
    },
    stack: ["Delphi"],
  },
  {
    company: "HTD Sistemas",
    role: developer,
    start: "2010",
    end: "2011",
    location: "São Paulo, BR",
    summary: {
      en: "Built and maintained a Delphi 7 application.",
      "pt-BR": "Construí e mantive uma aplicação em Delphi 7.",
    },
    highlights: {
      en: ["Worked with backend engineers to optimize existing API calls by deprecating unneeded ones."],
      "pt-BR": ["Trabalhei com engenheiros backend para otimizar chamadas de API, descontinuando as desnecessárias."],
    },
    stack: ["Delphi"],
  },
];

export const experience = allExperience.filter((e) => import.meta.env.DEV || !e.draft);
