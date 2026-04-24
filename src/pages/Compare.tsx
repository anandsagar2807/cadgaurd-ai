import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitCompare,
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    AlertTriangle,
    ArrowRight,
    ArrowLeft,
    ArrowRightLeft,
    Download,
    Eye,
    Box,
    Layers,
    Ruler,
    Wrench,
    DollarSign,
    Clock,
    TrendingUp,
    TrendingDown,
    Sparkles,
    BarChart3,
    PieChart,
    Target,
    Shield,
    Zap,
    Award,
    RefreshCw,
    FileCode,
    FileImage,
    Plus,
    Minus,
    Equal,
    ChevronRight,
    Info,
} from 'lucide-react';

interface ComparisonItem {
    metric: string;
    original: string | number;
    optimized: string | number;
    change: number;
    category: 'performance' | 'cost' | 'quality';
    icon: React.ElementType;
}

interface IssueComparison {
    issue: string;
    original: boolean;
    optimized: boolean;
    severity: 'error' | 'warning' | 'info';
    category: string;
}

const Compare: React.FC = () => {
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [activeView, setActiveView] = useState<'table' | 'cards' | 'visual'>('cards');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const comparisonData: ComparisonItem[] = [
        { metric: 'Overall DFM Score', original: '62%', optimized: '94%', change: 32, category: 'quality', icon: Award },
        { metric: 'Wall Thickness Compliance', original: '45%', optimized: '100%', change: 55, category: 'quality', icon: Layers },
        { metric: 'Draft Angle Coverage', original: '30%', optimized: '95%', change: 65, category: 'quality', icon: Ruler },
        { metric: 'Estimated Tooling Cost', original: '$45,000', optimized: '$32,000', change: -29, category: 'cost', icon: DollarSign },
        { metric: 'Production Cost/Unit', original: '$2.50', optimized: '$1.85', change: -26, category: 'cost', icon: DollarSign },
        { metric: 'Assembly Time', original: '12 min', optimized: '5 min', change: -58, category: 'performance', icon: Clock },
        { metric: 'Part Count', original: 15, optimized: 8, change: -47, category: 'performance', icon: Box },
        { metric: 'Tolerance Issues', original: 8, optimized: 2, change: -75, category: 'quality', icon: Target },
        { metric: 'Material Waste', original: '18%', optimized: '8%', change: -56, category: 'cost', icon: Ruler },
        { metric: 'Cycle Time', original: '45 sec', optimized: '32 sec', change: -29, category: 'performance', icon: Zap },
    ];

    const issuesComparison: IssueComparison[] = [
        { issue: 'Thin wall sections', original: true, optimized: false, severity: 'error', category: 'DFM' },
        { issue: 'Missing draft angles', original: true, optimized: false, severity: 'error', category: 'DFM' },
        { issue: 'Undercut features', original: true, optimized: true, severity: 'warning', category: 'Geometry' },
        { issue: 'Sharp internal corners', original: true, optimized: false, severity: 'warning', category: 'DFM' },
        { issue: 'Tight tolerances', original: true, optimized: false, severity: 'info', category: 'Tolerance' },
        { issue: 'High fastener count', original: true, optimized: false, severity: 'warning', category: 'DFA' },
        { issue: 'Material incompatibility', original: true, optimized: false, severity: 'error', category: 'Material' },
        { issue: 'Complex geometry', original: true, optimized: true, severity: 'info', category: 'Geometry' },
    ];

    const summaryStats = {
        original: {
            score: 62,
            issues: 8,
            cost: '$45,000',
            time: '12 min',
        },
        optimized: {
            score: 94,
            issues: 2,
            cost: '$32,000',
            time: '5 min',
        },
    };

    const handleCompare = async () => {
        setIsComparing(true);
        await new Promise(resolve => setTimeout(resolve, 2500));
        setShowResults(true);
        setIsComparing(false);
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) {
            return <TrendingUp className="w-4 h-4" />;
        }
        return <TrendingDown className="w-4 h-4" />;
    };

    const getChangeColor = (change: number, category: string) => {
        if (category === 'cost' || category === 'performance') {
            return change < 0 ? 'text-green-400' : 'text-red-400';
        }
        return change > 0 ? 'text-green-400' : 'text-red-400';
    };

    const getChangeBg = (change: number, category: string) => {
        if (category === 'cost' || category === 'performance') {
            return change < 0 ? 'bg-green-500/20' : 'bg-red-500/20';
        }
        return change > 0 ? 'bg-green-500/20' : 'bg-red-500/20';
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'quality': return 'from-emerald-500 to-green-500';
            case 'cost': return 'from-amber-500 to-orange-500';
            case 'performance': return 'from-blue-500 to-cyan-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    const originalIssues = issuesComparison.filter(i => i.original).length;
    const optimizedIssues = issuesComparison.filter(i => i.optimized).length;
    const resolvedIssues = originalIssues - optimizedIssues;

    const filteredComparisonData = selectedCategory === 'all' 
        ? comparisonData 
        : comparisonData.filter(item => item.category === selectedCategory);

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'svg'].includes(ext || '')) {
            return <FileImage className="w-8 h-8 text-purple-400" />;
        }
        return <FileCode className="w-8 h-8 text-cyan-400" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#111827] to-[#0B0F1A] p-4 md:p-6 overflow-x-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-xl opacity-50"></div>
                            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                                <GitCompare className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Design <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Compare</span>
                            </h1>
                            <p className="text-gray-400">Compare original and optimized designs side by side to see improvements</p>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!showResults ? (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Upload Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Original Design Upload */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && setFile1(e.dataTransfer.files[0]); }}
                                    onDragOver={(e) => e.preventDefault()}
                                    className={`relative group cursor-pointer`}
                                >
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className={`relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border-2 border-dashed transition-all p-8 ${
                                        file1 ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/20 hover:border-blue-500/40'
                                    }`}>
                                        <input
                                            type="file"
                                            onChange={(e) => e.target.files?.[0] && setFile1(e.target.files[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept=".stl,.step,.stp,.iges,.igs,.dxf"
                                        />
                                        <div className="flex flex-col items-center text-center">
                                            {file1 ? (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30">
                                                        {getFileIcon(file1.name)}
                                                    </div>
                                                    <p className="text-lg font-medium text-white mb-1">{file1.name}</p>
                                                    <p className="text-sm text-gray-400 mb-3">{(file1.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                        Original Design
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-white/10">
                                                        <Upload className="w-8 h-8 text-blue-400" />
                                                    </div>
                                                    <p className="text-lg font-medium text-white mb-2">Original Design</p>
                                                    <p className="text-sm text-gray-400 mb-4">Drop your original CAD file here</p>
                                                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
                                                        Click or drag to upload
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Optimized Design Upload */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && setFile2(e.dataTransfer.files[0]); }}
                                    onDragOver={(e) => e.preventDefault()}
                                    className={`relative group cursor-pointer`}
                                >
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className={`relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border-2 border-dashed transition-all p-8 ${
                                        file2 ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 hover:border-green-500/40'
                                    }`}>
                                        <input
                                            type="file"
                                            onChange={(e) => e.target.files?.[0] && setFile2(e.target.files[0])}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept=".stl,.step,.stp,.iges,.igs,.dxf"
                                        />
                                        <div className="flex flex-col items-center text-center">
                                            {file2 ? (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4 border border-green-500/30">
                                                        {getFileIcon(file2.name)}
                                                    </div>
                                                    <p className="text-lg font-medium text-white mb-1">{file2.name}</p>
                                                    <p className="text-sm text-gray-400 mb-3">{(file2.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                                                        Optimized Design
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4 border border-white/10">
                                                        <Upload className="w-8 h-8 text-green-400" />
                                                    </div>
                                                    <p className="text-lg font-medium text-white mb-2">Optimized Design</p>
                                                    <p className="text-sm text-gray-400 mb-4">Drop your optimized CAD file here</p>
                                                    <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300">
                                                        Click or drag to upload
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Compare Button */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <button
                                    onClick={handleCompare}
                                    disabled={!file1 || !file2 || isComparing}
                                    className="group relative px-10 py-4 rounded-2xl font-semibold text-white overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 transition-transform group-hover:scale-105"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="relative flex items-center gap-3">
                                        {isComparing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Analyzing Designs...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowRightLeft className="w-5 h-5" />
                                                Compare Designs
                                            </>
                                        )}
                                    </span>
                                </button>
                                
                                <button
                                    onClick={() => { 
                                        setFile1(new File([''], 'bracket_original.step')); 
                                        setFile2(new File([''], 'bracket_optimized.step')); 
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Use demo files to preview comparison
                                </button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Summary Cards - Score Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Original Score */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-6"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <span className="text-sm font-medium text-blue-400">Original Design</span>
                                        </div>
                                        <div className="text-4xl font-bold text-white mb-2">{summaryStats.original.score}%</div>
                                        <p className="text-sm text-gray-400">DFM Score</p>
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <div className="p-2 rounded-lg bg-white/5">
                                                <p className="text-xs text-gray-500">Issues</p>
                                                <p className="text-sm font-medium text-red-400">{summaryStats.original.issues}</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-white/5">
                                                <p className="text-xs text-gray-500">Cost</p>
                                                <p className="text-sm font-medium text-white">{summaryStats.original.cost}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Improvement Arrow */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-col items-center justify-center p-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/30 mb-3">
                                        <div className="text-center">
                                            <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-1" />
                                            <span className="text-lg font-bold text-orange-400">+32%</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 text-center">Overall Improvement</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Minus className="w-4 h-4 text-red-400" />
                                        <span className="text-xs text-gray-500">6 issues resolved</span>
                                    </div>
                                </motion.div>

                                {/* Optimized Score */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            </div>
                                            <span className="text-sm font-medium text-green-400">Optimized Design</span>
                                        </div>
                                        <div className="text-4xl font-bold text-white mb-2">{summaryStats.optimized.score}%</div>
                                        <p className="text-sm text-gray-400">DFM Score</p>
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <div className="p-2 rounded-lg bg-white/5">
                                                <p className="text-xs text-gray-500">Issues</p>
                                                <p className="text-sm font-medium text-green-400">{summaryStats.optimized.issues}</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-white/5">
                                                <p className="text-xs text-gray-500">Cost</p>
                                                <p className="text-sm font-medium text-white">{summaryStats.optimized.cost}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: DollarSign, label: 'Cost Savings', value: '-29%', color: 'green' },
                                    { icon: Clock, label: 'Time Saved', value: '-58%', color: 'cyan' },
                                    { icon: AlertTriangle, label: 'Issues Fixed', value: resolvedIssues.toString(), color: 'orange' },
                                    { icon: Award, label: 'Quality Boost', value: '+32%', color: 'purple' },
                                ].map((stat, idx) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                                            <span className="text-xs text-gray-400">{stat.label}</span>
                                        </div>
                                        <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* View Toggle & Category Filter */}
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">View:</span>
                                    {[
                                        { id: 'cards', label: 'Cards', icon: Layers },
                                        { id: 'table', label: 'Table', icon: BarChart3 },
                                        { id: 'visual', label: 'Visual', icon: PieChart },
                                    ].map((view) => (
                                        <button
                                            key={view.id}
                                            onClick={() => setActiveView(view.id as typeof activeView)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                                                activeView === view.id
                                                    ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            <view.icon className="w-4 h-4" />
                                            {view.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">Filter:</span>
                                    {['all', 'quality', 'cost', 'performance'].map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                selectedCategory === cat
                                                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-white'
                                                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comparison Content Based on View */}
                            {activeView === 'cards' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredComparisonData.map((item, index) => (
                                        <motion.div
                                            key={item.metric}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-5 hover:border-white/20 transition-all"
                                        >
                                            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${getCategoryColor(item.category)}`}></div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getCategoryColor(item.category)} bg-opacity-20 flex items-center justify-center`}>
                                                    <item.icon className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-white">{item.metric}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Original</p>
                                                    <p className="text-lg font-semibold text-gray-300">{item.original}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-500" />
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500 mb-1">Optimized</p>
                                                    <p className={`text-lg font-semibold ${getChangeColor(item.change, item.category)}`}>
                                                        {item.optimized}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`mt-3 flex items-center justify-center gap-1 py-1.5 rounded-lg ${getChangeBg(item.change, item.category)}`}>
                                                {getChangeIcon(item.change)}
                                                <span className={`text-sm font-medium ${getChangeColor(item.change, item.category)}`}>
                                                    {Math.abs(item.change)}% {item.change > 0 ? 'increase' : 'reduction'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeView === 'table' && (
                                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Metric</th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-blue-400 uppercase">Original</th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase"></th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-green-400 uppercase">Optimized</th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Change</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredComparisonData.map((item, index) => (
                                                    <motion.tr
                                                        key={item.metric}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="hover:bg-white/5 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <item.icon className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm text-white">{item.metric}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-sm text-gray-300">{item.original}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <ArrowRight className="w-4 h-4 text-gray-500 mx-auto" />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-sm font-medium ${getChangeColor(item.change, item.category)}`}>
                                                                {item.optimized}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getChangeBg(item.change, item.category)} ${getChangeColor(item.change, item.category)}`}>
                                                                {getChangeIcon(item.change)}
                                                                {Math.abs(item.change)}%
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeView === 'visual' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Visual Bars Comparison */}
                                    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-orange-400" />
                                            Visual Comparison
                                        </h3>
                                        <div className="space-y-4">
                                            {filteredComparisonData.slice(0, 5).map((item) => {
                                                const originalNum = typeof item.original === 'number' ? item.original : parseInt(item.original as string) || 50;
                                                const optimizedNum = typeof item.optimized === 'number' ? item.optimized : parseInt(item.optimized as string) || 75;
                                                
                                                return (
                                                    <div key={item.metric} className="space-y-2">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-300">{item.metric}</span>
                                                            <span className={`font-medium ${getChangeColor(item.change, item.category)}`}>
                                                                {item.change > 0 ? '+' : ''}{item.change}%
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                                    style={{ width: `${Math.min(originalNum, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-400 w-10">{originalNum}%</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                                                    style={{ width: `${Math.min(optimizedNum, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-400 w-10">{optimizedNum}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Issues Breakdown */}
                                    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                            Issues Resolution
                                        </h3>
                                        <div className="space-y-3">
                                            {issuesComparison.map((item, index) => (
                                                <motion.div
                                                    key={item.issue}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm text-white">{item.issue}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(item.severity)}`}>
                                                                {item.severity}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{item.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            {item.original ? (
                                                                <XCircle className="w-5 h-5 text-red-400" />
                                                            ) : (
                                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                                            )}
                                                            <span className="text-xs text-gray-500">Orig</span>
                                                        </div>
                                                        <ArrowRight className="w-3 h-3 text-gray-500" />
                                                        <div className="flex items-center gap-1">
                                                            {item.optimized ? (
                                                                <XCircle className="w-5 h-5 text-red-400" />
                                                            ) : (
                                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                                            )}
                                                            <span className="text-xs text-gray-500">Opt</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <Info className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Comparison Complete</p>
                                        <p className="text-xs text-gray-400">6 issues resolved, 32% quality improvement</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowResults(false)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        New Comparison
                                    </button>
                                    <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:opacity-90 transition-all">
                                        <Download className="w-4 h-4" />
                                        Export Report
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Compare;