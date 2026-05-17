import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { projects } from "@/data/projects";
import { ArrowLeft, ArrowRight } from "lucide-react";

const Project = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const project = projects.find((p) => p.id === id);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length];

  // Project-specific translations with safe fallback to static data
  const category = t(`projects.${project.id}.category`, { defaultValue: project.category });
  const client = t(`projects.${project.id}.client`, { defaultValue: project.client });
  const description = t(`projects.${project.id}.description`, { defaultValue: project.description });

  return (
    <Layout noPadding headerRevealMode showEchelonFooter>
      <div ref={containerRef} className="bg-background">
        {/* Project Hero - Full Screen with Parallax */}
        <section className="relative h-screen overflow-hidden">
          <motion.img
            style={{
              y: useTransform(scrollYProgress, [0, 0.5], [0, 200]),
              scale: 1.1
            }}
            src={project.coverImage}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/30" />
          
          {/* Centered Title */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-display text-center px-4"
            >
              {project.title}
            </motion.h1>
          </div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-8 left-0 right-0 z-10 container-wide">
            <div className="flex justify-between items-end border-t border-foreground/20 pt-8">
              <div className="text-label text-foreground">
                {project.year} — {category}
              </div>
              <div className="flex gap-4">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[10px] uppercase tracking-widest border border-foreground/30 px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Project Info Section */}
        <section className="container-wide py-32 border-b">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-4 space-y-12">
              <div>
                <p className="text-label mb-4">{t("project.client")}</p>
                <p className="text-2xl">{client}</p>
              </div>
              <div>
                <p className="text-label mb-4">{t("project.focus")}</p>
                <p className="text-lg text-muted-foreground">{category}</p>
              </div>
            </div>
            <div className="lg:col-span-8">
              <p className="text-3xl md:text-5xl leading-[1.1] font-normal tracking-tight">
                {description}
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic Image Gallery */}
        <section className="py-20 space-y-20">
          {project.images.map((image, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="container-wide"
            >
              <div className="aspect-video overflow-hidden bg-muted group">
                <img 
                  src={image} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              </div>
            </motion.div>
          ))}
        </section>

        {/* Next Project Navigation */}
        <section className="py-60 border-t mt-20 bg-muted/30">
          <Link to={`/project/${nextProject.id}`} className="group block text-center container-wide">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-12">{t("project.nextProject")}</div>
              <h2 className="text-display group-hover:text-primary transition-all duration-500 transform group-hover:scale-[1.02]">
                {nextProject.title}
              </h2>
              <div className="mt-16 inline-flex items-center gap-4 text-xl border-b border-foreground pb-2">
                {t("project.viewCaseStudy")} <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-3" />
              </div>
            </motion.div>
          </Link>
        </section>

        {/* Navigation Footer */}
        <section className="container-wide py-12 border-t flex justify-between items-center">
          <Link to="/work" className="inline-flex items-center gap-3 text-sm uppercase tracking-widest hover:text-primary transition-colors group">
            <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-2" />
            {t("project.backToArchive")}
          </Link>
          <div className="text-[10px] uppercase tracking-widest opacity-30">
            {t("project.copyright")}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Project;
