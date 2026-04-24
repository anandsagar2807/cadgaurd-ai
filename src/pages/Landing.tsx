import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Zap, Brain, ArrowRight, CheckCircle, TrendingUp, 
    Clock, DollarSign, Box, Wrench, FileText, Sparkles, Play, 
    Star, Menu, X, ChevronRight, Activity, Cpu, Layers,
    MessageSquare, BarChart3, Eye, Settings, Users, BookOpen,
    Mail, Linkedin, Twitter, Github, MousePointer2
} from 'lucide-react';

const Landing: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [counters, setCounters] = useState({ accuracy: 0, speed: 0, designs: 0, savings: 0 });

    // Cursor glow effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animated counters
    useEffect(() => {
        const targets = { accuracy: 99.9, speed: 10, designs: 50000, savings: 40 };
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setCounters({
                accuracy: Math.min(targets.accuracy * progress, targets.accuracy),
                speed: Math.min(Math.floor(targets.speed * progress), targets.speed),
                designs: Math.min(Math.floor(targets.designs * progress), targets.designs),
                savings: Math.min(Math.floor(targets.savings * progress), targets.savings)
            });
            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const features = [
        { 
            icon: Shield, 
            title: 'Validation Engine', 
            desc: 'Comprehensive DFM/DFA analysis with real-time validation and manufacturability scoring',
            color: 'from-blue-500 to-cyan-400',
            glow: 'shadow-blue-500/20'
        },
        { 
            icon: Cpu, 
            title: 'AI Simulation', 
            desc: 'Advanced physics simulation powered by neural networks for accurate predictions',
            color: 'from-purple-500 to-pink-500',
            glow: 'shadow-purple-500/20'
        },
        { 
            icon: Brain, 
            title: 'AI Copilot', 
            desc: 'Intelligent design suggestions powered by Grok AI for optimal engineering decisions',
            color: 'from-violet-500 to-indigo-500',
            glow: 'shadow-violet-500/20'
        },
    ];

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Solutions', href: '#solutions' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Docs', href: '#docs' },
        { name: 'Contact', href: '#contact' },
    ];

    const stats = [
        { value: `${counters.accuracy.toFixed(1)}%`, label: 'Validation Accuracy', icon: Activity },
        { value: `${counters.speed}x`, label: 'Faster Analysis', icon: Zap },
        { value: `${counters.designs.toLocaleString()}+`, label: 'Designs Validated', icon: Box },
        { value: `${counters.savings}%`, label: 'Cost Reduction', icon: DollarSign },
    ];

    const aiFeatures = [
        { icon: MessageSquare, title: 'AI Chat', desc: 'Natural language design queries' },
        { icon: Eye, title: 'Visual Analysis', desc: 'Real-time CAD inspection' },
        { icon: BarChart3, title: 'Analytics', desc: 'Comprehensive metrics' },
        { icon: Settings, title: 'Smart Config', desc: 'Auto-optimization' },
    ];

    const footerLinks = {
        Product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
        Resources: ['Documentation', 'API Reference', 'Tutorials', 'Blog', 'Community'],
        Company: ['About', 'Careers', 'Press', 'Partners', 'Contact'],
        Legal: ['Privacy', 'Terms', 'Security', 'Compliance'],
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] text-white overflow-hidden relative">
            {/* Cursor Glow Effect */}
            <div 
                className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.06), transparent 40%)`,
                }}
            />

            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-violet-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse-slow animation-delay-4000"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
                <div className="h-full w-full" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                                    <Box className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-violet-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                CADGuard <span className="text-blue-400">AI</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a 
                                    key={link.name} 
                                    href={link.href}
                                    className="text-sm text-gray-400 hover:text-white transition-colors relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </a>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link 
                                to="/dashboard" 
                                className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/dashboard" 
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative px-5 py-2.5 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-lg text-sm font-medium flex items-center gap-2">
                                    Start Free Trial
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-400 hover:text-white"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/5 bg-[#0B0F1A]/95 backdrop-blur-xl"
                        >
                            <div className="px-6 py-4 space-y-4">
                                {navLinks.map((link) => (
                                    <a 
                                        key={link.name} 
                                        href={link.href}
                                        className="block text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div className="pt-4 border-t border-white/10 space-y-3">
                                    <Link to="/dashboard" className="block text-gray-300">Sign In</Link>
                                    <Link to="/dashboard" className="block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-center font-medium">
                                        Start Free Trial
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            {/* Badge */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm"
                            >
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-blue-300">Powered by Grok AI & Neural Networks</span>
                            </motion.div>

                            {/* Heading */}
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                                    <span className="text-white">AI-Powered</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                                        CAD Validation
                                    </span>
                                    <br />
                                    <span className="text-white">Platform</span>
                                </h1>
                                <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                                    Automate design validation, simulate manufacturing constraints, and get AI-powered suggestions to optimize your CAD designs before production.
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Link to="/dashboard" className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all">
                                        Launch Dashboard
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                                <Link to="/image-validator" className="group px-8 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2">
                                    <Play className="w-5 h-5 text-blue-400" />
                                    <span>View Demo</span>
                                </Link>
                            </motion.div>

                            {/* Trust Indicators */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center gap-6 pt-4"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-[#0B0F1A] flex items-center justify-center text-xs font-bold">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-400">Trusted by 10,000+ engineers</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                    <span className="text-sm text-gray-400 ml-1">4.9/5</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right - CAD Preview Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative"
                        >
                            {/* Main Card */}
                            <div className="relative">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-3xl blur-3xl opacity-30 animate-pulse-slow"></div>
                                
                                {/* Card */}
                                <div className="relative bg-[#131825]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                                    {/* Animated Border */}
                                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                                        <div className="absolute inset-[-2px] bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 opacity-50 animate-gradient-x"></div>
                                        <div className="absolute inset-[1px] bg-[#131825] rounded-3xl"></div>
                                    </div>

                                    <div className="relative space-y-6">
                                        {/* CAD Viewer Mock */}
                                        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-white/5 overflow-hidden relative">
                                            {/* Grid */}
                                            <div className="absolute inset-0 opacity-20" style={{
                                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                                backgroundSize: '20px 20px'
                                            }}></div>
                                            {/* CAD Mock Elements */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="relative">
                                                    <Box className="w-24 h-24 text-blue-400/50" />
                                                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                                                </div>
                                            </div>
                                            {/* Floating Labels */}
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.8, duration: 0.5 }}
                                                className="absolute top-4 left-4 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-xs text-green-400 backdrop-blur-sm flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                DFM Passed
                                            </motion.div>
                                            <motion.div 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1, duration: 0.5 }}
                                                className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-400 backdrop-blur-sm"
                                            >
                                                Accuracy: 99.2%
                                            </motion.div>
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 1.2, duration: 0.5 }}
                                                className="absolute bottom-4 left-4 right-4 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-xs text-purple-300 backdrop-blur-sm flex items-center gap-2"
                                            >
                                                <Brain className="w-4 h-4" />
                                                <span>AI: "Consider adding fillets to reduce stress concentration"</span>
                                            </motion.div>
                                        </div>

                                        {/* Stats Row */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Issues', value: '0', color: 'text-green-400' },
                                                { label: 'Warnings', value: '2', color: 'text-yellow-400' },
                                                { label: 'Score', value: '98%', color: 'text-blue-400' },
                                            ].map((stat) => (
                                                <div key={stat.label} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                                                    <div className="text-xs text-gray-500">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.5, duration: 0.5 }}
                                className="absolute -top-6 -right-6 px-4 py-3 bg-[#131825] border border-white/10 rounded-xl shadow-xl backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">+40% Efficiency</div>
                                        <div className="text-xs text-gray-500">This week</div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.7, duration: 0.5 }}
                                className="absolute -bottom-4 -left-4 px-4 py-3 bg-[#131825] border border-white/10 rounded-xl shadow-xl backdrop-blur-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">Validation Complete</div>
                                        <div className="text-xs text-green-400">All checks passed ✓</div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="relative py-16 px-6 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div 
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mx-auto mb-4">
                                        <stat.icon className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Powerful <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Features</span>
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Enterprise-grade CAD validation powered by cutting-edge AI technology
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative"
                            >
                                {/* Glow Effect on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>
                                
                                {/* Card */}
                                <div className="relative bg-[#131825]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg ${feature.glow} group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                                    <div className="mt-6 flex items-center text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Learn more <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Demo Section */}
            <section id="solutions" className="relative py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 lg:order-1"
                        >
                            {/* AI Panel Mockup */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-3xl blur-3xl opacity-20"></div>
                                <div className="relative bg-[#131825]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                                    {/* Header */}
                                    <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-purple-400" />
                                            <span className="font-medium">AI Copilot</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Chat Mock */}
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                    <Users className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="bg-white/5 rounded-lg rounded-tl-none p-3 text-sm text-gray-300">
                                                    Analyze the structural integrity of this bracket design
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                    <Brain className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg rounded-tl-none p-3 text-sm text-gray-200">
                                                    <p className="mb-2">Analysis Complete. Found 3 optimization opportunities:</p>
                                                    <ul className="space-y-1 text-gray-400">
                                                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Add 2mm fillets to reduce stress</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Wall thickness optimal at 3mm</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-400" /> Consider alternative material</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Input */}
                                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                                            <input type="text" placeholder="Ask AI for suggestions..." className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none" readOnly />
                                            <button className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md text-sm font-medium">
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-1 lg:order-2 space-y-6"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-purple-300">AI-Powered Analysis</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                Intelligent Design
                                <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Assistance
                                </span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed">
                                Our AI Copilot understands engineering principles and provides real-time suggestions to improve manufacturability, reduce costs, and optimize designs for production.
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                {aiFeatures.map((feat, i) => (
                                    <motion.div 
                                        key={feat.title}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        viewport={{ once: true }}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                                    >
                                        <feat.icon className="w-5 h-5 text-blue-400 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium text-white">{feat.title}</div>
                                            <div className="text-xs text-gray-500">{feat.desc}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-3xl blur-3xl opacity-30"></div>
                        
                        <div className="relative bg-[#131825]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 overflow-hidden">
                            {/* Grid Pattern */}
                            <div className="absolute inset-0 opacity-5" style={{
                                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                                backgroundSize: '30px 30px'
                            }}></div>

                            <div className="relative text-center space-y-6">
                                <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                    Ready to Transform Your
                                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                                        Design Process?
                                    </span>
                                </h2>
                                <p className="text-gray-400 max-w-xl mx-auto">
                                    Join thousands of engineers already using CADGuard AI to validate designs, reduce costs, and accelerate time-to-market.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                    <Link to="/dashboard" className="group relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-violet-500 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg">
                                            Get Started Free
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                    <button className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all">
                                        Schedule Demo
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500">
                                    No credit card required • Free tier available • Cancel anytime
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="relative border-t border-white/5 pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                        {/* Brand */}
                        <div className="col-span-2">
                            <Link to="/" className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                                    <Box className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-white">
                                    CADGuard <span className="text-blue-400">AI</span>
                                </span>
                            </Link>
                            <p className="text-gray-500 text-sm leading-relaxed mb-4">
                                AI-powered CAD validation platform for engineers and designers. Validate designs, optimize for manufacturing, and reduce costs.
                            </p>
                            <div className="flex gap-3">
                                {[Twitter, Linkedin, Github].map((Icon, i) => (
                                    <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/10 transition-colors">
                                        <Icon className="w-4 h-4 text-gray-400" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title}>
                                <h4 className="font-semibold text-white mb-4">{title}</h4>
                                <ul className="space-y-2">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom */}
                    <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            © 2026 CADGuard AI. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Terms</a>
                            <a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Custom Styles for Animations */}
            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.15; transform: scale(1); }
                    50% { opacity: 0.25; transform: scale(1.05); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 8s ease-in-out infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes gradient-x {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
                .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                }
            `}</style>
        </div>
    );
};

export default Landing;