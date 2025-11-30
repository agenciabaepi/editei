import React, { useState } from 'react';
import { MessageCircle, Send, MoreHorizontal, Check, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Comment, PermissionLevel } from '@/features/collaboration/types';
import { safeFormatDistanceToNow } from '@/lib/date-utils';

interface CommentSystemProps {
  comments: Comment[];
  currentUserId: string;
  userPermission: PermissionLevel;
  isGuest: boolean;
  onAddComment: (content: string, position?: { x: number; y: number }, pageId?: string) => void;
  onReplyToComment: (commentId: string, content: string) => void;
  onResolveComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId: string;
  userPermission: PermissionLevel;
  isGuest: boolean;
  onReply: (commentId: string, content: string) => void;
  onResolve: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  userPermission,
  isGuest,
  onReply,
  onResolve,
  onDelete,
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setShowReply(false);
    }
  };

  const canComment = userPermission !== 'view' && !isGuest;
  const canManage = comment.authorId === currentUserId || userPermission === 'edit';

  return (
    <div className={`p-3 rounded-lg border ${comment.isResolved ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {comment.authorAvatar ? (
              <img
                src={comment.authorAvatar}
                alt={comment.authorName}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <span className="text-xs font-medium">
                {comment.authorName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{comment.authorName}</span>
              <span className="text-xs text-gray-500">
                {safeFormatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
              {comment.isResolved && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Resolved
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
            
            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="space-y-2 mt-3 pl-4 border-l-2 border-gray-200">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      {reply.authorAvatar ? (
                        <img
                          src={reply.authorAvatar}
                          alt={reply.authorName}
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {reply.authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{reply.authorName}</span>
                        <span className="text-xs text-gray-500">
                          {safeFormatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply input */}
            {showReply && canComment && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
                    <Send className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowReply(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!comment.isResolved && (
              <div className="flex items-center gap-2 mt-2">
                {canComment && !showReply && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowReply(true)}
                    className="text-xs"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!comment.isResolved && (
                <DropdownMenuItem onClick={() => onResolve(comment.id)}>
                  <Check className="w-3 h-3 mr-2" />
                  Resolve
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(comment.id)}
                className="text-red-600"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export const CommentSystem: React.FC<CommentSystemProps> = ({
  comments,
  currentUserId,
  userPermission,
  isGuest,
  onAddComment,
  onReplyToComment,
  onResolveComment,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
      setShowCommentInput(false);
    }
  };

  const canComment = userPermission !== 'view' && !isGuest;
  const activeComments = comments.filter(c => !c.isResolved);
  const resolvedComments = comments.filter(c => c.isResolved);

  return (
    <div className="w-80 h-full bg-white border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <h3 className="font-semibold">Comments</h3>
          </div>
          <span className="text-sm text-gray-500">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Comments list */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Add comment button */}
          {canComment && !showCommentInput && (
            <Button
              variant="outline"
              onClick={() => setShowCommentInput(true)}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Add Comment
            </Button>
          )}

          {/* New comment input */}
          {showCommentInput && canComment && (
            <div className="space-y-3 p-3 border rounded-lg">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  Comment
                </Button>
                <Button variant="outline" onClick={() => setShowCommentInput(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Active comments */}
          {activeComments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Active Comments</h4>
              {activeComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  userPermission={userPermission}
                  isGuest={isGuest}
                  onReply={onReplyToComment}
                  onResolve={onResolveComment}
                  onDelete={onDeleteComment}
                />
              ))}
            </div>
          )}

          {/* Resolved comments */}
          {resolvedComments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Resolved ({resolvedComments.length})
              </h4>
              {resolvedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  userPermission={userPermission}
                  isGuest={isGuest}
                  onReply={onReplyToComment}
                  onResolve={onResolveComment}
                  onDelete={onDeleteComment}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {comments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No comments yet</p>
              {!canComment && (
                <p className="text-xs mt-1">Sign in to add comments</p>
              )}
            </div>
          )}

          {/* Guest restrictions notice */}
          {isGuest && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Guest user:</strong> Sign in to add comments and access more features.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
