import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Download,
  Zap,
  Target,
  Rocket,
  Brain,
  Code,
  Award,
  Users,
  TrendingUp,
  ChevronDown,
  Sparkles,
  Clock,
  Star,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const stats = [
    { number: "5+", label: "YEARS BUILDING", icon: Clock },
    { number: "15+", label: "SHIPPED FEATURES", icon: Rocket },
    { number: "2", label: "HACKATHON WINS", icon: Award },
    { number: "20K+", label: "MONTHLY USERS", icon: Users }
  ];

  const projects = [
    {
      name: "Shiprocket Trends",
      stack: "React • Tailwind • Chart.js • MUI",
      description: "Self-serve analytics dashboard surfacing SKU & city-level trends",
      impact: "Cut manual Excel work by 80%",
      color: "from-cyan-400 to-blue-500",
      urgent: "LIVE IN PRODUCTION",
      delay: 0.1
    },
    {
      name: "Copilot AI Assistant", 
      stack: "Next.js • OpenAI • NestJS • MCP",
      description: "Embedded AI in e-commerce back-office with real-time insights",
      impact: "Processing 10K+ queries/month",
      color: "from-purple-400 to-pink-500",
      urgent: "SCALING FAST",
      delay: 0.2
    },
    {
      name: "Real-time Voice Chat",
      stack: "React • Socket.IO • AudioWorklet", 
      description: "Low-latency voice rooms with AI interruption & RAG",
      impact: "Azure OpenAI hackathon Top 5",
      color: "from-green-400 to-emerald-500",
      urgent: "AWARD WINNER",
      delay: 0.3
    },
    {
      name: "Shopify Add-to-Cart App",
      stack: "JS • Shopify App Bridge",
      description: "Tracks granular cart events for retargeting optimization", 
      impact: "30% increase in ROAS",
      color: "from-orange-400 to-red-500",
      urgent: "ROI PROVEN",
      delay: 0.4
    }
  ];

  const skills = [
    {
      category: "Frontend Mastery",
      skills: ["React/Next.js", "TypeScript", "Tailwind", "D3/Chart.js", "Vite", "MUI"],
      color: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      category: "Backend & APIs", 
      skills: ["NestJS", "Node/Express", "OpenAI/MCP", "GraphQL", "WebSockets", "gRPC"],
      color: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      category: "DevOps & Data",
      skills: ["Docker", "CI/CD", "PostgreSQL", "Redis", "Weaviate", "Azure"],
      color: "from-green-500 to-emerald-500",
      delay: 0.3
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setGlowPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 lg:hidden"
          >
            <div className="flex justify-end p-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white hover:text-cyan-400 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            <motion.nav
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center space-y-8 text-2xl font-bold"
            >
              <a href="#projects" className="text-white hover:text-cyan-400 transition-colors">Projects</a>
              <a href="#skills" className="text-white hover:text-cyan-400 transition-colors">Skills</a>
              <a href="#contact" className="text-white hover:text-cyan-400 transition-colors">Contact</a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-6 right-6 z-40 lg:hidden bg-gray-900/80 backdrop-blur border border-cyan-500/30 rounded-full p-3 hover:bg-cyan-500/20 transition-all"
      >
        <Menu className="w-6 h-6 text-cyan-400" />
      </motion.button>

      {/* Mouse Glow Effect */}
      <motion.div 
        className="fixed w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0 transition-all duration-300 hidden lg:block"
        style={{ 
          left: glowPosition.x - 192, 
          top: glowPosition.y - 192,
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Animated Background Grid */}
        <motion.div 
          className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="container mx-auto text-center relative z-10 max-w-6xl"
          style={{ y, opacity }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Attention Grabber */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <span className="text-cyan-400 font-semibold text-xs sm:text-sm tracking-wider">AVAILABLE FOR IMMEDIATE HIRE</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-black mb-4 sm:mb-6 relative"
            >
              <motion.span 
                className="bg-gradient-to-r from-white via-cyan-400 to-purple-500 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                ASHISH
              </motion.span>
              <motion.div 
                variants={itemVariants}
                className="text-xl sm:text-2xl md:text-4xl lg:text-6xl mt-2 font-light text-gray-300"
              >
                Frontend & AI Engineer
              </motion.div>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4"
            >
              I craft <span className="text-cyan-400 font-semibold">production-ready React & TypeScript experiences</span>, 
              infusing AI into data-heavy products for e-commerce and analytics teams.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
            >
              <motion.button 
                className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={pulseVariants.animate}
                onClick={() => window.open('https://calendly.com/love4css/coffee-style-interview-with-ashish', '_blank', 'noopener,noreferrer')}
              >
                <span
                  className="relative z-10 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 sm:w-5 h-4 sm:h-5" />
                  HIRE ME NOW
                </span>
              </motion.button>
              
              <motion.button 
                className="group border-2 border-cyan-500/50 hover:border-cyan-400 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition-all duration-300 hover:bg-cyan-500/10 w-full sm:w-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open('https://drive.google.com/file/d/1AfLS11uXS83-4XrvbdsKsCph78X_gkxD/view?usp=drivesdk', '_blank', 'noopener,noreferrer')}
              >
                <span className="flex items-center justify-center gap-2" >
                  <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                  GET MY CV
                </span>
              </motion.button>
            </motion.div>

            {/* Animated Stats */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto px-4"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div 
                    key={index}
                    className={`relative p-3 sm:p-6 rounded-xl border transition-all duration-500 ${
                      currentStat === index 
                        ? 'border-cyan-400 bg-cyan-500/10 scale-105' 
                        : 'border-gray-700 bg-gray-900/50'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    animate={currentStat === index ? {
                      boxShadow: ['0 0 0 rgba(6, 182, 212, 0)', '0 0 20px rgba(6, 182, 212, 0.3)', '0 0 0 rgba(6, 182, 212, 0)']
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <motion.div
                      animate={currentStat === index ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    >
                      <Icon className={`w-6 sm:w-8 h-6 sm:h-8 mb-2 sm:mb-3 mx-auto transition-colors duration-300 ${
                        currentStat === index ? 'text-cyan-400' : 'text-gray-400'
                      }`} />
                    </motion.div>
                    <div className={`text-xl sm:text-3xl font-black mb-1 transition-colors duration-300 ${
                      currentStat === index ? 'text-cyan-400' : 'text-white'
                    }`}>
                      {stat.number}
                    </div>
                    <div className="text-xs font-semibold text-gray-400 tracking-wider">
                      {stat.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 sm:w-8 h-6 sm:h-8 text-cyan-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-10 sm:py-20 relative px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-purple-400" />
              </motion.div>
              <span className="text-purple-400 font-semibold text-xs sm:text-sm tracking-wider">PROOF OF IMPACT</span>
            </motion.div>
            <motion.h2 
              className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              PROJECTS THAT
              <span className="block text-transparent bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text">
                MOVE METRICS
              </span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {projects.map((project, index) => (
              <motion.div 
                key={index}
                className="group relative bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/50 transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: project.delay }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(6, 182, 212, 0.1)'
                }}
              >
                {/* Urgency Badge */}
                <motion.div 
                  className={`absolute -top-3 left-6 bg-gradient-to-r ${project.color} px-3 sm:px-4 py-1 rounded-full text-xs font-black text-black`}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [-1, 1, -1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {project.urgent}
                </motion.div>

                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div>
                    <motion.h3 
                      className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      {project.name}
                    </motion.h3>
                    <p className="text-xs sm:text-sm text-gray-400 font-mono">{project.stack}</p>
                  </div>
                  <motion.div
                    whileHover={{ rotate: 45, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ExternalLink className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                  </motion.div>
                </div>

                <p className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed">
                  {project.description}
                </p>

                <motion.div 
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${project.color} bg-opacity-20 border border-current rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold`}
                  whileHover={{ scale: 1.05 }}
                >
                  <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4" />
                  {project.impact}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-10 sm:py-20 relative px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="w-4 h-4 text-green-400" />
              </motion.div>
              <span className="text-green-400 font-semibold text-xs sm:text-sm tracking-wider">BATTLE-TESTED STACK</span>
            </motion.div>
            <motion.h2 
              className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              TECH ARSENAL
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {skills.map((section, index) => (
              <motion.div 
                key={index}
                className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/50 transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: section.delay }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(6, 182, 212, 0.1)'
                }}
              >
                <motion.div 
                  className={`inline-block bg-gradient-to-r ${section.color} p-3 rounded-xl mb-4 sm:mb-6`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <Code className="w-5 sm:w-6 h-5 sm:h-6 text-black" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{section.category}</h3>
                <div className="space-y-3">
                  {section.skills.map((skill, skillIndex) => (
                    <motion.div 
                      key={skillIndex}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: skillIndex * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div 
                        className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.color}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: skillIndex * 0.2 }}
                      />
                      <span className="text-sm sm:text-base text-gray-300 font-medium">{skill}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-10 sm:py-20 relative px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 sm:px-6 py-2 mb-4 sm:mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="w-4 h-4 text-yellow-400" />
              </motion.div>
              <span className="text-yellow-400 font-semibold text-xs sm:text-sm tracking-wider">SOCIAL PROOF</span>
            </motion.div>
            <motion.h2 
              className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              WHAT OTHERS SAY
            </motion.h2>
          </motion.div>

          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/50 transition-all duration-500"
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(6, 182, 212, 0.1)'
              }}
            >
              <div className="flex items-center gap-4 mb-4 sm:mb-6">
                <motion.div 
                  className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-black font-bold text-base sm:text-lg">S</span>
                </motion.div>
                <div>
                  <div className="text-white font-bold text-sm sm:text-base">Product Lead</div>
                  <div className="text-cyan-400 text-xs sm:text-sm font-semibold">Shiprocket</div>
                </div>
              </div>
              <blockquote className="text-lg sm:text-xl text-gray-300 leading-relaxed italic">
                "Ashish shipped the entire Trends UI in six weeks and wiped out a backlog of analytics requests."
              </blockquote>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="contact" className="py-10 sm:py-20 relative px-4 sm:px-6">
        <div className="container mx-auto text-center max-w-6xl">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-3xl p-8 sm:p-12"
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 30px 60px rgba(6, 182, 212, 0.2)'
              }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [-1, 1, -1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-semibold text-xs sm:text-sm tracking-wider">LIMITED AVAILABILITY</span>
              </motion.div>

              <motion.h2 
                className="text-2xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                READY TO DOMINATE YOUR FRONTEND?
              </motion.h2>
              
              <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                I'm accepting <span className="text-cyan-400 font-bold">2 new projects</span> this quarter. 
                Skip the endless interview cycles. Let's build something that converts.
              </p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.button 
                  className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-lg sm:text-xl transition-all duration-300 w-full sm:w-auto"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 rgba(6, 182, 212, 0)',
                      '0 0 30px rgba(6, 182, 212, 0.3)',
                      '0 0 0 rgba(6, 182, 212, 0)'
                    ]
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                  onClick={() => window.open('https://calendly.com/love4css/coffee-style-interview-with-ashish', '_blank', 'noopener,noreferrer')}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Mail className="w-5 sm:w-6 h-5 sm:h-6" />
                    BOOK A CALL NOW
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                    </motion.div>
                  </span>
                </motion.button>
              </motion.div>

              {/* Contact Info */}
              <motion.div 
                className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { icon: Github, label: "ashigupta007", href: "https://github.com/ashigupta007" },
                  { icon: Linkedin, label: "ashish-gupta-dev", href: "https://www.linkedin.com/in/ashish-gupta-aa32bb129/" },
                  { icon: Mail, label: "love4css@gmail.com", href: "mailto:love4css@gmail.com" }
                ].map((contact, index) => (
                  <motion.a 
                    key={index}
                    href={contact.href}
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm sm:text-base"
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, y: -2 }}
                  >
                    <contact.icon className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="font-medium">{contact.label}</span>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="py-6 sm:py-8 border-t border-gray-800 px-4 sm:px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto text-center">
          <motion.p 
            className="text-gray-400 text-sm sm:text-base"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Built with ❤️ using React & Tailwind • Engineered for conversion
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;