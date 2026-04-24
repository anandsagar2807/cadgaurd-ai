import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, X, Box, FileCheck, GitCompare, Sparkles, Image, PenTool, Lightbulb, LayoutDashboard, Settings } from 'lucide-react';

const Layout: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Searchable pages and features
    const searchableItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, description: 'View overview and statistics', category: 'Navigation' },
        { name: 'Image Validator', path: '/image-validator', icon: Image, description: 'Validate CAD images with AI', category: 'Features' },
        { name: 'Validator', path: '/validator', icon: FileCheck, description: 'Validate CAD files', category: 'Features' },
        { name: 'Solution', path: '/solution', icon: Lightbulb, description: 'AI-generated solutions', category: 'Features' },
        { name: 'Compare', path: '/compare', icon: GitCompare, description: 'Compare CAD designs', category: 'Features' },
        { name: 'AI Copilot', path: '/copilot', icon: Sparkles, description: 'AI assistant for CAD', category: 'Features' },
        { name: 'CAD Studio', path: '/cad-studio', icon: PenTool, description: 'Complete CAD workspace', category: 'CAD Tools' },
        { name: 'CAD Viewer', path: '/cad/viewer', icon: Box, description: '3D model visualization', category: 'CAD Tools' },
        { name: 'CAD Measure', path: '/cad/measure', icon: Box, description: 'Precise measurement tools', category: 'CAD Tools' },
        { name: 'CAD Annotate', path: '/cad/annotate', icon: PenTool, description: 'Add annotations to designs', category: 'CAD Tools' },
        { name: 'CAD Analyze', path: '/cad/analyze', icon: Box, description: 'Detailed design analysis', category: 'CAD Tools' },
        { name: 'CAD Export', path: '/cad/export', icon: Box, description: 'Export in multiple formats', category: 'CAD Tools' },
        { name: 'Home', path: '/', icon: LayoutDashboard, description: 'Return to landing page', category: 'Navigation' },
        { name: 'Settings', path: '#', icon: Settings, description: 'Application settings', category: 'System' },
    ];

    // Filter results based on query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setShowResults(false);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = searchableItems.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
            setSearchResults(filtered);
            setShowResults(true);
        }
    }, [searchQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (path: string) => {
        setSearchQuery('');
        setShowResults(false);
        navigate(path);
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col">
                {/* Top Navbar */}
                <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
                    {/* Search */}
                    <div className="relative" ref={searchRef}>
                        <Search className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search pages, features, tools..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery && setShowResults(true)}
                            className="input-glass pl-10 pr-10 w-80 focus:w-96 transition-all duration-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); setShowResults(false); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                                <div className="p-2">
                                    {searchResults.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleResultClick(item.path)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                                <item.icon className="w-4 h-4 text-cyan-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white font-medium text-sm">{item.name}</span>
                                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{item.category}</span>
                                                </div>
                                                <p className="text-xs text-gray-400">{item.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {showResults && searchQuery && searchResults.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 z-50">
                                <p className="text-gray-400 text-sm text-center">No results found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                        </button>

                        {/* User Avatar */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-semibold">
                                U
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Floating AI Assistant Button */}
            <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow pulse-glow z-50">
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            </button>
        </div>
    );
};

export default Layout;