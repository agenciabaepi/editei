"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Editor } from "@/features/editor/components/editor";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SharedProjectPageProps {}

const SharedProjectContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const projectId = params.id as string;
  const token = searchParams.get('token');
  
  const [guestName, setGuestName] = useState<string>('');
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string>('');

  // For shared links, we need to bypass auth and fetch project directly
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectError, setProjectError] = useState<any>(null);

  // Generate guest name
  useEffect(() => {
    const animals = ['Fox', 'Bear', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Panda', 'Koala'];
    const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Gentle', 'Wise', 'Bold', 'Kind'];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    setGuestName(`${adjective} ${animal}`);
  }, []);

  // Validate share token and fetch project
  useEffect(() => {
    const validateAndFetchProject = async () => {
      if (!token) {
        setError('No access token provided');
        setIsValidating(false);
        setIsLoading(false);
        return;
      }

      try {
        // For demo purposes, accept any valid UUID format token
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(token)) {
          setError('Invalid share link format');
          setIsValidating(false);
          setIsLoading(false);
          return;
        }

        setHasAccess(true);
        setIsValidating(false);

        // Fetch project data directly without auth
        const response = await fetch(`/api/projects/${projectId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setProjectError({ message: 'Project not found' });
          } else if (response.status === 401) {
            // For shared links, we need to create a public endpoint or use a different approach
            // Let's try to fetch from a public shared endpoint instead
            try {
              const publicResponse = await fetch(`/api/shared/${projectId}?token=${token}`);
              if (publicResponse.ok) {
                const publicData = await publicResponse.json();
                setProject(publicData.data);
              } else {
                // Fallback to basic project structure
                setProject({
                  id: projectId,
                  name: 'Shared Design',
                  json: '{"version":"5.3.0","objects":[]}',
                  width: 900,
                  height: 1200,
                  isShared: true
                });
              }
            } catch {
              // Fallback to basic project structure
              setProject({
                id: projectId,
                name: 'Shared Design',
                json: '{"version":"5.3.0","objects":[]}',
                width: 900,
                height: 1200,
                isShared: true
              });
            }
          } else {
            setProjectError({ message: 'Failed to load project' });
          }
        } else {
          const data = await response.json();
          setProject(data.data);
        }
      } catch (err) {
        setProjectError({ message: 'Failed to load project' });
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetchProject();
  }, [token, projectId]);

  if (isValidating || isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-gray-600">
            {isValidating ? 'Validating access...' : 'Loading project...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || projectError || !hasAccess) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h1 className="text-xl font-semibold">Access Denied</h1>
          <p className="text-gray-600">
            {error || projectError?.message || 'This shared link is invalid or has expired.'}
          </p>
          <div className="text-xs text-gray-400 mt-2">
            Debug: hasAccess={hasAccess.toString()}, error=&quot;{error}&quot;, projectError=&quot;{projectError?.message}&quot;
          </div>
          <Button onClick={() => router.push('/')} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12 text-gray-500" />
          <h1 className="text-xl font-semibold">Project Not Found</h1>
          <p className="text-gray-600">The requested project could not be found.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  // Add guest user info to project data
  const projectWithGuestInfo = {
    ...project,
    isGuest: true,
    guestName,
    shareToken: token,
    // Disable auto-save for guest users to prevent update errors
    disableAutoSave: true,
  };

  return (
    <div className="h-screen">
      {/* Guest banner */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-orange-800">
              You&apos;re viewing as <strong>{guestName}</strong> (Guest)
            </span>
          </div>
          <div className="text-xs text-orange-600">
            Sign in to access more features and save your changes
          </div>
        </div>
      </div>
      
      <div className="h-[calc(100%-48px)]">
        <Editor initialData={projectWithGuestInfo} />
      </div>
    </div>
  );
};

export default function SharedProjectPage({}: SharedProjectPageProps) {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-gray-600">Loading shared project...</p>
        </div>
      </div>
    }>
      <SharedProjectContent />
    </Suspense>
  );
}
