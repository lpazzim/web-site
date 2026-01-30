import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const experience = [
  {
    role: "Senior Software Engineer",
    company: "Current Position",
    period: "Present",
    description: "Development and maintenance of complex components that enable users to build applications intuitively. Implementation of performance optimizations and innovative features in collaboration with cross-functional teams."
  },
  {
    role: "Frontend Developer",
    company: "Previous Experience",
    period: "2018 - 2022",
    description: "Building responsive websites using HTML, CSS3, JavaScript, jQuery, and Bootstrap. Collaboration with backend engineers to optimize API calls and maintenance of legacy applications."
  }
];

const skills = [
  "React",
  "TypeScript",
  "JavaScript",
  "Vite",
  "Docker",
  "Styled Components",
  "HTML/CSS",
  "SCSS",
  "pnpm",
  "Vitest"
];

const About = () => {
  return (
    <Layout showEchelonFooter>
      <section className="container-wide py-16 md:py-24">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">About</div>
            <h1 className="text-5xl md:text-7xl uppercase tracking-tighter mb-8">Lucas Pazzim</h1>
            
            <div className="mb-16">
              <img 
                src="/images/lucas-pazzim-about.jpeg" 
                alt="Lucas Pazzim" 
                className="w-full max-w-md h-auto grayscale object-cover rounded-sm"
              />
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              <p className="text-2xl md:text-3xl leading-relaxed">
                Senior Frontend Engineer based in <span className="text-primary">São Paulo, Brazil</span>, 
                specialized in React, TypeScript, and JavaScript.
              </p>
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  I'm passionate about technology, innovation, and detail-oriented development. 
                  My focus is on creating exceptional user experiences through clean code, 
                  thoughtful architecture, and attention to the smallest details.
                </p>
                <p>
                  Currently working, crafting solutions that transform digital experiences. 
                  I develop and maintain complex components that enable users to build applications intuitively, 
                  collaborating with DevOps teams using Docker for containerization, Vite for 
                  fast development, and pnpm for package management.
                </p>
                <p>
                  My work approach is detail-oriented and open-minded, with a strong focus on creating 
                  efficient and maintainable code, always seeking to enhance user experience 
                  through technical excellence.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-12"
            >
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">Location</div>
                <p className="text-lg">São Paulo, SP<br />Brazil</p>
              </div>
              
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">Education</div>
                <p className="text-lg">Universidade Cruzeiro do Sul</p>
              </div>
              
              <div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 font-sans">Contact</div>
                <div className="space-y-2">
                  <a 
                    href="https://www.linkedin.com/in/lpazzim" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-lg hover:text-primary transition-colors"
                    data-testid="link-linkedin-about"
                  >
                    LinkedIn →
                  </a>
                  <a 
                    href="https://github.com/lpazzim" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-lg hover:text-primary transition-colors"
                    data-testid="link-github-about"
                  >
                    GitHub →
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-24 pt-16 border-t border-border"
          >
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8 font-sans">Experience</div>
            <div className="space-y-12">
              {experience.map((exp, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-sm text-muted-foreground font-sans">{exp.period}</div>
                  <div className="md:col-span-3">
                    <h3 className="text-2xl mb-1">{exp.role}</h3>
                    <p className="text-primary mb-4">{exp.company}</p>
                    <p className="text-muted-foreground">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-24 pt-16 border-t border-border"
          >
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8 font-sans">Tech Stack</div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="text-sm border border-border px-4 py-2 hover:border-primary hover:text-primary transition-colors"
                  data-testid={`badge-skill-${skill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
