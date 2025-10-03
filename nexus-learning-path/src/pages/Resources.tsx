import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ResourceCard } from '@/components/ResourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResourceStore } from '@/store/resourceStore';
import { Search, BookOpen, Video, Users } from 'lucide-react';

export const Resources = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { 
    resources, 
    featuredResources, 
    categories, 
    loading, 
    fetchResources, 
    fetchFeatured, 
    fetchCategories,
    searchResources 
  } = useResourceStore();

  useEffect(() => {
    fetchResources();
    fetchFeatured();
    fetchCategories();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchResources(searchQuery);
    } else {
      fetchResources(activeTab === 'all' ? undefined : activeTab, selectedCategory);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchResources(tab === 'all' ? undefined : tab, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    const actualCategory = category === 'all' ? '' : category;
    setSelectedCategory(actualCategory);
    fetchResources(activeTab === 'all' ? undefined : activeTab, actualCategory);
  };

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Resource Hub</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover articles, webinars, and courses to enhance your L&D expertise
          </p>
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredResources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource Type Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="article" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="webinar" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Webinars
              </TabsTrigger>
              <TabsTrigger value="course" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Courses
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-lg">Loading resources...</div>
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-lg text-muted-foreground">No resources found</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <ResourceCard key={resource._id} resource={resource} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};