import type { Experience } from "./types";

// Most recent first. Entries marked `draft` are placeholders: replace them
// with real positions and remove the flag.
const allExperience: Experience[] = [
  {
    company: "Current company",
    role: { en: "Senior Software Engineer", "pt-BR": "Engenheiro de Software Sênior" },
    start: "2022-01",
    location: "São Paulo, BR",
    summary: {
      en: "Development and maintenance of complex components that enable users to build applications intuitively.",
      "pt-BR": "Desenvolvimento e manutenção de componentes complexos que permitem aos usuários construir aplicações de forma intuitiva.",
    },
    highlights: {
      en: [
        "Implemented performance optimizations and new features with cross-functional teams.",
        "Worked with DevOps on Docker-based environments, Vite tooling and pnpm workspaces.",
      ],
      "pt-BR": [
        "Implementei otimizações de performance e novas funcionalidades com times multidisciplinares.",
        "Trabalhei com DevOps em ambientes Docker, ferramentas Vite e workspaces pnpm.",
      ],
    },
    stack: ["React", "TypeScript", "Vite", "Docker", "pnpm", "Vitest"],
    draft: true,
  },
  {
    company: "Previous company",
    role: { en: "Frontend Developer", "pt-BR": "Desenvolvedor Frontend" },
    start: "2018-01",
    end: "2022-01",
    summary: {
      en: "Built responsive websites and maintained legacy applications.",
      "pt-BR": "Construção de sites responsivos e manutenção de aplicações legadas.",
    },
    highlights: {
      en: ["Collaborated with backend engineers to optimize API calls."],
      "pt-BR": ["Colaborei com engenheiros backend para otimizar chamadas de API."],
    },
    stack: ["JavaScript", "HTML", "CSS", "jQuery", "Bootstrap"],
    draft: true,
  },
];

export const experience = allExperience.filter((e) => import.meta.env.DEV || !e.draft);
