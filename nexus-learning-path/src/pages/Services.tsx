import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  Brain, 
  Shield, 
  MessageSquare, 
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    {
      icon: Users,
      title: 'Expert Matching',
      description: 'AI-powered matching system connects you with the perfect L&D professionals based on skills, experience, and project requirements.',
      features: ['Smart Algorithm', 'Skill-based Matching', 'Experience Analysis', 'Budget Compatibility'],
      color: 'bg-blue-500'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations and market analysis to make informed decisions about your L&D projects.',
      features: ['Project Analysis', 'Market Insights', 'Success Predictions', 'Risk Assessment'],
      color: 'bg-purple-500'
    },
    {
      icon: Briefcase,
      title: 'Project Management',
      description: 'Complete project lifecycle management from posting to completion with milestone tracking and secure payments.',
      features: ['Project Creation', 'Milestone Tracking', 'Secure Payments', 'Progress Monitoring'],
      color: 'bg-green-500'
    },
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All professionals are thoroughly vetted with verified credentials, certifications, and proven track records.',
      features: ['Identity Verification', 'Credential Checks', 'Portfolio Review', 'Reference Validation'],
      color: 'bg-orange-500'
    },
    {
      icon: MessageSquare,
      title: 'Secure Communication',
      description: 'Built-in messaging system ensures secure and efficient communication throughout your project.',
      features: ['Real-time Messaging', 'File Sharing', 'Video Calls', 'Project Updates'],
      color: 'bg-indigo-500'
    },
    {
      icon: Star,
      title: 'Quality Assurance',
      description: 'Comprehensive rating and review system ensures high-quality deliverables and professional standards.',
      features: ['Peer Reviews', 'Quality Metrics', 'Performance Tracking', 'Continuous Improvement'],
      color: 'bg-pink-500'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for small organizations getting started',
      features: [
        'Up to 2 active projects',
        'Basic AI matching',
        'Standard support',
        'Basic analytics'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$99/month',
      description: 'Ideal for growing businesses',
      features: [
        'Up to 10 active projects',
        'Advanced AI insights',
        'Priority support',
        'Detailed analytics',
        'Custom branding',
        'Team collaboration'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with complex needs',
      features: [
        'Unlimited projects',
        'Full AI suite',
        'Dedicated support',
        'Advanced analytics',
        'White-label solution',
        'API access',
        'Custom integrations'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            {t('services.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
          <Button 
            size="lg" 
            variant="hero"
            onClick={() => navigate('/signup')}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for L&D Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides end-to-end solutions for all your learning and development needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="card-professional hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing options to suit organizations of all sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`card-professional relative ${
                  plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary mb-2">{plan.price}</div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "hero" : "outline"}
                    onClick={() => navigate('/signup')}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your L&D Strategy?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of organizations and professionals already using L&D Nexus 
            to create impactful learning experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="hero"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};