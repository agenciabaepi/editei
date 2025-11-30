import React, { useState } from 'react';
import { Copy, Link, Mail, Users, Eye, MessageCircle, Edit, Globe, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AccessLevel, PermissionLevel, DiscoveryLevel, ShareSettings, Collaborator } from '@/features/collaboration/types';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  shareSettings: ShareSettings;
  collaborators: Collaborator[];
  shareLink?: string;
  isOwner: boolean;
  onUpdateSettings: (settings: Partial<ShareSettings>) => void;
  onGenerateLink: () => Promise<string>;
  onRevokeLink: () => void;
  onInviteCollaborator: (email: string, permission: PermissionLevel) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
  onUpdatePermission: (collaboratorId: string, permission: PermissionLevel) => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onOpenChange,
  projectName,
  shareSettings,
  collaborators,
  shareLink,
  isOwner,
  onUpdateSettings,
  onGenerateLink,
  onRevokeLink,
  onInviteCollaborator,
  onRemoveCollaborator,
  onUpdatePermission,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<PermissionLevel>('edit');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleAccessLevelChange = (value: string) => {
    onUpdateSettings({ accessLevel: value as AccessLevel });
  };

  const handlePermissionLevelChange = (value: string) => {
    onUpdateSettings({ permissionLevel: value as PermissionLevel });
  };

  const handleDiscoveryLevelChange = (value: string) => {
    onUpdateSettings({ discoveryLevel: value as DiscoveryLevel });
  };

  const handleGenerateLink = async () => {
    const link = await onGenerateLink();
    if (link) {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteCollaborator(inviteEmail.trim(), invitePermission);
      setInviteEmail('');
    }
  };

  const getPermissionIcon = (permission: PermissionLevel) => {
    switch (permission) {
      case 'view': return <Eye className="w-4 h-4" />;
      case 'comment': return <MessageCircle className="w-4 h-4" />;
      case 'edit': return <Edit className="w-4 h-4" />;
    }
  };

  const getPermissionLabel = (permission: PermissionLevel) => {
    switch (permission) {
      case 'view': return 'Can view';
      case 'comment': return 'Can comment';
      case 'edit': return 'Can edit';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Share &quot;{projectName}&quot;
          </DialogTitle>
          <DialogDescription>
            Collaborate with others by sharing your design
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Access Level Settings */}
          {isOwner && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Access Level</Label>
                <Select
                  value={shareSettings.accessLevel}
                  onValueChange={handleAccessLevelChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      Only you can access
                    </SelectItem>
                    <SelectItem value="link">
                      Anyone with the link
                    </SelectItem>
                    <SelectItem value="team">
                      Team members only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {shareSettings.accessLevel !== 'private' && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Permission Level</Label>
                    <Select
                      value={shareSettings.permissionLevel}
                      onValueChange={handlePermissionLevelChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">Can view</SelectItem>
                        <SelectItem value="comment">Can comment</SelectItem>
                        <SelectItem value="edit">Can edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Discovery</Label>
                    <Select
                      value={shareSettings.discoveryLevel}
                      onValueChange={handleDiscoveryLevelChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select discovery level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visible">Visible in search results</SelectItem>
                        <SelectItem value="link_only">Must have a link to access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Allow guest access</Label>
                      <p className="text-xs text-gray-500">Let people edit without signing in</p>
                    </div>
                    <Switch
                      checked={shareSettings.allowGuests}
                      onCheckedChange={(checked) => onUpdateSettings({ allowGuests: checked })}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Share Link */}
          {shareSettings.accessLevel === 'link' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Share Link</Label>
              {shareLink ? (
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="flex items-center gap-2"
                  >
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              ) : (
                <Button onClick={handleGenerateLink} className="w-full">
                  <Link className="w-4 h-4 mr-2" />
                  Generate Share Link
                </Button>
              )}
              
              {shareLink && isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRevokeLink}
                  className="text-red-600 hover:text-red-700"
                >
                  Revoke Link
                </Button>
              )}
            </div>
          )}

          <Separator />

          {/* Invite People */}
          {isOwner && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Invite People</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={invitePermission}
                  onValueChange={(value) => setInvitePermission(value as PermissionLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">Can view</SelectItem>
                    <SelectItem value="comment">Can comment</SelectItem>
                    <SelectItem value="edit">Can edit</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
                  <Mail className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
            </div>
          )}

          {/* Current Collaborators */}
          {collaborators.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                People with access ({collaborators.length})
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {collaborator.avatar ? (
                          <img
                            src={collaborator.avatar}
                            alt={collaborator.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {collaborator.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{collaborator.name}</p>
                        {collaborator.email && (
                          <p className="text-xs text-gray-500">{collaborator.email}</p>
                        )}
                        {collaborator.isGuest && (
                          <p className="text-xs text-orange-600">Guest user</p>
                        )}
                      </div>
                      {collaborator.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner && collaborator.id !== 'current-user' ? (
                        <>
                          <Select
                            value={collaborator.permission}
                            onValueChange={(value) => 
                              onUpdatePermission(collaborator.id, value as PermissionLevel)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view">Can view</SelectItem>
                              <SelectItem value="comment">Can comment</SelectItem>
                              <SelectItem value="edit">Can edit</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveCollaborator(collaborator.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {getPermissionIcon(collaborator.permission)}
                          {getPermissionLabel(collaborator.permission)}
                          {collaborator.id === 'current-user' && ' (You)'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
