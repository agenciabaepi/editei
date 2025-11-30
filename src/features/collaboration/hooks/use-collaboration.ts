import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  CollaborationState,
  CollaborationActions,
  UseCollaborationProps,
  Collaborator,
  ShareSettings,
  Comment,
  PermissionLevel,
} from '@/features/collaboration/types';

// Mock WebSocket for real-time collaboration
// In production, replace with actual WebSocket connection
class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};
  
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
}

export const useCollaboration = ({
  projectId,
  userId = 'current-user',
  isGuest = false,
  onCollaboratorJoin,
  onCollaboratorLeave,
  onCanvasUpdate,
}: UseCollaborationProps): CollaborationState & CollaborationActions => {
  const wsRef = useRef<MockWebSocket>(new MockWebSocket());
  
  const [state, setState] = useState<CollaborationState>(() => ({
    collaborators: [
      {
        id: userId,
        name: isGuest ? 'Guest User' : 'You',
        email: isGuest ? undefined : 'user@example.com',
        isGuest,
        isOnline: true,
        permission: 'edit',
        lastSeen: new Date(),
      }
    ],
    shareSettings: {
      accessLevel: 'private',
      permissionLevel: 'edit',
      discoveryLevel: 'link_only',
      allowGuests: false,
    },
    comments: [],
    isOwner: !isGuest,
    currentUser: {
      id: userId,
      name: isGuest ? 'Guest User' : 'You',
      email: isGuest ? undefined : 'user@example.com',
      isGuest,
      isOnline: true,
      permission: 'edit',
      lastSeen: new Date(),
    },
  }));

  // Generate animal names for guest users
  const generateGuestName = useCallback(() => {
    const animals = ['Fox', 'Bear', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Panda', 'Koala'];
    const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Gentle', 'Wise', 'Bold', 'Kind'];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${adjective} ${animal}`;
  }, []);

  // Update share settings
  const updateShareSettings = useCallback((newSettings: Partial<ShareSettings>) => {
    setState(prev => ({
      ...prev,
      shareSettings: { ...prev.shareSettings, ...newSettings },
    }));

    // Emit to other collaborators
    wsRef.current.emit('share-settings-updated', {
      projectId,
      settings: newSettings,
      updatedBy: userId,
    });
  }, [projectId, userId]);

  // Generate shareable link
  const generateShareLink = useCallback(async (): Promise<string> => {
    const token = uuidv4();
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/shared/${projectId}?token=${token}`;
    
    // In production, save this to backend
    setState(prev => ({
      ...prev,
      shareLink: {
        id: uuidv4(),
        projectId,
        token,
        settings: prev.shareSettings,
        createdBy: userId,
        createdAt: new Date(),
        isActive: true,
      },
    }));

    return shareUrl;
  }, [projectId, userId]);

  // Revoke share link
  const revokeShareLink = useCallback(() => {
    setState(prev => ({
      ...prev,
      shareLink: undefined,
    }));
  }, []);

  // Invite collaborator
  const inviteCollaborator = useCallback((email: string, permission: PermissionLevel) => {
    const newCollaborator: Collaborator = {
      id: uuidv4(),
      name: email.split('@')[0],
      email,
      isGuest: false,
      isOnline: false,
      permission,
      lastSeen: new Date(),
    };

    setState(prev => ({
      ...prev,
      collaborators: [...prev.collaborators, newCollaborator],
    }));

    // In production, send email invitation
    console.log(`Invitation sent to ${email} with ${permission} permission`);
  }, []);

  // Remove collaborator
  const removeCollaborator = useCallback((collaboratorId: string) => {
    setState(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(c => c.id !== collaboratorId),
    }));

    wsRef.current.emit('collaborator-removed', {
      projectId,
      collaboratorId,
      removedBy: userId,
    });
  }, [projectId, userId]);

  // Update collaborator permission
  const updateCollaboratorPermission = useCallback((collaboratorId: string, permission: PermissionLevel) => {
    setState(prev => ({
      ...prev,
      collaborators: prev.collaborators.map(c =>
        c.id === collaboratorId ? { ...c, permission } : c
      ),
    }));

    wsRef.current.emit('permission-updated', {
      projectId,
      collaboratorId,
      permission,
      updatedBy: userId,
    });
  }, [projectId, userId]);

  // Add comment
  const addComment = useCallback((content: string, position?: { x: number; y: number }, pageId?: string) => {
    const newComment: Comment = {
      id: uuidv4(),
      projectId,
      pageId,
      authorId: userId,
      authorName: state.currentUser.name,
      authorAvatar: state.currentUser.avatar,
      content,
      position,
      isResolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
    };

    setState(prev => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));

    wsRef.current.emit('comment-added', {
      projectId,
      comment: newComment,
    });
  }, [projectId, userId, state.currentUser]);

  // Reply to comment
  const replyToComment = useCallback((commentId: string, content: string) => {
    const reply = {
      id: uuidv4(),
      authorId: userId,
      authorName: state.currentUser.name,
      authorAvatar: state.currentUser.avatar,
      content,
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      comments: prev.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ),
    }));

    wsRef.current.emit('comment-reply-added', {
      projectId,
      commentId,
      reply,
    });
  }, [projectId, userId, state.currentUser]);

  // Resolve comment
  const resolveComment = useCallback((commentId: string) => {
    setState(prev => ({
      ...prev,
      comments: prev.comments.map(comment =>
        comment.id === commentId
          ? { ...comment, isResolved: true }
          : comment
      ),
    }));

    wsRef.current.emit('comment-resolved', {
      projectId,
      commentId,
      resolvedBy: userId,
    });
  }, [projectId, userId]);

  // Delete comment
  const deleteComment = useCallback((commentId: string) => {
    setState(prev => ({
      ...prev,
      comments: prev.comments.filter(c => c.id !== commentId),
    }));

    wsRef.current.emit('comment-deleted', {
      projectId,
      commentId,
      deletedBy: userId,
    });
  }, [projectId, userId]);

  // Update cursor position
  const updateCursor = useCallback((position: { x: number; y: number }) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    setState(prev => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        cursor: { ...position, color },
      },
    }));

    wsRef.current.emit('cursor-updated', {
      projectId,
      userId,
      cursor: { ...position, color },
    });
  }, [projectId, userId]);

  // Handle WebSocket events
  useEffect(() => {
    const ws = wsRef.current;

    const handleCollaboratorJoined = (data: { collaborator: Collaborator }) => {
      setState(prev => ({
        ...prev,
        collaborators: [...prev.collaborators, data.collaborator],
      }));
      onCollaboratorJoin?.(data.collaborator);
    };

    const handleCollaboratorLeft = (data: { collaboratorId: string }) => {
      setState(prev => ({
        ...prev,
        collaborators: prev.collaborators.filter(c => c.id !== data.collaboratorId),
      }));
      onCollaboratorLeave?.(data.collaboratorId);
    };

    const handleCursorUpdated = (data: { userId: string; cursor: { x: number; y: number; color: string } }) => {
      if (data.userId !== userId) {
        setState(prev => ({
          ...prev,
          collaborators: prev.collaborators.map(c =>
            c.id === data.userId ? { ...c, cursor: data.cursor } : c
          ),
        }));
      }
    };

    const handleCanvasUpdated = (data: any) => {
      onCanvasUpdate?.(data);
    };

    ws.on('collaborator-joined', handleCollaboratorJoined);
    ws.on('collaborator-left', handleCollaboratorLeft);
    ws.on('cursor-updated', handleCursorUpdated);
    ws.on('canvas-updated', handleCanvasUpdated);

    return () => {
      ws.off('collaborator-joined', handleCollaboratorJoined);
      ws.off('collaborator-left', handleCollaboratorLeft);
      ws.off('cursor-updated', handleCursorUpdated);
      ws.off('canvas-updated', handleCanvasUpdated);
    };
  }, [userId, onCollaboratorJoin, onCollaboratorLeave, onCanvasUpdate]);

  // Simulate joining as guest user from share link
  useEffect(() => {
    if (isGuest) {
      const guestName = generateGuestName();
      setState(prev => ({
        ...prev,
        currentUser: {
          ...prev.currentUser,
          name: guestName,
        },
        collaborators: prev.collaborators.map(c =>
          c.id === userId ? { ...c, name: guestName } : c
        ),
      }));
    }
  }, [isGuest, userId, generateGuestName]);

  return {
    ...state,
    updateShareSettings,
    generateShareLink,
    revokeShareLink,
    inviteCollaborator,
    removeCollaborator,
    updateCollaboratorPermission,
    addComment,
    replyToComment,
    resolveComment,
    deleteComment,
    updateCursor,
  };
};
