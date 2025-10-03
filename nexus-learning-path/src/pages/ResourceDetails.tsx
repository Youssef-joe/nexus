import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useResourceStore, Resource } from '@/store/resourceStore';
import { ArrowLeft, Clock, Eye, Calendar, ExternalLink, Play } from 'lucide-react';

export const ResourceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const { fetchResourceById, loading } = useResourceStore();

  useEffect(() => {
    if (id) {
      fetchResourceById(id).then(setResource);
    }
  }, [id, fetchResourceById]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Resource not found</div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'webinar': return 'bg-green-100 text-green-800';
      case 'course': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/resources">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge className={getTypeColor(resource.type)}>
                  {resource.type}
                </Badge>
                {resource.isFeatured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
                {resource.difficulty && (
                  <Badge variant="outline">{resource.difficulty}</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {resource.viewsCount} views
                </div>
                {resource.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {resource.duration} minutes
                  </div>
                )}
                {resource.scheduledDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(resource.scheduledDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {resource.videoUrl && (
              <div className="mb-8">
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <Button asChild>
                    <a href={resource.videoUrl} target="_blank" rel="noopener noreferrer">
                      <Play className="h-6 w-6 mr-2" />
                      Watch Video
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <div className="prose max-w-none">
              <p className="text-lg text-muted-foreground mb-6">{resource.description}</p>
              {resource.content && (
                <div dangerouslySetInnerHTML={{ __html: resource.content }} />
              )}
            </div>

            {resource.externalUrl && (
              <div className="mt-8">
                <Button asChild>
                  <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View External Resource
                  </a>
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Resource Details</h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Author:</span>
                    <p className="text-sm text-muted-foreground">
                      {resource.authorId?.firstName} {resource.authorId?.lastName}
                    </p>
                  </div>
                  
                  {resource.categories.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Categories:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resource.categories.map((category) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {resource.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium">Published:</span>
                    <p className="text-sm text-muted-foreground">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
};