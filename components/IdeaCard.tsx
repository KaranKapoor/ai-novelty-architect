import React from 'react';
import { Idea } from '../types';

interface IdeaCardProps {
  idea: Idea;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ idea }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.01]">
      {/* Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-100">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-blue-600 uppercase bg-blue-50 rounded-full mb-2">
              {idea.domain}
            </span>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">
              {idea.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative w-full h-64 bg-slate-200 overflow-hidden group">
        {idea.loadingImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-100 animate-pulse">
            <svg className="w-10 h-10 mb-3 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">Sculpting Claymation...</span>
          </div>
        ) : idea.imageUrl ? (
          <img
            src={idea.imageUrl}
            alt={`Claymation representation of ${idea.title}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
            <span className="text-sm">Image generation unavailable</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-6 flex-grow text-slate-700">
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-indigo-500 pl-3">
            The Novelty
          </h4>
          <p className="text-sm leading-relaxed bg-indigo-50/50 p-3 rounded-md">
            {idea.summary.novelty}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-emerald-500 pl-3">
            Description & Implementation
          </h4>
          <p className="text-sm leading-relaxed mb-4">
            {idea.summary.description}
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-100">
             <span className="font-semibold text-slate-900">Best Mode: </span>
             {idea.summary.implementation}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-rose-500 pl-3">
            Prior Art Differentiation
          </h4>
          <p className="text-sm leading-relaxed text-slate-600 italic">
            "{idea.summary.priorArtDifference}"
          </p>
        </div>
      </div>
    </div>
  );
};