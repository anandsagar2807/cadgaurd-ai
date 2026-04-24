import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
    Ruler,
    Maximize2,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Move,
    Layers,
    Box,
    Circle,
    Triangle,
    Grid3X3,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Crosshair,
    Move3d,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
    Scissors,
    Lightbulb,
    LightbulbOff,
    Camera,
    RefreshCw,
    Expand,
    Shrink,
    Target,
    Compass
} from 'lucide-react';

interface Measurement {
    id: string;
    type: 'distance' | 'angle' | 'radius' | 'area';
    startPoint: THREE.Vector3;
    endPoint?: THREE.Vector3;
    value: number;
    unit: string;
    label: string;
    color: string;
}

interface Annotation {
    id: string;
    position: [number, number, number];
    text: string;
    type: 'note' | 'warning' | 'info' | 'critical';
    createdAt: Date;
}

interface Layer {
    id: string;
    name: string;
    visible: boolean;
    locked: boolean;
    color: string;
    objects: THREE.Object3D[];
}

interface SectionPlane {
    id: string;
    axis: 'x' | 'y' | 'z';
    position: number;
    visible: boolean;
}

interface AdvancedCADViewerProps {
    fileUrl?: string;
    fileType?: string;
    highlights?: Array<{
        position: [number, number, number];
        color: string;
        severity: 'error' | 'warning' | 'info';
    }>;
    showGrid?: boolean;
    showAxes?: boolean;
    backgroundColor?: string;
}

export default function AdvancedCADViewer({
    fileUrl,
    fileType,
    highlights = [],
    showGrid: initialShowGrid = true,
    showAxes: initialShowAxes = true,
    backgroundColor = '#0B0F1A'
}: AdvancedCADViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        mainGroup?: THREE.Group;
        gridHelper?: THREE.GridHelper;
        axesHelper?: THREE.AxesHelper;
        measurementGroup: THREE.Group;
        annotationGroup: THREE.Group;
        sectionPlane?: THREE.Plane;
        sectionHelper?: THREE.PlaneHelper;
        explodedGroup?: THREE.Group;
    } | null>(null);

    // State for advanced features
    const [activeTool, setActiveTool] = useState<string>('select');
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [layers, setLayers] = useState<Layer[]>([
        { id: '1', name: 'Body', visible: true, locked: false, color: '#3b82f6', objects: [] },
        { id: '2', name: 'Motor', visible: true, locked: false, color: '#f97316', objects: [] },
        { id: '3', name: 'Supports', visible: true, locked: false, color: '#64748b', objects: [] },
        { id: '4', name: 'Valve', visible: true, locked: false, color: '#ef4444', objects: [] },
    ]);
    const [sectionPlanes, setSectionPlanes] = useState<SectionPlane[]>([
        { id: '1', axis: 'x', position: 0, visible: false },
        { id: '2', axis: 'y', position: 0, visible: false },
        { id: '3', axis: 'z', position: 0, visible: false },
    ]);
    const [showGrid, setShowGrid] = useState(initialShowGrid);
    const [showAxes, setShowAxes] = useState(initialShowAxes);
    const [wireframe, setWireframe] = useState(false);
    const [exploded, setExploded] = useState(false);
    const [explodeDistance, setExplodeDistance] = useState(10);
    const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
    const [cameraPosition, setCameraPosition] = useState<'front' | 'back' | 'left' | 'right' | 'top' | 'bottom' | 'iso'>('iso');
    const [ambientIntensity, setAmbientIntensity] = useState(0.4);
    const [selectionInfo, setSelectionInfo] = useState<{
        position: [number, number, number];
        normal: [number, number, number];
        objectName: string;
    } | null>(null);

    // Initialize scene
    useEffect(() => {
        if (!containerRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(backgroundColor);

        const camera = new THREE.PerspectiveCamera(
            60,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(50, 50, 50);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = true;

        // Groups for measurements and annotations
        const measurementGroup = new THREE.Group();
        measurementGroup.name = 'measurements';
        scene.add(measurementGroup);

        const annotationGroup = new THREE.Group();
        annotationGroup.name = 'annotations';
        scene.add(annotationGroup);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
        ambientLight.name = 'ambientLight';
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight1.position.set(50, 50, 50);
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 2048;
        directionalLight1.shadow.mapSize.height = 2048;
        directionalLight1.name = 'directionalLight1';
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0x8888ff, 0.3);
        directionalLight2.position.set(-50, 30, -50);
        directionalLight2.name = 'directionalLight2';
        scene.add(directionalLight2);

        // Grid
        const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
        gridHelper.visible = showGrid;
        scene.add(gridHelper);

        // Axes
        const axesHelper = new THREE.AxesHelper(20);
        axesHelper.visible = showAxes;
        scene.add(axesHelper);

        // Create main assembly group
        const mainGroup = new THREE.Group();
        mainGroup.name = 'mainAssembly';

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
        baseMesh.receiveShadow = true;
        baseMesh.userData = { layer: '1', name: 'Base Platform' };
        mainGroup.add(baseMesh);

        // Base detail strips
        const stripGeometry = new THREE.BoxGeometry(43, 1, 33);
        const stripMaterial = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            shininess: 100,
        });
        const stripMesh = new THREE.Mesh(stripGeometry, stripMaterial);
        stripMesh.position.y = 6.5;
        stripMesh.userData = { layer: '1', name: 'Base Strip' };
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
        motorMesh.userData = { layer: '2', name: 'Motor Housing' };
        mainGroup.add(motorMesh);

        // Motor cap
        const motorCapGeometry = new THREE.CylinderGeometry(7, 9, 4, 32);
        const motorCapMaterial = new THREE.MeshPhongMaterial({
            color: 0xc2410c,
            shininess: 120,
        });
        const motorCapMesh = new THREE.Mesh(motorCapGeometry, motorCapMaterial);
        motorCapMesh.position.set(-10, 27, 0);
        motorCapMesh.userData = { layer: '2', name: 'Motor Cap' };
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
        bodyMesh.userData = { layer: '1', name: 'Main Body' };
        mainGroup.add(bodyMesh);

        // Cylinder on top
        const cylinderGeometry = new THREE.CylinderGeometry(8, 8, 15, 32);
        const cylinderMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b5cf6,
            shininess: 100,
        });
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinderMesh.position.set(8, 35, 0);
        cylinderMesh.userData = { layer: '1', name: 'Top Cylinder' };
        mainGroup.add(cylinderMesh);

        // Support columns
        const columnGeometry = new THREE.CylinderGeometry(2, 2, 20, 16);
        const columnMaterial = new THREE.MeshPhongMaterial({
            color: 0x475569,
            shininess: 80,
        });
        const columnPositions = [[18, 16, 10], [18, 16, -10], [-2, 16, 10], [-2, 16, -10]];
        columnPositions.forEach((pos, i) => {
            const column = new THREE.Mesh(columnGeometry, columnMaterial);
            column.position.set(pos[0], pos[1], pos[2]);
            column.userData = { layer: '3', name: `Support Column ${i + 1}` };
            mainGroup.add(column);
        });

        // Top plate
        const topGeometry = new THREE.BoxGeometry(24, 2, 26);
        const topMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e40af,
            shininess: 100,
        });
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);
        topMesh.position.set(8, 26, 0);
        topMesh.userData = { layer: '1', name: 'Top Plate' };
        mainGroup.add(topMesh);

        // Valve
        const valveGeometry = new THREE.CylinderGeometry(4, 4, 8, 16);
        const valveMaterial = new THREE.MeshPhongMaterial({
            color: 0xef4444,
            shininess: 100,
        });
        const valveMesh = new THREE.Mesh(valveGeometry, valveMaterial);
        valveMesh.position.set(18, 32, 0);
        valveMesh.userData = { layer: '4', name: 'Valve' };
        mainGroup.add(valveMesh);

        // Valve handle
        const handleGeometry = new THREE.TorusGeometry(3, 0.5, 8, 16, Math.PI);
        const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x94a3b8 });
        const handleMesh = new THREE.Mesh(handleGeometry, handleMaterial);
        handleMesh.position.set(18, 36, 0);
        handleMesh.rotation.x = Math.PI / 2;
        handleMesh.userData = { layer: '4', name: 'Valve Handle' };
        mainGroup.add(handleMesh);

        scene.add(mainGroup);

        sceneRef.current = {
            scene,
            camera,
            renderer,
            controls,
            mainGroup,
            gridHelper,
            axesHelper,
            measurementGroup,
            annotationGroup
        };

        // Raycaster for picking
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleClick = (event: MouseEvent) => {
            if (!containerRef.current || !sceneRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, sceneRef.current.camera);
            const intersects = raycaster.intersectObjects(sceneRef.current.mainGroup?.children || [], true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                setSelectionInfo({
                    position: [hit.point.x, hit.point.y, hit.point.z],
                    normal: hit.face ? [hit.face.normal.x, hit.face.normal.y, hit.face.normal.z] : [0, 1, 0],
                    objectName: (hit.object.userData?.name as string) || hit.object.type
                });

                // Handle measurement tool
                if (activeTool === 'measure-distance' || activeTool === 'measure-radius') {
                    handleMeasurementClick(hit.point);
                }
            }
        };

        const handleMouseMove = (event: MouseEvent) => {
            if (!containerRef.current || !sceneRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, sceneRef.current.camera);
            const intersects = raycaster.intersectObjects(sceneRef.current.mainGroup?.children || [], true);

            // Change cursor based on tool
            if (activeTool !== 'select') {
                containerRef.current.style.cursor = intersects.length > 0 ? 'crosshair' : 'default';
            } else {
                containerRef.current.style.cursor = 'grab';
            }
        };

        renderer.domElement.addEventListener('click', handleClick);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        let animationId: number;
        const animate = () => {
            animationId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
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
            renderer.domElement.removeEventListener('click', handleClick);
            renderer.domElement.removeEventListener('mousemove', handleMouseMove);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, [backgroundColor]);

    // Handle measurement clicks
    const handleMeasurementClick = useCallback((point: THREE.Vector3) => {
        const newPoints = [...measurePoints, point.clone()];
        setMeasurePoints(newPoints);

        if (newPoints.length === 2) {
            const distance = newPoints[0].distanceTo(newPoints[1]);
            const measurement: Measurement = {
                id: Date.now().toString(),
                type: 'distance',
                startPoint: newPoints[0],
                endPoint: newPoints[1],
                value: distance,
                unit: 'mm',
                label: `Distance ${measurements.length + 1}`,
                color: '#22c55e'
            };
            setMeasurements(prev => [...prev, measurement]);
            drawMeasurement(measurement);
            setMeasurePoints([]);
        }
    }, [measurePoints, measurements]);

    // Draw measurement in 3D scene
    const drawMeasurement = (measurement: Measurement) => {
        if (!sceneRef.current) return;

        const { measurementGroup, scene } = sceneRef.current;

        // Create line
        const points = [measurement.startPoint, measurement.endPoint!];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x22c55e,
            linewidth: 2
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData.measurementId = measurement.id;
        measurementGroup.add(line);

        // Create endpoints spheres
        const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e });

        const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere1.position.copy(measurement.startPoint);
        measurementGroup.add(sphere1);

        const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
        sphere2.position.copy(measurement.endPoint!);
        measurementGroup.add(sphere2);

        // Create label sprite
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const context = canvas.getContext('2d')!;
        context.fillStyle = '#0B0F1A';
        context.fillRect(0, 0, 128, 64);
        context.strokeStyle = '#22c55e';
        context.lineWidth = 2;
        context.strokeRect(2, 2, 124, 60);
        context.fillStyle = '#22c55e';
        context.font = 'bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(`${measurement.value.toFixed(2)} mm`, 64, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(15, 7.5, 1);
        sprite.position.copy(
            measurement.startPoint.clone().add(measurement.endPoint!).multiplyScalar(0.5)
        );
        sprite.position.y += 5;
        measurementGroup.add(sprite);
    };

    // Update grid visibility
    useEffect(() => {
        if (sceneRef.current?.gridHelper) {
            sceneRef.current.gridHelper.visible = showGrid;
        }
    }, [showGrid]);

    // Update axes visibility
    useEffect(() => {
        if (sceneRef.current?.axesHelper) {
            sceneRef.current.axesHelper.visible = showAxes;
        }
    }, [showAxes]);

    // Update wireframe mode
    useEffect(() => {
        if (!sceneRef.current?.mainGroup) return;

        sceneRef.current.mainGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const material = child.material as THREE.MeshPhongMaterial;
                material.wireframe = wireframe;
            }
        });
    }, [wireframe]);

    // Handle exploded view
    useEffect(() => {
        if (!sceneRef.current?.mainGroup) return;

        const mainGroup = sceneRef.current.mainGroup;
        const originalPositions = new Map<THREE.Object3D, THREE.Vector3>();

        mainGroup.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (!exploded) {
                    // Reset to original positions
                    const original = child.userData.originalPosition;
                    if (original) {
                        child.position.copy(original);
                    }
                } else {
                    // Store original position
                    child.userData.originalPosition = child.position.clone();

                    // Explode outward based on layer
                    const layer = child.userData.layer || '1';
                    const distance = explodeDistance * (parseInt(layer) || 1);
                    const direction = child.position.clone().normalize();
                    child.position.add(direction.multiplyScalar(distance));
                }
            }
        });
    }, [exploded, explodeDistance]);

    // Camera presets
    const setCameraView = (view: typeof cameraPosition) => {
        if (!sceneRef.current) return;

        const { camera, controls } = sceneRef.current;
        const distance = 100;

        switch (view) {
            case 'front':
                camera.position.set(0, 20, distance);
                break;
            case 'back':
                camera.position.set(0, 20, -distance);
                break;
            case 'left':
                camera.position.set(-distance, 20, 0);
                break;
            case 'right':
                camera.position.set(distance, 20, 0);
                break;
            case 'top':
                camera.position.set(0, distance, 0);
                break;
            case 'bottom':
                camera.position.set(0, -distance, 0);
                break;
            case 'iso':
                camera.position.set(50, 50, 50);
                break;
        }

        controls.target.set(0, 15, 0);
        controls.update();
        setCameraPosition(view);
    };

    // Toggle layer visibility
    const toggleLayerVisibility = (layerId: string) => {
        if (!sceneRef.current?.mainGroup) return;

        const newLayers = layers.map(l =>
            l.id === layerId ? { ...l, visible: !l.visible } : l
        );
        setLayers(newLayers);

        sceneRef.current.mainGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.userData.layer === layerId) {
                child.visible = !layers.find(l => l.id === layerId)?.visible;
            }
        });
    };

    // Clear all measurements
    const clearMeasurements = () => {
        if (!sceneRef.current) return;

        const { measurementGroup } = sceneRef.current;
        while (measurementGroup.children.length > 0) {
            measurementGroup.remove(measurementGroup.children[0]);
        }
        setMeasurements([]);
        setMeasurePoints([]);
    };

    // Take screenshot
    const takeScreenshot = () => {
        if (!sceneRef.current) return;

        const { renderer } = sceneRef.current;
        const link = document.createElement('a');
        link.download = `cad-screenshot-${Date.now()}.png`;
        link.href = renderer.domElement.toDataURL('image/png');
        link.click();
    };

    // Reset view
    const resetView = () => {
        setCameraView('iso');
        setExploded(false);
        setWireframe(false);
        setShowGrid(true);
        setShowAxes(true);
        clearMeasurements();
    };

    // Zoom in/out
    const zoomIn = () => {
        if (!sceneRef.current) return;
        const { camera, controls } = sceneRef.current;
        const direction = camera.position.clone().sub(controls.target).normalize();
        camera.position.sub(direction.multiplyScalar(10));
        controls.update();
    };

    const zoomOut = () => {
        if (!sceneRef.current) return;
        const { camera, controls } = sceneRef.current;
        const direction = camera.position.clone().sub(controls.target).normalize();
        camera.position.add(direction.multiplyScalar(10));
        controls.update();
    };

    // Fit to view
    const fitToView = () => {
        if (!sceneRef.current) return;
        const { camera, controls, mainGroup } = sceneRef.current;

        const box = new THREE.Box3().setFromObject(mainGroup!);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const distance = maxDim / (2 * Math.tan(fov / 2)) * 1.5;

        camera.position.set(center.x + distance, center.y + distance * 0.5, center.z + distance);
        controls.target.copy(center);
        controls.update();
    };

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden">
            {/* Main 3D Viewer */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Left Toolbar */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 bg-[#0B0F1A]/90 backdrop-blur-sm rounded-xl border border-white/10 p-2">
                <div className="text-xs text-gray-500 text-center mb-1 font-medium">Tools</div>

                {/* Selection & Measurement Tools */}
                <button
                    onClick={() => setActiveTool('select')}
                    className={`p-2 rounded-lg transition-all ${activeTool === 'select' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Select"
                >
                    <Crosshair className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setActiveTool('measure-distance')}
                    className={`p-2 rounded-lg transition-all ${activeTool === 'measure-distance' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Measure Distance"
                >
                    <Ruler className="w-4 h-4" />
                </button>

                <div className="h-px bg-white/10 my-1" />

                {/* View Controls */}
                <button
                    onClick={zoomIn}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>

                <button
                    onClick={zoomOut}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>

                <button
                    onClick={fitToView}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Fit to View"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>

                <div className="h-px bg-white/10 my-1" />

                {/* Display Options */}
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-2 rounded-lg transition-all ${showGrid ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Toggle Grid"
                >
                    <Grid3X3 className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setShowAxes(!showAxes)}
                    className={`p-2 rounded-lg transition-all ${showAxes ? 'bg-purple-500/20 text-purple-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Toggle Axes"
                >
                    <Compass className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setWireframe(!wireframe)}
                    className={`p-2 rounded-lg transition-all ${wireframe ? 'bg-orange-500/20 text-orange-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Wireframe Mode"
                >
                    <Box className="w-4 h-4" />
                </button>

                <div className="h-px bg-white/10 my-1" />

                {/* Exploded View */}
                <button
                    onClick={() => setExploded(!exploded)}
                    className={`p-2 rounded-lg transition-all ${exploded ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    title="Exploded View"
                >
                    <Expand className="w-4 h-4" />
                </button>

                {exploded && (
                    <div className="px-2 py-1">
                        <input
                            type="range"
                            min="5"
                            max="30"
                            value={explodeDistance}
                            onChange={(e) => setExplodeDistance(parseInt(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                )}

                <div className="h-px bg-white/10 my-1" />

                {/* Actions */}
                <button
                    onClick={takeScreenshot}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Take Screenshot"
                >
                    <Camera className="w-4 h-4" />
                </button>

                <button
                    onClick={resetView}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    title="Reset View"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Top Camera Presets */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1 bg-[#0B0F1A]/90 backdrop-blur-sm rounded-xl border border-white/10 p-2">
                {[
                    { id: 'iso', label: 'ISO', icon: Move3d },
                    { id: 'front', label: 'Front', icon: Circle },
                    { id: 'back', label: 'Back', icon: Circle },
                    { id: 'left', label: 'Left', icon: Triangle },
                    { id: 'right', label: 'Right', icon: Triangle },
                    { id: 'top', label: 'Top', icon: Eye },
                ].map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setCameraView(view.id as typeof cameraPosition)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${cameraPosition === view.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        {view.label}
                    </button>
                ))}
            </div>

            {/* Right Panel - Layers & Measurements */}
            <div className="absolute right-3 top-3 bottom-3 w-64 bg-[#0B0F1A]/90 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden flex flex-col">
                {/* Layers Tab */}
                <div className="p-3 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            Layers
                        </h3>
                    </div>
                    <div className="space-y-1">
                        {layers.map((layer) => (
                            <div
                                key={layer.id}
                                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <button
                                    onClick={() => toggleLayerVisibility(layer.id)}
                                    className={`p-1 rounded ${layer.visible ? 'text-white' : 'text-gray-500'}`}
                                >
                                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{ backgroundColor: layer.color }}
                                />
                                <span className="text-sm text-gray-300 flex-1">{layer.name}</span>
                                <button className="p-1 rounded text-gray-500 hover:text-white">
                                    {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Measurements Tab */}
                <div className="flex-1 overflow-auto p-3">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-green-400" />
                            Measurements
                        </h3>
                        {measurements.length > 0 && (
                            <button
                                onClick={clearMeasurements}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {measurements.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            <Ruler className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p>Click on the model to measure</p>
                            <p className="text-xs mt-1">Select measurement tool first</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {measurements.map((m) => (
                                <div
                                    key={m.id}
                                    className="p-2 rounded-lg bg-green-500/10 border border-green-500/20"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{m.label}</span>
                                        <span className="text-sm font-medium text-green-400">
                                            {m.value.toFixed(2)} {m.unit}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {measurePoints.length === 1 && activeTool === 'measure-distance' && (
                        <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-xs text-yellow-400">Click second point to complete measurement</p>
                        </div>
                    )}
                </div>

                {/* Selection Info */}
                {selectionInfo && (
                    <div className="p-3 border-t border-white/10">
                        <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-400" />
                            Selection Info
                        </h3>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Object</span>
                                <span className="text-gray-300">{selectionInfo.objectName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Position</span>
                                <span className="text-gray-300">
                                    [{selectionInfo.position.map(v => v.toFixed(1)).join(', ')}]
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Normal</span>
                                <span className="text-gray-300">
                                    [{selectionInfo.normal.map(v => v.toFixed(2)).join(', ')}]
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-3 left-3 right-72 flex items-center justify-between bg-[#0B0F1A]/90 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Tool: <span className="text-cyan-400">{activeTool.replace('-', ' ')}</span></span>
                    <span>•</span>
                    <span>Measurements: <span className="text-green-400">{measurements.length}</span></span>
                    <span>•</span>
                    <span>Mode: <span className="text-purple-400">{wireframe ? 'Wireframe' : 'Solid'}</span></span>
                </div>
                <div className="text-xs text-gray-500">
                    Tip: Click on model with measurement tool selected to measure distances
                </div>
            </div>
        </div>
    );
}
