import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  Clock, 
  BookOpen, 
  FileText, 
  FolderOpen,
  ChevronRight,
  Award,
  Stethoscope
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  type: string;
  duration: string;
  description: string | null;
  is_active: boolean;
}

interface MaterialCount {
  program: string;
  year_level: number | null;
  count: number;
}

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [materialCounts, setMaterialCounts] = useState<MaterialCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diploma');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (programsError) throw programsError;

      // Fetch material counts by program and year
      const { data: materials, error: materialsError } = await supabase
        .from('materials')
        .select('department, year_level')
        .eq('status', 'approved');

      if (materialsError) throw materialsError;

      // Count materials per program and year
      const counts: Record<string, MaterialCount[]> = {};
      materials?.forEach(m => {
        const key = `${m.department}-${m.year_level || 'null'}`;
        if (!counts[m.department]) {
          counts[m.department] = [];
        }
        const existing = counts[m.department].find(c => c.year_level === m.year_level);
        if (existing) {
          existing.count++;
        } else {
          counts[m.department].push({
            program: m.department,
            year_level: m.year_level,
            count: 1
          });
        }
      });

      const flatCounts = Object.values(counts).flat();

      setPrograms(programsData || []);
      setMaterialCounts(flatCounts);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaterialCount = (programName: string, yearLevel?: number) => {
    if (yearLevel !== undefined) {
      return materialCounts.find(c => c.program === programName && c.year_level === yearLevel)?.count || 0;
    }
    return materialCounts
      .filter(c => c.program === programName)
      .reduce((acc, c) => acc + c.count, 0);
  };

  const getYearLevels = (programType: string) => {
    if (programType === 'diploma') {
      return [1, 2, 3];
    }
    return [1]; // Certificate programs typically don't have year levels
  };

  const diplomaPrograms = programs.filter(p => p.type === 'diploma');
  const certificatePrograms = programs.filter(p => p.type === 'certificate');

  const ProgramCard = ({ program }: { program: Program }) => {
    const totalMaterials = getMaterialCount(program.name);
    const yearLevels = getYearLevels(program.type);

    return (
      <Card className="bg-card border-border hover:shadow-lg transition-all duration-300 group">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {program.type === 'diploma' ? (
                  <GraduationCap className="h-6 w-6" />
                ) : (
                  <Award className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg font-display">{program.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-3.5 w-3.5" />
                  {program.duration}
                </CardDescription>
              </div>
            </div>
            <Badge variant={program.type === 'diploma' ? 'default' : 'secondary'}>
              {program.type === 'diploma' ? 'Diploma' : 'Certificate'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {program.description && (
            <p className="text-sm text-muted-foreground">{program.description}</p>
          )}

          {/* Year-level folders for diploma programs */}
          {program.type === 'diploma' && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Year Levels
              </h4>
              <div className="grid gap-2">
                {yearLevels.map(year => {
                  const yearCount = getMaterialCount(program.name, year);
                  return (
                    <Link
                      key={year}
                      to={`/browse?program=${encodeURIComponent(program.name)}&year=${year}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group/year"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Year {year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {yearCount} materials
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover/year:text-primary transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                {totalMaterials} materials
              </span>
            </div>
            <Button asChild size="sm" variant="ghost" className="group/btn">
              <Link to={`/browse?program=${encodeURIComponent(program.name)}`}>
                Browse All
                <ChevronRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Stethoscope className="h-4 w-4" />
                <span className="text-sm font-medium">Academic Programs</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Explore Our Programs
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse materials organized by program and year level. Find exactly what you need for your studies at Destination Training Institute.
              </p>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="diploma" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Diploma Courses
                    <Badge variant="secondary" className="ml-1">
                      {diplomaPrograms.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="certificate" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certificate Courses
                    <Badge variant="secondary" className="ml-1">
                      {certificatePrograms.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="diploma" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Full-Time Diploma Courses
                  </h2>
                  <p className="text-muted-foreground">
                    Comprehensive programs ranging from 2 to 3 years
                  </p>
                </div>
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="space-y-3">
                          <div className="h-6 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="h-12 bg-muted rounded" />
                            <div className="h-12 bg-muted rounded" />
                            <div className="h-12 bg-muted rounded" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diplomaPrograms.map(program => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="certificate" className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                    Certificate Courses
                  </h2>
                  <p className="text-muted-foreground">
                    Short-term professional development programs
                  </p>
                </div>
                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="space-y-3">
                          <div className="h-6 bg-muted rounded w-3/4" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <div className="h-16 bg-muted rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificatePrograms.map(program => (
                      <ProgramCard key={program.id} program={program} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
