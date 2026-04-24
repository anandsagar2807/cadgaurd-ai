import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderKanban,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Clock,
    FileText,
    Box,
    Sparkles,
    ArrowRight,
    Zap,
    Target,
    Activity,
    ChevronRight,
    Bell,
    Settings,
    Search,
    Filter,
    Calendar,
    BarChart3,
    PieChart,
    LineChart,
    Users,
    DollarSign,
    Cpu,
    HardDrive,
    RefreshCw,
    MoreHorizontal,
    Star,
    BookOpen,
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const [animatedStats, setAnimatedStats] = useState({
        projects: 0,
        validations: 0,
        issues: 0,
        savings: 0,
    });
    const [activeFilter, setActiveFilter] = useState('week');
    const [selectedMetric, setSelectedMetric] = useState('overview');

    useEffect(() => {
        const targetStats = { projects: 12, validations: 48, issues: 156, savings: 32 };
        const duration = 1500;
        const steps = 60;
        const interval = duration / steps;
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setAnimatedStats({
                projects: Math.round(targetStats.projects * progress),
                validations: Math.round(targetStats.validations * progress),
                issues: Math.round(targetStats.issues * progress),
                savings: Math.round(targetStats.savings * progress),
            });
            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    const stats = [
        {
            label: 'Active Projects',
            value: animatedStats.projects,
            icon: FolderKanban,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            change: '+3 this week',
            trend: 'up',
            description: '3 new projects started',
        },
        {
            label: 'Validations Run',
            value: animatedStats.validations,
            icon: Shield,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            change: '+12 today',
            trend: 'up',
            description: 'Automated checks completed',
        },
        {
            label: 'Issues Found',
            value: animatedStats.issues,
            icon: AlertTriangle,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            change: '85% resolved',
            trend: 'down',
            description: 'Design issues detected',
        },
        {
            label: 'Cost Savings',
            value: `${animatedStats.savings}%`,
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            change: '$45K saved',
            trend: 'up',
            description: 'Manufacturing cost reduction',
        },
    ];

    const recentProjects = [
        { name: 'Bracket Assembly v2', status: 'passed', issues: 2, lastChecked: '2 hours ago', score: 94, progress: 94, category: 'Injection Molding' },
        { name: 'Engine Housing', status: 'warning', issues: 5, lastChecked: '5 hours ago', score: 72, progress: 72, category: 'CNC Machining' },
        { name: 'Gear Box Cover', status: 'failed', issues: 12, lastChecked: '1 day ago', score: 45, progress: 45, category: 'Die Casting' },
        { name: 'Injection Mold Base', status: 'passed', issues: 1, lastChecked: '2 days ago', score: 98, progress: 98, category: 'Injection Molding' },
        { name: 'Pump Housing', status: 'passed', issues: 3, lastChecked: '3 days ago', score: 88, progress: 88, category: '3D Printing' },
    ];

    const validationHistory = [
        { date: 'Today', passed: 8, failed: 2, warnings: 5, total: 15 },
        { date: 'Yesterday', passed: 15, failed: 3, warnings: 7, total: 25 },
        { date: 'Mar 25', passed: 12, failed: 1, warnings: 4, total: 17 },
        { date: 'Mar 24', passed: 10, failed: 4, warnings: 8, total: 22 },
        { date: 'Mar 23', passed: 18, failed: 2, warnings: 3, total: 23 },
    ];

    const aiInsights = [
        { type: 'warning', text: 'Engine Housing has 3 critical tolerance issues', action: 'View Details', priority: 'high' },
        { type: 'success', text: 'Bracket Assembly optimized for CNC machining', action: 'See Report', priority: 'low' },
        { type: 'info', text: 'Material cost reduction opportunity in Gear Box', action: 'Learn More', priority: 'medium' },
        { type: 'warning', text: '5 designs pending validation review', action: 'Review Now', priority: 'medium' },
    ];

    const quickActions = [
        { to: '/validator', icon: Shield, label: 'Validate Design', description: 'Upload and check your CAD files', color: 'from-cyan-500 to-blue-500', bgColor: 'bg-cyan-500/10' },
        { to: '/copilot', icon: Sparkles, label: 'AI Copilot', description: 'Get design assistance', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10' },
        { to: '/solution', icon: Target, label: 'Solutions', description: 'View error solutions', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
        { to: '/reports', icon: FileText, label: 'Reports', description: 'Download validation reports', color: 'from-orange-500 to-red-500', bgColor: 'bg-orange-500/10' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'passed': return 'bg-green-500';
            case 'warning': return 'bg-yellow-500';
            case 'failed': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return null;
        }
    };

    const getInsightIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'info': return <Sparkles className="w-5 h-5 text-cyan-400" />;
            default: return null;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0F172A] to-[#0B0F1A] p-4 md:p-6 lg:p-8">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50"></div>
                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                    <LayoutDashboard className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                                    Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Designer</span>
                                </h1>
                                <p className="text-gray-400 text-sm md:text-base">Here's your design validation overview for today</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <Bell className="w-5 h-5 text-gray-400" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <Settings className="w-5 h-5 text-gray-400" />
                            </button>
                            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">JD</span>
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">John Doe</p>
                                    <p className="text-xs text-gray-400">Pro Plan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all backdrop-blur-sm">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center border border-white/10`}>
                                        <stat.icon className="w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text" style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('purple') ? '#a855f7' : stat.color.includes('orange') ? '#f97316' : '#22c55e' }} />
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="w-3 h-3 text-green-400" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 text-red-400" />
                                        )}
                                        <span className={stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}>{stat.change}</span>
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                                <p className="text-sm text-gray-400">{stat.label}</p>
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <p className="text-xs text-gray-500">{stat.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Projects - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm"
                        >
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                            <FolderKanban className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                                            <p className="text-xs text-gray-400">Your latest design validations</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                                            <Filter className="w-3 h-3 text-gray-400" />
                                            <select className="bg-transparent text-xs text-gray-400 border-none outline-none">
                                                <option>All Status</option>
                                                <option>Passed</option>
                                                <option>Warning</option>
                                                <option>Failed</option>
                                            </select>
                                        </div>
                                        <Link to="/projects" className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                                            View All <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {recentProjects.map((project, index) => (
                                    <motion.div
                                        key={project.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                                                <Box className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium text-white truncate">{project.name}</p>
                                                    {getStatusIcon(project.status)}
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)} bg-opacity-20 text-white`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{project.category}</span>
                                                    <span>•</span>
                                                    <span>{project.lastChecked}</span>
                                                    <span>•</span>
                                                    <span>{project.issues} issues</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${project.status === 'passed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                                                    project.status === 'warning' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                                        'bg-gradient-to-r from-red-500 to-pink-500'
                                                                }`}
                                                            style={{ width: `${project.progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-white">{project.score}%</span>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Validation History Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">Validation History</h2>
                                        <p className="text-xs text-gray-400">Weekly performance overview</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {['week', 'month', 'year'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeFilter === filter
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                    : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                                                }`}
                                        >
                                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-end gap-4 h-48">
                                {validationHistory.map((day, index) => (
                                    <div key={day.date} className="flex-1 flex flex-col items-center">
                                        <div className="w-full flex flex-col gap-1 justify-end h-40 mb-2">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(day.passed / 20) * 100}%` }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg min-h-[4px]"
                                            />
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(day.warnings / 20) * 50}%` }}
                                                transition={{ delay: index * 0.1 + 0.05 }}
                                                className="bg-gradient-to-t from-yellow-500 to-orange-400 min-h-[2px]"
                                            />
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(day.failed / 20) * 30}%` }}
                                                transition={{ delay: index * 0.1 + 0.1 }}
                                                className="bg-gradient-to-t from-red-500 to-pink-400 rounded-b-lg min-h-[2px]"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">{day.date}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"></div>
                                    <span className="text-xs text-gray-400">Passed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-400"></div>
                                    <span className="text-xs text-gray-400">Warnings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-pink-400"></div>
                                    <span className="text-xs text-gray-400">Failed</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* AI Insights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm"
                        >
                            <div className="p-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">AI Insights</h2>
                                        <p className="text-xs text-gray-400">Smart recommendations</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {aiInsights.map((insight, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm text-gray-300 line-clamp-1">{insight.text}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(insight.priority)}`}>
                                                        {insight.priority}
                                                    </span>
                                                    <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                                        {insight.action} →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-white/5">
                                <Link to="/copilot" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 hover:text-white hover:border-purple-500/50 transition-all">
                                    <Sparkles className="w-4 h-4" />
                                    Open AI Copilot
                                </Link>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm"
                        >
                            <div className="p-4 border-b border-white/10">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                                {quickActions.map((action, index) => (
                                    <Link
                                        key={action.to}
                                        to={action.to}
                                        className="group relative overflow-hidden"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`} />
                                        <div className={`relative p-4 rounded-xl ${action.bgColor} border border-white/10 group-hover:border-white/20 transition-all`}>
                                            <action.icon className="w-6 h-6 mb-2 text-gray-300 group-hover:text-white transition-colors" />
                                            <p className="text-sm font-medium text-white">{action.label}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{action.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* Resources Quick Access */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 p-4 backdrop-blur-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-cyan-400" />
                                    Resources
                                </h3>
                                <Link to="/resources" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                                    View all
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { title: 'DFM Guidelines', type: 'Guide', color: 'bg-blue-500/20 text-blue-400' },
                                    { title: 'GD&T Reference', type: 'Reference', color: 'bg-purple-500/20 text-purple-400' },
                                    { title: 'Material Database', type: 'Tool', color: 'bg-green-500/20 text-green-400' },
                                ].map((resource, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{resource.title}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${resource.color}`}>
                                            {resource.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;