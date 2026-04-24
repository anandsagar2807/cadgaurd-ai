import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Plus, MessageSquare, AlertTriangle, Info, XCircle, Trash2, Bookmark, Save } from 'lucide-react';
import { groqService } from '../services/groqService';
import AdvancedCADViewer from '../components/AdvancedCADViewer';

interface Annotation {
    id: string;
    text: string;
    type: 'note' | 'warning' | 'info' | 'critical';
    position: [number, number, number];
    createdAt: Date;
    author: string;
}

const CADAnnotate: React.FC = () => {
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newText, setNewText] = useState('');
    const [newType, setNewType] = useState<Annotation['type']>('note');
    const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);

    const annotationTypes = [
        { id: 'note', label: 'Note', icon: MessageSquare, color: 'green' },
        { id: 'info', label: 'Info', icon: Info, color: 'blue' },
        { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'yellow' },
        { id: 'critical', label: 'Critical', icon: XCircle, color: 'red' },
    ];

    const addAnnotation = async () => {
        if (!newText.trim()) return;

        const annotation: Annotation = {
            id: Date.now().toString(),
            text: newText,
            type: newType,
            position: [Math.random() * 40 - 20, Math.random() * 40, Math.random() * 40 - 20],
            createdAt: new Date(),
            author: 'User',
        };

        setAnnotations(prev => [...prev, annotation]);
        setNewText('');
        setNewType('note');
        setShowModal(false);

        // Generate annotation insights using Groq
        try {
            const context = `Design annotation: ${annotation.text}`;
            await groqService.generateDesignSuggestions(context);
        } catch (error) {
            console.error('Error generating annotation insights:', error);
        }
    };

    const deleteAnnotation = (id: string) => {
        setAnnotations(prev => prev.filter(a => a.id !== id));
        if (selectedAnnotation === id) {
            setSelectedAnnotation(null);
        }
    };

    const getAnnotationIcon = (type: Annotation['type']) => {
        switch (type) {
            case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
            case 'info': return <Info className="w-4 h-4 text-blue-400" />;
            default: return <MessageSquare className="w-4 h-4 text-green-400" />;
        }
    };

    const getAnnotationColor = (type: Annotation['type']) => {
        switch (type) {
            case 'critical': return 'border-red-500/50 bg-red-500/10';
            case 'warning': return 'border-yellow-500/50 bg-yellow-500/10';
            case 'info': return 'border-blue-500/50 bg-blue-500/10';
            default: return 'border-green-500/50 bg-green-500/10';
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                                <PenTool className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">CAD Annotate</h1>
                            <p className="text-gray-400 text-sm">Add annotations and collaborate on designs</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-medium flex items-center gap-2 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Annotation
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Annotations Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 sticky top-4">
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <Bookmark className="w-4 h-4 text-purple-400" />
                                Annotations ({annotations.length})
                            </h3>

                            {/* Filter by type */}
                            <div className="flex gap-1 mb-4 flex-wrap">
                                <button className="px-2 py-1 bg-white/10 rounded text-xs text-white">All</button>
                                {annotationTypes.map(type => (
                                    <button key={type.id} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 hover:text-white transition-all">
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Annotations List */}
                            <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                {annotations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p className="text-sm">No annotations yet</p>
                                        <p className="text-xs mt-1">Click "Add Annotation" to create one</p>
                                    </div>
                                ) : (
                                    annotations.map((ann, index) => (
                                        <motion.div
                                            key={ann.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelectedAnnotation(ann.id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all relative group ${getAnnotationColor(ann.type)} ${selectedAnnotation === ann.id ? 'ring-2 ring-purple-500/50' : ''}`}
                                        >
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteAnnotation(ann.id); }}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            <div className="flex items-start gap-2 pr-5">
                                                {getAnnotationIcon(ann.type)}
                                                <div className="flex-1">
                                                    <p className="text-sm text-white line-clamp-2">{ann.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {ann.author} • {ann.createdAt.toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {annotations.length > 0 && (
                                <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2 transition-all">
                                    <Save className="w-4 h-4" />
                                    Export Annotations
                                </button>
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
                        <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <h4 className="text-sm font-medium text-purple-400 mb-2">Annotation Tips</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• Click on the model to place annotation markers</li>
                                <li>• Use different types to categorize feedback</li>
                                <li>• Share annotations with team members for collaboration</li>
                                <li>• Export annotations for documentation</li>
                            </ul>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {annotationTypes.map((type, index) => (
                                <motion.div
                                    key={type.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white/5 rounded-xl border border-white/10 p-4"
                                >
                                    <span className="text-xs text-gray-400">{type.label}</span>
                                    <p className="text-xl font-bold text-white mt-1">
                                        {annotations.filter(a => a.type === type.id).length}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Annotation Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
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
                                New Annotation
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Type</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {annotationTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setNewType(type.id as Annotation['type'])}
                                                className={`py-2 rounded-lg text-xs font-medium transition-all ${newType === type.id ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Comment</label>
                                    <textarea
                                        value={newText}
                                        onChange={(e) => setNewText(e.target.value)}
                                        placeholder="Enter your annotation..."
                                        className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-purple-500/50 transition-all"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addAnnotation}
                                        disabled={!newText.trim()}
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

export default CADAnnotate;
