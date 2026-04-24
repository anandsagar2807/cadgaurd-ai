import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Validator from './pages/Validator';
import Copilot from './pages/Copilot';
import Solution from './pages/Solution';
import Compare from './pages/Compare';
import CADStudio from './pages/CADStudio';
import CADViewer from './pages/CADViewer';
import CADMeasure from './pages/CADMeasure';
import CADAnnotate from './pages/CADAnnotate';
import CADAnalyze from './pages/CADAnalyze';
import CADExport from './pages/CADExport';
import ImageValidator from './pages/ImageValidator';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/solution" element={<Solution />} />
                    <Route path="/compare" element={<Compare />} />

                    {/* App Routes with Layout */}
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/copilot" element={<Copilot />} />
                        <Route path="/validator" element={<Validator />} />
                        <Route path="/cad-studio" element={<CADStudio />} />
                        
                        {/* Separate CAD Feature Pages */}
                        <Route path="/cad/viewer" element={<CADViewer />} />
                        <Route path="/cad/measure" element={<CADMeasure />} />
                        <Route path="/cad/annotate" element={<CADAnnotate />} />
                        <Route path="/cad/analyze" element={<CADAnalyze />} />
                        <Route path="/cad/export" element={<CADExport />} />
                        <Route path="/image-validator" element={<ImageValidator />} />
                    </Route>

                    {/* Catch all - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
};

export default App;