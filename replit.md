# Lucas Pazzim Portfolio

## Overview

A personal portfolio website for Lucas Pazzim, a Frontend Engineer. The site showcases projects, provides information about the developer, and offers contact details. Built as a modern, responsive single-page application with dark/light theme support, sophisticated parallax effects, and editorial typography inspired by https://15th.plus-ex.com/.

## Recent Changes (January 2026)

- Enhanced hero section with large stacked typography and scroll-based opacity/scale animations
- Added TextReveal component for scroll-triggered text reveal animations
- Added ParallaxText marquee component with infinite horizontal scrolling
- Implemented sticky hero with parallax fade effects
- Added keywords section with staggered entrance animations
- Improved project grid with strong gradient overlays for better text contrast
- Added Vision statement section with large typography
- Enhanced footer with contact CTA section
- Updated CSS with refined color variables and editorial styling

## User Preferences

Preferred communication style: Simple, everyday language.
Design reference: https://15th.plus-ex.com/ (editorial typography, parallax effects)

## System Architecture

### Frontend Framework
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and dev server for fast development experience
- **React Router** for client-side routing with pages for Home, Work, Project details, About, and Contact
- **Framer Motion** for scroll-based animations and parallax effects

### Styling Architecture
- **Tailwind CSS** for utility-first styling with custom configuration
- **CSS Variables** for theming (light/dark mode support via `next-themes`)
- **Custom font families**: Times New Roman (primary serif), system-ui (sans-serif for labels)
- Zero border-radius design language (`--radius: 0rem`)
- Editorial design aesthetic with large typography and generous whitespace

### Component Library
- **shadcn/ui** components built on Radix UI primitives
- Located in `src/components/ui/` with comprehensive set of accessible components
- **Class Variance Authority (CVA)** for component variant management
- **clsx** and **tailwind-merge** for conditional class handling

### State Management
- **TanStack React Query** for server state management (configured but data is currently static)
- React's built-in hooks for local component state
- Theme state managed by `next-themes`

### Project Structure
```
src/
├── components/       # Reusable components
│   ├── ui/          # shadcn/ui components
│   └── *.tsx        # App-specific components (Header, Footer, Layout, etc.)
├── pages/           # Route components (Index, Work, Project, About, Contact)
├── data/            # Static data (projects.ts)
├── hooks/           # Custom hooks
├── lib/             # Utilities
└── assets/          # Images
```

### Design Patterns
- **Layout component** wraps pages with consistent Header/Footer structure
- **Project data** stored as TypeScript array in `src/data/projects.ts`
- **Path aliases** configured (`@/*` maps to `src/*`)
- Animations using CSS keyframes and Tailwind animation utilities

## External Dependencies

### UI Framework
- Radix UI primitives for accessible, unstyled components (accordion, dialog, dropdown, tabs, tooltip, etc.)
- Lucide React for icons

### Third-Party Services
- **Google Fonts** for Syne and Inter font families (loaded via CDN in index.html)
- No backend services, databases, or APIs currently integrated

### Build & Development
- Vite dev server configured on port 5000 with host `0.0.0.0`
- ESLint with TypeScript and React plugins
- PostCSS with Tailwind and Autoprefixer

### Notable Libraries
- `embla-carousel-react` for carousel functionality
- `react-day-picker` and `date-fns` for date handling
- `vaul` for drawer components
- `sonner` for toast notifications
- `react-resizable-panels` for resizable layouts
- `recharts` for chart components (via shadcn/ui chart)