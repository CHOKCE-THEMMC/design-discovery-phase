import { BookOpen, Users, Award, Globe, Mail, Phone, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLibraryStats, formatStatCount } from "@/hooks/use-library-stats";

const team = [
  {
    name: "Dr. Sarah Johnson",
    role: "Library Director",
    description: "20+ years in academic library management",
  },
  {
    name: "Prof. Michael Chen",
    role: "Head of Digital Resources",
    description: "Expert in digital learning technologies",
  },
  {
    name: "Dr. Emily Watson",
    role: "Student Success Coordinator",
    description: "Dedicated to enhancing student experience",
  },
  {
    name: "David Miller",
    role: "Technical Lead",
    description: "Building seamless digital experiences",
  },
];

const About = () => {
  const { data: libraryStats } = useLibraryStats();

  const stats = [
    { value: libraryStats ? formatStatCount(libraryStats.totalResources) : "0+", label: "Academic Resources", icon: BookOpen },
    { value: libraryStats ? formatStatCount(libraryStats.activeStudents) : "0+", label: "Active Students", icon: Users },
    { value: libraryStats ? formatStatCount(libraryStats.lecturers) : "0+", label: "Faculty Contributors", icon: Award },
    { value: libraryStats ? formatStatCount(libraryStats.departments) : "0+", label: "Departments Covered", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-library-burgundy py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              About DTI Library
            </h1>
            <p className="text-white/80 max-w-3xl mx-auto text-lg">
              DESTINATION TRAINING INSTITUTE - Empowering academic excellence through accessible, comprehensive, and 
              innovative digital library solutions for students, faculty, and researchers.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="bg-card border-border hover-lift">
                    <CardContent className="p-6 text-center">
                      <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                      <div className="text-2xl md:text-3xl font-display font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-muted-foreground mb-4">
                  DTI Library was founded with a singular vision: to democratize access to 
                  academic resources and empower every student to reach their full potential.
                  We believe that quality educational materials should be accessible to all.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our platform brings together textbooks, lecture notes, past examination papers, 
                  and interactive tutorials in one seamless digital experience. We work closely 
                  with faculty members across all departments to ensure our collection remains 
                  current, relevant, and comprehensive.
                </p>
                <p className="text-muted-foreground">
                  Whether you are preparing for exams, conducting research, or simply expanding 
                  your knowledge, DTI Library is your trusted academic companion.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Comprehensive Collection</h3>
                      <p className="text-sm text-muted-foreground">
                        Curated resources across all academic disciplines
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-library-sage/20 rounded-lg">
                      <Users className="h-5 w-5 text-library-sage" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Community Driven</h3>
                      <p className="text-sm text-muted-foreground">
                        Built by educators, for learners
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-library-gold/20 rounded-lg">
                      <Award className="h-5 w-5 text-library-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Quality Assured</h3>
                      <p className="text-sm text-muted-foreground">
                        Verified and approved by academic staff
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Meet Our Team
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dedicated professionals working to make academic resources accessible to everyone.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <Card key={member.name} className="bg-card border-border hover-lift">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-library-burgundy rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  Get in Touch
                </h2>
                <p className="text-muted-foreground mb-8">
                  Have questions or suggestions? We'd love to hear from you. 
                  Reach out to us through any of the channels below.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-foreground">support@unilibrary.edu</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground">123 University Ave, Campus Building A</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Support Hours</p>
                      <p className="text-foreground">Mon - Fri: 8am - 6pm</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-lg p-8 border border-border">
                <h3 className="text-xl font-display font-semibold text-foreground mb-6">
                  Send us a Message
                </h3>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Email</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Message</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
