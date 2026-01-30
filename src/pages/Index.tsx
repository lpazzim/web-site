import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { Layout } from "@/components/Layout";
import { projects } from "@/data/projects";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const TextReveal = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={isInView ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const ParallaxText = ({ children, baseVelocity = 1 }: { children: ReactNode; baseVelocity?: number }) => {
  return (
    <div className="overflow-hidden whitespace-nowrap flex">
      <motion.div
        className="flex gap-8"
        animate={{ x: baseVelocity > 0 ? [0, -1000] : [-1000, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-[8vw] md:text-[6vw] uppercase tracking-tighter font-serif opacity-10">
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <Layout hideFooter noPadding>
      <div ref={containerRef} className="bg-background">
        {/* Hero Section - Full Screen */}
        <motion.section 
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="min-h-screen flex flex-col justify-between pt-24 pb-12 container-wide sticky top-0 z-10"
        >
          <div className="flex-1 flex flex-col justify-center">
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter uppercase font-serif"
              >
                Building
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter uppercase font-serif text-primary"
              >
                Interfaces
              </motion.h1>
            </div>
            <div className="overflow-hidden mt-4">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter uppercase font-serif text-muted-foreground"
              >
                That
              </motion.h1>
            </div>
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter uppercase font-serif text-muted-foreground"
              >
                Matter
              </motion.h1>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-12 border-t border-border"
          >
            <p className="text-lg md:text-xl max-w-md text-muted-foreground leading-relaxed">
              Senior Frontend Engineer based in São Paulo, Brazil. Specialized in React, TypeScript, and JavaScript. Currently working, crafting solutions that transform digital experiences.
            </p>
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-sans">
              2018 — 2025<br />Selected Works
            </div>
          </motion.div>
        </motion.section>

        {/* Spacer for sticky hero */}
        <div className="h-[50vh]" />

        {/* Marquee Section */}
        <section className="py-20 border-y border-border overflow-hidden">
          <ParallaxText baseVelocity={1}>Clean Code • Pixel Perfect • Performance First • User Focused •</ParallaxText>
        </section>

        {/* Video/Statement Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-foreground text-background">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="container-wide text-center py-32"
          >
            <div className="text-xs tracking-[0.3em] uppercase mb-12 opacity-60 font-sans">Approach</div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl uppercase tracking-tighter leading-[0.95] mb-12">
              Turning Complex<br />Problems Into<br />Elegant Solutions
            </h2>
            <p className="text-xl md:text-2xl opacity-60 max-w-2xl mx-auto italic font-serif">
              "The details are not the details. They make the design."
            </p>
          </motion.div>
        </section>

        {/* Philosophy Section */}
        <section className="py-32 md:py-48 container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
            <div>
              <TextReveal>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8 font-sans">Philosophy</div>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95]">
                  Code that scales,
                </h2>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95] text-primary">
                  interfaces that inspire,
                </h2>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95]">
                  experiences that last.
                </h2>
              </TextReveal>
            </div>
            <div className="flex flex-col justify-end">
              <TextReveal>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12">
                  I believe great software is built on the foundation of clean architecture and obsessive attention to detail.
                  From component design to performance optimization, every decision shapes the final experience.
                </p>
              </TextReveal>
              <TextReveal>
                <a 
                  href="#about" 
                  className="inline-flex items-center gap-3 group text-lg border-b border-foreground pb-2 text-foreground transition-all hover:gap-5"
                  data-testid="link-about-story"
                >
                  More about me 
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </a>
              </TextReveal>
            </div>
          </div>
        </section>

        {/* Keywords Section */}
        <section className="py-20 border-y border-border overflow-hidden bg-muted/30">
          <div className="container-wide">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {["Curiosity", "Inquisitive", "Empathetic", "Creatively", "Rational", "Long-lasting", "Optimal", "Articulate", "Consistency", "Intuitive"].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="text-2xl md:text-4xl tracking-tight text-muted-foreground hover:text-foreground transition-colors cursor-default"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section id="projects" className="py-32 scroll-mt-24">
          <div className="container-wide mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <TextReveal>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">Selected Work</div>
              </TextReveal>
              <TextReveal>
                <h2 className="text-5xl md:text-7xl uppercase tracking-tighter">Featured Projects</h2>
              </TextReveal>
            </div>
            <Link 
              to="/work" 
              className="text-sm uppercase tracking-[0.2em] hover:text-primary transition-colors font-sans flex items-center gap-2 group"
              data-testid="link-view-all-projects"
            >
              View All
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            {projects.slice(0, 4).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative aspect-[4/3] overflow-hidden border-b border-r border-border"
              >
                <Link to={`/project/${project.id}`} className="block h-full w-full" data-testid={`card-project-${project.id}`}>
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Strong gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <motion.div 
                          className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70 font-sans"
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 0.7, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                        >
                          {project.category}
                        </motion.div>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl tracking-tight leading-none">{project.title}</h3>
                      </div>
                      <div className="text-sm font-sans opacity-50">{project.year}</div>
                    </div>
                  </div>

                  {/* Hover arrow indicator */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-8 h-8 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Big Statement Section */}
        <section className="py-32 md:py-48 overflow-hidden">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-12 font-sans">Vision</div>
              <h2 className="text-[10vw] md:text-[8vw] lg:text-[6vw] uppercase tracking-tighter leading-[0.85]">
                Every Pixel
              </h2>
              <h2 className="text-[10vw] md:text-[8vw] lg:text-[6vw] uppercase tracking-tighter leading-[0.85] text-primary">
                Has Purpose
              </h2>
              <h2 className="text-[10vw] md:text-[8vw] lg:text-[6vw] uppercase tracking-tighter leading-[0.85] text-muted-foreground">
                Every Line
              </h2>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-32 md:py-48 container-wide border-t border-border scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
            <div>
              <TextReveal>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8 font-sans">About Me</div>
              </TextReveal>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95] mb-8">
                  Lucas Pazzim
                </h2>
              </TextReveal>
              <TextReveal>
                <div className="mb-8">
                  <img 
                    src="/images/lucas-pazzim-about.jpeg" 
                    alt="Lucas Pazzim" 
                    className="w-full max-w-sm h-auto grayscale object-cover rounded-sm"
                  />
                </div>
              </TextReveal>
              <TextReveal>
                <p className="text-2xl md:text-3xl leading-relaxed">
                  Senior Frontend Engineer based in <span className="text-primary">São Paulo, Brazil</span>, 
                  specialized in React, TypeScript, and JavaScript.
                </p>
              </TextReveal>
            </div>
            <div className="flex flex-col justify-center">
              <TextReveal>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  I'm passionate about technology, innovation, and detail-oriented development. 
                  My focus is on creating exceptional user experiences through clean code, 
                  thoughtful architecture, and attention to the smallest details.
                </p>
              </TextReveal>
              <TextReveal>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  Currently working, crafting solutions that transform digital experiences. 
                  I develop and maintain complex components that enable users to build applications intuitively, 
                  collaborating with DevOps teams using Docker, Vite, and modern tooling.
                </p>
              </TextReveal>
              <TextReveal>
                <div className="flex flex-wrap gap-3 mt-4">
                  {["React", "TypeScript", "JavaScript", "Vite", "Docker", "Styled Components"].map((skill) => (
                    <span
                      key={skill}
                      className="text-sm border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </TextReveal>
            </div>
          </div>
        </section>

        {/* Scrolling Marquee Bottom */}
        <section className="py-12 border-t border-border overflow-hidden">
          <ParallaxText baseVelocity={-1}>React • TypeScript • Vite • Docker • Styled Components • JavaScript •</ParallaxText>
        </section>

        {/* Contact CTA */}
        <section id="contact" className="py-32 container-wide border-t border-border scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <TextReveal>
                <h2 className="text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter leading-[0.95] mb-8">
                  Have a Project in Mind?
                </h2>
              </TextReveal>
            </div>
            <div className="flex flex-col justify-end">
              <TextReveal>
                <p className="text-xl text-muted-foreground mb-8">
                  I'm always open to discussing new projects, creative ideas, 
                  or opportunities to be part of your vision.
                </p>
              </TextReveal>
              <TextReveal>
                <Link 
                  to="/contact" 
                  className="inline-flex items-center gap-3 text-2xl group"
                  data-testid="link-contact-cta"
                >
                  <span className="border-b-2 border-foreground pb-1 transition-colors group-hover:border-primary group-hover:text-primary">
                    Get in Touch
                  </span>
                  <ArrowUpRight className="w-6 h-6 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Link>
              </TextReveal>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 container-wide border-t border-border relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="text-sm text-muted-foreground font-sans">
              Lucas Pazzim © 2018—2025
            </div>
            <div className="flex gap-8 text-sm font-sans relative z-20">
              <a href="https://www.linkedin.com/in/lpazzim" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-linkedin">
                LinkedIn
              </a>
              <a href="https://github.com/lpazzim" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-github">
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Index;
