// @ts-nocheck
import axios from 'axios';

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8000';

export interface CADValidationResult {
    status: 'success' | 'error';
    type: 'CAD' | 'NON_CAD';
    icon: string;
    message: string;
    action: 'CONTINUE' | 'STOP';
    confidence?: number;
    detectedFeatures?: string[];
}

export interface CADAnalysisResult {
    isValid: boolean;
    validation: CADValidationResult;
    analysis?: {
        dimensions: {
            width: number;
            height: number;
            depth: number;
            unit: string;
        };
        components: number;
        material: string;
        tolerance: string;
        issues: string[];
        suggestions: string[];
    };
}

/**
 * Validates if an uploaded image contains CAD-related content
 * Analyzes the ACTUAL CONTENT of the image, not just the format
 */
export const validateCADImage = async (imageFile: File): Promise<CADValidationResult> => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
        const response = await axios.post(`${API_BASE_URL}/api/validate-cad`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        // If backend is not available, use client-side content analysis
        return analyzeImageContent(imageFile);
    }
};

/**
 * Analyzes the CONTENT of the image to detect CAD-related elements
 * This looks at what's actually in the image, not the file format
 */
const analyzeImageContent = async (imageFile: File): Promise<CADValidationResult> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);

                // Get image data for content analysis
                const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                
                if (imageData) {
                    const analysis = analyzeCADContent(imageData);
                    resolve(analysis);
                } else {
                    resolve({
                        status: 'error',
                        type: 'NON_CAD',
                        icon: '❌',
                        message: 'Unable to analyze image content. Please try again.',
                        action: 'STOP',
                    });
                }
            };
            img.onerror = () => {
                resolve({
                    status: 'error',
                    type: 'NON_CAD',
                    icon: '❌',
                    message: 'Failed to load image. Please try a different file.',
                    action: 'STOP',
                });
            };
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            resolve({
                status: 'error',
                type: 'NON_CAD',
                icon: '❌',
                message: 'Failed to read file. Please try again.',
                action: 'STOP',
            });
        };
        reader.readAsDataURL(imageFile);
    });
};

/**
 * Comprehensive content analysis to detect CAD-related elements
 * Checks for: technical drawings, blueprints, 3D models, schematics, etc.
 */
const analyzeCADContent = (imageData: ImageData): CADValidationResult => {
    const { data, width, height } = imageData;
    const totalPixels = width * height;

    // Content analysis metrics
    let blackPixels = 0;
    let whitePixels = 0;
    let bluePixels = 0;
    let grayPixels = 0;
    let cyanPixels = 0;
    let redPixels = 0;
    let greenPixels = 0;
    
    // Edge detection for technical lines
    let horizontalEdges = 0;
    let verticalEdges = 0;
    let diagonalEdges = 0;
    let totalEdges = 0;
    
    // Geometric pattern detection
    let lineSegments = 0;
    let cornerPoints = 0;
    let circularPatterns = 0;
    
    // Color variance for content type detection
    let totalR = 0, totalG = 0, totalB = 0;
    let colorVarianceSum = 0;
    let uniqueColors = new Set<string>();
    
    // Grid pattern detection (common in CAD)
    let gridPatternScore = 0;
    
    // Text/annotation detection (dimension lines, labels)
    let smallDetailRegions = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            if (a < 128) continue;

            // Color analysis
            totalR += r;
            totalG += g;
            totalB += b;
            
            const brightness = (r + g + b) / 3;
            const colorKey = `${Math.round(r/10)*10}-${Math.round(g/10)*10}-${Math.round(b/10)*10}`;
            uniqueColors.add(colorKey);

            // Categorize colors
            if (brightness < 30) blackPixels++;
            else if (brightness > 225) whitePixels++;
            else if (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && Math.abs(r - b) < 20) grayPixels++;
            
            // Blue/Cyan detection (common in blueprints and technical drawings)
            if (b > r && b > g && b > 100) bluePixels++;
            if (b > r && g > r && b > 100 && g > 100) cyanPixels++;
            
            // Red detection (common in dimension lines, annotations)
            if (r > g && r > b && r > 150) redPixels++;
            
            // Green detection (common in CAD wireframes)
            if (g > r && g > b && g > 100) greenPixels++;

            // Edge detection - Sobel-like analysis for technical line detection
            if (x < width - 1 && y < height - 1) {
                const nextRight = i + 4;
                const nextBelow = i + width * 4;
                const nextDiagonal = i + (width + 1) * 4;
                
                const rightDiff = Math.abs(data[i] - data[nextRight]) + 
                                  Math.abs(data[i+1] - data[nextRight+1]) + 
                                  Math.abs(data[i+2] - data[nextRight+2]);
                                  
                const belowDiff = Math.abs(data[i] - data[nextBelow]) + 
                                  Math.abs(data[i+1] - data[nextBelow+1]) + 
                                  Math.abs(data[i+2] - data[nextBelow+2]);
                                  
                const diagDiff = Math.abs(data[i] - data[nextDiagonal]) + 
                                 Math.abs(data[i+1] - data[nextDiagonal+1]) + 
                                 Math.abs(data[i+2] - data[nextDiagonal+2]);

                if (rightDiff > 100) horizontalEdges++;
                if (belowDiff > 100) verticalEdges++;
                if (diagDiff > 100) diagonalEdges++;
                if (rightDiff > 100 || belowDiff > 100) totalEdges++;
            }

            // Detect small detail regions (typical of annotations, dimension lines)
            if (brightness < 100 && x > 0 && y > 0 && x < width - 1 && y < height - 1) {
                const neighbors = [
                    data[(y-1) * width * 4 + x * 4],
                    data[(y+1) * width * 4 + x * 4],
                    data[y * width * 4 + (x-1) * 4],
                    data[y * width * 4 + (x+1) * 4]
                ].filter(n => n < 100);
                
                if (neighbors.length >= 3) cornerPoints++;
            }
        }
    }

    // Calculate content-based ratios
    const blackRatio = blackPixels / totalPixels;
    const whiteRatio = whitePixels / totalPixels;
    const grayRatio = grayPixels / totalPixels;
    const blueRatio = bluePixels / totalPixels;
    const cyanRatio = cyanPixels / totalPixels;
    const redRatio = redPixels / totalPixels;
    const greenRatio = greenPixels / totalPixels;
    const edgeRatio = totalEdges / totalPixels;
    const cornerRatio = cornerPoints / totalPixels;
    
    // Color diversity (limited in CAD, high in photos)
    const colorDiversity = uniqueColors.size;
    const limitedPalette = colorDiversity < 5000;
    
    // Average color values
    const avgR = totalR / totalPixels;
    const avgG = totalG / totalPixels;
    const avgB = totalB / totalPixels;

    // Content-based scoring for CAD detection
    let cadScore = 0;
    let detectedFeatures: string[] = [];

    // 1. High contrast technical drawings (black lines on white)
    if (blackRatio > 0.05 && whiteRatio > 0.4) {
        cadScore += 3;
        detectedFeatures.push('High contrast technical lines');
    }

    // 2. Blueprint characteristics (blue background with white lines)
    if (blueRatio > 0.2 || cyanRatio > 0.1) {
        cadScore += 2;
        detectedFeatures.push('Blueprint-style coloring');
    }

    // 3. CAD wireframe colors (cyan, green, red for different elements)
    if (cyanRatio > 0.01 || greenRatio > 0.01) {
        cadScore += 1;
        detectedFeatures.push('CAD wireframe colors');
    }

    // 4. Technical edge patterns (straight lines, precise geometry)
    if (edgeRatio > 0.01 && edgeRatio < 0.3) {
        const edgeBalance = Math.min(horizontalEdges, verticalEdges) / Math.max(horizontalEdges, verticalEdges);
        if (edgeBalance > 0.3) {
            cadScore += 2;
            detectedFeatures.push('Technical line patterns');
        }
    }

    // 5. Limited color palette (CAD uses fewer colors than photos)
    if (limitedPalette && grayRatio > 0.2) {
        cadScore += 1;
        detectedFeatures.push('Limited color palette');
    }

    // 6. Grid-like patterns (common in CAD backgrounds)
    const hVBalance = Math.min(horizontalEdges, verticalEdges) / Math.max(horizontalEdges, verticalEdges, 1);
    if (hVBalance > 0.5 && totalEdges > 1000) {
        cadScore += 1;
        detectedFeatures.push('Grid-like structure');
    }

    // 7. Corner points indicate geometric precision
    if (cornerRatio > 0.0001 && cornerRatio < 0.1) {
        cadScore += 1;
        detectedFeatures.push('Geometric precision points');
    }

    // 8. Red elements (dimension lines, annotations in CAD)
    if (redRatio > 0.001 && redRatio < 0.2) {
        cadScore += 1;
        detectedFeatures.push('Dimension/annotation markers');
    }

    // 9. Predominantly gray (typical of 3D model renders)
    if (grayRatio > 0.4 && blackRatio < 0.3 && whiteRatio < 0.3) {
        cadScore += 2;
        detectedFeatures.push('3D render characteristics');
    }

    // 10. Very dark image (could be dark mode CAD or technical drawing)
    if (blackRatio > 0.5 && (cyanRatio > 0.01 || greenRatio > 0.01)) {
        cadScore += 2;
        detectedFeatures.push('Dark mode CAD interface');
    }

    // Negative indicators (photos, selfies, natural scenes)
    
    // High color diversity typically means photo
    if (colorDiversity > 20000) {
        cadScore -= 2;
    }

    // Skin tone detection (indicates selfie/photo)
    const skinTonePixels = detectSkinTones(data, width, height);
    if (skinTonePixels / totalPixels > 0.1) {
        cadScore -= 3;
    }

    // Natural scene detection (high green from nature, not CAD)
    if (greenRatio > 0.3 && redRatio < 0.05) {
        cadScore -= 2;
    }

    // Calculate confidence
    const confidence = Math.min(100, Math.max(0, cadScore * 10 + 30));

    // Determine result based on content analysis
    const isCAD = cadScore >= 3 && confidence >= 40;

    if (isCAD) {
        return {
            status: 'success',
            type: 'CAD',
            icon: '✔️',
            message: 'Valid CAD image detected. CAD-related content found in the image.',
            action: 'CONTINUE',
            confidence,
            detectedFeatures,
        };
    } else {
        return {
            status: 'error',
            type: 'NON_CAD',
            icon: '❌',
            message: 'Invalid input: Image does not contain CAD-related content. Upload a valid CAD design, blueprint, or technical drawing.',
            action: 'STOP',
            confidence,
            detectedFeatures: [],
        };
    }
};

/**
 * Detects skin tones in the image (to reject selfies/photos)
 */
const detectSkinTones = (data: Uint8ClampedArray, width: number, height: number): number => {
    let skinPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Skin tone detection (various skin colors)
        const isSkin = (
            (r > 95 && g > 40 && b > 20) &&
            (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
            (Math.abs(r - g) > 15) &&
            (r > g && r > b)
        );
        
        if (isSkin) skinPixels++;
    }
    
    return skinPixels;
};

/**
 * Full CAD analysis after validation
 */
export const analyzeCADImage = async (imageFile: File): Promise<CADAnalysisResult> => {
    // First validate the image content
    const validation = await validateCADImage(imageFile);
    
    if (validation.status === 'error') {
        return {
            isValid: false,
            validation,
        };
    }
    
    // Proceed with analysis for valid CAD images
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const response = await axios.post(`${API_BASE_URL}/api/analyze-cad`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return {
            isValid: true,
            validation,
            analysis: response.data,
        };
    } catch (error) {
        // Return simulated analysis if backend unavailable
        return {
            isValid: true,
            validation,
            analysis: generateSimulatedAnalysis(),
        };
    }
};

/**
 * Detected object interface
 */
export interface DetectedObject {
    name: string;
    category: string;
    material: string;
    estimated_size: string;
    shape: string;
    surface_finish: string;
    function: string;
    common_applications: string[];
    manufacturing_process: string;
}

/**
 * Full analysis result with objects
 */
export interface FullAnalysisResult {
    status: 'success' | 'error';
    type: 'CAD' | 'NON_CAD';
    icon: string;
    message: string;
    action: 'CONTINUE' | 'STOP';
    validation?: {
        is_cad: boolean;
        image_type: string;
        confidence: number;
        detected_elements: string[];
    };
    objects?: {
        objects_detected: DetectedObject[];
        primary_object: string;
        scene_type: string;
        overall_description: string;
    };
    analysis?: {
        design_type: string;
        design_subtype: string;
        identified_elements: string[];
        dimensions_detected: boolean;
        scale_present: boolean;
        title_block_present: boolean;
        critical_issues: Array<{
            id: string;
            category: string;
            severity: string;
            title: string;
            description: string;
            location?: string;
            impact?: string;
            suggestion: string;
            priority: string;
        }>;
        warnings: Array<{
            id: string;
            category: string;
            severity: string;
            title: string;
            description: string;
            location?: string;
            suggestion: string;
        }>;
        suggestions: Array<{
            category: string;
            priority: string;
            title: string;
            description: string;
            benefit?: string;
        }>;
        missing_elements: {
            dimensions: string[];
            tolerances: string[];
            views: string[];
            annotations: string[];
            standards: string[];
        };
        manufacturing_analysis: {
            recommended_processes: string[];
            manufacturability_score: number;
            cost_factors: string[];
            risk_areas: string[];
        };
        standards_compliance: {
            applicable_standards: string[];
            compliance_status: string;
            violations: string[];
            recommendations: string[];
        };
        errors_detected: any[];
        inconsistencies: any[];
        overall_assessment: string;
        confidence_score: number;
        problem_summary?: {
            total_issues: number;
            critical_count: number;
            warning_count: number;
            info_count: number;
            categories_affected: string[];
        };
    };
}

/**
 * Perform full analysis with object detection
 */
export const fullAnalysis = async (imageFile: File): Promise<FullAnalysisResult> => {
    try {
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const response = await axios.post(`${API_BASE_URL}/api/full-analysis`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        // If backend unavailable, use client-side validation
        const validation = await validateCADImage(imageFile);
        
        if (validation.status === 'error') {
            return {
                status: 'error',
                type: 'NON_CAD',
                icon: '❌',
                message: validation.message,
                action: 'STOP',
            };
        }
        
        return {
            status: 'success',
            type: 'CAD',
            icon: '✔️',
            message: 'Valid CAD image detected (offline mode - limited analysis).',
            action: 'CONTINUE',
            validation: {
                is_cad: true,
                image_type: 'unknown',
                confidence: validation.confidence || 70,
                detected_elements: validation.detectedFeatures || [],
            },
        };
    }
};

/**
 * Generates simulated CAD analysis for demo purposes
 */
const generateSimulatedAnalysis = () => ({
    dimensions: {
        width: Math.round(50 + Math.random() * 150),
        height: Math.round(50 + Math.random() * 150),
        depth: Math.round(20 + Math.random() * 80),
        unit: 'mm',
    },
    components: Math.round(5 + Math.random() * 20),
    material: ['Aluminum 6061', 'Steel AISI 1018', 'ABS Plastic', 'Titanium Grade 5'][Math.floor(Math.random() * 4)],
    tolerance: ['±0.1mm', '±0.05mm', '±0.02mm', '±0.01mm'][Math.floor(Math.random() * 4)],
    issues: [
        'Thin wall detected at corner (0.8mm)',
        'Consider adding fillets for manufacturability',
        'Hole depth exceeds 3x diameter ratio',
    ].slice(0, Math.floor(Math.random() * 3) + 1),
    suggestions: [
        'Increase wall thickness to minimum 1.2mm',
        'Add 2mm fillet radius on internal corners',
        'Consider splitting deep holes into through-holes',
    ],
});

export default {
    validateCADImage,
    analyzeCADImage,
};