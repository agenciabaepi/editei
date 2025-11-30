export type PermissionLevel = 'view' | 'comment' | 'edit';
export type AccessLevel = 'private' | 'link' | 'team';
export type DiscoveryLevel = 'visible' | 'link_only';

export interface ShareSettings {
  accessLevel: AccessLevel;
  permissionLevel: PermissionLevel;
  discoveryLevel: DiscoveryLevel;
  allowGuests: boolean;
  expiresAt?: Date;
}

export interface Collaborator {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isGuest: boolean;
  isOnline: boolean;
  cursor?: {
    x: number;
    y: number;
    color: string;
  };
  lastSeen: Date;
  permission: PermissionLevel;
}

export interface ShareLink {
  id: string;
  projectId: string;
  token: string;
  settings: ShareSettings;
  createdBy: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface Comment {
  id: string;
  projectId: string;
  pageId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  position?: {
    x: number;
    y: number;
  };
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface CollaborationState {
  collaborators: Collaborator[];
  shareSettings: ShareSettings;
  shareLink?: ShareLink;
  comments: Comment[];
  isOwner: boolean;
  currentUser: Collaborator;
}

export interface CollaborationActions {
  updateShareSettings: (settings: Partial<ShareSettings>) => void;
  generateShareLink: () => Promise<string>;
  revokeShareLink: () => void;
  inviteCollaborator: (email: string, permission: PermissionLevel) => void;
  removeCollaborator: (collaboratorId: string) => void;
  updateCollaboratorPermission: (collaboratorId: string, permission: PermissionLevel) => void;
  addComment: (content: string, position?: { x: number; y: number }, pageId?: string) => void;
  replyToComment: (commentId: string, content: string) => void;
  resolveComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  updateCursor: (position: { x: number; y: number }) => void;
}

export interface UseCollaborationProps {
  projectId: string;
  userId?: string;
  isGuest?: boolean;
  onCollaboratorJoin?: (collaborator: Collaborator) => void;
  onCollaboratorLeave?: (collaboratorId: string) => void;
  onCanvasUpdate?: (data: any) => void;
}
