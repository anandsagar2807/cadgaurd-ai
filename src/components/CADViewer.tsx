import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface CADViewerProps {
    fileUrl?: string;
    fileType?: string;
    highlights?: Array<{
        position: [number, number, number];
        color: string;
        severity: 'error' | 'warning' | 'info';
    }>;
}

export default function CADViewer({ fileUrl, fileType, highlights = [] }: CADViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<{
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        mesh?: THREE.Mesh;
    } | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a2e);

        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(50, 50, 50);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        scene.add(directionalLight);

        // Add grid
        const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x222222);
        scene.add(gridHelper);

        // Add axes
        const axesHelper = new THREE.AxesHelper(20);
        scene.add(axesHelper);

        // Add default cube if no file
        const geometry = new THREE.BoxGeometry(30, 30, 30);
        const material = new THREE.MeshPhongMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.8,
        });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Add wireframe
        const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x60a5fa });
        const wireframeGeometry = new THREE.EdgesGeometry(geometry);
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        cube.add(wireframe);

        sceneRef.current = { scene, camera, renderer, controls, mesh: cube };

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
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
            window.removeEventListener('resize', handleResize);
            if (containerRef.current && renderer.domElement) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // Update highlights when they change
    useEffect(() => {
        if (!sceneRef.current?.mesh) return;

        // Remove existing highlight spheres
        sceneRef.current.scene.children
            .filter((child) => child.name === 'highlight')
            .forEach((child) => sceneRef.current!.scene.remove(child));

        // Add new highlights
        highlights.forEach(({ position, color, severity }) => {
            const geometry = new THREE.SphereGeometry(3, 16, 16);
            const material = new THREE.MeshBasicMaterial({
                color: severity === 'error' ? 0xef4444 : severity === 'warning' ? 0xf59e0b : 0x3b82f6,
                transparent: true,
                opacity: 0.7,
            });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(...position);
            sphere.name = 'highlight';
            sceneRef.current!.scene.add(sphere);
        });
    }, [highlights]);

    return <div ref={containerRef} className="w-full h-full min-h-[400px] rounded-lg" />;
}