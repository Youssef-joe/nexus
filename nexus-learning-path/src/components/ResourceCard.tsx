import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Resource } from '@/store/resourceStore';
import { Clock, Eye, BookOpen, Video, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResourceCardProps {
  resource: Resource;
}

export const ResourceCard = ({ resource }: ResourceCardProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="h-4 w-4" />;
      case 'webinar': return <Video className="h-4 w-4" />;
      case 'course': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'webinar': return 'bg-green-100 text-green-800';
      case 'course': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getTypeColor(resource.type)}>
            <div className="flex items-center gap-1">
              {getTypeIcon(resource.type)}
              {resource.type}
            </div>
          </Badge>
          {resource.isFeatured && (
            <Badge variant="secondary">Featured</Badge>
          )}
        </div>
        
        {resource.thumbnailUrl && (
          <div className="w-full h-32 bg-gray-200 rounded-md mb-3 overflow-hidden">
            <img 
              src={resource.thumbnailUrl} 
              alt={resource.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <h3 className="font-semibold text-lg line-clamp-2">{resource.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {resource.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {resource.duration}m
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {resource.viewsCount}
          </div>
          {resource.difficulty && (
            <Badge variant="outline" className="text-xs">
              {resource.difficulty}
            </Badge>
          )}
        </div>
        
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            By {resource.authorId?.firstName} {resource.authorId?.lastName}
          </span>
          <Button asChild size="sm">
            <Link to={`/resources/${resource._id}`}>
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};