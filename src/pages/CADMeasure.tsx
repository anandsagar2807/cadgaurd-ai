import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Move, Target, Circle, Box, Trash2, CheckCircle } from 'lucide-react';
import AdvancedCADViewer from '../components/AdvancedCADViewer';

interface Measurement {
    id: string;
    type: string;
    value: number;
    unit: string;
    point1?: string;
    point2?: string;
}

const CADMeasure: React.FC = () => {
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [measureHistory, setMeasureHistory] = useState<Measurement[]>([]);

    const measureTools = [
        { id: 'distance', label: 'Distance', icon: Move, desc: 'Measure point-to-point distance', color: 'green' },
        { id: 'angle', label: 'Angle', icon: Target, desc: 'Measure angle between faces', color: 'blue' },
        { id: 'radius', label: 'Radius', icon: Circle, desc: 'Measure radius of circles/arcs', color: 'purple' },
        { id: 'area', label: 'Area', icon: Box, desc: 'Measure surface area', color: 'orange' },
    ];

    const selectTool = (toolId: string) => {
        if (activeTool === toolId) {
            setActiveTool(null);
        } else {
            setActiveTool(toolId);
        }
    };

    const addMeasurement = () => {
        if (!activeTool) return;

        const values: Record<string, number> = {
            distance: 45.67,
            angle: 32.5,
            radius: 12.0,
            area: 1250.8,
        };

        const measurement: Measurement = {
            id: Date.now().toString(),
            type: activeTool,
            value: values[activeTool] || 0,
            unit: activeTool === 'angle' ? '°' : activeTool === 'area' ? 'mm²' : 'mm',
            point1: '0, 0, 0',
            point2: activeTool === 'distance' ? '45.67, 0, 0' : undefined,
        };

        setMeasurements(prev => [...prev, measurement]);
        setMeasureHistory(prev => [...prev, measurement]);
    };

    const clearMeasurements = () => {
        setMeasurements([]);
    };

    const deleteMeasurement = (id: string) => {
        setMeasurements(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <Ruler className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">CAD Measure</h1>
                            <p className="text-gray-400 text-sm">Precise measurement tools for your models</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={clearMeasurements}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Tools Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 sticky top-4">
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-green-400" />
                                Measurement Tools
                            </h3>

                            <div className="space-y-2">
                                {measureTools.map((tool) => (
                                    <button
                                        key={tool.id}
                                        onClick={() => selectTool(tool.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group ${activeTool === tool.id ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${activeTool === tool.id ? 'bg-green-500/30' : 'bg-green-500/20 group-hover:bg-green-500/30'}`}>
                                            <tool.icon className={`w-5 h-5 ${activeTool === tool.id ? 'text-green-300' : 'text-green-400'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${activeTool === tool.id ? 'text-green-300' : 'text-white'}`}>{tool.label}</p>
                                            <p className="text-xs text-gray-500">{tool.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {activeTool && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={addMeasurement}
                                    className="w-full mt-4 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm transition-all"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Take Measurement
                                </motion.button>
                            )}

                            {/* Measurement Results */}
                            {measurements.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-medium text-gray-400 mb-3">Results ({measurements.length})</h4>
                                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                                        {measurements.map((m, index) => (
                                            <motion.div
                                                key={m.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg group relative"
                                            >
                                                <button
                                                    onClick={() => deleteMeasurement(m.id)}
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400 capitalize">{m.type}</span>
                                                    <span className="text-sm font-medium text-green-400">{m.value} {m.unit}</span>
                                                </div>
                                            </motion.div>
                                        ))}
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

                        {/* Instructions */}
                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <h4 className="text-sm font-medium text-green-400 mb-2">How to Measure</h4>
                            <ol className="text-xs text-gray-400 space-y-1">
                                <li>1. Select a measurement tool from the left panel</li>
                                <li>2. Click on the model to set measurement points</li>
                                <li>3. View results in real-time</li>
                                <li>4. Export measurements as needed</li>
                            </ol>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <span className="text-xs text-gray-400">Distance</span>
                                <p className="text-xl font-bold text-white mt-1">{measurements.filter(m => m.type === 'distance').length}</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <span className="text-xs text-gray-400">Angles</span>
                                <p className="text-xl font-bold text-white mt-1">{measurements.filter(m => m.type === 'angle').length}</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <span className="text-xs text-gray-400">Radii</span>
                                <p className="text-xl font-bold text-white mt-1">{measurements.filter(m => m.type === 'radius').length}</p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <span className="text-xs text-gray-400">Total</span>
                                <p className="text-xl font-bold text-white mt-1">{measurements.length}</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CADMeasure;