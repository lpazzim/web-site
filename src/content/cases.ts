import type { CaseStudy } from "./types";

// Professional case studies. Source of truth: linkedin.com/in/lpazzim —
// facts and figures here must match what is stated there.
export const professionalCases: CaseStudy[] = [
  {
    id: "treeunfe",
    title: "Treeunfe",
    company: "Treeunfe",
    period: "2026",
    role: { en: "Senior Frontend Software Engineer", "pt-BR": "Engenheiro de Software Frontend Sênior" },
    category: { en: "Invoice generation SaaS", "pt-BR": "SaaS de emissão de notas fiscais" },
    summary: {
      en: "Scaling the frontend of a high-throughput invoice generation SaaS, including a core technology migration with near-zero downtime.",
      "pt-BR": "Escala do frontend de um SaaS de emissão de notas fiscais de alto volume, incluindo uma migração de tecnologia core com downtime praticamente zero.",
    },
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Zustand", "Zod", "AWS Amplify"],
    context: {
      en: "Invoice generation is critical, high-throughput work: the platform has to stay available while it evolves, and the interface has to hold up under many users working at the same time.",
      "pt-BR": "Emissão de notas é um trabalho crítico e de alto volume: a plataforma precisa continuar disponível enquanto evolui, e a interface precisa aguentar muitos usuários trabalhando ao mesmo tempo.",
    },
    contributions: {
      en: [
        "Collaborated on a critical core technology migration with near-zero downtime, modernizing the stack and improving overall maintainability.",
        "Contributed to the frontend development and scaling of the SaaS with Next.js, Tailwind CSS, Zustand and Zod.",
        "Architected and implemented high-concurrency features supporting 1,000+ simultaneous users.",
        "Configured and managed automated CI/CD pipelines and cloud deployments on AWS Amplify.",
        "Built scalable web components, enforcing strict code standards, performance optimizations and robust state management.",
      ],
      "pt-BR": [
        "Colaborei em uma migração crítica de tecnologia core com downtime praticamente zero, modernizando a stack e melhorando a manutenibilidade.",
        "Contribuí para o desenvolvimento e a escala do frontend do SaaS com Next.js, Tailwind CSS, Zustand e Zod.",
        "Projetei e implementei funcionalidades de alta concorrência com suporte a mais de 1.000 usuários simultâneos.",
        "Configurei e mantive pipelines de CI/CD automatizados e deploys em nuvem com AWS Amplify.",
        "Construí componentes web escaláveis, com padrões de código rigorosos, otimizações de performance e gerenciamento de estado robusto.",
      ],
    },
    results: {
      en: [
        { value: "1,000+", label: "simultaneous users supported" },
        { value: "≈0", label: "downtime during the core migration" },
        { value: "CI/CD", label: "automated deployments on AWS Amplify" },
      ],
      "pt-BR": [
        { value: "1.000+", label: "usuários simultâneos suportados" },
        { value: "≈0", label: "de downtime na migração core" },
        { value: "CI/CD", label: "deploys automatizados no AWS Amplify" },
      ],
    },
    accent: "152 60% 42%",
    featured: true,
  },
  {
    id: "upx",
    title: "UPX",
    company: "UPX",
    period: "2023 — 2026",
    role: { en: "Senior Frontend Software Engineer", "pt-BR": "Engenheiro de Software Frontend Sênior" },
    category: { en: "Performance, SEO & i18n", "pt-BR": "Performance, SEO & i18n" },
    summary: {
      en: "Frontend architecture for enterprise web applications, with a focus on Core Web Vitals, technical SEO and multi-language routing.",
      "pt-BR": "Arquitetura frontend para aplicações web corporativas, com foco em Core Web Vitals, SEO técnico e roteamento multi-idioma.",
    },
    stack: ["React", "Next.js", "TypeScript", "REST", "Jest", "Vitest", "Playwright"],
    context: {
      en: "Enterprise web applications that need to be fast, discoverable in search and available in multiple languages, built and shipped together with product, design and backend teams.",
      "pt-BR": "Aplicações web corporativas que precisam ser rápidas, encontráveis em buscadores e disponíveis em vários idiomas, construídas e entregues junto com times de produto, design e backend.",
    },
    contributions: {
      en: [
        "Led frontend architecture decisions, including component design and design systems.",
        "Optimized Web Performance and Core Web Vitals, improving Lighthouse metrics and load times.",
        "Implemented technical SEO strategies, including dynamic metadata and canonical optimization.",
        "Designed and implemented multi-language (i18n) architectures with dynamic routing.",
        "Developed automated tests with Jest, Vitest and Playwright, and managed deployments through CI/CD pipelines.",
      ],
      "pt-BR": [
        "Liderei decisões de arquitetura frontend, incluindo design de componentes e design systems.",
        "Otimizei Web Performance e Core Web Vitals, melhorando as métricas do Lighthouse e os tempos de carregamento.",
        "Implementei estratégias de SEO técnico, incluindo metadados dinâmicos e otimização de canonical.",
        "Projetei e implementei arquiteturas multi-idioma (i18n) com roteamento dinâmico.",
        "Desenvolvi testes automatizados com Jest, Vitest e Playwright e gerenciei deploys via pipelines de CI/CD.",
      ],
    },
    decisions: {
      en: [
        {
          title: "Code splitting and lazy loading",
          body: "Applied code splitting, lazy loading and bundle optimization so each page ships only the code it needs.",
        },
        {
          title: "Dynamic metadata and canonicals",
          body: "Generated metadata per page and optimized canonical URLs as part of the technical SEO strategy.",
        },
        {
          title: "i18n with dynamic routing",
          body: "Structured multi-language support around dynamic routes, so each language is served from its own URLs.",
        },
      ],
      "pt-BR": [
        {
          title: "Code splitting e lazy loading",
          body: "Apliquei code splitting, lazy loading e otimização de bundle para que cada página carregue apenas o código de que precisa.",
        },
        {
          title: "Metadados dinâmicos e canonicals",
          body: "Gerei metadados por página e otimizei as URLs canônicas como parte da estratégia de SEO técnico.",
        },
        {
          title: "i18n com roteamento dinâmico",
          body: "Estruturei o suporte a vários idiomas em torno de rotas dinâmicas, servindo cada idioma em suas próprias URLs.",
        },
      ],
    },
    results: {
      en: [
        { value: "CWV", label: "better Lighthouse metrics and load times" },
        { value: "SEO", label: "dynamic metadata and canonical strategy" },
        { value: "i18n", label: "multi-language architecture with dynamic routing" },
      ],
      "pt-BR": [
        { value: "CWV", label: "melhores métricas no Lighthouse e tempos de carregamento" },
        { value: "SEO", label: "metadados dinâmicos e estratégia de canonical" },
        { value: "i18n", label: "arquitetura multi-idioma com roteamento dinâmico" },
      ],
    },
    accent: "211 100% 55%",
    featured: true,
  },
  {
    id: "webmotors",
    title: "Webmotors",
    company: "Webmotors",
    period: "2019 — 2021",
    role: { en: "Senior Frontend Software Engineer", "pt-BR": "Engenheiro de Software Frontend Sênior" },
    category: { en: "Automotive marketplace · Financial team", "pt-BR": "Marketplace automotivo · Time financeiro" },
    summary: {
      en: "Building and maintaining features for the tech financial team, where ranking high in Google searches was a product requirement.",
      "pt-BR": "Construção e manutenção de funcionalidades no time de tecnologia financeira, onde ranquear bem no Google era requisito de produto.",
    },
    stack: ["React", "Next.js", "Redux", "TypeScript", "SCSS", "ESLint", "Google Analytics"],
    context: {
      en: "As part of the tech financial team, the work combined new features and maintenance with a constant focus on performance, usability and presentation. SEO was critical: the product needed to rank highly in Google searches.",
      "pt-BR": "No time de tecnologia financeira, o trabalho combinava novas funcionalidades e manutenção com foco constante em performance, usabilidade e apresentação. SEO era crítico: o produto precisava ranquear bem nas buscas do Google.",
    },
    contributions: {
      en: [
        "Maintained and implemented new features focused on performance, usability and presentation.",
        "Worked on SEO optimization so the product could rank highly in Google searches.",
        "Upheld quality standards with coding best practices, ESLint and Google Analytics.",
      ],
      "pt-BR": [
        "Mantive e implementei novas funcionalidades com foco em performance, usabilidade e apresentação.",
        "Trabalhei na otimização de SEO para que o produto ranqueasse bem nas buscas do Google.",
        "Mantive padrões de qualidade com boas práticas de código, ESLint e Google Analytics.",
      ],
    },
    results: {
      en: [
        { value: "SEO", label: "search ranking as a core product goal" },
        { value: "Next.js", label: "React, Redux and TypeScript in production" },
      ],
      "pt-BR": [
        { value: "SEO", label: "ranqueamento em buscas como objetivo do produto" },
        { value: "Next.js", label: "React, Redux e TypeScript em produção" },
      ],
    },
    accent: "0 80% 55%",
    featured: true,
  },
  {
    id: "unitedhealth-group",
    title: "UnitedHealth Group",
    company: "UnitedHealth Group",
    period: "2017 — 2019",
    role: { en: "Frontend Software Engineer", "pt-BR": "Engenheiro de Software Frontend" },
    category: { en: "Healthcare product", "pt-BR": "Produto de saúde" },
    summary: {
      en: "Helping create a new product used by hundreds of doctors in their daily consultations.",
      "pt-BR": "Participação na criação de um novo produto usado por centenas de médicos em suas consultas diárias.",
    },
    stack: ["React", "Redux", "TypeScript", "JavaScript", "SCSS", "GitHub"],
    context: {
      en: "A new product built from the ground up for doctors to use during their daily consultations, where the frontend had to be efficient, reusable and dependable.",
      "pt-BR": "Um novo produto construído do zero para médicos usarem em suas consultas diárias, em que o frontend precisava ser eficiente, reutilizável e confiável.",
    },
    contributions: {
      en: [
        "Played an integral role helping the team create the new product.",
        "Developed efficient, reusable and dependable frontend code with React, Redux and TypeScript.",
      ],
      "pt-BR": [
        "Tive papel fundamental ajudando o time a criar o novo produto.",
        "Desenvolvi código frontend eficiente, reutilizável e confiável com React, Redux e TypeScript.",
      ],
    },
    results: {
      en: [{ value: "100s", label: "of doctors using it in daily consultations" }],
      "pt-BR": [{ value: "100s", label: "de médicos usando nas consultas diárias" }],
    },
    accent: "24 95% 55%",
    featured: true,
  },
  {
    id: "jestor",
    title: "Jestor",
    company: "Jestor",
    period: "2022 — 2023",
    role: { en: "Senior Frontend Software Engineer", "pt-BR": "Engenheiro de Software Frontend Sênior" },
    category: { en: "No-code platform", "pt-BR": "Plataforma no-code" },
    summary: {
      en: "Complex components that let users build their own applications effortlessly on a no-code platform.",
      "pt-BR": "Componentes complexos que permitem aos usuários construir suas próprias aplicações sem esforço em uma plataforma no-code.",
    },
    stack: ["React", "TypeScript", "styled-components", "Docker", "Vite", "pnpm", "Prettier"],
    context: {
      en: "In a no-code platform, the components are the product: users assemble applications from them, so they need to be powerful, reliable and easy to use.",
      "pt-BR": "Em uma plataforma no-code, os componentes são o produto: os usuários montam aplicações com eles, então precisam ser poderosos, confiáveis e fáceis de usar.",
    },
    contributions: {
      en: [
        "Created and maintained complex components that empower users to build applications effortlessly.",
        "Continuously enhanced the application with optimizations, performance improvements and new features.",
        "Collaborated with DevOps on frontend integration using Docker, Vite and pnpm.",
        "Implemented and enforced coding standards and best practices with Prettier.",
        "Built reusable, styled UI components with styled-components.",
      ],
      "pt-BR": [
        "Criei e mantive componentes complexos que permitem aos usuários construir aplicações sem esforço.",
        "Evoluí continuamente a aplicação com otimizações, melhorias de performance e novas funcionalidades.",
        "Colaborei com DevOps na integração do frontend usando Docker, Vite e pnpm.",
        "Implementei e garanti padrões de código e boas práticas com Prettier.",
        "Construí componentes de UI reutilizáveis e estilizados com styled-components.",
      ],
    },
    results: {
      en: [
        { value: "No-code", label: "components users build applications with" },
        { value: "Vite", label: "fast development and HMR in a Docker setup" },
      ],
      "pt-BR": [
        { value: "No-code", label: "componentes com que os usuários constroem aplicações" },
        { value: "Vite", label: "desenvolvimento rápido e HMR em ambiente Docker" },
      ],
    },
    accent: "262 83% 62%",
  },
];
