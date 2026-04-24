import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileImage,
    FileCode,
    Loader2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Move,
    Eye,
    EyeOff,
    FileText,
    FileDown,
    RefreshCw,
    Sparkles,
    Target,
    Shield,
    Gauge,
    ChevronRight,
    Check,
    X,
    Play,
    Pause,
    Box,
    Layers,
    SquareStack,
    Info,
    ArrowRight,
    ArrowLeftRight,
    TrendingUp,
    TrendingDown,
    Clock,
    DollarSign,
    Settings,
    Wrench,
    Cpu,
    Zap,
    Award,
    BarChart3,
    FileCheck,
    MessageSquare,
    Send,
    Bot,
    User,
    ChevronDown,
    ChevronUp,
    PlayCircle,
    PauseCircle,
    SkipForward,
    Rewind,
    Maximize2,
    Minimize2,
    Share2,
    Bookmark,
    BookmarkCheck,
    Printer,
    Mail,
    Link2,
    Code,
    FileSpreadsheet,
    Copy,
    CheckCircle2,
    HelpCircle,
    Lightbulb,
    Package,
    Factory,
    LayersIcon,
    Sliders,
    PieChart,
    Brain,
    Camera,
    Scan,
    Bug,
    Droplet,
    Thermometer,
    Activity,
    Settings2,
} from 'lucide-react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Types
interface DetectedError {
    id: string;
    type: 'misalignment' | 'weak_structure' | 'dimension_error' | 'thickness' | 'draft_angle';
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    location: [number, number, number];
    fix: string;
}

interface ProcessingStep {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface MaterialRecommendation {
    name: string;
    type: string;
    properties: string[];
    costRating: number;
    suitability: number;
    image?: string;
}

interface ManufacturingProcess {
    name: string;
    description: string;
    timeEstimate: string;
    costEstimate: string;
    quality: number;
    suitability: number;
    pros: string[];
    cons: string[];
}

// Engine Image Analysis Types
interface ImpurityDetection {
    id: string;
    type: 'contamination' | 'corrosion' | 'crack' | 'wear' | 'discoloration' | 'foreign_particle' | 'surface_damage';
    severity: 'low' | 'medium' | 'high' | 'critical';
    location: string;
    description: string;
    confidence: number;
    area: string;
    recommendation: string;
}

interface ProblemType {
    id: string;
    label: string;
    description: string;
    category: 'structural' | 'mechanical' | 'thermal' | 'electrical' | 'hydraulic' | 'contamination';
    icon: React.ReactNode;
}

interface BestDesignSuggestion {
    id: string;
    title: string;
    description: string;
    improvement: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
    estimatedCost: string;
    timeToImplement: string;
    image?: string;
}

// 3D Viewer Component
const AdvancedCADViewer: React.FC<{
    highlights: Array<{ position: [number, number, number]; severity: string }>;
    showHeatmap: boolean;
    showCorrected: boolean;
    isRotating: boolean;
    onRotateToggle: () => void;
    showAnnotations: boolean;
    currentStep: number;
    animationProgress: number;
}> = ({ highlights, showHeatmap, showCorrected, isRotating, onRotateToggle, showAnnotations, currentStep, animationProgress }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        mainMesh?: THREE.Mesh;
        correctedMesh?: THREE.Mesh;
        highlightMeshes: THREE.Mesh[];
        heatmapMesh?: THREE.Mesh;
    } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0B0F1A);

        const camera = new THREE.PerspectiveCamera(
            60,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(60, 60, 60);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 30;
        controls.maxDistance = 150;

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

        // Main object - Complex mechanical assembly
        const mainGroup = new THREE.Group();

        if (showCorrected) {
            // AI Corrected Design - Green themed
            // Base platform
            const baseGeometry = new THREE.BoxGeometry(45, 6, 35);
            const baseMaterial = new THREE.MeshPhongMaterial({
                color: 0x22c55e,
                transparent: true,
                opacity: 0.9,
                shininess: 100,
            });
            const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
            baseMesh.position.y = 3;
            baseMesh.castShadow = true;
            mainGroup.add(baseMesh);

            // Main body
            const bodyGeometry = new THREE.BoxGeometry(30, 25, 25);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0x16a34a,
                transparent: true,
                opacity: 0.9,
                shininess: 100,
            });
            const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
            bodyMesh.position.y = 18.5;
            bodyMesh.castShadow = true;
            mainGroup.add(bodyMesh);

            // Cylinder
            const cylinderGeometry = new THREE.CylinderGeometry(10, 10, 18, 32);
            const cylinderMaterial = new THREE.MeshPhongMaterial({
                color: 0x15803d,
                transparent: true,
                opacity: 0.9,
                shininess: 120,
            });
            const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            cylinderMesh.position.set(0, 31, 0);
            cylinderMesh.castShadow = true;
            mainGroup.add(cylinderMesh);
        } else {
            // Original Design - Full colored working machine part

            // Base platform - Metallic gray
            const baseGeometry = new THREE.BoxGeometry(50, 8, 40);
            const baseMaterial = new THREE.MeshPhongMaterial({
                color: 0x64748b,
                transparent: true,
                opacity: 0.95,
                shininess: 80,
            });
            const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
            baseMesh.position.y = 4;
            baseMesh.castShadow = true;
            mainGroup.add(baseMesh);

            // Base detail strips - Blue accent
            const stripGeometry = new THREE.BoxGeometry(48, 1, 38);
            const stripMaterial = new THREE.MeshPhongMaterial({
                color: 0x3b82f6,
                shininess: 100,
            });
            const stripMesh = new THREE.Mesh(stripGeometry, stripMaterial);
            stripMesh.position.y = 8.5;
            mainGroup.add(stripMesh);

            // Motor housing - Orange
            const motorGeometry = new THREE.CylinderGeometry(12, 14, 20, 32);
            const motorMaterial = new THREE.MeshPhongMaterial({
                color: 0xf97316,
                transparent: true,
                opacity: 0.95,
                shininess: 100,
            });
            const motorMesh = new THREE.Mesh(motorGeometry, motorMaterial);
            motorMesh.position.set(-12, 20, 0);
            motorMesh.castShadow = true;
            mainGroup.add(motorMesh);

            // Motor cap - Dark orange
            const motorCapGeometry = new THREE.CylinderGeometry(8, 10, 5, 32);
            const motorCapMaterial = new THREE.MeshPhongMaterial({
                color: 0xc2410c,
                shininess: 120,
            });
            const motorCapMesh = new THREE.Mesh(motorCapGeometry, motorCapMaterial);
            motorCapMesh.position.set(-12, 31, 0);
            mainGroup.add(motorCapMesh);

            // Shaft - Silver
            const shaftGeometry = new THREE.CylinderGeometry(3, 3, 15, 16);
            const shaftMaterial = new THREE.MeshPhongMaterial({
                color: 0x94a3b8,
                shininess: 150,
            });
            const shaftMesh = new THREE.Mesh(shaftGeometry, shaftMaterial);
            shaftMesh.position.set(-12, 38, 0);
            mainGroup.add(shaftMesh);

            // Main body - Blue
            const bodyGeometry = new THREE.BoxGeometry(25, 30, 28);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0x2563eb,
                transparent: true,
                opacity: 0.9,
                shininess: 100,
            });
            const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
            bodyMesh.position.set(10, 25, 0);
            bodyMesh.castShadow = true;
            mainGroup.add(bodyMesh);

            // Control panel - Purple
            const panelGeometry = new THREE.BoxGeometry(8, 15, 2);
            const panelMaterial = new THREE.MeshPhongMaterial({
                color: 0x8b5cf6,
                shininess: 100,
            });
            const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
            panelMesh.position.set(10, 30, 15);
            mainGroup.add(panelMesh);

            // LED indicators - Cyan, Yellow, Green
            const ledGeometry = new THREE.SphereGeometry(1, 16, 16);
            const ledColors = [0x00d4ff, 0xfbbf24, 0x22c55e];
            const ledPositions = [[10, 35, 15.5], [10, 32, 15.5], [10, 29, 15.5]];
            ledColors.forEach((color, i) => {
                const ledMaterial = new THREE.MeshBasicMaterial({ color });
                const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);
                ledMesh.position.set(...(ledPositions[i] as [number, number, number]));
                mainGroup.add(ledMesh);
            });

            // Gear assembly - Gold/Brass
            const gearGeometry = new THREE.TorusGeometry(8, 2, 8, 24);
            const gearMaterial = new THREE.MeshPhongMaterial({
                color: 0xfbbf24,
                shininess: 150,
            });
            const gearMesh = new THREE.Mesh(gearGeometry, gearMaterial);
            gearMesh.position.set(10, 25, 0);
            gearMesh.rotation.x = Math.PI / 2;
            mainGroup.add(gearMesh);

            // Gear center hub
            const hubGeometry = new THREE.CylinderGeometry(4, 4, 6, 16);
            const hubMaterial = new THREE.MeshPhongMaterial({
                color: 0xf59e0b,
                shininess: 150,
            });
            const hubMesh = new THREE.Mesh(hubGeometry, hubMaterial);
            hubMesh.position.set(10, 25, 0);
            mainGroup.add(hubMesh);

            // Support columns - Gray
            const columnGeometry = new THREE.CylinderGeometry(2.5, 2.5, 25, 16);
            const columnMaterial = new THREE.MeshPhongMaterial({
                color: 0x475569,
                shininess: 80,
            });
            const columnPositions = [[22, 20.5, 12], [22, 20.5, -12], [-2, 20.5, 12], [-2, 20.5, -12]];
            columnPositions.forEach((pos) => {
                const columnMesh = new THREE.Mesh(columnGeometry, columnMaterial);
                columnMesh.position.set(...(pos as [number, number, number]));
                mainGroup.add(columnMesh);
            });

            // Top plate - Dark blue
            const topPlateGeometry = new THREE.BoxGeometry(28, 3, 30);
            const topPlateMaterial = new THREE.MeshPhongMaterial({
                color: 0x1e40af,
                shininess: 100,
            });
            const topPlateMesh = new THREE.Mesh(topPlateGeometry, topPlateMaterial);
            topPlateMesh.position.set(10, 41, 0);
            mainGroup.add(topPlateMesh);

            // Valve - Red
            const valveGeometry = new THREE.CylinderGeometry(5, 5, 10, 16);
            const valveMaterial = new THREE.MeshPhongMaterial({
                color: 0xef4444,
                shininess: 100,
            });
            const valveMesh = new THREE.Mesh(valveGeometry, valveMaterial);
            valveMesh.position.set(22, 47, 0);
            mainGroup.add(valveMesh);

            // Valve wheel - Pink
            const wheelGeometry = new THREE.TorusGeometry(4, 0.8, 8, 16);
            const wheelMaterial = new THREE.MeshPhongMaterial({
                color: 0xf472b6,
                shininess: 100,
            });
            const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheelMesh.position.set(22, 53, 0);
            mainGroup.add(wheelMesh);

            // Pipes - Cyan
            const pipeGeometry = new THREE.CylinderGeometry(1.5, 1.5, 20, 8);
            const pipeMaterial = new THREE.MeshPhongMaterial({
                color: 0x06b6d4,
                shininess: 120,
            });
            const pipe1Mesh = new THREE.Mesh(pipeGeometry, pipeMaterial);
            pipe1Mesh.position.set(25, 20, 10);
            pipe1Mesh.rotation.x = Math.PI / 2;
            mainGroup.add(pipe1Mesh);

            const pipe2Mesh = new THREE.Mesh(pipeGeometry, pipeMaterial);
            pipe2Mesh.position.set(25, 20, -10);
            pipe2Mesh.rotation.x = Math.PI / 2;
            mainGroup.add(pipe2Mesh);

            // Connector boxes - Teal
            const connectorGeometry = new THREE.BoxGeometry(6, 6, 6);
            const connectorMaterial = new THREE.MeshPhongMaterial({
                color: 0x14b8a6,
                shininess: 100,
            });
            const connector1Mesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
            connector1Mesh.position.set(-5, 12, 18);
            mainGroup.add(connector1Mesh);

            const connector2Mesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
            connector2Mesh.position.set(-5, 12, -18);
            mainGroup.add(connector2Mesh);
        }

        scene.add(mainGroup);

        sceneRef.current = {
            scene,
            camera,
            renderer,
            controls,
            highlightMeshes: [],
        };

        // Animation
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

        // Resize handler
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
    }, [isRotating, showCorrected]);

    // Update highlights
    useEffect(() => {
        if (!sceneRef.current) return;

        // Remove existing highlights
        sceneRef.current.highlightMeshes.forEach((mesh) => {
            sceneRef.current!.scene.remove(mesh);
        });
        sceneRef.current.highlightMeshes = [];

        // Add new highlights
        if (showHeatmap) {
            highlights.forEach(({ position, severity }) => {
                const geometry = new THREE.SphereGeometry(2.5, 16, 16);
                const color = severity === 'high' ? 0xef4444 : severity === 'medium' ? 0xf59e0b : 0x22c55e;
                const material = new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.8,
                });
                const sphere = new THREE.Mesh(geometry, material);
                sphere.position.set(...position);
                sceneRef.current!.scene.add(sphere);
                sceneRef.current!.highlightMeshes.push(sphere);

                // Add pulsing ring
                const ringGeometry = new THREE.RingGeometry(3, 4, 32);
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 0.5,
                    side: THREE.DoubleSide,
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.set(...position);
                ring.lookAt(sceneRef.current!.camera.position);
                sceneRef.current!.scene.add(ring);
                sceneRef.current!.highlightMeshes.push(ring);
            });
        }
    }, [highlights, showHeatmap]);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[400px] rounded-xl overflow-hidden relative">
            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
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

// Main Solution Component
const Solution: React.FC = () => {
    const [uploadState, setUploadState] = useState<'idle' | 'dragover' | 'uploading' | 'processing' | 'completed'>('idle');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStep, setProcessingStep] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showCorrected, setShowCorrected] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [isRotating, setIsRotating] = useState(false);
    const [selectedError, setSelectedError] = useState<string | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showAnnotations, setShowAnnotations] = useState(true);
    const [currentAnimationStep, setCurrentAnimationStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [activeTab, setActiveTab] = useState<'solutions' | 'materials' | 'manufacturing' | 'export'>('solutions');
    const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
    const [showComparisonSlider, setShowComparisonSlider] = useState(false);
    const [showValidationError, setShowValidationError] = useState(false);
    const [validationErrorMessage, setValidationErrorMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Engine Image Analysis States
    const [isEngineImageMode, setIsEngineImageMode] = useState(false);
    const [engineImageFile, setEngineImageFile] = useState<File | null>(null);
    const [engineImagePreview, setEngineImagePreview] = useState<string | null>(null);
    const [isAnalyzingImpurities, setIsAnalyzingImpurities] = useState(false);
    const [detectedImpurities, setDetectedImpurities] = useState<ImpurityDetection[]>([]);
    const [selectedProblemTypes, setSelectedProblemTypes] = useState<string[]>([]);
    const [problemDescription, setProblemDescription] = useState('');
    const [showImpurityResults, setShowImpurityResults] = useState(false);
    const [bestDesignSuggestions, setBestDesignSuggestions] = useState<BestDesignSuggestion[]>([]);
    const engineImageInputRef = useRef<HTMLInputElement>(null);

    const processingSteps: ProcessingStep[] = [
        { id: '1', label: 'Analyzing Geometry...', status: 'pending' },
        { id: '2', label: 'Detecting Structural Issues...', status: 'pending' },
        { id: '3', label: 'Generating AI Fixes...', status: 'pending' },
    ];

    const [steps, setSteps] = useState<ProcessingStep[]>(processingSteps);

    const detectedErrors: DetectedError[] = [
        {
            id: '1',
            type: 'misalignment',
            severity: 'high',
            title: 'Component Misalignment',
            description: 'The cylinder feature is misaligned by 2.3mm from the center axis, which may cause assembly issues.',
            location: [0, 27.5, 0],
            fix: 'Adjust the cylinder position to align with the base center axis. Apply a 2.3mm offset correction.',
        },
        {
            id: '2',
            type: 'weak_structure',
            severity: 'medium',
            title: 'Weak Structural Support',
            description: 'The base thickness of 5mm may not provide adequate support for the top load.',
            location: [0, 2.5, 0],
            fix: 'Increase base thickness to 8mm or add ribbing for structural reinforcement.',
        },
        {
            id: '3',
            type: 'dimension_error',
            severity: 'low',
            title: 'Dimension Tolerance Warning',
            description: 'The 40mm base width exceeds the recommended tolerance range for the target manufacturing process.',
            location: [20, 2.5, 0],
            fix: 'Consider reducing base width to 38mm or updating manufacturing specifications.',
        },
        {
            id: '4',
            type: 'thickness',
            severity: 'high',
            title: 'Wall Thickness Issue',
            description: 'Wall thickness below minimum recommended value (0.8mm < 1.2mm).',
            location: [-15, 15, 10],
            fix: 'Increase wall thickness to at least 1.2mm for proper injection molding flow.',
        },
    ];

    const materialRecommendations: MaterialRecommendation[] = [
        {
            name: 'ABS Plastic',
            type: 'Thermoplastic',
            properties: ['High impact resistance', 'Good machinability', 'Low cost', 'Easy to mold'],
            costRating: 4,
            suitability: 95,
        },
        {
            name: 'Aluminum 6061-T6',
            type: 'Metal Alloy',
            properties: ['Lightweight', 'Excellent strength-to-weight', 'Good corrosion resistance', 'Weldable'],
            costRating: 3,
            suitability: 88,
        },
        {
            name: 'Stainless Steel 316',
            type: 'Metal Alloy',
            properties: ['High corrosion resistance', 'Medical grade', 'High strength', 'Heat resistant'],
            costRating: 2,
            suitability: 75,
        },
        {
            name: 'Nylon PA6',
            type: 'Engineering Plastic',
            properties: ['High wear resistance', 'Low friction', 'Good chemical resistance', 'Flexible'],
            costRating: 3,
            suitability: 82,
        },
        {
            name: 'PEEK',
            type: 'High-Performance Polymer',
            properties: ['Extreme temperature resistance', 'Chemical resistant', 'High strength', 'Biocompatible'],
            costRating: 1,
            suitability: 70,
        },
    ];

    const manufacturingProcesses: ManufacturingProcess[] = [
        {
            name: 'Injection Molding',
            description: 'High-volume production method ideal for complex plastic parts',
            timeEstimate: '15-30 days for tooling, 1-5 min/part',
            costEstimate: '$5,000 - $50,000 tooling, $0.50 - $5/part',
            quality: 95,
            suitability: 98,
            pros: ['High production rate', 'Consistent quality', 'Low per-part cost at scale', 'Complex geometries possible'],
            cons: ['High initial tooling cost', 'Long lead time for molds', 'Limited design changes after tooling'],
        },
        {
            name: 'CNC Machining',
            description: 'Subtractive manufacturing for precise metal and plastic parts',
            timeEstimate: '1-7 days, varies by complexity',
            costEstimate: '$50 - $500+ per part',
            quality: 99,
            suitability: 85,
            pros: ['High precision', 'Wide material options', 'No tooling required', 'Fast prototyping'],
            cons: ['Higher per-part cost', 'Limited complexity', 'Material waste', 'Slower for large volumes'],
        },
        {
            name: '3D Printing (SLS)',
            description: 'Additive manufacturing for complex geometries and prototyping',
            timeEstimate: '1-3 days',
            costEstimate: '$20 - $200 per part',
            quality: 80,
            suitability: 70,
            pros: ['No tooling required', 'Complex geometries', 'Fast iteration', 'Low volume economical'],
            cons: ['Lower surface finish', 'Limited materials', 'Anisotropic properties', 'Size limitations'],
        },
        {
            name: 'Die Casting',
            description: 'Metal casting process for high-volume metal parts',
            timeEstimate: '4-8 weeks tooling, 30 sec - 2 min/part',
            costEstimate: '$10,000 - $100,000 tooling, $1 - $20/part',
            quality: 92,
            suitability: 88,
            pros: ['Excellent surface finish', 'High production rate', 'Good dimensional accuracy', 'Complex shapes'],
            cons: ['High tooling cost', 'Limited to non-ferrous metals', 'Porosity issues possible', 'Long setup time'],
        },
    ];

    // AI Chat handling
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput,
            timestamp: new Date(),
        };

        setChatMessages((prev) => [...prev, userMessage]);
        setChatInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponses: { [key: string]: string } = {
                'wall thickness': 'Based on the analysis, the wall thickness should be increased from 0.8mm to at least 1.5mm. This will ensure proper material flow during injection molding and reduce the risk of defects like sink marks or warping.',
                'material': 'For this design, I recommend ABS plastic for cost-effective production, or Aluminum 6061-T6 if you need higher strength-to-weight ratio. Both materials are well-suited for the detected manufacturing processes.',
                'manufacturing': 'Injection molding is the most suitable process for this design due to the complex geometry and potential for high-volume production. However, for prototype phase, I recommend CNC machining for faster iteration.',
                'cost': 'The current design modifications could reduce manufacturing costs by approximately 32%. Key savings come from optimized wall thickness (less material usage) and aligned geometry (reduced scrap rate).',
                'default': 'I can help you understand the design analysis and recommendations. You can ask about specific issues, material recommendations, manufacturing processes, or cost optimization strategies.',
            };

            let response = aiResponses['default'];
            const lowerInput = userMessage.content.toLowerCase();

            for (const [key, value] of Object.entries(aiResponses)) {
                if (lowerInput.includes(key)) {
                    response = value;
                    break;
                }
            }

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setChatMessages((prev) => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    // Animation steps
    const animationSteps = [
        { step: 1, title: 'Base Reinforcement', description: 'Increasing base thickness from 5mm to 8mm' },
        { step: 2, title: 'Geometry Alignment', description: 'Correcting 2.3mm cylinder misalignment' },
        { step: 3, title: 'Wall Thickness Update', description: 'Adjusting walls to 1.5mm standard' },
        { step: 4, title: 'Dimension Adjustment', description: 'Optimizing base width to 38mm' },
    ];

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!isEngineImageMode) {
            setUploadState('dragover');
        }
    }, [isEngineImageMode]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!isEngineImageMode) {
            setUploadState('idle');
        }
    }, [isEngineImageMode]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        // Don't handle drop in Engine Image mode - it has its own click handler
        if (isEngineImageMode) {
            return;
        }
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    }, [isEngineImageMode]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    // Validate if file is machinery/hardware related
    const validateMachineryFile = (file: File): { isValid: boolean; message: string } => {
        const filename = file.name.toLowerCase();
        const ext = filename.split('.').pop();
        
        // CAD files are always valid for this platform
        const cadExtensions = ['dxf', 'step', 'stp', 'iges', 'igs', 'stl'];
        if (cadExtensions.includes(ext || '')) {
            return { isValid: true, message: '' };
        }
        
        // For image files, check filename for machinery-related keywords
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
        if (imageExtensions.includes(ext || '')) {
            const machineryKeywords = [
                'engine', 'motor', 'gear', 'bearing', 'shaft', 'piston', 'valve',
                'pump', 'compressor', 'turbine', 'cylinder', 'crankshaft', 'camshaft',
                'bolt', 'nut', 'screw', 'washer', 'spring', 'lever', 'bracket',
                'housing', 'frame', 'chassis', 'panel', 'pipe', 'flange', 'coupling',
                'seal', 'gasket', 'o-ring', 'belt', 'chain', 'sprocket', 'pulley',
                'machinery', 'machine', 'mechanical', 'industrial', 'hardware',
                'automotive', 'aerospace', 'manufacturing', 'part', 'component',
                'assembly', 'cad', 'design', 'prototype', 'fixture', 'tool'
            ];
            
            const hasMachineryKeyword = machineryKeywords.some(keyword => filename.includes(keyword));
            
            if (hasMachineryKeyword) {
                return { isValid: true, message: '' };
            }
            
            // For images without clear machinery keywords, we'll accept them but show a note
            // This allows users to upload their images and the AI will analyze them
            return { 
                isValid: true, 
                message: 'Note: Please ensure your image is of machinery parts or hardware components for accurate analysis.' 
            };
        }
        
        return { 
            isValid: false, 
            message: 'Invalid file type. Please upload CAD files (DXF, STEP, IGES, STL) or images of machinery/hardware parts.' 
        };
    };

    const handleFileUpload = async (file: File) => {
        // Validate the file
        const validation = validateMachineryFile(file);
        
        if (!validation.isValid) {
            setValidationErrorMessage(validation.message);
            setShowValidationError(true);
            setTimeout(() => setShowValidationError(false), 5000);
            return;
        }
        
        setUploadedFile(file);
        setUploadState('uploading');
        setUploadProgress(0);

        // Check if it's an image file - validate with CAD image analyzer
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp'];
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        
        if (imageExtensions.includes(ext)) {
            // Simulate upload progress
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 150);

            // Validate CAD image via API
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch('http://localhost:8001/validate-image', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.status === 'error' || !result.validation?.is_cad) {
                    // Not a CAD image - show cross marks
                    setUploadState('processing');
                    setSteps([
                        { id: '1', label: 'Analyzing Geometry...', status: 'failed' },
                        { id: '2', label: 'Detecting Structural Issues...', status: 'failed' },
                        { id: '3', label: 'Generating AI Fixes...', status: 'failed' },
                    ]);
                    
                    setValidationErrorMessage(result.message || 'The uploaded image is not a CAD design or technical drawing.');
                    setShowValidationError(true);
                    
                    // Reset after showing error
                    setTimeout(() => {
                        setUploadState('idle');
                        setUploadedFile(null);
                        setSteps(processingSteps);
                        setShowValidationError(false);
                    }, 4000);
                    return;
                }
                
                // CAD image - proceed with processing
                startProcessing();
            } catch (error) {
                console.error('CAD validation error:', error);
                // If API fails, proceed anyway (fallback)
                startProcessing();
            }
        } else {
            // Non-image CAD files - proceed normally
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        startProcessing();
                        return 100;
                    }
                    return prev + 10;
                });
            }, 150);
        }
    };

    const startProcessing = () => {
        setUploadState('processing');
        setProcessingStep(0);
        setSteps(processingSteps.map((s, i) => ({ ...s, status: i === 0 ? 'processing' : 'pending' })));

        // Simulate processing steps
        let currentStep = 0;
        const processInterval = setInterval(() => {
            currentStep++;
            if (currentStep < 3) {
                setSteps((prev) =>
                    prev.map((s, i) => ({
                        ...s,
                        status: i < currentStep ? 'completed' : i === currentStep ? 'processing' : 'pending',
                    }))
                );
            } else {
                setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })));
                clearInterval(processInterval);
                setTimeout(() => setUploadState('completed'), 500);
            }
        }, 1500);
    };

    const resetUpload = () => {
        setUploadState('idle');
        setUploadProgress(0);
        setUploadedFile(null);
        setSteps(processingSteps);
        setShowCorrected(false);
        setSelectedError(null);
        setChatMessages([]);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'low':
                return 'text-green-400 bg-green-500/10 border-green-500/30';
            default:
                return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high':
                return <XCircle className="w-4 h-4" />;
            case 'medium':
                return <AlertTriangle className="w-4 h-4" />;
            case 'low':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'svg'].includes(ext || '')) {
            return <FileImage className="w-8 h-8 text-purple-400" />;
        }
        return <FileCode className="w-8 h-8 text-cyan-400" />;
    };

    const toggleBookmark = (id: string) => {
        setBookmarkedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const highlights = detectedErrors.map((e) => ({
        position: e.location,
        severity: e.severity,
    }));

    // Problem Types for Spare Parts
    const problemTypes: ProblemType[] = [
        { id: 'crack', label: 'Crack/Damage', description: 'Visible cracks or structural damage', category: 'structural', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'wear', label: 'Wear & Tear', description: 'Surface wear from normal usage', category: 'mechanical', icon: <Activity className="w-4 h-4" /> },
        { id: 'corrosion', label: 'Corrosion/Rust', description: 'Oxidation or rust formation', category: 'contamination', icon: <Droplet className="w-4 h-4" /> },
        { id: 'misalignment', label: 'Misalignment', description: 'Parts not aligned correctly', category: 'mechanical', icon: <Settings2 className="w-4 h-4" /> },
        { id: 'overheating', label: 'Overheating Signs', description: 'Heat damage or discoloration', category: 'thermal', icon: <Thermometer className="w-4 h-4" /> },
        { id: 'contamination', label: 'Contamination', description: 'Foreign particles or impurities', category: 'contamination', icon: <Bug className="w-4 h-4" /> },
        { id: 'oil_leak', label: 'Oil Leakage', description: 'Oil or fluid leakage marks', category: 'hydraulic', icon: <Droplet className="w-4 h-4" /> },
        { id: 'electrical', label: 'Electrical Issue', description: 'Wiring or connection problems', category: 'electrical', icon: <Zap className="w-4 h-4" /> },
        { id: 'vibration', label: 'Excessive Vibration', description: 'Abnormal vibration patterns', category: 'mechanical', icon: <Settings className="w-4 h-4" /> },
        { id: 'noise', label: 'Unusual Noise', description: 'Abnormal sounds during operation', category: 'mechanical', icon: <Activity className="w-4 h-4" /> },
    ];

    // Handle engine image upload
    const handleEngineImageUpload = (file: File) => {
        setEngineImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setEngineImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Analyze engine image for impurities
    const analyzeEngineImage = async () => {
        setIsAnalyzingImpurities(true);

        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 2500));

        // Generate mock impurity detection results
        const mockImpurities: ImpurityDetection[] = [
            {
                id: '1',
                type: 'contamination',
                severity: 'high',
                location: 'Upper cylinder area',
                description: 'Foreign particle contamination detected near the combustion chamber',
                confidence: 94,
                area: '12.5 cm²',
                recommendation: 'Clean affected area and inspect fuel system for contamination source'
            },
            {
                id: '2',
                type: 'corrosion',
                severity: 'medium',
                location: 'Exhaust manifold',
                description: 'Surface corrosion detected on exhaust components',
                confidence: 87,
                area: '8.2 cm²',
                recommendation: 'Apply anti-corrosion coating and inspect for moisture intrusion'
            },
            {
                id: '3',
                type: 'wear',
                severity: 'low',
                location: 'Bearing surface',
                description: 'Minor wear pattern on bearing contact surfaces',
                confidence: 91,
                area: '4.8 cm²',
                recommendation: 'Monitor wear progression during next maintenance cycle'
            },
        ];

        setDetectedImpurities(mockImpurities);

        // Generate best design suggestions
        const mockDesignSuggestions: BestDesignSuggestion[] = [
            {
                id: '1',
                title: 'Enhanced Filtration System',
                description: 'Upgrade the filtration system to prevent particle contamination in the combustion chamber',
                improvement: 'Reduces contamination risk by 85%',
                impact: 'high',
                category: 'Prevention',
                estimatedCost: '$150 - $300',
                timeToImplement: '2-4 hours'
            },
            {
                id: '2',
                title: 'Corrosion-Resistant Coating',
                description: 'Apply specialized anti-corrosion coating to exhaust components',
                improvement: 'Extends component lifespan by 40%',
                impact: 'medium',
                category: 'Protection',
                estimatedCost: '$75 - $150',
                timeToImplement: '1-2 hours'
            },
            {
                id: '3',
                title: 'Optimized Bearing Design',
                description: 'Implement self-lubricating bearing design with improved wear resistance',
                improvement: 'Reduces maintenance frequency by 50%',
                impact: 'high',
                category: 'Optimization',
                estimatedCost: '$200 - $400',
                timeToImplement: '3-5 hours'
            },
            {
                id: '4',
                title: 'Thermal Barrier Coating',
                description: 'Add thermal barrier coating to improve heat resistance in critical areas',
                improvement: 'Improves thermal efficiency by 15%',
                impact: 'medium',
                category: 'Enhancement',
                estimatedCost: '$100 - $200',
                timeToImplement: '2-3 hours'
            },
        ];

        setBestDesignSuggestions(mockDesignSuggestions);
        setIsAnalyzingImpurities(false);
        setShowImpurityResults(true);
    };

    // Toggle problem type selection
    const toggleProblemType = (id: string) => {
        setSelectedProblemTypes(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    // Get impurity severity color
    const getImpuritySeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
        }
    };

    // Get impurity type icon
    const getImpurityTypeIcon = (type: string) => {
        switch (type) {
            case 'contamination': return <Bug className="w-4 h-4" />;
            case 'corrosion': return <Droplet className="w-4 h-4" />;
            case 'crack': return <AlertTriangle className="w-4 h-4" />;
            case 'wear': return <Activity className="w-4 h-4" />;
            case 'discoloration': return <Thermometer className="w-4 h-4" />;
            case 'foreign_particle': return <AlertCircle className="w-4 h-4" />;
            case 'surface_damage': return <Settings className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A] p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Validation Error Toast */}
                <AnimatePresence>
                    {showValidationError && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -50, x: '-50%' }}
                            className="fixed top-8 left-1/2 z-50 max-w-md w-full mx-auto px-4"
                        >
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-md shadow-lg">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-red-400 font-semibold mb-1">Invalid File</h4>
                                        <p className="text-gray-300 text-sm">{validationErrorMessage}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowValidationError(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">AI Solution Workspace</h1>
                            <p className="text-gray-400">Upload your CAD design to get AI-generated solutions and optimizations</p>
                        </div>
                    </div>
                </motion.div>

                {/* Upload Section */}
                <AnimatePresence mode="wait">
                    {uploadState === 'idle' && !isEngineImageMode && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8"
                        >
                            {/* Mode Toggle */}
                            <div className="flex items-center gap-2 mb-6">
                                <button
                                    onClick={() => setIsEngineImageMode(false)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${!isEngineImageMode
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Box className="w-5 h-5" />
                                    CAD Design Upload
                                </button>
                                <button
                                    onClick={() => setIsEngineImageMode(true)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isEngineImageMode
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Camera className="w-5 h-5" />
                                    Engine/Part Image Analysis
                                </button>
                            </div>

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                            >
                                {/* Glow effect on dragover */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse pointer-events-none opacity-0 hover:opacity-100 transition-opacity" />

                                <div className="relative p-12 text-center">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".dxf,.step,.stp,.iges,.igs,.stl,.jpg,.jpeg,.png,.webp"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                        <Upload className="w-10 h-10 text-cyan-400" />
                                    </div>

                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Upload your CAD design or image for AI validation
                                    </h3>
                                    <p className="text-gray-400 mb-6">
                                        Drag and drop your file here, or click to browse
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                                        {['DXF', 'STEP', 'STP', 'IGES', 'IGS', 'STL', 'JPG', 'PNG', 'WEBP'].map((format) => (
                                            <span
                                                key={format}
                                                className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-300"
                                            >
                                                {format}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium">
                                        <Upload className="w-4 h-4" />
                                        Select File
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Engine Image Analysis Mode */}
                    {uploadState === 'idle' && isEngineImageMode && (
                        <motion.div
                            key="engine-upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Mode Toggle */}
                            <div className="flex items-center gap-2 mb-6">
                                <button
                                    onClick={() => setIsEngineImageMode(false)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${!isEngineImageMode
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Box className="w-5 h-5" />
                                    CAD Design Upload
                                </button>
                                <button
                                    onClick={() => setIsEngineImageMode(true)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isEngineImageMode
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Camera className="w-5 h-5" />
                                    Engine/Part Image Analysis
                                </button>
                            </div>

                            {/* Engine Image Upload Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Side - Image Upload */}
                                <div className="glass-card p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Camera className="w-5 h-5 text-cyan-400" />
                                        <h3 className="text-lg font-semibold text-white">Upload Engine/Part Image</h3>
                                    </div>

                                    <div
                                        onClick={() => engineImageInputRef.current?.click()}
                                        className="relative cursor-pointer rounded-xl border-2 border-dashed border-white/20 bg-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all overflow-hidden"
                                    >
                                        <input
                                            ref={engineImageInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleEngineImageUpload(file);
                                            }}
                                            className="hidden"
                                        />

                                        {engineImagePreview ? (
                                            <div className="relative aspect-video">
                                                <img
                                                    src={engineImagePreview}
                                                    alt="Engine preview"
                                                    className="w-full h-full object-cover rounded-xl"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <p className="text-white text-sm font-medium">{engineImageFile?.name}</p>
                                                    <p className="text-gray-300 text-xs">Click to change image</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                                    <Camera className="w-8 h-8 text-cyan-400" />
                                                </div>
                                                <p className="text-gray-300 mb-2">Upload an image of your engine or spare part</p>
                                                <p className="text-gray-500 text-sm">JPG, PNG, WEBP supported</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Problem Type Checkboxes */}
                                    <div className="mt-6">
                                        <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                            Describe the Issue (Optional)
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            {problemTypes.map((problem) => (
                                                <button
                                                    key={problem.id}
                                                    onClick={() => toggleProblemType(problem.id)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${selectedProblemTypes.includes(problem.id)
                                                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                                                        : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    {problem.icon}
                                                    <span>{problem.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Problem Description */}
                                        <textarea
                                            value={problemDescription}
                                            onChange={(e) => setProblemDescription(e.target.value)}
                                            placeholder="Provide additional details about the issue..."
                                            className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                                        />
                                    </div>

                                    {/* Analyze Button */}
                                    <button
                                        onClick={analyzeEngineImage}
                                        disabled={!engineImageFile || isAnalyzingImpurities}
                                        className="w-full mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isAnalyzingImpurities ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing Image...
                                            </>
                                        ) : (
                                            <>
                                                <Scan className="w-5 h-5" />
                                                Analyze for Impurities
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Right Side - Analysis Results */}
                                <div className="glass-card p-6">
                                    {isAnalyzingImpurities ? (
                                        <div className="flex flex-col items-center justify-center h-full py-12">
                                            <div className="relative w-20 h-20 mb-6">
                                                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                                                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
                                                <div className="absolute inset-3 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Bug className="w-8 h-8 text-cyan-400 animate-pulse" />
                                                </div>
                                            </div>
                                            <h4 className="text-lg font-semibold text-white mb-2">AI Impurity Detection</h4>
                                            <p className="text-gray-400 text-sm text-center">Scanning image for impurities, defects, and anomalies...</p>
                                        </div>
                                    ) : showImpurityResults ? (
                                        <div className="space-y-6">
                                            {/* Detected Impurities */}
                                            <div>
                                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                                    <Bug className="w-5 h-5 text-red-400" />
                                                    Detected Issues ({detectedImpurities.length})
                                                </h4>
                                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                                    {detectedImpurities.map((impurity) => (
                                                        <div
                                                            key={impurity.id}
                                                            className="p-3 rounded-xl bg-white/5 border border-white/10"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getImpuritySeverityColor(impurity.severity)}`}>
                                                                        {getImpurityTypeIcon(impurity.type)}
                                                                    </div>
                                                                    <span className="text-white font-medium capitalize">{impurity.type.replace('_', ' ')}</span>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getImpuritySeverityColor(impurity.severity)}`}>
                                                                    {impurity.severity}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mb-2">{impurity.description}</p>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <span>📍 {impurity.location}</span>
                                                                <span>📊 {impurity.confidence}% confidence</span>
                                                                <span>📐 {impurity.area}</span>
                                                            </div>
                                                            <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                                                <p className="text-xs text-green-300">
                                                                    <strong>Recommendation:</strong> {impurity.recommendation}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Best Design Suggestions */}
                                            <div>
                                                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                                                    Best Design Suggestions
                                                </h4>
                                                <div className="space-y-3">
                                                    {bestDesignSuggestions.map((suggestion) => (
                                                        <div
                                                            key={suggestion.id}
                                                            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border border-white/10"
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <h5 className="text-white font-medium">{suggestion.title}</h5>
                                                                    <span className="text-xs text-gray-500">{suggestion.category}</span>
                                                                </div>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${suggestion.impact === 'high'
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : suggestion.impact === 'medium'
                                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                                        : 'bg-blue-500/20 text-blue-400'
                                                                    }`}>
                                                                    {suggestion.impact} impact
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 mb-2">{suggestion.description}</p>
                                                            <p className="text-xs text-cyan-400 mb-2">✨ {suggestion.improvement}</p>
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    {suggestion.estimatedCost}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {suggestion.timeToImplement}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                <button className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all">
                                                    Apply Suggestions
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowImpurityResults(false);
                                                        setDetectedImpurities([]);
                                                        setBestDesignSuggestions([]);
                                                        setEngineImageFile(null);
                                                        setEngineImagePreview(null);
                                                        setSelectedProblemTypes([]);
                                                        setProblemDescription('');
                                                    }}
                                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                                                >
                                                    New Analysis
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                            <div className="w-16 h-16 mb-4 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                <Scan className="w-8 h-8 text-gray-500" />
                                            </div>
                                            <h4 className="text-lg font-semibold text-white mb-2">Upload & Analyze</h4>
                                            <p className="text-gray-400 text-sm">Upload an engine or spare part image to detect impurities and get design recommendations</p>

                                            {selectedProblemTypes.length > 0 && (
                                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                                    {selectedProblemTypes.map((id) => {
                                                        const problem = problemTypes.find((p) => p.id === id);
                                                        return problem ? (
                                                            <span key={id} className="px-2 py-1 rounded-full text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                                                                {problem.label}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Information Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                            <Bug className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h5 className="text-white font-medium">Impurity Detection</h5>
                                            <p className="text-xs text-gray-400">AI-powered defect identification</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                        </div>
                                        <div>
                                            <h5 className="text-white font-medium">Issue Classification</h5>
                                            <p className="text-xs text-gray-400">Categorize problems by type</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <Lightbulb className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h5 className="text-white font-medium">Design Suggestions</h5>
                                            <p className="text-xs text-gray-400">Optimized recommendations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Uploading State */}
                    {uploadState === 'uploading' && (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8"
                        >
                            <div className="relative rounded-2xl bg-white/5 border border-white/10 p-8 overflow-hidden">
                                {/* Animated border glow */}
                                <div className="absolute inset-0 rounded-2xl">
                                    <div
                                        className="absolute inset-0 rounded-2xl opacity-50"
                                        style={{
                                            background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent)',
                                            animation: 'shimmer 2s infinite',
                                        }}
                                    />
                                </div>

                                <div className="relative flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                        {uploadedFile && getFileIcon(uploadedFile.name)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-white mb-1">
                                            {uploadedFile?.name}
                                        </h4>
                                        <p className="text-sm text-gray-400 mb-3">
                                            {uploadedFile && (uploadedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
                                            <motion.div
                                                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-cyan-400">{uploadProgress}%</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Processing State */}
                    {uploadState === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8"
                        >
                            <div className="relative rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 p-8 overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 animate-gradient-x" />
                                </div>

                                <div className="text-center mb-8">
                                    <div className="relative w-24 h-24 mx-auto mb-6">
                                        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
                                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
                                        <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Brain className="w-10 h-10 text-cyan-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">AI Analysis in Progress</h3>
                                    <p className="text-gray-400">Processing your CAD design for validation</p>
                                </div>

                                <div className="space-y-4 max-w-md mx-auto">
                                    {steps.map((step, index) => (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.2 }}
                                            className={`flex items-center gap-4 p-4 rounded-xl ${step.status === 'completed'
                                                ? 'bg-green-500/10 border border-green-500/30'
                                                : step.status === 'processing'
                                                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                                                    : 'bg-white/5 border border-white/10'
                                                }`}
                                        >
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${step.status === 'completed'
                                                    ? 'bg-green-500/20'
                                                    : step.status === 'processing'
                                                        ? 'bg-cyan-500/20'
                                                        : step.status === 'failed'
                                                            ? 'bg-red-500/20'
                                                            : 'bg-white/5'
                                                    }`}
                                            >
                                                {step.status === 'completed' ? (
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                ) : step.status === 'processing' ? (
                                                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                                                ) : step.status === 'failed' ? (
                                                    <XCircle className="w-5 h-5 text-red-400" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-500" />
                                                )}
                                            </div>
                                            <span
                                                className={`font-medium ${step.status === 'completed'
                                                    ? 'text-green-400'
                                                    : step.status === 'processing'
                                                        ? 'text-cyan-400'
                                                        : step.status === 'failed'
                                                            ? 'text-red-400'
                                                            : 'text-gray-500'
                                                    }`}
                                            >
                                                {step.label}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Completed State - Main Workspace */}
                {uploadState === 'completed' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                    {uploadedFile && getFileIcon(uploadedFile.name)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{uploadedFile?.name}</h4>
                                    <p className="text-sm text-gray-400">Analysis Complete</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <button
                                    onClick={() => setShowChat(!showChat)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${showChat
                                        ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                                        : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    AI Assistant
                                </button>
                                <button
                                    onClick={resetUpload}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    New Analysis
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all"
                                >
                                    <FileText className="w-4 h-4" />
                                    Generate Report
                                </button>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
                            {[
                                { id: 'solutions', label: 'Solutions', icon: Lightbulb },
                                { id: 'materials', label: 'Materials', icon: Package },
                                { id: 'manufacturing', label: 'Manufacturing', icon: Factory },
                                { id: 'export', label: 'Export', icon: Download },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Panel - 3D Viewer */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* 3D Visualization Panel */}
                                <div className="glass-card p-1">
                                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <Box className="w-5 h-5 text-cyan-400" />
                                            3D Visualization
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowAnnotations(!showAnnotations)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${showAnnotations
                                                    ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                                                    : 'bg-white/5 border border-white/10 text-gray-400'
                                                    }`}
                                            >
                                                {showAnnotations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                Annotations
                                            </button>
                                            <button
                                                onClick={() => setShowCorrected(!showCorrected)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${showCorrected
                                                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                                    : 'bg-white/5 border border-white/10 text-gray-400'
                                                    }`}
                                            >
                                                <Layers className="w-4 h-4" />
                                                {showCorrected ? 'Show Original' : 'Show Solution'}
                                            </button>
                                            <button
                                                onClick={() => setShowComparisonSlider(!showComparisonSlider)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${showComparisonSlider
                                                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                                                    : 'bg-white/5 border border-white/10 text-gray-400'
                                                    }`}
                                            >
                                                <ArrowLeftRight className="w-4 h-4" />
                                                Compare
                                            </button>
                                        </div>
                                    </div>
                                    <div className="h-[450px] md:h-[500px]">
                                        <AdvancedCADViewer
                                            highlights={showHeatmap ? highlights : []}
                                            showHeatmap={showHeatmap}
                                            showCorrected={showCorrected}
                                            isRotating={isRotating}
                                            onRotateToggle={() => setIsRotating(!isRotating)}
                                            showAnnotations={showAnnotations}
                                            currentStep={currentAnimationStep}
                                            animationProgress={animationProgress}
                                        />
                                    </div>
                                    {/* Viewer Controls */}
                                    <div className="flex items-center justify-center gap-4 p-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <RotateCcw className="w-4 h-4" />
                                            Rotate
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <ZoomIn className="w-4 h-4" />
                                            Zoom
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Move className="w-4 h-4" />
                                            Pan
                                        </div>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'solutions' && (
                                    <>
                                        {/* Animation Playback Controls */}
                                        <div className="glass-card p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-white font-semibold flex items-center gap-2">
                                                    <PlayCircle className="w-5 h-5 text-cyan-400" />
                                                    Fix Animation Playback
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setCurrentAnimationStep(Math.max(0, currentAnimationStep - 1))}
                                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                                    >
                                                        <Rewind className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setIsPlaying(!isPlaying)}
                                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                                    >
                                                        {isPlaying ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrentAnimationStep(Math.min(animationSteps.length - 1, currentAnimationStep + 1))}
                                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                                    >
                                                        <SkipForward className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {animationSteps.map((step, idx) => (
                                                    <button
                                                        key={step.step}
                                                        onClick={() => setCurrentAnimationStep(idx)}
                                                        className={`flex-1 p-2 rounded-lg text-xs font-medium transition-all ${currentAnimationStep === idx
                                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        Step {step.step}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-400 mt-2 text-center">
                                                {animationSteps[currentAnimationStep].title}: {animationSteps[currentAnimationStep].description}
                                            </p>
                                        </div>

                                        {/* AI Solutions Panel */}
                                        <div className="glass-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                                    <h3 className="text-lg font-semibold text-white">AI-Generated Design Solution</h3>
                                                </div>
                                                <button
                                                    onClick={() => toggleBookmark('solutions')}
                                                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                                                >
                                                    {bookmarkedItems.includes('solutions') ? (
                                                        <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                                                    ) : (
                                                        <Bookmark className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Solution Description */}
                                            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 mb-6">
                                                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                                    Optimized Design Solution
                                                </h4>
                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                    Based on the uploaded design, the AI has generated an optimized solution with improved structural integrity,
                                                    better material distribution, and enhanced manufacturability. The corrected design features reinforced base support,
                                                    aligned component geometry, and optimized wall thickness for injection molding.
                                                </p>
                                            </div>

                                            {/* Solution Features */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                {[
                                                    { icon: Layers, title: 'Reinforced Base', desc: 'Base thickness increased from 5mm to 8mm with ribbing support', color: 'cyan' },
                                                    { icon: Target, title: 'Aligned Geometry', desc: 'Cylinder axis aligned with base center for proper assembly', color: 'purple' },
                                                    { icon: Shield, title: 'Wall Thickness', desc: 'Wall thickness increased to 1.5mm for manufacturing compliance', color: 'green' },
                                                    { icon: Gauge, title: 'Dimension Optimized', desc: 'Base width adjusted to 38mm within tolerance specifications', color: 'orange' },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center`}>
                                                                <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                                                            </div>
                                                            <span className="text-white font-medium">{item.title}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap gap-3">
                                                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-all">
                                                    <Check className="w-5 h-5" />
                                                    Apply All Solutions
                                                </button>
                                                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 transition-all">
                                                    <Download className="w-5 h-5" />
                                                    Download Corrected CAD
                                                </button>
                                            </div>
                                        </div>

                                        {/* Before/After Comparison Section */}
                                        <div className="glass-card p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
                                                <h3 className="text-lg font-semibold text-white">Before vs After Comparison</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Original Design */}
                                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                                            <X className="w-4 h-4 text-red-400" />
                                                        </div>
                                                        <h4 className="font-medium text-red-300">Original Design Issues</h4>
                                                    </div>
                                                    <ul className="space-y-2 text-sm">
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-red-400 mt-1">•</span>
                                                            Base thickness: 5mm (insufficient for load bearing)
                                                        </li>
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-red-400 mt-1">•</span>
                                                            Cylinder offset: 2.3mm misalignment from center
                                                        </li>
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-red-400 mt-1">•</span>
                                                            Wall thickness: 0.8mm (below minimum standard)
                                                        </li>
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-red-400 mt-1">•</span>
                                                            Base width: 40mm (exceeds tolerance range)
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* Corrected Design */}
                                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-green-400" />
                                                        </div>
                                                        <h4 className="font-medium text-green-300">AI Corrected Design</h4>
                                                    </div>
                                                    <ul className="space-y-2 text-sm">
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-green-400 mt-1">✓</span>
                                                            Base thickness: 8mm with ribbing support
                                                        </li>
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-green-400 mt-1">✓</span>
                                                            Cylinder perfectly aligned to center axis
                                                        </li>
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-green-400 mt-1">✓</span>
                                                            Wall thickness: 1.5mm (manufacturing compliant)
                                                        </li>
                                                        <li className="flex items-start gap-2 text-gray-400">
                                                            <span className="text-green-400 mt-1">✓</span>
                                                            Base width: 38mm (within specifications)
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Step-by-Step Solution Guide */}
                                        <div className="glass-card p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Wrench className="w-5 h-5 text-orange-400" />
                                                <h3 className="text-lg font-semibold text-white">Step-by-Step Implementation Guide</h3>
                                            </div>

                                            <div className="space-y-4">
                                                {[
                                                    { step: 1, title: 'Base Reinforcement', description: 'Increase base thickness from 5mm to 8mm. Add cross-ribbing pattern underneath for additional structural support.', time: '5 mins', difficulty: 'Easy' },
                                                    { step: 2, title: 'Geometry Alignment', description: 'Adjust cylinder position by 2.3mm towards center. Ensure all mounting holes align with the corrected position.', time: '10 mins', difficulty: 'Medium' },
                                                    { step: 3, title: 'Wall Thickness Update', description: 'Modify wall parameters to achieve 1.5mm uniform thickness throughout the design. Check all fillets and radii.', time: '15 mins', difficulty: 'Medium' },
                                                    { step: 4, title: 'Dimension Adjustment', description: 'Reduce base width from 40mm to 38mm. Update all related dimensions and check assembly fit.', time: '8 mins', difficulty: 'Easy' },
                                                ].map((item) => (
                                                    <div key={item.step} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                            {item.step}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-white mb-1">{item.title}</h4>
                                                            <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                                                            <div className="flex items-center gap-4 text-xs">
                                                                <span className="flex items-center gap-1 text-cyan-400">
                                                                    <Clock className="w-3 h-3" />
                                                                    {item.time}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${item.difficulty === 'Easy'
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                                    }`}>
                                                                    {item.difficulty}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Cost & Time Savings */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="glass-card p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <DollarSign className="w-5 h-5 text-green-400" />
                                                    <span className="text-sm text-gray-400">Cost Savings</span>
                                                </div>
                                                <div className="text-2xl font-bold text-green-400">-32%</div>
                                                <p className="text-xs text-gray-500 mt-1">Estimated reduction in manufacturing costs</p>
                                            </div>
                                            <div className="glass-card p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="w-5 h-5 text-cyan-400" />
                                                    <span className="text-sm text-gray-400">Time Saved</span>
                                                </div>
                                                <div className="text-2xl font-bold text-cyan-400">-45%</div>
                                                <p className="text-xs text-gray-500 mt-1">Faster production cycle with optimized design</p>
                                            </div>
                                            <div className="glass-card p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                                    <span className="text-sm text-gray-400">Quality Score</span>
                                                </div>
                                                <div className="text-2xl font-bold text-purple-400">+28%</div>
                                                <p className="text-xs text-gray-500 mt-1">Improvement in overall quality metrics</p>
                                            </div>
                                        </div>

                                        {/* Manufacturing Readiness */}
                                        <div className="glass-card p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Award className="w-5 h-5 text-yellow-400" />
                                                <h3 className="text-lg font-semibold text-white">Manufacturing Readiness Checklist</h3>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { label: 'DFM Compliance', status: true },
                                                    { label: 'Tolerance Analysis', status: true },
                                                    { label: 'Material Optimization', status: true },
                                                    { label: 'Assembly Check', status: true },
                                                    { label: 'Cost Optimization', status: true },
                                                    { label: 'Quality Standards', status: true },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.status ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                                            {item.status ? (
                                                                <Check className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <X className="w-4 h-4 text-red-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-gray-300">{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Materials Tab */}
                                {activeTab === 'materials' && (
                                    <div className="glass-card p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Package className="w-5 h-5 text-cyan-400" />
                                            <h3 className="text-lg font-semibold text-white">Material Recommendations</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {materialRecommendations.map((material, idx) => (
                                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h4 className="text-white font-semibold">{material.name}</h4>
                                                            <p className="text-sm text-gray-400">{material.type}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-right">
                                                                <div className="text-sm text-gray-400">Suitability</div>
                                                                <div className="text-lg font-bold text-cyan-400">{material.suitability}%</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {material.properties.map((prop, i) => (
                                                            <span key={i} className="px-2 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-gray-300">
                                                                {prop}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-400">Cost:</span>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <div
                                                                    key={star}
                                                                    className={`w-4 h-4 rounded ${star <= material.costRating ? 'bg-green-500' : 'bg-white/10'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {material.costRating === 1 ? 'Expensive' : material.costRating === 2 ? 'High' : material.costRating === 3 ? 'Moderate' : material.costRating === 4 ? 'Affordable' : 'Low Cost'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Manufacturing Tab */}
                                {activeTab === 'manufacturing' && (
                                    <div className="glass-card p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Factory className="w-5 h-5 text-orange-400" />
                                            <h3 className="text-lg font-semibold text-white">Manufacturing Process Recommendations</h3>
                                        </div>

                                        <div className="space-y-6">
                                            {manufacturingProcesses.map((process, idx) => (
                                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h4 className="text-white font-semibold text-lg">{process.name}</h4>
                                                            <p className="text-sm text-gray-400 mt-1">{process.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm text-gray-400">Match</div>
                                                            <div className="text-2xl font-bold text-green-400">{process.suitability}%</div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="p-3 rounded-lg bg-white/5">
                                                            <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
                                                                <Clock className="w-4 h-4" />
                                                                Time Estimate
                                                            </div>
                                                            <p className="text-xs text-gray-400">{process.timeEstimate}</p>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-white/5">
                                                            <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                                                                <DollarSign className="w-4 h-4" />
                                                                Cost Estimate
                                                            </div>
                                                            <p className="text-xs text-gray-400">{process.costEstimate}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm text-gray-400">Quality Score</span>
                                                            <span className="text-sm text-white">{process.quality}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-white/10">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                                                style={{ width: `${process.quality}%` }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <h5 className="text-sm font-medium text-green-400 mb-2">Pros</h5>
                                                            <ul className="space-y-1">
                                                                {process.pros.map((pro, i) => (
                                                                    <li key={i} className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <Check className="w-3 h-3 text-green-400" />
                                                                        {pro}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-medium text-red-400 mb-2">Cons</h5>
                                                            <ul className="space-y-1">
                                                                {process.cons.map((con, i) => (
                                                                    <li key={i} className="text-xs text-gray-400 flex items-center gap-1">
                                                                        <X className="w-3 h-3 text-red-400" />
                                                                        {con}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Export Tab */}
                                {activeTab === 'export' && (
                                    <div className="glass-card p-6">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Download className="w-5 h-5 text-cyan-400" />
                                            <h3 className="text-lg font-semibold text-white">Export Options</h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-all text-left">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                                        <Code className="w-5 h-5 text-cyan-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-medium">STEP File (.step)</h4>
                                                        <p className="text-xs text-gray-400">Standard CAD exchange format</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-left">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                                        <Box className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-medium">STL File (.stl)</h4>
                                                        <p className="text-xs text-gray-400">3D printing format</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition-all text-left">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                        <FileSpreadsheet className="w-5 h-5 text-green-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-medium">PDF Report</h4>
                                                        <p className="text-xs text-gray-400">Detailed analysis report</p>
                                                    </div>
                                                </div>
                                            </button>

                                            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all text-left">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-orange-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-medium">DXF File (.dxf)</h4>
                                                        <p className="text-xs text-gray-400">2D CAD drawing format</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel - Issues List & Chat */}
                            <div className="space-y-4">
                                {/* Detected Issues */}
                                <div className="glass-card p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                            Detected Issues
                                        </h3>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                            {detectedErrors.length} issues
                                        </span>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {detectedErrors.map((error) => (
                                            <div
                                                key={error.id}
                                                onClick={() => setSelectedError(selectedError === error.id ? null : error.id)}
                                                className={`p-3 rounded-xl cursor-pointer transition-all ${selectedError === error.id
                                                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                                                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getSeverityColor(error.severity)}`}>
                                                            {getSeverityIcon(error.severity)}
                                                        </div>
                                                        <span className="text-sm font-medium text-white">{error.title}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${getSeverityColor(error.severity)}`}>
                                                        {error.severity}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2">{error.description}</p>
                                                {selectedError === error.id && (
                                                    <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                                        <p className="text-xs text-green-300">
                                                            <strong>Fix:</strong> {error.fix}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Chat Panel */}
                                {showChat && (
                                    <div className="glass-card p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Bot className="w-5 h-5 text-purple-400" />
                                                AI Assistant
                                            </h3>
                                            <button
                                                onClick={() => setShowChat(false)}
                                                className="p-1 rounded-lg hover:bg-white/10 text-gray-400"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="h-[300px] overflow-y-auto mb-4 space-y-3">
                                            {chatMessages.length === 0 ? (
                                                <div className="text-center text-gray-400 text-sm py-8">
                                                    <Bot className="w-12 h-12 mx-auto mb-2 text-purple-400/50" />
                                                    <p>Ask me about the design analysis</p>
                                                </div>
                                            ) : (
                                                chatMessages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        {msg.role === 'assistant' && (
                                                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                                <Bot className="w-4 h-4 text-purple-400" />
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                                                ? 'bg-cyan-500/20 text-white'
                                                                : 'bg-white/5 text-gray-300'
                                                                }`}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                        {msg.role === 'user' && (
                                                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                                                <User className="w-4 h-4 text-cyan-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                            {isTyping && (
                                                <div className="flex gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                        <Bot className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                    <div className="bg-white/5 p-3 rounded-xl">
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                                                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Ask about the design..."
                                                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Solution;
