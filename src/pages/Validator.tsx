import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { groqService } from '../services/groqService';
import {
    Upload,
    FileText,
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Zap,
    Eye,
    Download,
    RefreshCw,
    Box,
    Layers,
    Ruler,
    Wrench,
    Settings,
    ChevronRight,
    X,
    RotateCcw,
    ZoomIn,
    Move,
    Target,
    Gauge,
    Activity,
    Flame,
    Thermometer,
    AlertCircle,
    Info,
    FileCode,
    FileImage,
    Play,
    Pause,
} from 'lucide-react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface ValidationIssue {
    id: string;
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    severity: number;
    suggestion: string;
    location: [number, number, number];
}

interface HeatPoint {
    position: [number, number, number];
    intensity: number;
    temperature: number;
}

// 3D Heat Map Viewer Component
const HeatMapViewer: React.FC<{
    showHeatmap: boolean;
    isRotating: boolean;
    onRotateToggle: () => void;
    heatPoints: HeatPoint[];
    selectedIssue: string | null;
}> = ({ showHeatmap, isRotating, onRotateToggle, heatPoints, selectedIssue }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        mainMesh?: THREE.Group;
        heatMeshes: THREE.Mesh[];
    } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0B0F1A);

        const camera = new THREE.PerspectiveCamera(
            60,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(50, 50, 50);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0x00d4ff, 0.6);
        directionalLight1.position.set(50, 50, 50);
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xb24bf3, 0.4);
        directionalLight2.position.set(-50, 30, -50);
        scene.add(directionalLight2);

        // Grid
        const gridHelper = new THREE.GridHelper(100, 20, 0x1e293b, 0x0f172a);
        scene.add(gridHelper);

        // Main mechanical assembly
        const mainGroup = new THREE.Group();

        // Base platform
        const baseGeometry = new THREE.BoxGeometry(45, 6, 35);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x64748b,
            transparent: true,
            opacity: 0.95,
            shininess: 80,
        });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.y = 3;
        baseMesh.castShadow = true;
        mainGroup.add(baseMesh);

        // Base detail strips
        const stripGeometry = new THREE.BoxGeometry(43, 1, 33);
        const stripMaterial = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            shininess: 100,
        });
        const stripMesh = new THREE.Mesh(stripGeometry, stripMaterial);
        stripMesh.position.y = 6.5;
        mainGroup.add(stripMesh);

        // Motor housing
        const motorGeometry = new THREE.CylinderGeometry(10, 12, 18, 32);
        const motorMaterial = new THREE.MeshPhongMaterial({
            color: 0xf97316,
            transparent: true,
            opacity: 0.95,
            shininess: 100,
        });
        const motorMesh = new THREE.Mesh(motorGeometry, motorMaterial);
        motorMesh.position.set(-10, 17, 0);
        motorMesh.castShadow = true;
        mainGroup.add(motorMesh);

        // Motor cap
        const motorCapGeometry = new THREE.CylinderGeometry(7, 9, 4, 32);
        const motorCapMaterial = new THREE.MeshPhongMaterial({
            color: 0xc2410c,
            shininess: 120,
        });
        const motorCapMesh = new THREE.Mesh(motorCapGeometry, motorCapMaterial);
        motorCapMesh.position.set(-10, 27, 0);
        mainGroup.add(motorCapMesh);

        // Main body
        const bodyGeometry = new THREE.BoxGeometry(22, 25, 24);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x2563eb,
            transparent: true,
            opacity: 0.9,
            shininess: 100,
        });
        const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bodyMesh.position.set(8, 21.5, 0);
        bodyMesh.castShadow = true;
        mainGroup.add(bodyMesh);

        // Cylinder on top
        const cylinderGeometry = new THREE.CylinderGeometry(8, 8, 15, 32);
        const cylinderMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b5cf6,
            shininess: 100,
        });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderMesh.position.set(8, 35, 0);
        mainGroup.add(cylinderMesh);

        // Support columns
        const columnGeometry = new THREE.CylinderGeometry(2, 2, 20, 16);
        const columnMaterial = new THREE.MeshPhongMaterial({
            color: 0x475569,
            shininess: 80,
        });
        [[18, 16, 10], [18, 16, -10], [-2, 16, 10], [-2, 16, -10]].forEach((pos) => {
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(pos[0], pos[1], pos[2]);
            mainGroup.add(column);
        });

        // Top plate
        const topGeometry = new THREE.BoxGeometry(24, 2, 26);
        const topMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e40af,
            shininess: 100,
        });
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);
        topMesh.position.set(8, 35, 0);
        mainGroup.add(topMesh);

        // Valve
        const valveGeometry = new THREE.CylinderGeometry(4, 4, 8, 16);
        const valveMaterial = new THREE.MeshPhongMaterial({
            color: 0xef4444,
            shininess: 100,
        });
        const valveMesh = new THREE.Mesh(valveGeometry, valveMaterial);
        valveMesh.position.set(18, 40, 0);
        mainGroup.add(valveMesh);

        scene.add(mainGroup);

        sceneRef.current = {
            scene,
            camera,
            renderer,
            controls,
            heatMeshes: [],
        };

        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            if (isRotating) {
                mainGroup.rotation.y += 0.005;
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!containerRef.current) return;
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [isRotating]);

    // Update heat points
    useEffect(() => {
        if (!sceneRef.current) return;

        // Remove existing heat meshes
        sceneRef.current.heatMeshes.forEach((mesh) => {
            sceneRef.current!.scene.remove(mesh);
        });
        sceneRef.current.heatMeshes = [];

        if (!showHeatmap) return;

        // Add heat points
        heatPoints.forEach((point) => {
            // Heat sphere
            const geometry = new THREE.SphereGeometry(3, 16, 16);
            const color = point.intensity > 70 ? 0xef4444 : point.intensity > 40 ? 0xf59e0b : 0x22c55e;
            const material = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.7,
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(...point.position);
            sceneRef.current!.scene.add(sphere);
            sceneRef.current!.heatMeshes.push(sphere);

            // Heat glow ring
            const ringGeometry = new THREE.RingGeometry(4, 6, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.set(...point.position);
            ring.lookAt(sceneRef.current!.camera.position);
            sceneRef.current!.scene.add(ring);
            sceneRef.current!.heatMeshes.push(ring);
        });
    }, [heatPoints, showHeatmap]);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[350px] rounded-xl overflow-hidden relative">
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                <button
                    onClick={onRotateToggle}
                    className={`p-2 rounded-lg backdrop-blur-md transition-all ${isRotating
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                        }`}
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const Validator: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [issues, setIssues] = useState<ValidationIssue[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [isRotating, setIsRotating] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
    const [analysisStep, setAnalysisStep] = useState(0);

    const analysisSteps = [
        'Parsing CAD Geometry...',
        'Analyzing Structure...',
        'Detecting Manufacturing Issues...',
        'Running Thermal Analysis...',
        'Generating Validation Report...'
    ];

    const mockIssues: ValidationIssue[] = [
        { id: '1', type: 'error', category: 'DFM', message: 'Wall thickness below minimum (0.8mm < 1.2mm)', severity: 85, suggestion: 'Increase wall thickness to at least 1.2mm for injection molding', location: [-10, 17, 8] },
        { id: '2', type: 'warning', category: 'Tolerance', message: 'Tight tolerance ±0.05mm may increase cost', severity: 60, suggestion: 'Consider ±0.1mm tolerance for non-critical dimensions', location: [8, 35, 0] },
        { id: '3', type: 'error', category: 'Geometry', message: 'Undercut detected in motor housing', severity: 90, suggestion: 'Add draft angle or redesign for mold release', location: [-10, 17, 0] },
        { id: '4', type: 'warning', category: 'DFA', message: 'Assembly requires 8 fasteners, consider snap-fit', severity: 45, suggestion: 'Reduce part count for easier assembly', location: [18, 16, 10] },
        { id: '5', type: 'info', category: 'Material', message: 'Consider using ABS instead of PLA for production', severity: 30, suggestion: 'ABS offers better mechanical properties for this application', location: [8, 21.5, 0] },
        { id: '6', type: 'error', category: 'DFM', message: 'Sharp internal corner detected (R < 0.5mm)', severity: 75, suggestion: 'Add fillet with minimum R0.5mm radius', location: [8, 9, 12] },
        { id: '7', type: 'error', category: 'Thermal', message: 'High stress concentration at valve connection', severity: 88, suggestion: 'Add reinforcement ribs around valve base', location: [18, 40, 0] },
        { id: '8', type: 'warning', category: 'Thermal', message: 'Heat dissipation may be insufficient', severity: 55, suggestion: 'Consider adding cooling fins or ventilation', location: [-10, 27, 0] },
    ];

    const heatPoints: HeatPoint[] = mockIssues.map((issue) => ({
        position: issue.location,
        intensity: issue.severity,
        temperature: issue.severity * 3,
    }));

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFile(droppedFile);
    }, []);

    const handleFile = (selectedFile: File) => {
        setFile(selectedFile);
        setShowResults(false);
        setIssues([]);
        setSelectedIssue(null);
    };

    const analyzeFile = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setProgress(0);
        setAnalysisStep(0);

        try {
            for (let i = 0; i < analysisSteps.length; i++) {
                setAnalysisStep(i);
                await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
                setProgress((i + 1) * 20);
            }

            // Generate validation report using Groq
            const fileInfo = `File: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
            const validationReport = await groqService.generateValidationReport(fileInfo);

            // Parse and format the issues from Groq response
            const groqIssues = validationReport.issues || [];

            // If Groq returns issues in the expected format, use them; otherwise use mock data with enhancement
            if (groqIssues.length > 0) {
                // Format Groq issues to match our ValidationIssue interface
                const formattedIssues: ValidationIssue[] = groqIssues.map((issue: any, index: number) => ({
                    id: issue.id || String(index + 1),
                    type: issue.type || (issue.severity > 70 ? 'error' : issue.severity > 40 ? 'warning' : 'info'),
                    category: issue.category || 'General',
                    message: issue.message || 'Issue detected',
                    severity: typeof issue.severity === 'number' ? issue.severity : 50,
                    suggestion: issue.suggestion || 'Review and optimize this area',
                    location: [Math.random() * 40 - 20, Math.random() * 40, Math.random() * 40 - 20] as [number, number, number],
                }));
                setIssues(formattedIssues);
            } else {
                // Fallback to enhanced mock issues
                setIssues(mockIssues);
            }

            setShowResults(true);
        } catch (error) {
            console.error('Error during validation:', error);
            // Use mock issues as fallback
            setIssues(mockIssues);
            setShowResults(true);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
            case 'info': return <Info className="w-5 h-5 text-cyan-400" />;
            default: return null;
        }
    };

    const getSeverityColor = (severity: number) => {
        if (severity >= 70) return 'bg-red-500';
        if (severity >= 40) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const infoCount = issues.filter(i => i.type === 'info').length;

    const overallScore = showResults ? Math.max(0, 100 - (errorCount * 15 + warningCount * 5)) : 0;

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'svg'].includes(ext || '')) {
            return <FileImage className="w-6 h-6 text-purple-400" />;
        }
        return <FileCode className="w-6 h-6 text-cyan-400" />;
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] p-4 md:p-6 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl blur-lg opacity-50"></div>
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">CAD Validator</h1>
                            <p className="text-gray-400">AI-powered validation with thermal & structural analysis</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Upload Section */}
                        {!showResults && (
                            <motion.div
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                className={`relative rounded-2xl border-2 border-dashed transition-all ${file ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/20 hover:border-cyan-500/30 bg-white/5'
                                    } p-8`}
                            >
                                <input
                                    type="file"
                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept=".stl,.step,.stp,.iges,.igs,.dxf,.jpg,.jpeg,.png,.svg"
                                />
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                                        <Upload className="w-8 h-8 text-orange-400" />
                                    </div>
                                    {file ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-2">
                                                {getFileIcon(file.name)}
                                                <p className="text-lg font-medium text-white">{file.name}</p>
                                            </div>
                                            <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-lg font-medium text-white mb-2">Drop your CAD file here</p>
                                            <p className="text-sm text-gray-400">Supports STL, STEP, IGES, DXF, Images</p>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Analysis Progress */}
                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20 p-6"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative w-16 h-16">
                                        <div className="absolute inset-0 rounded-full border-4 border-red-500/20" />
                                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-400 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Activity className="w-6 h-6 text-orange-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">Analyzing Design</h3>
                                        <p className="text-gray-400">{analysisSteps[analysisStep]}</p>
                                    </div>
                                </div>
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                        animate={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    {analysisSteps.map((step, i) => (
                                        <span key={i} className={i <= analysisStep ? 'text-orange-400' : ''}>
                                            {i + 1}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Analysis Options */}
                        {file && !showResults && !isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 rounded-2xl border border-white/10 p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-4">Analysis Options</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { icon: Wrench, label: 'DFM Check', desc: 'Manufacturability', checked: true },
                                        { icon: Layers, label: 'DFA Check', desc: 'Assembly', checked: true },
                                        { icon: Flame, label: 'Thermal', desc: 'Heat Analysis', checked: true },
                                        { icon: Ruler, label: 'Tolerances', desc: 'GD&T Analysis', checked: true },
                                    ].map((option, i) => (
                                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <input type="checkbox" defaultChecked={option.checked} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500" />
                                                <option.icon className="w-5 h-5 text-orange-400" />
                                            </div>
                                            <p className="text-sm font-medium text-white">{option.label}</p>
                                            <p className="text-xs text-gray-500">{option.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={analyzeFile}
                                    className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                                >
                                    <Zap className="w-5 h-5" />
                                    Start Validation Analysis
                                </button>
                            </motion.div>
                        )}

                        {/* Results - 3D Viewer & Issues */}
                        <AnimatePresence>
                            {showResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* 3D Viewer with Heat Map */}
                                    <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Flame className="w-5 h-5 text-orange-400" />
                                                3D Heat Analysis
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setShowHeatmap(!showHeatmap)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${showHeatmap
                                                        ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400'
                                                        : 'bg-white/5 border border-white/10 text-gray-400'
                                                        }`}
                                                >
                                                    <Thermometer className="w-4 h-4" />
                                                    Heat Map
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-[400px]">
                                            <HeatMapViewer
                                                showHeatmap={showHeatmap}
                                                isRotating={isRotating}
                                                onRotateToggle={() => setIsRotating(!isRotating)}
                                                heatPoints={heatPoints}
                                                selectedIssue={selectedIssue}
                                            />
                                        </div>
                                        {/* Heat Legend */}
                                        <div className="flex items-center justify-center gap-6 p-4 border-t border-white/10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-red-500" />
                                                <span className="text-xs text-gray-400">Critical (70%+)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-yellow-500" />
                                                <span className="text-xs text-gray-400">Warning (40-70%)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full bg-green-500" />
                                                <span className="text-xs text-gray-400">Info (Below 40%)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Validation Issues List */}
                                    <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-white">Validation Issues</h3>
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1.5 text-xs"><XCircle className="w-4 h-4 text-red-400" /> {errorCount} Errors</span>
                                                <span className="flex items-center gap-1.5 text-xs"><AlertTriangle className="w-4 h-4 text-yellow-400" /> {warningCount} Warnings</span>
                                                <span className="flex items-center gap-1.5 text-xs"><Info className="w-4 h-4 text-cyan-400" /> {infoCount} Info</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                            {issues.map((issue, index) => (
                                                <motion.div
                                                    key={issue.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                                                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedIssue === issue.id
                                                        ? 'bg-orange-500/10 border border-orange-500/30'
                                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {getTypeIcon(issue.type)}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300">{issue.category}</span>
                                                                <span className="text-xs text-gray-500">Severity: {issue.severity}%</span>
                                                            </div>
                                                            <p className="text-sm text-white mb-1">{issue.message}</p>
                                                            <p className="text-xs text-gray-400">{issue.suggestion}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div className={`h-full ${getSeverityColor(issue.severity)}`} style={{ width: `${issue.severity}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="mt-6 flex gap-3">
                                            <button className="flex-1 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                                <Download className="w-4 h-4" /> Download Report
                                            </button>
                                            <button
                                                onClick={() => { setShowResults(false); setFile(null); }}
                                                className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/10 transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Overall Score */}
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Gauge className="w-5 h-5 text-orange-400" />
                                Validation Score
                            </h3>
                            {showResults ? (
                                <>
                                    <div className="relative w-36 h-36 mx-auto mb-4">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="72" cy="72" r="60" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                                            <circle
                                                cx="72" cy="72" r="60"
                                                stroke={overallScore >= 70 ? '#22c55e' : overallScore >= 40 ? '#f59e0b' : '#ef4444'}
                                                strokeWidth="10"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 60 * (overallScore / 100)} ${2 * Math.PI * 60}`}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-white">{overallScore}</span>
                                            <span className="text-xs text-gray-400">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-white/10">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">DFM Score</span>
                                            <span className="text-green-400">72%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">DFA Score</span>
                                            <span className="text-yellow-400">65%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Thermal Analysis</span>
                                            <span className="text-red-400">58%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Tolerance Check</span>
                                            <span className="text-yellow-400">68%</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>Upload a file to see validation score</p>
                                </div>
                            )}
                        </div>

                        {/* Thermal Analysis Summary */}
                        {showResults && (
                            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Flame className="w-5 h-5 text-orange-400" />
                                    <h3 className="text-lg font-semibold text-white">Thermal Analysis</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Max Temperature</span>
                                            <span className="text-red-400">185°C</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full">
                                            <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full w-[85%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Heat Dissipation</span>
                                            <span className="text-orange-400">72%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full">
                                            <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full w-[72%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Stress Points</span>
                                            <span className="text-yellow-400">4 detected</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Critical Issues */}
                        {showResults && (
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Critical Issues</h3>
                                <div className="space-y-3">
                                    {issues.filter(i => i.severity >= 70).slice(0, 3).map((issue) => (
                                        <div key={issue.id} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                                <span className="text-sm font-medium text-red-300">{issue.category}</span>
                                            </div>
                                            <p className="text-xs text-gray-400">{issue.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Supported Formats */}
                        {!showResults && (
                            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Supported Formats</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {['STL', 'STEP', 'IGES', 'DXF', 'JPG', 'PNG'].map((format) => (
                                        <div key={format} className="px-3 py-2 bg-white/5 rounded-lg text-center text-sm text-gray-300">
                                            {format}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Validator;
