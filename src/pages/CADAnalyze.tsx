import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Box, Ruler, Circle, AlertTriangle, CheckCircle, RefreshCw, BarChart3, PieChart } from 'lucide-react';
import AdvancedCADViewer from '../components/AdvancedCADViewer';

interface AnalysisResult {
    volume: number;
    surfaceArea: number;
    boundingBox: { x: number; y: number; z: number };
    partCount: number;
    holes: number;
    fillets: number;
    chamfers: number;
    shells: number;
}

const CADAnalyze: React.FC = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<AnalysisResult | null>(null);
    const [analysisProgress, setAnalysisProgress] = useState(0);

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);

        // Simulate analysis progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 150));
            setAnalysisProgress(i);
        }

        setResults({
            volume: 45280.5,
            surfaceArea: 12500.8,
            boundingBox: { x: 45, y: 42, z: 35 },
            partCount: 12,
            holes: 8,
            fillets: 15,
            chamfers: 6,
            shells: 3,
        });

        setIsAnalyzing(false);
    };

    const resetAnalysis = () => {
        setResults(null);
        setAnalysisProgress(0);
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">CAD Analyze</h1>
                            <p className="text-gray-400 text-sm">Comprehensive model analysis and insights</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {results && (
                            <button
                                onClick={resetAnalysis}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reset
                            </button>
                        )}
                        <button
                            onClick={runAnalysis}
                            disabled={isAnalyzing}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 rounded-lg text-white font-medium flex items-center gap-2 transition-all"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Run Analysis
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Analysis Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 sticky top-4">
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-orange-400" />
                                Analysis Results
                            </h3>

                            {isAnalyzing && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Analyzing model...</span>
                                        <span>{analysisProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${analysisProgress}%` }}
                                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {!results && !isAnalyzing ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No analysis yet</p>
                                    <p className="text-xs mt-1">Click "Run Analysis" to start</p>
                                </div>
                            ) : results ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Box className="w-3 h-3" /> Volume
                                            </span>
                                            <span className="text-sm text-white font-medium">{results.volume.toLocaleString()} mm³</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Ruler className="w-3 h-3" /> Surface Area
                                            </span>
                                            <span className="text-sm text-white font-medium">{results.surfaceArea.toLocaleString()} mm²</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">Bounding Box</span>
                                            <span className="text-sm text-white font-medium">{results.boundingBox.x} × {results.boundingBox.y} × {results.boundingBox.z}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                            <p className="text-lg text-white font-bold">{results.partCount}</p>
                                            <span className="text-xs text-gray-500">Parts</span>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                            <p className="text-lg text-white font-bold">{results.holes}</p>
                                            <span className="text-xs text-gray-500">Holes</span>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                            <p className="text-lg text-white font-bold">{results.fillets}</p>
                                            <span className="text-xs text-gray-500">Fillets</span>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-center">
                                            <p className="text-lg text-white font-bold">{results.chamfers}</p>
                                            <span className="text-xs text-gray-500">Chamfers</span>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Quality Checks */}
                            {results && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-medium text-gray-400 mb-3">Quality Checks</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-xs text-green-400">No manifold issues</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-xs text-green-400">All surfaces valid</span>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg">
                                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                            <span className="text-xs text-yellow-400">Thin walls detected (2)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3D Viewer */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <div className="h-[600px] lg:h-[700px]">
                                <AdvancedCADViewer showGrid={true} showAxes={true} />
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Box className="w-5 h-5 text-cyan-400" />
                                    <span className="text-sm font-medium text-white">Geometry</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Analyze vertices, edges, faces, and topology of your CAD model
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <PieChart className="w-5 h-5 text-green-400" />
                                    <span className="text-sm font-medium text-white">Mass Properties</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Calculate volume, surface area, center of mass, and inertia
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                    <span className="text-sm font-medium text-white">Quality Check</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Detect issues like thin walls, undercuts, and manufacturability
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CADAnalyze;