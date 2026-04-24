import React from 'react';
import { useParams } from 'react-router-dom';

export default function ProjectDetail() {
    const { id } = useParams();
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Project {id}</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">Project details and design files will be displayed here.</p>
            </div>
        </div>
    );
}