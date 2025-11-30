import React from 'react';
import { Collaborator } from '@/features/collaboration/types';

interface CollaboratorCursorsProps {
  collaborators: Collaborator[];
  currentUserId: string;
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({
  collaborators,
  currentUserId,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {collaborators
        .filter(c => c.id !== currentUserId && c.cursor && c.isOnline)
        .map((collaborator) => (
          <div
            key={collaborator.id}
            className="absolute transition-all duration-100 ease-out"
            style={{
              left: collaborator.cursor!.x,
              top: collaborator.cursor!.y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="drop-shadow-md"
            >
              <path
                d="M2 2L18 8L8 12L2 18V2Z"
                fill={collaborator.cursor!.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            
            {/* Name label */}
            <div
              className="absolute top-5 left-2 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: collaborator.cursor!.color }}
            >
              {collaborator.name}
            </div>
          </div>
        ))}
    </div>
  );
};
