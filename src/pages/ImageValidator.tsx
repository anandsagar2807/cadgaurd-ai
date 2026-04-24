import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, CheckCircle, XCircle, AlertTriangle, FileText, Ruler, Layers, Settings, Zap, RefreshCw, AlertCircle, Info, Wrench, FileWarning, Beaker, Gauge, Package, CheckSquare, XSquare, ArrowRight, Lightbulb, Box, RotateCcw, ZoomIn, ZoomOut, Move, Download, FileDown, Play, Pause } from 'lucide-react';
import { validateCADImage, analyzeCADImage, fullAnalysis, CADValidationResult, CADAnalysisResult, FullAnalysisResult, DetectedObject } from '../services/cadValidationService';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 3D Viewer Component for Dynamic Model Visualization
const Dynamic3DViewer: React.FC<{
    analysisResult: FullAnalysisResult | null;
    validationResult: CADValidationResult | null;
}> = ({ analysisResult, validationResult }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<any>(null);
    const animationIdRef = useRef<number>(0);
    const [isRotating, setIsRotating] = useState(true);

    // Generate 3D model based on detected objects
    const generateModel = useCallback(() => {
        if (!sceneRef.current) return;

        // Clear existing objects
        while (sceneRef.current.children.length > 0) {
            sceneRef.current.remove(sceneRef.current.children[0]);
        }

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        sceneRef.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        sceneRef.current.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.5);
        directionalLight2.position.set(-5, -5, -5);
        sceneRef.current.add(directionalLight2);

        // Grid helper
        const gridHelper = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
        sceneRef.current.add(gridHelper);

        // Generate models based on detected objects
        if (analysisResult?.objects?.objects_detected && analysisResult.objects.objects_detected.length > 0) {
            const objects = analysisResult.objects.objects_detected;

            objects.forEach((obj: any, index: number) => {
                let geometry: THREE.BufferGeometry;
                const material = new THREE.MeshPhongMaterial({
                    color: getMeshColor(obj.category || 'default'),
                    transparent: true,
                    opacity: 0.85,
                    shininess: 100,
                });

                // Create geometry based on shape
                const shape = obj.shape?.toLowerCase() || 'box';
                const size = getSizeFromEstimate(obj.estimated_size) || 1;

                switch (shape) {
                    case 'cylinder':
                    case 'cylindrical':
                    case 'shaft':
                        geometry = new THREE.CylinderGeometry(size * 0.4, size * 0.4, size * 1.5, 32);
                        break;
                    case 'sphere':
                    case 'spherical':
                    case 'ball':
                        geometry = new THREE.SphereGeometry(size * 0.5, 32, 32);
                        break;
                    case 'cone':
                    case 'conical':
                        geometry = new THREE.ConeGeometry(size * 0.5, size * 1.2, 32);
                        break;
                    case 'torus':
                    case 'ring':
                        geometry = new THREE.TorusGeometry(size * 0.5, size * 0.2, 16, 100);
                        break;
                    case 'gear':
                        geometry = new THREE.TorusGeometry(size * 0.5, size * 0.15, 16, 100);
                        break;
                    case 'hexagon':
                    case 'hexagonal':
                        geometry = new THREE.CylinderGeometry(size * 0.5, size * 0.5, size, 6);
                        break;
                    default:
                        geometry = new THREE.BoxGeometry(size, size * 0.5, size * 0.8);
                }

                const mesh = new THREE.Mesh(geometry, material);

                // Position objects in a circle
                const angle = (index / objects.length) * Math.PI * 2;
                const radius = objects.length > 1 ? 2.5 : 0;
                mesh.position.x = Math.cos(angle) * radius;
                mesh.position.z = Math.sin(angle) * radius;
                mesh.position.y = 0.5;

                // Add wireframe
                const wireframe = new THREE.WireframeGeometry(geometry);
                const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.3, transparent: true });
                const wireframeMesh = new THREE.LineSegments(wireframe, wireframeMaterial);
                mesh.add(wireframeMesh);

                sceneRef.current.add(mesh);

                // Add label
                if (obj.name) {
                    const canvas = document.createElement('canvas');
                    canvas.width = 256;
                    canvas.height = 64;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.fillStyle = 'rgba(0,0,0,0.7)';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = 'white';
                        ctx.font = '24px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(obj.name, canvas.width / 2, canvas.height / 2 + 8);
                    }
                    const texture = new THREE.CanvasTexture(canvas);
                    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                    const sprite = new THREE.Sprite(spriteMaterial);
                    sprite.position.copy(mesh.position);
                    sprite.position.y += size * 0.5 + 0.5;
                    sprite.scale.set(2, 0.5, 1);
                    sceneRef.current.add(sprite);
                }
            });

            // Add bounding box for the assembly
            const boxGeometry = new THREE.BoxGeometry(6, 3, 6);
            const boxEdges = new THREE.EdgesGeometry(boxGeometry);
            const boxMaterial = new THREE.LineBasicMaterial({ color: 0x8b5cf6, opacity: 0.5, transparent: true });
            const boundingBox = new THREE.LineSegments(boxEdges, boxMaterial);
            boundingBox.position.y = 1;
            sceneRef.current.add(boundingBox);

        } else if (validationResult?.status === 'success') {
            // Default CAD model representation
            const group = new THREE.Group();

            // Main body
            const bodyGeometry = new THREE.BoxGeometry(3, 1, 2);
            const bodyMaterial = new THREE.MeshPhongMaterial({
                color: 0x06b6d4,
                transparent: true,
                opacity: 0.85,
                shininess: 100
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.5;
            group.add(body);

            // Add wireframe to body
            const bodyWireframe = new THREE.WireframeGeometry(bodyGeometry);
            const bodyWireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, opacity: 0.3, transparent: true });
            const bodyWireframeMesh = new THREE.LineSegments(bodyWireframe, bodyWireframeMaterial);
            body.add(bodyWireframeMesh);

            // Top feature
            const topGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32);
            const topMaterial = new THREE.MeshPhongMaterial({ color: 0xa855f7, shininess: 100 });
            const top = new THREE.Mesh(topGeometry, topMaterial);
            top.position.set(0.5, 1.4, 0);
            group.add(top);

            // Side features
            const sideGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 32);
            const sideMaterial = new THREE.MeshPhongMaterial({ color: 0x22c55e, shininess: 100 });

            const side1 = new THREE.Mesh(sideGeometry, sideMaterial);
            side1.rotation.z = Math.PI / 2;
            side1.position.set(-1.8, 0.5, 0);
            group.add(side1);

            const side2 = new THREE.Mesh(sideGeometry, sideMaterial);
            side2.rotation.z = Math.PI / 2;
            side2.position.set(1.8, 0.5, 0);
            group.add(side2);

            sceneRef.current.add(group);

        } else if (validationResult?.status === 'error') {
            // Invalid image representation - error model
            const geometry = new THREE.IcosahedronGeometry(1, 0);
            const material = new THREE.MeshPhongMaterial({
                color: 0xef4444,
                transparent: true,
                opacity: 0.85,
                shininess: 100
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 1;
            sceneRef.current.add(mesh);

            // Add X mark
            const xGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
            const xMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const x1 = new THREE.Mesh(xGeometry, xMaterial);
            x1.rotation.z = Math.PI / 4;
            x1.position.y = 1;
            sceneRef.current.add(x1);

            const x2 = new THREE.Mesh(xGeometry, xMaterial);
            x2.rotation.z = -Math.PI / 4;
            x2.position.y = 1;
            sceneRef.current.add(x2);
        }
    }, [analysisResult, validationResult]);

    // Initialize Three.js scene
    useEffect(() => {
        if (!containerRef.current) return;

        // Scene setup
        sceneRef.current = new THREE.Scene();
        sceneRef.current.background = new THREE.Color(0x0B0F1A);

        // Camera setup
        cameraRef.current = new THREE.PerspectiveCamera(
            60,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        cameraRef.current.position.set(5, 5, 5);
        cameraRef.current.lookAt(0, 0, 0);

        // Renderer setup
        rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(rendererRef.current.domElement);

        // Controls
        controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05;
        controlsRef.current.maxDistance = 20;
        controlsRef.current.minDistance = 2;

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            if (isRotating && sceneRef.current) {
                sceneRef.current.children.forEach((child) => {
                    if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
                        child.rotation.y += 0.005;
                    }
                });
            }

            controlsRef.current?.update();
            rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
        };
        animate();

        // Handle resize
        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
            cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationIdRef.current);
            rendererRef.current?.dispose();
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
        };
    }, []);

    // Update model when analysis changes
    useEffect(() => {
        generateModel();
    }, [analysisResult, validationResult, generateModel]);

    // Handle rotation toggle
    useEffect(() => {
        // Re-render scene when rotation state changes
    }, [isRotating]);

    const handleResetView = () => {
        if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(5, 5, 5);
            cameraRef.current.lookAt(0, 0, 0);
            controlsRef.current.reset();
        }
    };

    const handleZoomIn = () => {
        if (cameraRef.current) {
            cameraRef.current.position.multiplyScalar(0.8);
        }
    };

    const handleZoomOut = () => {
        if (cameraRef.current) {
            cameraRef.current.position.multiplyScalar(1.2);
        }
    };

    const handleDownloadModel = () => {
        // Export scene as image
        if (rendererRef.current) {
            const link = document.createElement('a');
            link.download = 'cad-model-view.png';
            link.href = rendererRef.current.domElement.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">3D Model Preview</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsRotating(!isRotating)}
                        className={`p-1.5 rounded-lg transition-colors ${isRotating ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        title={isRotating ? 'Pause rotation' : 'Start rotation'}
                    >
                        {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleResetView}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Reset view"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDownloadModel}
                        className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Download as image"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 3D Canvas */}
            <div ref={containerRef} className="h-64 w-full relative">
                {/* Overlay info */}
                <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">
                    {analysisResult?.objects?.objects_detected?.length > 0
                        ? `${analysisResult.objects.objects_detected.length} object(s) visualized`
                        : validationResult?.status === 'success'
                            ? 'CAD model preview'
                            : 'Upload an image to visualize'}
                </div>
                <div className="absolute top-2 right-2 text-xs text-gray-500 bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                    <Move className="w-3 h-3" /> Drag to rotate
                </div>
            </div>
        </div>
    );
};

// Helper functions for 3D model generation
const getMeshColor = (category: string): number => {
    const colors: Record<string, number> = {
        'mechanical': 0x06b6d4, // cyan
        'electrical': 0xfbbf24, // yellow
        'structural': 0x8b5cf6, // purple
        'pneumatic': 0x22c55e, // green
        'hydraulic': 0x3b82f6, // blue
        'fastener': 0xf97316, // orange
        'default': 0x06b6d4
    };
    return colors[category.toLowerCase()] || colors['default'];
};

const getSizeFromEstimate = (estimate?: string): number => {
    if (!estimate) return 1;
    const sizeMap: Record<string, number> = {
        'small': 0.5,
        'medium': 1,
        'large': 1.5,
        'extra_large': 2,
        'micro': 0.2,
        'tiny': 0.3
    };
    return sizeMap[estimate.toLowerCase()] || 1;
};

const ImageValidator: React.FC = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<CADValidationResult | null>(null);
    const [analysisResult, setAnalysisResult] = useState<CADAnalysisResult | null>(null);
    const [fullAnalysisResult, setFullAnalysisResult] = useState<FullAnalysisResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setValidationResult(null);
        setAnalysisResult(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const runValidation = async () => {
        if (!selectedFile) return;

        setIsValidating(true);
        setValidationResult(null);
        setAnalysisResult(null);
        setFullAnalysisResult(null);

        // Run full analysis which includes validation, object detection, and CAD analysis
        const fullResult = await fullAnalysis(selectedFile);
        setFullAnalysisResult(fullResult);

        // Also set the validation result for the UI
        if (fullResult.status === 'success') {
            setValidationResult({
                status: 'success',
                type: 'CAD',
                icon: fullResult.icon || '✔️',
                message: fullResult.message,
                action: fullResult.action || 'CONTINUE',
                confidence: fullResult.validation?.confidence,
                detectedFeatures: fullResult.validation?.detected_elements,
            });
        } else {
            setValidationResult({
                status: 'error',
                type: 'NON_CAD',
                icon: fullResult.icon || '❌',
                message: fullResult.message,
                action: fullResult.action || 'STOP',
                confidence: fullResult.validation?.confidence,
                detectedFeatures: [],
            });
        }

        setIsValidating(false);
    };

    const resetValidation = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setValidationResult(null);
        setAnalysisResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Download Report Function
    const handleDownloadReport = () => {
        if (!validationResult || !fullAnalysisResult) return;

        // Create comprehensive report content
        const reportContent = `
                        CADGuard AI - VALIDATION REPORT
Generated: ${new Date().toLocaleString()}
File: ${selectedFile?.name || 'Unknown'}
File Size: ${selectedFile ? (selectedFile.size / 1024).toFixed(2) : '0'} KB

                            VALIDATION RESULT
Status: ${validationResult.status.toUpperCase()}
Type: ${validationResult.type}
Message: ${validationResult.message}
Action: ${validationResult.action}
Confidence: ${validationResult.confidence || 'N/A'}%

${validationResult.detectedFeatures?.length ? `Detected Features: ${validationResult.detectedFeatures.join(', ')}` : ''}

                            DETECTED OBJECTS
${fullAnalysisResult.objects?.primary_object ? `Primary Object: ${fullAnalysisResult.objects.primary_object}` : ''}

${fullAnalysisResult.objects?.objects_detected?.map((obj, i) => `
Object ${i + 1}: ${obj.name}
  - Category: ${obj.category}
  - Shape: ${obj.shape}
  - Material: ${obj.material}
  - Size: ${obj.estimated_size}
  - Surface Finish: ${obj.surface_finish}
  ${obj.function ? `- Function: ${obj.function}` : ''}
  ${obj.manufacturing_process ? `- Manufacturing: ${obj.manufacturing_process}` : ''}
`).join('\n') || 'No objects detected'}

                            PROBLEM SUMMARY
${fullAnalysisResult.analysis?.problem_summary ? `
Critical Issues: ${fullAnalysisResult.analysis.problem_summary.critical_count || 0}
Warnings: ${fullAnalysisResult.analysis.problem_summary.warning_count || 0}
Info: ${fullAnalysisResult.analysis.problem_summary.info_count || 0}
` : 'No problems detected'}

                            CRITICAL ISSUES
${fullAnalysisResult.analysis?.critical_issues?.map((issue: any, i: number) => `
${i + 1}. [${issue.category.toUpperCase()}] ${issue.title}
   Priority: ${issue.priority}
   Description: ${issue.description}
   ${issue.location ? `Location: ${issue.location}` : ''}
   Suggestion: ${issue.suggestion}
`).join('\n') || 'No critical issues'}

                            WARNINGS
${fullAnalysisResult.analysis?.warnings?.map((warning: any, i: number) => `
${i + 1}. [${warning.category.toUpperCase()}] ${warning.title}
   Description: ${warning.description}
   ${warning.suggestion ? `Fix: ${warning.suggestion}` : ''}
`).join('\n') || 'No warnings'}

                            MISSING ELEMENTS
${fullAnalysisResult.analysis?.missing_elements ? `
${fullAnalysisResult.analysis.missing_elements.dimensions?.length ? `Missing Dimensions: ${fullAnalysisResult.analysis.missing_elements.dimensions.join(', ')}` : ''}
${fullAnalysisResult.analysis.missing_elements.tolerances?.length ? `Missing Tolerances: ${fullAnalysisResult.analysis.missing_elements.tolerances.join(', ')}` : ''}
${fullAnalysisResult.analysis.missing_elements.views?.length ? `Missing Views: ${fullAnalysisResult.analysis.missing_elements.views.join(', ')}` : ''}
${fullAnalysisResult.analysis.missing_elements.annotations?.length ? `Missing Annotations: ${fullAnalysisResult.analysis.missing_elements.annotations.join(', ')}` : ''}
` : 'All required elements present'}

                        MANUFACTURING ANALYSIS
${fullAnalysisResult.analysis?.manufacturing_analysis ? `
Manufacturability Score: ${fullAnalysisResult.analysis.manufacturing_analysis.manufacturability_score}%
${fullAnalysisResult.analysis.manufacturing_analysis.recommended_processes?.length ? `Recommended Processes: ${fullAnalysisResult.analysis.manufacturing_analysis.recommended_processes.join(', ')}` : ''}
${fullAnalysisResult.analysis.manufacturing_analysis.cost_factors?.length ? `Cost Factors: ${fullAnalysisResult.analysis.manufacturing_analysis.cost_factors.join(', ')}` : ''}
${fullAnalysisResult.analysis.manufacturing_analysis.risk_areas?.length ? `Risk Areas: ${fullAnalysisResult.analysis.manufacturing_analysis.risk_areas.join(', ')}` : ''}
` : 'No manufacturing analysis available'}

                        STANDARDS COMPLIANCE
${fullAnalysisResult.analysis?.standards_compliance ? `
Status: ${fullAnalysisResult.analysis.standards_compliance.compliance_status?.toUpperCase()}
${fullAnalysisResult.analysis.standards_compliance.applicable_standards?.length ? `Applicable Standards: ${fullAnalysisResult.analysis.standards_compliance.applicable_standards.join(', ')}` : ''}
${fullAnalysisResult.analysis.standards_compliance.violations?.length ? `Violations: ${fullAnalysisResult.analysis.standards_compliance.violations.join(', ')}` : ''}
` : 'No standards compliance data'}

                        OVERALL ASSESSMENT
${fullAnalysisResult.analysis?.overall_assessment || 'No overall assessment available'}

${fullAnalysisResult.analysis?.confidence_score ? `Analysis Confidence: ${Math.round(fullAnalysisResult.analysis.confidence_score * 100)}%` : ''}

                            IMPROVEMENT SUGGESTIONS
${fullAnalysisResult.analysis?.suggestions?.map((suggestion: any, i: number) => `
${i + 1}. ${suggestion.title} [${suggestion.priority.toUpperCase()}]
   ${suggestion.description}
   ${suggestion.benefit ? `Benefit: ${suggestion.benefit}` : ''}
`).join('\n') || 'No suggestions available'}

                            DISCLAIMER
This report was generated by CADGuard AI. The analysis is based on AI-powered
image recognition and should be verified by a qualified engineer before making
manufacturing decisions.

                    Report generated by CADGuard AI
                    https://cadguard.ai
`;

        // Create and download the file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `CADGuard_Report_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">CAD Image Validator</h1>
                            <p className="text-gray-400 text-sm">AI-powered validation for CAD design images</p>
                        </div>
                    </div>
                </div>

                {/* 3D Visualization Section */}
                <Dynamic3DViewer
                    analysisResult={fullAnalysisResult}
                    validationResult={validationResult}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <div className="space-y-4">
                        {/* Drop Zone */}
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer ${isDragging
                                ? 'border-purple-500 bg-purple-500/10'
                                : selectedFile
                                    ? 'border-green-500/50 bg-green-500/5'
                                    : 'border-white/10 hover:border-white/30 bg-white/5'
                                }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            />

                            <AnimatePresence mode="wait">
                                {previewUrl ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative"
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg shadow-lg"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                                            <p className="text-white text-sm">Click to change image</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center"
                                    >
                                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                        <p className="text-white font-medium mb-1">Drop CAD image here</p>
                                        <p className="text-gray-500 text-sm">or click to browse</p>
                                        <p className="text-gray-600 text-xs mt-2">Supports: PNG, JPG, SVG, PDF snapshots</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* File Info */}
                        {selectedFile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm truncate">{selectedFile.name}</p>
                                        <p className="text-gray-500 text-xs">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={runValidation}
                                disabled={!selectedFile || isValidating}
                                className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${isValidating
                                    ? 'bg-purple-500/50 text-white/70'
                                    : selectedFile
                                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-90'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {isValidating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Validate Image
                                    </>
                                )}
                            </button>

                            {(selectedFile || validationResult) && (
                                <button
                                    onClick={resetValidation}
                                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-2 transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            {validationResult ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {/* Validation Result Card */}
                                    <div
                                        className={`rounded-2xl border p-6 ${validationResult.status === 'success'
                                            ? 'bg-green-500/10 border-green-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${validationResult.status === 'success'
                                                ? 'bg-green-500/20'
                                                : 'bg-red-500/20'
                                                }`}>
                                                {validationResult.status === 'success' ? (
                                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-red-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-2xl">{validationResult.icon}</span>
                                                    <span className={`text-lg font-bold ${validationResult.status === 'success'
                                                        ? 'text-green-400'
                                                        : 'text-red-400'
                                                        }`}>
                                                        {validationResult.type}
                                                    </span>
                                                </div>
                                                <p className="text-white">{validationResult.message}</p>
                                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${validationResult.action === 'CONTINUE'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                        }`}>
                                                        {validationResult.action}
                                                    </span>
                                                    {validationResult.confidence !== undefined && (
                                                        <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-gray-300">
                                                            Confidence: {validationResult.confidence}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detected CAD Features */}
                                        {validationResult.detectedFeatures && validationResult.detectedFeatures.length > 0 && (
                                            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                                <h4 className="text-xs font-medium text-gray-400 mb-2">Detected CAD Features:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {validationResult.detectedFeatures.map((feature, i) => (
                                                        <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Detected Objects Section */}
                                    {fullAnalysisResult?.objects && fullAnalysisResult.objects.objects_detected.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-white font-semibold flex items-center gap-2">
                                                    <Layers className="w-5 h-5 text-purple-400" />
                                                    Detected Objects
                                                </h3>
                                                <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                                                    {fullAnalysisResult.objects.objects_detected.length} object(s)
                                                </span>
                                            </div>

                                            {/* Primary Object */}
                                            {fullAnalysisResult.objects.primary_object && (
                                                <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg p-4 border border-purple-500/30">
                                                    <span className="text-xs text-purple-300 font-medium">PRIMARY OBJECT</span>
                                                    <p className="text-white text-lg font-bold mt-1">{fullAnalysisResult.objects.primary_object}</p>
                                                    {fullAnalysisResult.objects.overall_description && (
                                                        <p className="text-gray-300 text-sm mt-2">{fullAnalysisResult.objects.overall_description}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Object Cards */}
                                            <div className="space-y-3">
                                                {fullAnalysisResult.objects.objects_detected.map((obj, i) => (
                                                    <div key={i} className="bg-white/5 rounded-lg border border-white/10 p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h4 className="text-white font-semibold">{obj.name}</h4>
                                                                <span className="text-xs text-gray-400">{obj.category}</span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">
                                                                    {obj.material}
                                                                </span>
                                                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                                    {obj.estimated_size}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-gray-500">Shape:</span>
                                                                <span className="text-gray-300 ml-1">{obj.shape}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Surface:</span>
                                                                <span className="text-gray-300 ml-1">{obj.surface_finish}</span>
                                                            </div>
                                                        </div>

                                                        {obj.function && (
                                                            <p className="text-gray-400 text-xs mt-2">
                                                                <span className="text-gray-500">Function:</span> {obj.function}
                                                            </p>
                                                        )}

                                                        {obj.common_applications && obj.common_applications.length > 0 && (
                                                            <div className="mt-2">
                                                                <span className="text-gray-500 text-xs">Applications:</span>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {obj.common_applications.slice(0, 3).map((app, j) => (
                                                                        <span key={j} className="px-2 py-0.5 bg-white/10 text-gray-300 rounded text-xs">
                                                                            {app}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {obj.manufacturing_process && (
                                                            <p className="text-gray-400 text-xs mt-2">
                                                                <span className="text-gray-500">Manufacturing:</span> {obj.manufacturing_process}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Problem Summary Card - Shows when there are issues */}
                                    {fullAnalysisResult?.analysis?.problem_summary && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                            className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20 p-4"
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-white font-semibold flex items-center gap-2">
                                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                                    Problem Summary
                                                </h3>
                                                <div className="flex gap-2">
                                                    {fullAnalysisResult.analysis.problem_summary.critical_count > 0 && (
                                                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                                                            {fullAnalysisResult.analysis.problem_summary.critical_count} Critical
                                                        </span>
                                                    )}
                                                    {fullAnalysisResult.analysis.problem_summary.warning_count > 0 && (
                                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                                                            {fullAnalysisResult.analysis.problem_summary.warning_count} Warnings
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-white/5 rounded-lg p-2">
                                                    <p className="text-2xl font-bold text-red-400">{fullAnalysisResult.analysis.problem_summary.critical_count || 0}</p>
                                                    <p className="text-xs text-gray-500">Critical</p>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-2">
                                                    <p className="text-2xl font-bold text-yellow-400">{fullAnalysisResult.analysis.problem_summary.warning_count || 0}</p>
                                                    <p className="text-xs text-gray-500">Warnings</p>
                                                </div>
                                                <div className="bg-white/5 rounded-lg p-2">
                                                    <p className="text-2xl font-bold text-blue-400">{fullAnalysisResult.analysis.problem_summary.info_count || 0}</p>
                                                    <p className="text-xs text-gray-500">Info</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Critical Issues Section */}
                                    {fullAnalysisResult?.analysis?.critical_issues && fullAnalysisResult.analysis.critical_issues.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="bg-red-500/10 rounded-2xl border border-red-500/30 p-6 space-y-4"
                                        >
                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                <XCircle className="w-5 h-5 text-red-400" />
                                                Critical Issues ({fullAnalysisResult.analysis.critical_issues.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {fullAnalysisResult.analysis.critical_issues.map((issue: any, i: number) => (
                                                    <div key={i} className="bg-white/5 rounded-lg border border-red-500/20 p-4">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium uppercase">
                                                                    {issue.category}
                                                                </span>
                                                                <h4 className="text-white font-medium">{issue.title}</h4>
                                                            </div>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${issue.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                                                issue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {issue.priority} priority
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm mb-2">{issue.description}</p>
                                                        {issue.location && (
                                                            <p className="text-gray-500 text-xs mb-2">
                                                                <span className="text-gray-400">Location:</span> {issue.location}
                                                            </p>
                                                        )}
                                                        <div className="flex items-start gap-2 mt-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                                                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                                            <div>
                                                                <p className="text-xs text-green-400 font-medium">Suggestion:</p>
                                                                <p className="text-sm text-green-200">{issue.suggestion}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Warnings Section */}
                                    {fullAnalysisResult?.analysis?.warnings && fullAnalysisResult.analysis.warnings.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="bg-yellow-500/10 rounded-2xl border border-yellow-500/30 p-6 space-y-4"
                                        >
                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                                Warnings ({fullAnalysisResult.analysis.warnings.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {fullAnalysisResult.analysis.warnings.map((warning: any, i: number) => (
                                                    <div key={i} className="bg-white/5 rounded-lg border border-yellow-500/20 p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium uppercase">
                                                                {warning.category}
                                                            </span>
                                                            <h4 className="text-white font-medium">{warning.title}</h4>
                                                        </div>
                                                        <p className="text-gray-300 text-sm">{warning.description}</p>
                                                        {warning.suggestion && (
                                                            <p className="text-yellow-400 text-xs mt-2">
                                                                <span className="text-gray-500">Fix:</span> {warning.suggestion}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Missing Elements Section */}
                                    {fullAnalysisResult?.analysis?.missing_elements && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="bg-purple-500/10 rounded-2xl border border-purple-500/30 p-6 space-y-4"
                                        >
                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                <FileWarning className="w-5 h-5 text-purple-400" />
                                                Missing Elements
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {fullAnalysisResult.analysis.missing_elements.dimensions?.length > 0 && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Ruler className="w-4 h-4 text-cyan-400" />
                                                            <span className="text-xs text-gray-400">Missing Dimensions</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {fullAnalysisResult.analysis.missing_elements.dimensions.map((dim: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs">{dim}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {fullAnalysisResult.analysis.missing_elements.tolerances?.length > 0 && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Gauge className="w-4 h-4 text-orange-400" />
                                                            <span className="text-xs text-gray-400">Missing Tolerances</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {fullAnalysisResult.analysis.missing_elements.tolerances.map((tol: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded text-xs">{tol}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {fullAnalysisResult.analysis.missing_elements.views?.length > 0 && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Layers className="w-4 h-4 text-green-400" />
                                                            <span className="text-xs text-gray-400">Missing Views</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {fullAnalysisResult.analysis.missing_elements.views.map((view: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">{view}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {fullAnalysisResult.analysis.missing_elements.annotations?.length > 0 && (
                                                    <div className="bg-white/5 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="w-4 h-4 text-pink-400" />
                                                            <span className="text-xs text-gray-400">Missing Annotations</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {fullAnalysisResult.analysis.missing_elements.annotations.map((ann: string, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded text-xs">{ann}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Manufacturing Analysis */}
                                    {fullAnalysisResult?.analysis?.manufacturing_analysis && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35 }}
                                            className="bg-cyan-500/10 rounded-2xl border border-cyan-500/30 p-6 space-y-4"
                                        >
                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                <Wrench className="w-5 h-5 text-cyan-400" />
                                                Manufacturing Analysis
                                            </h3>

                                            {/* Manufacturability Score */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs text-gray-400">Manufacturability Score</span>
                                                        <span className="text-sm text-white font-medium">{fullAnalysisResult.analysis.manufacturing_analysis.manufacturability_score}%</span>
                                                    </div>
                                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${fullAnalysisResult.analysis.manufacturing_analysis.manufacturability_score >= 80 ? 'bg-green-500' :
                                                                fullAnalysisResult.analysis.manufacturing_analysis.manufacturability_score >= 60 ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`}
                                                            style={{ width: `${fullAnalysisResult.analysis.manufacturing_analysis.manufacturability_score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recommended Processes */}
                                            {fullAnalysisResult.analysis.manufacturing_analysis.recommended_processes?.length > 0 && (
                                                <div>
                                                    <span className="text-xs text-gray-400 mb-2 block">Recommended Processes</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {fullAnalysisResult.analysis.manufacturing_analysis.recommended_processes.map((proc: string, i: number) => (
                                                            <span key={i} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-xs">{proc}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Cost Factors */}
                                            {fullAnalysisResult.analysis.manufacturing_analysis.cost_factors?.length > 0 && (
                                                <div>
                                                    <span className="text-xs text-gray-400 mb-2 block">Cost Factors</span>
                                                    <div className="space-y-1">
                                                        {fullAnalysisResult.analysis.manufacturing_analysis.cost_factors.map((factor: string, i: number) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                                                <span className="text-gray-300">{factor}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Risk Areas */}
                                            {fullAnalysisResult.analysis.manufacturing_analysis.risk_areas?.length > 0 && (
                                                <div>
                                                    <span className="text-xs text-gray-400 mb-2 block">Risk Areas</span>
                                                    <div className="space-y-1">
                                                        {fullAnalysisResult.analysis.manufacturing_analysis.risk_areas.map((risk: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-2 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
                                                                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                                <span className="text-red-200">{risk}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Standards Compliance */}
                                    {fullAnalysisResult?.analysis?.standards_compliance && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-white font-semibold flex items-center gap-2">
                                                    <CheckSquare className="w-5 h-5 text-blue-400" />
                                                    Standards Compliance
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${fullAnalysisResult.analysis.standards_compliance.compliance_status === 'compliant'
                                                    ? 'bg-green-500/20 text-green-400' :
                                                    fullAnalysisResult.analysis.standards_compliance.compliance_status === 'partial'
                                                        ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {fullAnalysisResult.analysis.standards_compliance.compliance_status?.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Applicable Standards */}
                                            {fullAnalysisResult.analysis.standards_compliance.applicable_standards?.length > 0 && (
                                                <div>
                                                    <span className="text-xs text-gray-400 mb-2 block">Applicable Standards</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {fullAnalysisResult.analysis.standards_compliance.applicable_standards.map((std: string, i: number) => (
                                                            <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">{std}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Violations */}
                                            {fullAnalysisResult.analysis.standards_compliance.violations?.length > 0 && (
                                                <div>
                                                    <span className="text-xs text-gray-400 mb-2 block">Violations</span>
                                                    <div className="space-y-1">
                                                        {fullAnalysisResult.analysis.standards_compliance.violations.map((violation: string, i: number) => (
                                                            <div key={i} className="flex items-start gap-2 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
                                                                <XSquare className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                                <span className="text-red-200">{violation}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Improvement Suggestions */}
                                    {fullAnalysisResult?.analysis?.suggestions && fullAnalysisResult.analysis.suggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.45 }}
                                            className="bg-green-500/10 rounded-2xl border border-green-500/30 p-6 space-y-4"
                                        >
                                            <h3 className="text-white font-semibold flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                                Improvement Suggestions ({fullAnalysisResult.analysis.suggestions.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {fullAnalysisResult.analysis.suggestions.map((suggestion: any, i: number) => (
                                                    <div key={i} className="bg-white/5 rounded-lg border border-green-500/20 p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="text-white font-medium">{suggestion.title}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${suggestion.priority === 'high' ? 'bg-green-500/20 text-green-400' :
                                                                suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {suggestion.priority} priority
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-300 text-sm">{suggestion.description}</p>
                                                        {suggestion.benefit && (
                                                            <p className="text-green-400 text-xs mt-2">
                                                                <span className="text-gray-500">Benefit:</span> {suggestion.benefit}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Overall Assessment */}
                                    {fullAnalysisResult?.analysis?.overall_assessment && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl border border-purple-500/20 p-6"
                                        >
                                            <h3 className="text-white font-semibold mb-2">Overall Assessment</h3>
                                            <p className="text-gray-300 text-sm">{fullAnalysisResult.analysis.overall_assessment}</p>
                                            {fullAnalysisResult.analysis.confidence_score !== undefined && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className="text-xs text-gray-400">Analysis Confidence:</span>
                                                    <span className="px-2 py-0.5 bg-white/10 text-white rounded text-xs font-medium">
                                                        {Math.round(fullAnalysisResult.analysis.confidence_score * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Action Buttons */}
                                    {validationResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="flex gap-3"
                                        >
                                            {validationResult.status === 'success' && (
                                                <button
                                                    onClick={() => navigate('/solution')}
                                                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
                                                >
                                                    <Lightbulb className="w-5 h-5" />
                                                    View AI Solutions
                                                    <ArrowRight className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDownloadReport}
                                                className="px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-green-500/20"
                                            >
                                                <FileDown className="w-5 h-5" />
                                                Download Report
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white/5 rounded-2xl border border-white/10 p-12 text-center"
                                >
                                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                    <p className="text-gray-400 font-medium">Upload an image to validate</p>
                                    <p className="text-gray-600 text-sm mt-1">
                                        The AI will classify if it's a valid CAD design
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <h4 className="text-xs font-medium text-gray-400 mb-2">Valid CAD Types</h4>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-300">• Engineering drawings</p>
                                    <p className="text-xs text-gray-300">• Blueprints</p>
                                    <p className="text-xs text-gray-300">• Schematics</p>
                                    <p className="text-xs text-gray-300">• 3D model renders</p>
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                                <h4 className="text-xs font-medium text-gray-400 mb-2">Invalid Types</h4>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-300">• Photos/Selfies</p>
                                    <p className="text-xs text-gray-300">• UI screenshots</p>
                                    <p className="text-xs text-gray-300">• Nature images</p>
                                    <p className="text-xs text-gray-300">• Random objects</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageValidator;