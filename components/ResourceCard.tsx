import React from 'react';
import { Resource } from '../types';
import { ExternalLink, BookOpen } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-900/20 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
            {resource.title}
          </h3>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
      </div>
      <p className="text-sm text-slate-400 line-clamp-2 mb-2">{resource.summary}</p>
      <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-cyan-500 h-full" 
          style={{ width: `${resource.relevance * 100}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 mt-1 block">Relevance Match</span>
    </a>
  );
};

export default ResourceCard;