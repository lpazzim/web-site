import type { CaseStudy } from "./types";
import { professionalCases } from "./cases";

// This site itself, listed after the professional work.
const portfolioCase: CaseStudy = {
  id: "lpazzim-com",
  title: "lpazzim.com",
  company: "Personal project",
  period: "2025 — 2026",
  role: { en: "Design & Engineering", "pt-BR": "Design & Engenharia" },
  category: { en: "Portfolio / Living CV", "pt-BR": "Portfólio / CV vivo" },
  summary: {
    en: "This site: a bilingual, editorial-style portfolio that doubles as a living CV, with a blog powered by Notion as a headless CMS.",
    "pt-BR":
      "Este site: um portfólio bilíngue de estética editorial que funciona como CV vivo, com um blog que usa o Notion como CMS headless.",
  },
  stack: [
    "React",
    "TypeScript",
    "Vite",
    "Tailwind CSS",
    "Framer Motion",
    "TanStack Query",
    "i18next",
    "Notion API",
    "Vercel",
  ],
  context: {
    en: "I wanted a portfolio that shows how I work rather than just listing technologies: typed content, motion with intent, real data and a publishing flow I actually enjoy using.",
    "pt-BR":
      "Eu queria um portfólio que mostrasse como eu trabalho em vez de apenas listar tecnologias: conteúdo tipado, animação com propósito, dados reais e um fluxo de publicação que eu goste de usar.",
  },
  contributions: {
    en: [
      "Designed the editorial visual language: oversized serif type, restrained palette, scroll-driven reveals.",
      "Built a typed, bilingual content model so every case study and role is written once per language and checked by TypeScript.",
      "Integrated Notion as a headless CMS through Vercel Serverless Functions, keeping the API token out of the client bundle.",
      "Set up EN / PT-BR internationalization with persisted language preference.",
    ],
    "pt-BR": [
      "Desenhei a linguagem visual editorial: tipografia serifada em grande escala, paleta contida e revelações guiadas pelo scroll.",
      "Criei um modelo de conteúdo tipado e bilíngue, em que cada case e cada experiência é escrito uma vez por idioma e validado pelo TypeScript.",
      "Integrei o Notion como CMS headless via Vercel Serverless Functions, mantendo o token da API fora do bundle do cliente.",
      "Configurei a internacionalização EN / PT-BR com a preferência de idioma persistida.",
    ],
  },
  decisions: {
    en: [
      {
        title: "Notion as the CMS",
        body: "Writing happens where I already take notes. A serverless function queries the database, filters by a Published flag and returns plain JSON, cached at the edge with stale-while-revalidate.",
      },
      {
        title: "Content as typed data, not markup",
        body: "Case studies live in TypeScript objects instead of JSX. Missing translations become compile errors, and the same data can later generate a PDF résumé.",
      },
      {
        title: "Generated covers over stock photos",
        body: "Each case gets a generative line-art cover seeded by its id and tinted by its own accent color, so the archive stays visually consistent without stock imagery.",
      },
    ],
    "pt-BR": [
      {
        title: "Notion como CMS",
        body: "Escrevo onde já faço minhas anotações. Uma função serverless consulta o banco, filtra pela flag Published e devolve JSON simples, com cache na edge e stale-while-revalidate.",
      },
      {
        title: "Conteúdo como dado tipado, não markup",
        body: "Os cases ficam em objetos TypeScript em vez de JSX. Uma tradução faltando vira erro de compilação, e os mesmos dados podem gerar um currículo em PDF no futuro.",
      },
      {
        title: "Capas geradas em vez de fotos de banco",
        body: "Cada case ganha uma capa generativa de linhas, gerada a partir do seu id e tingida pela própria cor de destaque, mantendo o arquivo visualmente consistente sem imagens de banco.",
      },
    ],
  },
  results: {
    en: [
      { value: "2", label: "languages, fully translated" },
      { value: "-95%", label: "image weight after asset cleanup" },
      { value: "0", label: "secrets shipped to the browser" },
    ],
    "pt-BR": [
      { value: "2", label: "idiomas, totalmente traduzidos" },
      { value: "-95%", label: "de peso em imagens após a limpeza" },
      { value: "0", label: "segredos enviados ao navegador" },
    ],
  },
  learnings: {
    en: "A portfolio is a product with one very specific user: the person deciding whether to talk to you. Every section should answer a question they have.",
    "pt-BR":
      "Um portfólio é um produto com um usuário muito específico: a pessoa que está decidindo se vai falar com você. Cada seção deve responder a uma pergunta dela.",
  },
  links: { live: "https://lpazzim.com", repo: "https://github.com/lpazzim/web-site" },
  accent: "211 100% 55%",
  featured: false,
};

const allProjects: CaseStudy[] = [...professionalCases, portfolioCase];

export const projects = allProjects.filter((p) => import.meta.env.DEV || !p.draft);
