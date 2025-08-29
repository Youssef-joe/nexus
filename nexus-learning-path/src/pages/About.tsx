import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Zap, Globe, Target, Heart } from 'lucide-react';

export const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in every L&D connection we facilitate.'
    },
    {
      icon: Shield,
      title: 'Trust',
      description: 'Building trust through verified professionals and secure transactions.'
    },
    {
      icon: Heart,
      title: 'Impact',
      description: 'Empowering organizations to achieve their learning goals.'
    },
    {
      icon: Globe,
      title: 'Global',
      description: 'Connecting L&D talent across borders and time zones.'
    }
  ];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <Badge variant="secondary" className="mb-6">
            About L&D Nexus
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">
              Transforming Learning Through Connection
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            L&D Nexus is the premier marketplace connecting organizations with expert Learning & Development professionals. 
            We believe that great learning experiences come from great people, and we're here to make those connections happen.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <Card className="card-professional">
            <CardContent className="pt-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-center leading-relaxed">
                To democratize access to world-class Learning & Development expertise by creating 
                a trusted marketplace where organizations can find the right professionals for their 
                unique learning challenges.
              </p>
            </CardContent>
          </Card>

          <Card className="card-professional">
            <CardContent className="pt-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">Our Vision</h2>
              <p className="text-muted-foreground text-center leading-relaxed">
                A world where every organization has access to exceptional learning experiences, 
                and every L&D professional can build a thriving consultancy business doing what they love.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at L&D Nexus
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="card-professional text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-primary flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-hero rounded-3xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-primary-dark/90" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-8">L&D Nexus by the Numbers</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-white/80">Verified Professionals</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">5,000+</div>
                <div className="text-white/80">Organizations Served</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-white/80">Projects Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-white/80">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};