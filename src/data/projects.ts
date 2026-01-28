import codeEditor from "@/assets/code-editor.jpg";
import programmingMonitor from "@/assets/programming-monitor.jpg";
import reactCode from "@/assets/react-code.jpg";
import laptopCode from "@/assets/laptop-code.jpg";
import techAbstract from "@/assets/tech-abstract.jpg";
import serverRoom from "@/assets/server-room.jpg";
import matrixCode from "@/assets/matrix-code.jpg";
import debugging from "@/assets/debugging.jpg";

export interface Project {
  id: string;
  title: string;
  category: string;
  tags: string[];
  year: string;
  client: string;
  description: string;
  coverImage: string;
  images: string[];
}

export const projects: Project[] = [
  {
    id: "react-dashboard",
    title: "React Dashboard",
    category: "Web Application",
    tags: ["REACT", "TYPESCRIPT"],
    year: "2024",
    client: "Personal Project",
    description: "A modern analytics dashboard built with React, TypeScript, and Tailwind CSS. Features real-time data visualization, responsive design, and dark mode support.",
    coverImage: reactCode,
    images: [reactCode],
  },
  {
    id: "design-system",
    title: "Design System",
    category: "Component Library",
    tags: ["UI/UX", "COMPONENTS"],
    year: "2024",
    client: "Open Source",
    description: "A comprehensive design system and component library built with React and Storybook. Includes 50+ accessible, customizable components following atomic design principles.",
    coverImage: codeEditor,
    images: [codeEditor],
  },
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    category: "Web Application",
    tags: ["NEXT.JS", "FULL-STACK"],
    year: "2024",
    client: "Startup",
    description: "A performant e-commerce platform with server-side rendering, optimized checkout flow, and seamless payment integration using Stripe.",
    coverImage: laptopCode,
    images: [laptopCode],
  },
  {
    id: "developer-tools",
    title: "Developer Tools",
    category: "Tooling",
    tags: ["CLI", "AUTOMATION"],
    year: "2023",
    client: "Personal Project",
    description: "A collection of developer productivity tools including CLI utilities, VS Code extensions, and automation scripts to streamline development workflows.",
    coverImage: programmingMonitor,
    images: [programmingMonitor],
  },
  {
    id: "api-gateway",
    title: "API Gateway",
    category: "Backend",
    tags: ["NODE.JS", "MICROSERVICES"],
    year: "2023",
    client: "Enterprise",
    description: "A scalable API gateway handling authentication, rate limiting, and request routing for microservices architecture serving millions of requests.",
    coverImage: serverRoom,
    images: [serverRoom],
  },
  {
    id: "data-visualization",
    title: "Data Visualization",
    category: "Interactive",
    tags: ["D3.JS", "ANIMATION"],
    year: "2023",
    client: "Tech Conference",
    description: "Interactive data visualization projects exploring complex datasets through animated charts, graphs, and creative visual storytelling.",
    coverImage: matrixCode,
    images: [matrixCode],
  },
  {
    id: "performance-audit",
    title: "Performance Audit",
    category: "Article",
    tags: ["PERFORMANCE", "OPTIMIZATION"],
    year: "2022",
    client: "Tech Blog",
    description: "In-depth technical article on web performance optimization techniques, covering Core Web Vitals, code splitting, and lazy loading strategies.",
    coverImage: techAbstract,
    images: [techAbstract],
  },
  {
    id: "debugging-guide",
    title: "Debugging Masterclass",
    category: "Article",
    tags: ["TUTORIAL", "DEVTOOLS"],
    year: "2022",
    client: "Dev Community",
    description: "Comprehensive guide to debugging JavaScript applications, covering browser DevTools, React DevTools, and advanced debugging techniques.",
    coverImage: debugging,
    images: [debugging],
  },
];
