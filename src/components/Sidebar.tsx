import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    GitCompare,
    Sparkles,
    Box,
    CheckCircle2,
    Lightbulb,
    PenTool,
    Eye,
    Ruler,
    Activity,
    Download,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
    Home,
    FileCheck,
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [cadMenuOpen, setCadMenuOpen] = useState(true);

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/image-validator', icon: ImageIcon, label: 'Image Validator' },
        { path: '/validator', icon: FileCheck, label: 'Validator' },
        { path: '/solution', icon: Lightbulb, label: 'Solution' },
        { path: '/compare', icon: GitCompare, label: 'Compare' },
        { path: '/copilot', icon: Sparkles, label: 'AI Copilot' },
    ];

    const cadItems = [
        { path: '/cad-studio', icon: PenTool, label: 'CAD Studio' },
        { path: '/cad/viewer', icon: Eye, label: 'CAD Viewer' },
        { path: '/cad/measure', icon: Ruler, label: 'CAD Measure' },
        { path: '/cad/annotate', icon: PenTool, label: 'CAD Annotate' },
        { path: '/cad/analyze', icon: Activity, label: 'CAD Analyze' },
        { path: '/cad/export', icon: Download, label: 'CAD Export' },
    ];

    const isCadActive = location.pathname.startsWith('/cad') || location.pathname === '/cad-studio';

    return (
        <div className="w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-950 border-r border-white/5 flex flex-col fixed left-0 top-0">
            {/* Logo - Clickable Home Link */}
            <NavLink to="/" className="p-5 border-b border-white/5 block hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-50"></div>
                        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                            <Box className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">CADGuard</h1>
                        <p className="text-xs text-gray-500">AI CAD Validation</p>
                    </div>
                </div>
            </NavLink>

            {/* Home Button */}
            <NavLink
                to="/"
                className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 mx-3 mt-3 rounded-xl transition-all duration-200 group ${
                        isActive && location.pathname === '/'
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <Home className={`w-5 h-5 ${isActive && location.pathname === '/' ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                        <span className="font-medium text-sm">Home</span>
                    </>
                )}
            </NavLink>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {/* Regular Nav Items */}
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                                isActive
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-white'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                                <span className="font-medium text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}

                {/* CAD Tools Section */}
                <div className="pt-2">
                    <button
                        onClick={() => setCadMenuOpen(!cadMenuOpen)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                            isCadActive
                                ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Box className={`w-5 h-5 ${isCadActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                            <span className="font-medium text-sm">CAD Tools</span>
                        </div>
                        {cadMenuOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>

                    {/* CAD Sub-menu */}
                    {cadMenuOpen && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            {cadItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                                            isActive
                                                ? 'bg-purple-500/20 border border-purple-500/30 text-white'
                                                : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'group-hover:text-purple-400'}`} />
                                            <span className="font-medium text-xs">{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
                        U
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">User</p>
                        <p className="text-xs text-gray-500">Engineer</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;