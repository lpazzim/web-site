import type { CaseStudy } from "./types";
import { professionalCases } from "./cases";

// Personal study projects, listed first. Source of truth: each repository's README; covers and
// galleries are screenshots from those READMEs, converted to WebP under public/images/projects/<id>.
const ecosDoDestino: CaseStudy = {
  id: "ecos-do-destino",
  title: "Ecos do Destino",
  company: "Personal project",
  period: "2026",
  role: { en: "Design & Engineering", "pt-BR": "Design & Engenharia" },
  category: { en: "16-bit Action RPG, no engine", "pt-BR": "RPG de ação 16-bit, sem engine" },
  summary: {
    en: "A SNES-style action RPG built with vanilla JavaScript and Canvas 2D: no framework, no game engine, no build step. A playable lab for the frontend fundamentals that libraries usually hide.",
    "pt-BR":
      "Um RPG de ação estilo SNES feito com JavaScript puro e Canvas 2D: sem framework, sem engine de jogo e sem etapa de build. Um laboratório jogável dos fundamentos de frontend que as bibliotecas costumam esconder.",
  },
  stack: ["JavaScript", "ES Modules", "Canvas 2D", "Node.js", "node:test", "sharp", "Vercel"],
  context: {
    en: "After years of React, Vue and bundlers, I wanted to see what is left when every abstraction is removed. A real-time game is the most demanding way to find out: it needs a render loop, input handling, state machines, persistence and tests, all running at 60 FPS in the browser with nothing but the platform.",
    "pt-BR":
      "Depois de anos com React, Vue e bundlers, eu queria ver o que sobra quando todas as abstrações são removidas. Um jogo em tempo real é o jeito mais exigente de descobrir: ele precisa de loop de renderização, tratamento de input, máquinas de estado, persistência e testes, tudo rodando a 60 FPS no navegador só com a plataforma.",
  },
  contributions: {
    en: [
      "Built a deterministic game loop on requestAnimationFrame (update → render → input flush) with clamped delta time, so physics, animations and cooldowns run at the same speed on any refresh rate.",
      "Painted the whole world in code: grass, water, trees, houses and caves are generated pixel by pixel into Uint8ClampedArray buffers and cached on offscreen canvases, with no third-party tilesets.",
      "Wrote a 5×7 bitmap font engine with per-color atlases, keeping text pixel-sharp where ctx.fillText would blur it at full-screen scale.",
      "Designed a modular architecture on native ES Modules with a one-way dependency graph: shop, equipment, dialog, damage and save rules are pure functions with no DOM or Canvas access.",
      "Shipped real-time combat with a party of three heroes (one player-controlled, two AI allies), a boss fight, NPC dialogs, a shop, an inn and an equipment system.",
      "Automated the art pipeline with Node.js and sharp: frame detection, background removal, 2× downscaling and 15-bit SNES palette quantization in a single command.",
    ],
    "pt-BR": [
      "Construí um game loop determinístico sobre requestAnimationFrame (update → render → limpeza do input) com delta time limitado, para que física, animações e recargas rodem na mesma velocidade em qualquer taxa de atualização.",
      "Pintei o mundo inteiro em código: grama, água, árvores, casas e cavernas são gerados pixel a pixel em buffers Uint8ClampedArray e cacheados em canvas offscreen, sem tilesets de terceiros.",
      "Escrevi um motor de fonte bitmap 5×7 com atlas por cor, mantendo o texto nítido onde o ctx.fillText ficaria borrado em tela cheia.",
      "Desenhei uma arquitetura modular com ES Modules nativos e grafo de dependências unidirecional: as regras de loja, equipamento, diálogo, dano e save são funções puras, sem acesso a DOM ou Canvas.",
      "Entreguei combate em tempo real com um grupo de três heróis (um controlado pelo jogador e dois aliados com IA), luta contra chefe, diálogos com NPCs, loja, estalagem e sistema de equipamentos.",
      "Automatizei o pipeline de arte com Node.js e sharp: detecção de quadros, remoção de fundo, redução 2× e quantização para a paleta SNES de 15 bits em um único comando.",
    ],
  },
  decisions: {
    en: [
      {
        title: "Zero frameworks, zero bundler",
        body: 'The browser loads the modules directly through <script type="module">. Save and reload is the whole feedback loop, and every layer (rendering, input, state, persistence) stays visible and readable instead of hidden behind a library.',
      },
      {
        title: "Pure rules, separated from rendering",
        body: "Business logic never touches the Canvas, so 124 tests run in milliseconds with node:test and no DOM emulation. Hero stats keep base values apart from equipment bonuses, recomputed on every change, so equipping and levelling up can never corrupt state.",
      },
      {
        title: "Seeded procedural dungeons",
        body: "Dungeon floors come from a seeded PRNG instead of Math.random(): the same seed always produces the same rooms, collisions and enemy positions, which lets flood-fill tests prove every floor is reachable.",
      },
      {
        title: "Versioned saves with migration",
        body: "Three localStorage slots carry a schema version. A migration function upgrades version-1 saves to version 2 on load, the same discipline a production app needs when its client-side data shape changes.",
      },
      {
        title: "Spec-driven development with AI agents",
        body: "Every feature goes through PRD, tech spec, atomic tasks, code review against the architecture rules and a playable QA pass, each step run by a dedicated AI skill and versioned in the repository.",
      },
    ],
    "pt-BR": [
      {
        title: "Zero frameworks, zero bundler",
        body: 'O navegador carrega os módulos diretamente via <script type="module">. Salvar e recarregar é todo o ciclo de feedback, e cada camada (renderização, input, estado, persistência) fica visível e legível em vez de escondida atrás de uma biblioteca.',
      },
      {
        title: "Regras puras, separadas da renderização",
        body: "A lógica de negócio nunca toca no Canvas, então 124 testes rodam em milissegundos com node:test e sem emular o DOM. Os atributos dos heróis separam valores base dos bônus de equipamento, recalculados a cada troca, para que equipar itens ou subir de nível nunca corrompa o estado.",
      },
      {
        title: "Dungeons procedurais com semente",
        body: "Os andares das dungeons vêm de um PRNG com semente em vez de Math.random(): a mesma semente sempre gera as mesmas salas, colisões e posições de inimigos, o que permite que testes de flood-fill provem que todo andar é alcançável.",
      },
      {
        title: "Saves versionados com migração",
        body: "Os três slots no localStorage carregam uma versão de esquema. Uma função de migração atualiza saves da versão 1 para a versão 2 ao carregar, a mesma disciplina que uma aplicação em produção precisa quando o formato dos dados no cliente muda.",
      },
      {
        title: "Desenvolvimento guiado por especificação com agentes de IA",
        body: "Cada funcionalidade passa por PRD, especificação técnica, tarefas atômicas, revisão de código contra as regras de arquitetura e uma rodada de QA jogável, cada etapa conduzida por uma skill de IA dedicada e versionada no repositório.",
      },
    ],
  },
  results: {
    en: [
      { value: "124", label: "automated tests on native node:test" },
      { value: "0", label: "runtime dependencies" },
      { value: "60", label: "FPS from a hand-written render loop" },
    ],
    "pt-BR": [
      { value: "124", label: "testes automatizados com node:test nativo" },
      { value: "0", label: "dependências em runtime" },
      { value: "60", label: "FPS em um loop de renderização feito à mão" },
    ],
  },
  learnings: {
    en: "Frameworks are faster to build with, but writing the loop, the font and the save format by hand made me much better at judging what they cost and when they are worth it.",
    "pt-BR":
      "Frameworks aceleram o desenvolvimento, mas escrever à mão o loop, a fonte e o formato do save me deixou muito melhor em avaliar quanto eles custam e quando valem a pena.",
  },
  links: { live: "https://nes-rpg.vercel.app", repo: "https://github.com/lpazzim/nes-rpg" },
  cover: "/images/projects/ecos-do-destino/menu-status.webp",
  gallery: [
    {
      src: "/images/projects/ecos-do-destino/title-screen.webp",
      width: 1920,
      height: 1080,
      title: { en: "Title screen", "pt-BR": "Tela título" },
      caption: {
        en: "A panning camera over the code-painted map, with the custom bitmap font keeping every letter sharp.",
        "pt-BR":
          "Câmera panorâmica sobre o mapa pintado por código, com a fonte bitmap própria mantendo cada letra nítida.",
      },
    },
    {
      src: "/images/projects/ecos-do-destino/village-dialog.webp",
      width: 1920,
      height: 1080,
      title: { en: "Exploration and dialogs", "pt-BR": "Exploração e diálogos" },
      caption: {
        en: "The village, with villagers on their walking routines, a save crystal and a SNES-style dialog box that reacts to campaign progress.",
        "pt-BR":
          "A vila, com moradores em rotina de passeio, cristal de save e caixa de diálogo estilo SNES que reage ao progresso da campanha.",
      },
    },
    {
      src: "/images/projects/ecos-do-destino/combat-boss.webp",
      width: 1920,
      height: 1080,
      title: { en: "Real-time combat", "pt-BR": "Combate em tempo real" },
      caption: {
        en: "A party of three heroes, one controlled by the player and two by AI, fighting the boss with hitboxes, particles and a live HUD.",
        "pt-BR":
          "Um grupo de três heróis, um controlado pelo jogador e dois pela IA, enfrentando o chefe com hitboxes, partículas e HUD em tempo real.",
      },
    },
    {
      src: "/images/projects/ecos-do-destino/village-shop.webp",
      width: 1920,
      height: 1080,
      title: { en: "Shop", "pt-BR": "Loja" },
      caption: {
        en: "Buying and selling consumables and gear, with stock and gold validated by pure, unit-tested functions.",
        "pt-BR":
          "Compra e venda de consumíveis e equipamentos, com estoque e ouro validados por funções puras e testadas.",
      },
    },
  ],
  accent: "45 90% 55%",
  featured: true,
};

const renderLab: CaseStudy = {
  id: "render-lab",
  title: "Render Lab",
  company: "Personal project",
  period: "2026",
  role: { en: "Design & Engineering", "pt-BR": "Design & Engenharia" },
  category: { en: "Interactive frontend course", "pt-BR": "Curso interativo de frontend" },
  summary: {
    en: "An interactive, bilingual platform that teaches how the browser really works: 19 lessons where every step is a live isometric scene, from the critical rendering path to hydration, bundlers and accessibility.",
    "pt-BR":
      "Uma plataforma interativa e bilíngue que ensina como o navegador funciona de verdade: 19 lições em que cada passo é uma cena isométrica viva, do caminho crítico de renderização à hidratação, bundlers e acessibilidade.",
  },
  stack: [
    "React 19",
    "TypeScript",
    "TanStack Router",
    "Zod",
    "Vite",
    "Web Animations API",
    "Vitest",
    "Playwright",
    "Vercel",
  ],
  context: {
    en: "Frontend fundamentals (reflow, the event loop, hydration, code splitting) are usually taught with static text and diagrams, which hides the thing that matters: how they change over time. Inspired by the visual approach of [Designed to Scale](https://designed-to-scale.vercel.app/) (created by [Dilum Sanjaya](https://x.com/DilumSanjaya)), which does this for backend systems, I built the same kind of guided, step-by-step experience for frontend engineering.",
    "pt-BR":
      "Fundamentos de frontend (reflow, event loop, hidratação, code splitting) costumam ser ensinados com texto e diagramas estáticos, o que esconde o que importa: como eles mudam ao longo do tempo. Inspirado na abordagem visual do [Designed to Scale](https://designed-to-scale.vercel.app/) (criado por [Dilum Sanjaya](https://x.com/DilumSanjaya)), que faz isso para sistemas de backend, construí o mesmo tipo de experiência guiada, passo a passo, para engenharia frontend.",
  },
  contributions: {
    en: [
      "Wrote a 19-lesson curriculum in 6 modules (rendering, execution, delivery, architecture, tooling and quality), each lesson closing with curated primary sources from W3C, WHATWG, MDN and web.dev.",
      "Built a zero-dependency isometric stage engine that diffs one scene against the next and choreographs the change: what leaves, what moves, what enters and how the camera frames it.",
      "Created a measured lab where readers mutate a real element and the browser itself reports layout shifts and forced layout time through PerformanceObserver, labelled apart from what is only modelled.",
      "Made the whole product bilingual (PT · EN): interface, lessons, scene labels and references switch instantly, with missing translations caught by the type system and by tests.",
      "Set up type-safe routing with TanStack Router where the current step lives in the URL, so deep links, the back button, keyboard shortcuts and e2e tests all drive the same state.",
      "Covered the project with Vitest and Playwright, including a geometric legibility check that runs on every step of every lesson in both languages.",
    ],
    "pt-BR": [
      "Escrevi um currículo de 19 lições em 6 módulos (renderização, execução, entrega, arquitetura, ferramentas e qualidade), cada lição terminando com fontes primárias selecionadas da W3C, WHATWG, MDN e web.dev.",
      "Construí um motor de palco isométrico sem dependências que compara uma cena com a seguinte e coreografa a mudança: o que sai, o que se move, o que entra e como a câmera enquadra o conjunto.",
      "Criei um laboratório medido em que o leitor altera um elemento real e o próprio navegador reporta layout shifts e o tempo de layout forçado via PerformanceObserver, separado visualmente do que é apenas modelado.",
      "Fiz o produto inteiro bilíngue (PT · EN): interface, lições, rótulos das cenas e referências trocam na hora, com traduções faltando detectadas pelo sistema de tipos e pelos testes.",
      "Configurei roteamento tipado com TanStack Router, com o passo atual na URL, para que deep links, o botão voltar, os atalhos de teclado e os testes e2e controlem o mesmo estado.",
      "Cobri o projeto com Vitest e Playwright, incluindo uma verificação geométrica de legibilidade que roda em todos os passos de todas as lições nos dois idiomas.",
    ],
  },
  decisions: {
    en: [
      {
        title: "A lesson is data, not code",
        body: "Lessons are declarative objects validated by a Zod schema: entities with isometric coordinates, edges and packet flows. No step conditionals in JSX, and broken content (an edge pointing at a missing node) fails in CI instead of on a learner's screen.",
      },
      {
        title: "The tool follows its own lessons",
        body: "Lesson 2 explains why animating layout properties is expensive, so the engine's keyframe type only accepts transform and opacity. The camera is a transform, edges grow with scaleX and particles come from a fixed DOM pool: no node is added or removed while flows run.",
      },
      {
        title: "Honest fidelity: model vs. measured",
        body: "Every lesson carries a badge saying whether it animates a mental model or measures the reader's own browser. Inferred values and measured values are labelled differently, so the tool never presents a simulation as data.",
      },
      {
        title: "A legibility detector in CI",
        body: "A pure geometric checker based on the Separating Axis Theorem verifies every step in both languages: no overlapping blocks, overflowing labels or arrows crossing unrelated nodes, even after a translation makes a label longer.",
      },
      {
        title: "Split per lesson and per language",
        body: "The initial bundle ships only the shell and a lightweight generated catalog. Each lesson and translation is a 3–8 kB chunk, preloaded on hover or focus, and the catalog is checked against the real lessons with a file snapshot so it cannot drift.",
      },
    ],
    "pt-BR": [
      {
        title: "A lição é dado, não código",
        body: "As lições são objetos declarativos validados por um schema Zod: entidades com coordenadas isométricas, ligações e fluxos de pacotes. Nada de condicionais por passo no JSX, e conteúdo quebrado (uma ligação apontando para um nó inexistente) falha no CI em vez de na tela de quem está estudando.",
      },
      {
        title: "A ferramenta segue as próprias lições",
        body: "A lição 2 explica por que animar propriedades de layout custa caro, então o tipo de keyframe do motor só aceita transform e opacity. A câmera é um transform, as ligações crescem com scaleX e as partículas saem de um pool fixo de elementos: nenhum nó entra ou sai do DOM enquanto os fluxos rodam.",
      },
      {
        title: "Fidelidade honesta: modelo vs. medido",
        body: "Cada lição traz um selo dizendo se anima um modelo mental ou mede o próprio navegador do leitor. Valores inferidos e valores medidos aparecem com rótulos diferentes, então a ferramenta nunca apresenta uma simulação como dado real.",
      },
      {
        title: "Um detector de legibilidade no CI",
        body: "Um verificador geométrico puro, baseado no Teorema do Eixo Separador, confere todos os passos nos dois idiomas: nada de blocos sobrepostos, rótulos vazando ou setas cruzando nós que não são seus, mesmo depois que uma tradução deixa um rótulo mais longo.",
      },
      {
        title: "Divisão por lição e por idioma",
        body: "O bundle inicial leva só o shell e um catálogo leve gerado. Cada lição e cada tradução é um chunk de 3 a 8 kB, pré-carregado no hover ou no foco, e o catálogo é comparado com as lições reais por snapshot de arquivo para não ficar desatualizado.",
      },
    ],
  },
  results: {
    en: [
      { value: "19", label: "interactive lessons in 6 modules" },
      { value: "2", label: "languages, switched without a reload" },
      { value: "3–8 kB", label: "per lesson chunk, loaded on demand" },
    ],
    "pt-BR": [
      { value: "19", label: "lições interativas em 6 módulos" },
      { value: "2", label: "idiomas, trocados sem recarregar" },
      { value: "3–8 kB", label: "por chunk de lição, carregado sob demanda" },
    ],
  },
  learnings: {
    en: "Explaining a concept well enough to animate it, step by step, is the strictest test of whether you understand it. Building the tool under the rules it teaches kept me honest.",
    "pt-BR":
      "Explicar um conceito bem o suficiente para animá-lo passo a passo é o teste mais rigoroso de que você o entende. Construir a ferramenta seguindo as regras que ela ensina me manteve honesto.",
  },
  links: {
    live: "https://frontend-fundamentals-nine.vercel.app",
    repo: "https://github.com/lpazzim/frontend-fundamentals",
  },
  cover: "/images/projects/render-lab/isometric-stage.webp",
  gallery: [
    {
      src: "/images/projects/render-lab/overview-catalog.webp",
      width: 1920,
      height: 1056,
      title: { en: "Course catalog", "pt-BR": "Catálogo do curso" },
      caption: {
        en: "The overview of the 6 modules and 19 lessons, with progress tracking and instant search (Ctrl+K).",
        "pt-BR":
          "A visão geral dos 6 módulos e 19 lições, com acompanhamento de progresso e busca instantânea (Ctrl+K).",
      },
    },
    {
      src: "/images/projects/render-lab/interactive-lab.webp",
      width: 1920,
      height: 1056,
      title: { en: "Measured rendering lab", "pt-BR": "Laboratório de renderização medido" },
      caption: {
        en: "Readers mutate a real element and the browser reports layout shifts and forced layout time through PerformanceObserver.",
        "pt-BR":
          "O leitor altera um elemento real e o navegador reporta layout shifts e o tempo de layout forçado via PerformanceObserver.",
      },
    },
    {
      src: "/images/projects/render-lab/english-dark-mode.webp",
      width: 1920,
      height: 1056,
      title: { en: "Dark mode in English", "pt-BR": "Modo escuro em inglês" },
      caption: {
        en: "The event loop lesson in English with the dark theme: language and theme switch instantly, with no reload and no flash.",
        "pt-BR":
          "A lição de event loop em inglês com o tema escuro: idioma e tema trocam na hora, sem recarregar e sem flash.",
      },
    },
  ],
  accent: "84 60% 48%",
  featured: true,
};

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

const allProjects: CaseStudy[] = [ecosDoDestino, renderLab, ...professionalCases, portfolioCase];

export const projects = allProjects.filter((p) => import.meta.env.DEV || !p.draft);

/** Featured cases on the home carousel; each one adds a screen of scrolling. */
export const MAX_FEATURED = 6;
