import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Ruler,
    Settings,
    Download,
    Upload,
    Move,
    Target,
    Camera,
    Eye,
    EyeOff,
    Plus,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    Info,
    XCircle,
    PenTool,
    Bookmark,
    Save,
    FileText,
    Activity,
    Zap,
    Shield,
    Circle,
    Grid3X3,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Scissors,
} from 'lucide-react';
import AdvancedCADViewer from '../components/AdvancedCADViewer';

interface Annotation {
    id: string;
    position: [number, number, number];
    text: string;
    type: 'note' | 'warning' | 'info' | 'critical';
    createdAt: Date;
    author: string;
}

interface Measurement {
    id: string;
    type: string;
    value: number;
    unit: string;
}

const CADStudio: React.FC = () => {
    // Tab state
    const [activeTab, setActiveTab] = useState<'view' | 'measure' | 'annotate' | 'analyze' | 'export'>('view');
    
    // View settings state
    const [showGrid, setShowGrid] = useState(true);
    const [showAxes, setShowAxes] = useState(true);
    const [wireframe, setWireframe] = useState(false);
    const [showShadows, setShowShadows] = useState(true);
    const [cameraPreset, setCameraPreset] = useState<string>('ISO');
    
    // Measure state
    const [activeMeasureTool, setActiveMeasureTool] = useState<string | null>(null);
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    
    // Annotate state
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [showAnnotationModal, setShowAnnotationModal] = useState(false);
    const [newAnnotationText, setNewAnnotationText] = useState('');
    const [newAnnotationType, setNewAnnotationType] = useState<Annotation['type']>('note');

    // Analyze state
    const [analysisResults, setAnalysisResults] = useState<{
        volume: number;
        surfaceArea: number;
        boundingBox: { x: number; y: number; z: number };
        partCount: number;
        holes: number;
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Export state
    const [exportFormat, setExportFormat] = useState<'step' | 'stl' | 'iges' | 'obj'>('step');
    const [isExporting, setIsExporting] = useState(false);

    // Section plane state
    const [sectionPlane, setSectionPlane] = useState<{ axis: string; enabled: boolean; position: number }>({
        axis: 'x',
        enabled: false,
        position: 0
    });

    // Run analysis
    const runAnalysis = async () => {
        setIsAnalyzing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysisResults({
            volume: 45280.5,
            surfaceArea: 12500.8,
            boundingBox: { x: 45, y: 42, z: 35 },
            partCount: 12,
            holes: 8,
        });
        setIsAnalyzing(false);
    };

    // Add annotation
    const addAnnotation = () => {
        if (!newAnnotationText.trim()) return;

        const annotation: Annotation = {
            id: Date.now().toString(),
            position: [0, 0, 0],
            text: newAnnotationText,
            type: newAnnotationType,
            createdAt: new Date(),
            author: 'User',
        };

        setAnnotations(prev => [...prev, annotation]);
        setNewAnnotationText('');
        setShowAnnotationModal(false);
    };

    // Delete annotation
    const deleteAnnotation = (id: string) => {
        setAnnotations(prev => prev.filter(a => a.id !== id));
    };

    // Select measurement tool
    const selectMeasureTool = (toolId: string) => {
        if (activeMeasureTool === toolId) {
            setActiveMeasureTool(null);
        } else {
            setActiveMeasureTool(toolId);
        }
    };

    // Clear measurements
    const clearMeasurements = () => {
        setMeasurements([]);
    };

    // Export model
    const exportModel = async () => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        alert(`Model exported as ${exportFormat.toUpperCase()} format successfully!`);
    };

    // Export screenshot
    const exportScreenshot = () => {
        alert('Screenshot captured and saved!');
    };

    // Reset view
    const resetView = () => {
        setShowGrid(true);
        setShowAxes(true);
        setWireframe(false);
        setShowShadows(true);
        setCameraPreset('ISO');
        setSectionPlane({ axis: 'x', enabled: false, position: 0 });
    };

    // Get annotation icon
    const getAnnotationIcon = (type: Annotation['type']) => {
        switch (type) {
            case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'info': return <Info className="w-4 h-4 text-blue-400" />;
            default: return <MessageSquare className="w-4 h-4 text-green-400" />;
        }
    };

    // Get annotation color
    const getAnnotationColor = (type: Annotation['type']) => {
        switch (type) {
            case 'critical': return 'border-red-500/50 bg-red-500/10';
            case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
            case 'info': return 'border-blue-500/50 bg-blue-500/10';
            default: return 'border-green-500/50 bg-green-500/10';
        }
    };

    // Toggle button component
    const ToggleButton: React.FC<{
        enabled: boolean;
        onClick: () => void;
        label: string;
    }> = ({ enabled, onClick, label }) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-400">{label}</span>
            <button
                onClick={onClick}
                className={`w-11 h-6 rounded-full relative transition-all duration-200 ${
                    enabled ? 'bg-cyan-500/30' : 'bg-gray-700'
                }`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                    enabled ? 'right-1 bg-cyan-400' : 'left-1 bg-gray-400'
                }`} />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            {/* Background effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-full mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <Box className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">CAD Studio</h1>
                            <p className="text-gray-400 text-sm">Advanced CAD viewing and analysis tools</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all">
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline">Import</span>
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-all">
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">Save Project</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left Sidebar - Tabs */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-1.5 sticky top-4">
                            {[
                                { id: 'view', label: 'View', icon: Eye },
                                { id: 'measure', label: 'Measure', icon: Ruler },
                                { id: 'annotate', label: 'Annotate', icon: PenTool },
                                { id: 'analyze', label: 'Analyze', icon: Activity },
                                { id: 'export', label: 'Export', icon: Download },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4 flex-shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Middle - Tab Content */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {activeTab === 'view' && (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/5 rounded-xl border border-white/10 p-4"
                                >
                                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-cyan-400" />
                                        View Settings
                                    </h3>
                                    
                                    <div className="space-y-1">
                                        <ToggleButton
                                            enabled={showGrid}
                                            onClick={() => setShowGrid(!showGrid)}
                                            label="Show Grid"
                                        />
                                        <ToggleButton
                                            enabled={showAxes}
                                            onClick={() => setShowAxes(!showAxes)}
                                            label="Show Axes"
                                        />
                                        <ToggleButton
                                            enabled={wireframe}
                                            onClick={() => setWireframe(!wireframe)}
                                            label="Wireframe"
                                        />
                                        <ToggleButton
                                            enabled={showShadows}
                                            onClick={() => setShowShadows(!showShadows)}
                                            label="Shadows"
                                        />
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <h4 className="text-xs font-medium text-gray-400 mb-3">Camera Presets</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['ISO', 'Front', 'Back', 'Left', 'Right', 'Top'].map((preset) => (
                                                <button
                                                    key={preset}
                                                    onClick={() => setCameraPreset(preset)}
                                                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                                                        cameraPreset === preset
                                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                                    }`}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <h4 className="text-xs font-medium text-gray-400 mb-3">Section Cut</h4>
                                        <div className="space-y-2">
                                            <ToggleButton
                                                enabled={sectionPlane.enabled}
                                                onClick={() => setSectionPlane(prev => ({ ...prev, enabled: !prev.enabled }))}
                                                label="Enable Section"
                                            />
                                            {sectionPlane.enabled && (
                                                <div className="flex gap-2">
                                                    {['x', 'y', 'z'].map((axis) => (
                                                        <button
                                                            key={axis}
                                                            onClick={() => setSectionPlane(prev => ({ ...prev, axis }))}
                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium uppercase transition-all ${
                                                                sectionPlane.axis === axis
                                                                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                                                    : 'bg-white/5 text-gray-400 hover:text-white'
                                                            }`}
                                                        >
                                                            {axis} Axis
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={resetView}
                                        className="w-full mt-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 flex items-center justify-center gap-2 text-sm transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset View
                                    </button>
                                </motion.div>
                            )}

                            {activeTab === 'measure' && (
                                <motion.div
                                    key="measure"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/5 rounded-xl border border-white/10 p-4"
                                >
                                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                        <Ruler className="w-4 h-4 text-green-400" />
                                        Measurement Tools
                                    </h3>
                                    
                                    <div className="space-y-2">
                                        {[
                                            { id: 'distance', label: 'Distance', icon: Move, desc: 'Point to point' },
                                            { id: 'angle', label: 'Angle', icon: Target, desc: 'Between faces' },
                                            { id: 'radius', label: 'Radius', icon: Circle, desc: 'Circle/arc' },
                                            { id: 'area', label: 'Area', icon: Box, desc: 'Surface area' },
                                        ].map((tool) => (
                                            <button
                                                key={tool.id}
                                                onClick={() => selectMeasureTool(tool.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group ${
                                                    activeMeasureTool === tool.id
                                                        ? 'bg-green-500/20 border border-green-500/30'
                                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                    activeMeasureTool === tool.id
                                                        ? 'bg-green-500/30'
                                                        : 'bg-green-500/20 group-hover:bg-green-500/30'
                                                }`}>
                                                    <tool.icon className={`w-4 h-4 ${
                                                        activeMeasureTool === tool.id ? 'text-green-300' : 'text-green-400'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-medium ${
                                                        activeMeasureTool === tool.id ? 'text-green-300' : 'text-white'
                                                    }`}>{tool.label}</p>
                                                    <p className="text-xs text-gray-500">{tool.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {measurements.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="text-xs font-medium text-gray-400">Results</h4>
                                                <button
                                                    onClick={clearMeasurements}
                                                    className="text-xs text-red-400 hover:text-red-300"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                {measurements.map((m) => (
                                                    <div key={m.id} className="p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-400">{m.type}</span>
                                                            <span className="text-green-400 font-medium">{m.value} {m.unit}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                        <p className="text-xs text-green-400">
                                            Select a tool, then click points on the model to measure
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'annotate' && (
                                <motion.div
                                    key="annotate"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/5 rounded-xl border border-white/10 p-4"
                                >
                                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                        <PenTool className="w-4 h-4 text-purple-400" />
                                        Annotations
                                    </h3>

                                    <button
                                        onClick={() => setShowAnnotationModal(true)}
                                        className="w-full py-2.5 mb-4 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Annotation
                                    </button>

                                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                                        {annotations.length === 0 ? (
                                            <div className="text-center py-6 text-gray-500 text-sm">
                                                <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                                <p>No annotations yet</p>
                                                <p className="text-xs mt-1">Click "Add Annotation" to create one</p>
                                            </div>
                                        ) : (
                                            annotations.map((ann) => (
                                                <div
                                                    key={ann.id}
                                                    className={`p-3 rounded-lg border ${getAnnotationColor(ann.type)} relative group`}
                                                >
                                                    <button
                                                        onClick={() => deleteAnnotation(ann.id)}
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                    <div className="flex items-start gap-2 pr-6">
                                                        {getAnnotationIcon(ann.type)}
                                                        <div className="flex-1">
                                                            <p className="text-sm text-white">{ann.text}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {ann.author} - {ann.createdAt.toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'analyze' && (
                                <motion.div
                                    key="analyze"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/5 rounded-xl border border-white/10 p-4"
                                >
                                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-orange-400" />
                                        Model Analysis
                                    </h3>

                                    <button
                                        onClick={runAnalysis}
                                        disabled={isAnalyzing}
                                        className="w-full py-2.5 mb-4 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:bg-orange-500/30 flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4" />
                                                Run Analysis
                                            </>
                                        )}
                                    </button>

                                    {analysisResults && (
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Volume</span>
                                                    <span className="text-sm text-white font-medium">{analysisResults.volume.toLocaleString()} mm³</span>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Surface Area</span>
                                                    <span className="text-sm text-white font-medium">{analysisResults.surfaceArea.toLocaleString()} mm²</span>
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Bounding Box</span>
                                                    <span className="text-sm text-white font-medium">
                                                        {analysisResults.boundingBox.x} × {analysisResults.boundingBox.y} × {analysisResults.boundingBox.z}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                                                    <p className="text-lg text-white font-bold">{analysisResults.partCount}</p>
                                                    <span className="text-xs text-gray-500">Parts</span>
                                                </div>
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center">
                                                    <p className="text-lg text-white font-bold">{analysisResults.holes}</p>
                                                    <span className="text-xs text-gray-500">Holes</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'export' && (
                                <motion.div
                                    key="export"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/5 rounded-xl border border-white/10 p-4"
                                >
                                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                        <Download className="w-4 h-4 text-blue-400" />
                                        Export Options
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        {[
                                            { id: 'step', label: 'STEP (.step)', desc: 'CAD interchange' },
                                            { id: 'stl', label: 'STL (.stl)', desc: '3D printing' },
                                            { id: 'iges', label: 'IGES (.igs)', desc: 'Legacy format' },
                                            { id: 'obj', label: 'OBJ (.obj)', desc: '3D graphics' },
                                        ].map((format) => (
                                            <button
                                                key={format.id}
                                                onClick={() => setExportFormat(format.id as typeof exportFormat)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                                                    exportFormat === format.id
                                                        ? 'bg-blue-500/20 border border-blue-500/30'
                                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                }`}
                                            >
                                                <FileText className={`w-4 h-4 flex-shrink-0 ${
                                                    exportFormat === format.id ? 'text-blue-400' : 'text-gray-400'
                                                }`} />
                                                <div>
                                                    <p className={`text-sm font-medium ${
                                                        exportFormat === format.id ? 'text-blue-400' : 'text-white'
                                                    }`}>{format.label}</p>
                                                    <p className="text-xs text-gray-500">{format.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={exportModel}
                                        disabled={isExporting}
                                        className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm transition-all"
                                    >
                                        {isExporting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                Export Model
                                            </>
                                        )}
                                    </button>

                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={exportScreenshot}
                                            className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Export Screenshot
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right - 3D Viewer */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <div className="h-[600px] lg:h-[700px]">
                                <AdvancedCADViewer
                                    showGrid={showGrid}
                                    showAxes={showAxes}
                                />
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Box className="w-4 h-4 text-cyan-400" />
                                    <span className="text-xs text-gray-400">Parts</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">12</p>
                            </div>
                            <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Ruler className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-gray-400">Measurements</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">{measurements.length}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <PenTool className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-gray-400">Annotations</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">{annotations.length}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield className="w-4 h-4 text-orange-400" />
                                    <span className="text-xs text-gray-400">Issues</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-bold text-white">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Annotation Modal */}
            <AnimatePresence>
                {showAnnotationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAnnotationModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0B0F1A] rounded-2xl border border-white/10 p-6 w-full max-w-md"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <PenTool className="w-5 h-5 text-purple-400" />
                                Add Annotation
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Annotation Type</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'note', label: 'Note', color: 'green' },
                                            { id: 'info', label: 'Info', color: 'blue' },
                                            { id: 'warning', label: 'Warning', color: 'yellow' },
                                            { id: 'critical', label: 'Critical', color: 'red' },
                                        ].map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setNewAnnotationType(type.id as Annotation['type'])}
                                                className={`py-2 rounded-lg text-xs font-medium transition-all ${
                                                    newAnnotationType === type.id
                                                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                                                }`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Comment</label>
                                    <textarea
                                        value={newAnnotationText}
                                        onChange={(e) => setNewAnnotationText(e.target.value)}
                                        placeholder="Enter your annotation..."
                                        className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAnnotationModal(false)}
                                        className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addAnnotation}
                                        disabled={!newAnnotationText.trim()}
                                        className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 rounded-lg text-white font-medium text-sm disabled:opacity-50 transition-all"
                                    >
                                        Add Annotation
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CADStudio;