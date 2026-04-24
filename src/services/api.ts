import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const validationApi = {
    validate: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/validation/validate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    getStatus: async (validationId: string) => {
        const response = await api.get(`/validation/${validationId}`);
        return response.data;
    },
};

export const projectsApi = {
    list: async () => {
        const response = await api.get('/projects');
        return response.data;
    },

    get: async (id: string) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },

    create: async (data: { name: string; description?: string }) => {
        const response = await api.post('/projects', data);
        return response.data;
    },
};

export interface ChatMessagePayload {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponsePayload {
    response: string;
    suggestions?: string[];
}

export const chatbotApi = {
    chat: async (messages: ChatMessagePayload[], context: string = 'CAD Design Validation'): Promise<ChatResponsePayload> => {
        const response = await api.post('/chatbot/chat', { messages, context });
        return response.data;
    },

    quickSuggestions: async (): Promise<{ suggestions: Array<{ category: string; prompts: string[] }> }> => {
        const response = await api.get('/chatbot/quick-suggestions');
        return response.data;
    },

    pageContent: async (page: string, context?: Record<string, unknown>): Promise<{ page: string; content: any }> => {
        const response = await api.post('/chatbot/page-content', { page, context: context || {} });
        return response.data;
    },
};

// Image Analysis API Types
export interface ImageAnalysisResponse {
    status: 'success' | 'error' | 'partial_success';
    message?: string;
    design_type?: {
        primary: string;
        secondary: string;
        confidence: number;
    };
    identified_elements?: Array<{
        element: string;
        description: string;
        location: string;
    }>;
    errors_detected?: Array<{
        type: string;
        severity: 'critical' | 'major' | 'minor';
        description: string;
        location: string;
        impact: string;
    }>;
    inconsistencies?: Array<{
        type: string;
        description: string;
        affected_elements: string[];
    }>;
    suggestions?: Array<{
        category: string;
        suggestion: string;
        priority: 'high' | 'medium' | 'low';
        rationale: string;
    }>;
    overall_assessment?: {
        quality_score: number;
        completeness: number;
        compliance: number;
        manufacturability: number;
        summary: string;
    };
    confidence_score?: number;
    validation?: {
        is_cad: boolean;
        detected_type: string;
        confidence: number;
    };
}

// AI Engine API (direct to AI service)
const AI_SERVICE_URL = 'http://localhost:8001';

export const imageAnalysisApi = {
    /**
     * Validate if an image is CAD-related.
     * Returns error response if the image is NOT a CAD design.
     */
    validateImage: async (file: File): Promise<ImageAnalysisResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${AI_SERVICE_URL}/validate-image`, {
            method: 'POST',
            body: formData,
        });

        return response.json();
    },

    /**
     * Analyze a CAD image in detail.
     * First validates if CAD-related, then performs comprehensive analysis.
     * Returns error if image is NOT a CAD design.
     */
    analyzeImage: async (file: File): Promise<ImageAnalysisResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${AI_SERVICE_URL}/analyze-image`, {
            method: 'POST',
            body: formData,
        });

        return response.json();
    },

    /**
     * Analyze a base64 encoded image.
     */
    analyzeImageBase64: async (
        base64Image: string,
        analysisType: string = 'comprehensive'
    ): Promise<ImageAnalysisResponse> => {
        const response = await fetch(`${AI_SERVICE_URL}/analyze-image-base64`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: base64Image,
                analysis_type: analysisType,
            }),
        });

        return response.json();
    },
};
