import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Eye, Grid3X3, Compass, RotateCcw, Maximize2, Camera } from 'lucide-react';
import AdvancedCADViewer from '../components/AdvancedCADViewer';

const CADViewer: React.FC = () => {
    const [showGrid, setShowGrid] = useState(true);
    const [showAxes, setShowAxes] = useState(true);
    const [wireframe, setWireframe] = useState(false);
    const [cameraPreset, setCameraPreset] = useState<string>('ISO');

    const cameraPresets = ['ISO', 'Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'];

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">CAD Viewer</h1>
                            <p className="text-gray-400 text-sm">Interactive 3D model visualization</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all">
                            <Camera className="w-4 h-4" />
                            Screenshot
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Controls Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 sticky top-4">
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <Grid3X3 className="w-4 h-4 text-cyan-400" />
                                View Controls
                            </h3>

                            <div className="space-y-4">
                                {/* Toggle Controls */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Show Grid</span>
                                        <button
                                            onClick={() => setShowGrid(!showGrid)}
                                            className={`w-11 h-6 rounded-full relative transition-all duration-200 ${showGrid ? 'bg-cyan-500/30' : 'bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${showGrid ? 'right-1 bg-cyan-400' : 'left-1 bg-gray-400'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Show Axes</span>
                                        <button
                                            onClick={() => setShowAxes(!showAxes)}
                                            className={`w-11 h-6 rounded-full relative transition-all duration-200 ${showAxes ? 'bg-cyan-500/30' : 'bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${showAxes ? 'right-1 bg-cyan-400' : 'left-1 bg-gray-400'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Wireframe</span>
                                        <button
                                            onClick={() => setWireframe(!wireframe)}
                                            className={`w-11 h-6 rounded-full relative transition-all duration-200 ${wireframe ? 'bg-orange-500/30' : 'bg-gray-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${wireframe ? 'right-1 bg-orange-400' : 'left-1 bg-gray-400'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Camera Presets */}
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
                                        <Compass className="w-4 h-4" />
                                        Camera Presets
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cameraPresets.map((preset) => (
                                            <button
                                                key={preset}
                                                onClick={() => setCameraPreset(preset)}
                                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${cameraPreset === preset ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'}`}
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-medium text-gray-400 mb-3">Quick Actions</h4>
                                    <div className="space-y-2">
                                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2 transition-all">
                                            <Maximize2 className="w-4 h-4" />
                                            Fit to View
                                        </button>
                                        <button
                                            onClick={() => { setShowGrid(true); setShowAxes(true); setWireframe(false); setCameraPreset('ISO'); }}
                                            className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2 transition-all"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Reset View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3D Viewer */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <div className="h-[600px] lg:h-[700px]">
                                <AdvancedCADViewer showGrid={showGrid} showAxes={showAxes} />
                            </div>
                        </div>

                        {/* Model Info */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Box className="w-4 h-4 text-cyan-400" />
                                    <span className="text-xs text-gray-400">Parts</span>
                                </div>
                                <p className="text-2xl font-bold text-white">12</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Box className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-400">Vertices</span>
                                </div>
                                <p className="text-2xl font-bold text-white">2,450</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Box className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-gray-400">Faces</span>
                                </div>
                                <p className="text-2xl font-bold text-white">4,896</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Box className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs text-gray-400">Layers</span>
                                </div>
                                <p className="text-2xl font-bold text-white">4</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CADViewer;