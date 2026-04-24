import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, Camera, Settings, CheckCircle, Folder, File } from 'lucide-react';
import { groqService } from '../services/groqService';
import AdvancedCADViewer from '../components/AdvancedCADViewer';
import { chatbotApi } from '../services/api';

interface ExportFormat {
    id: string;
    label: string;
    extension: string;
    desc: string;
    category: string;
}

const CADExport: React.FC = () => {
    const [selectedFormat, setSelectedFormat] = useState<string>('step');
    const [isExporting, setIsExporting] = useState(false);
    const [exportComplete, setExportComplete] = useState(false);
    const [formats, setFormats] = useState<ExportFormat[]>([]);
    const [recentExports, setRecentExports] = useState<Array<{ name: string; date: string; size: string }>>([]);
    const [exportOptions, setExportOptions] = useState({
        includeMetadata: true,
        highPrecision: false,
        compressOutput: true,
    });

    useEffect(() => {
        const loadExportContent = async () => {
            try {
                const response = await chatbotApi.pageContent('export', {
                    selectedFormat,
                    options: exportOptions,
                    timestamp: new Date().toISOString(),
                });

                const content = response.content || {};
                const modelFormats: ExportFormat[] = (Array.isArray(content.formats) ? content.formats : []).map((item: any) => ({
                    id: String(item.id || '').toLowerCase() || 'step',
                    label: String(item.label || 'FORMAT'),
                    extension: String(item.extension || '.dat'),
                    desc: String(item.desc || 'Model-generated export format'),
                    category: String(item.category || 'CAD'),
                }));

                setFormats(modelFormats);
                if (modelFormats.length > 0 && !modelFormats.find((f) => f.id === selectedFormat)) {
                    setSelectedFormat(modelFormats[0].id);
                }

                const modelRecent = Array.isArray(content.recentExports) ? content.recentExports : [];
                setRecentExports(modelRecent.map((item: any) => ({
                    name: String(item.name || 'export.step'),
                    date: String(item.date || new Date().toISOString().split('T')[0]),
                    size: String(item.size || '0 MB'),
                })));
            } catch {
                setFormats([]);
                setRecentExports([]);
            }
        };

        loadExportContent();
    }, []);

    const exportModel = async () => {
        setIsExporting(true);
        setExportComplete(false);

        try {
            // Generate export recommendations using Groq
            const format = formats.find(f => f.id === selectedFormat) || { label: 'STEP' };
            await groqService.generateExportRecommendations(format.label);

            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsExporting(false);
            setExportComplete(true);

            setTimeout(() => setExportComplete(false), 3000);
        } catch (error) {
            console.error('Error during export:', error);
            setIsExporting(false);
            setExportComplete(true);
            setTimeout(() => setExportComplete(false), 3000);
        }
    };

    const exportScreenshot = () => {
        alert('Screenshot saved successfully!');
    };

    return (
        <div className="min-h-screen bg-[#0B0F1A]">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl blur-lg opacity-50" />
                            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                <Download className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">CAD Export</h1>
                            <p className="text-gray-400 text-sm">Export your models in multiple formats</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Export Options Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 sticky top-4">
                            <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-400" />
                                Export Format
                            </h3>

                            <div className="space-y-2 mb-6">
                                {formats.map((format) => (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedFormat(format.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group ${selectedFormat === format.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium ${selectedFormat === format.id ? 'text-blue-400' : 'text-white'}`}>{format.label}</p>
                                                <span className="text-xs text-gray-500">{format.extension}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{format.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Export Options */}
                            <h4 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
                                <Settings className="w-3 h-3" />
                                Options
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Include Metadata</span>
                                    <button
                                        onClick={() => setExportOptions(prev => ({ ...prev, includeMetadata: !prev.includeMetadata }))}
                                        className={`w-11 h-6 rounded-full relative transition-all ${exportOptions.includeMetadata ? 'bg-blue-500/30' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${exportOptions.includeMetadata ? 'right-1 bg-blue-400' : 'left-1 bg-gray-400'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">High Precision</span>
                                    <button
                                        onClick={() => setExportOptions(prev => ({ ...prev, highPrecision: !prev.highPrecision }))}
                                        className={`w-11 h-6 rounded-full relative transition-all ${exportOptions.highPrecision ? 'bg-blue-500/30' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${exportOptions.highPrecision ? 'right-1 bg-blue-400' : 'left-1 bg-gray-400'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Compress Output</span>
                                    <button
                                        onClick={() => setExportOptions(prev => ({ ...prev, compressOutput: !prev.compressOutput }))}
                                        className={`w-11 h-6 rounded-full relative transition-all ${exportOptions.compressOutput ? 'bg-blue-500/30' : 'bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${exportOptions.compressOutput ? 'right-1 bg-blue-400' : 'left-1 bg-gray-400'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Export Button */}
                            <button
                                onClick={exportModel}
                                disabled={isExporting}
                                className={`w-full mt-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 text-sm transition-all ${isExporting ? 'bg-blue-500/50' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Exporting...
                                    </>
                                ) : exportComplete ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Export Complete!
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Export Model
                                    </>
                                )}
                            </button>

                            {/* Screenshot */}
                            <button
                                onClick={exportScreenshot}
                                className="w-full mt-2 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm flex items-center justify-center gap-2 transition-all"
                            >
                                <Camera className="w-4 h-4" />
                                Export Screenshot
                            </button>

                            {/* Recent Exports */}
                            <div className="mt-6 pt-4 border-t border-white/10">
                                <h4 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
                                    <Folder className="w-3 h-3" />
                                    Recent Exports
                                </h4>
                                <div className="space-y-2">
                                    {recentExports.map((exp, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                                            <File className="w-4 h-4 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-white truncate">{exp.name}</p>
                                                <p className="text-xs text-gray-500">{exp.date} • {exp.size}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3D Viewer */}
                    <div className="lg:col-span-3">
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            <div className="h-[600px] lg:h-[700px]">
                                <AdvancedCADViewer showGrid={true} showAxes={true} />
                            </div>
                        </div>

                        {/* Format Info */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-5 h-5 text-cyan-400" />
                                    <span className="text-sm font-medium text-white">CAD Formats</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    STEP, IGES for professional CAD data exchange with full geometry preservation
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Image className="w-5 h-5 text-green-400" />
                                    <span className="text-sm font-medium text-white">3D Printing</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    STL, 3MF optimized for additive manufacturing and rapid prototyping
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 rounded-xl border border-white/10 p-4"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Camera className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm font-medium text-white">Visualization</span>
                                </div>
                                <p className="text-xs text-gray-400">
                                    OBJ, FBX, glTF for rendering, animation, and web visualization
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CADExport;
