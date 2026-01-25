import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GraduationCap, Plus, Pencil, Trash2, Award } from 'lucide-react';
import { toast } from 'sonner';

interface Program {
  id: string;
  name: string;
  type: string;
  duration: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export function ProgramsManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'certificate' as string,
    duration: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'certificate',
      duration: '',
      description: '',
      is_active: true
    });
    setEditingProgram(null);
  };

  const handleOpenDialog = (program?: Program) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name: program.name,
        type: program.type,
        duration: program.duration,
        description: program.description || '',
        is_active: program.is_active
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingProgram) {
        const { error } = await supabase
          .from('programs')
          .update({
            name: formData.name,
            type: formData.type,
            duration: formData.duration,
            description: formData.description || null,
            is_active: formData.is_active
          })
          .eq('id', editingProgram.id);

        if (error) throw error;
        toast.success('Program updated successfully');
      } else {
        const { error } = await supabase
          .from('programs')
          .insert({
            name: formData.name,
            type: formData.type,
            duration: formData.duration,
            description: formData.description || null,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast.success('Program created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchPrograms();
    } catch (error: any) {
      console.error('Error saving program:', error);
      if (error.code === '23505') {
        toast.error('A program with this name already exists');
      } else {
        toast.error('Failed to save program');
      }
    }
  };

  const handleDelete = async (program: Program) => {
    if (!confirm(`Are you sure you want to delete "${program.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', program.id);

      if (error) throw error;
      toast.success('Program deleted successfully');
      fetchPrograms();
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete program');
    }
  };

  const handleToggleActive = async (program: Program) => {
    try {
      const { error } = await supabase
        .from('programs')
        .update({ is_active: !program.is_active })
        .eq('id', program.id);

      if (error) throw error;
      toast.success(`Program ${program.is_active ? 'deactivated' : 'activated'}`);
      fetchPrograms();
    } catch (error) {
      console.error('Error toggling program status:', error);
      toast.error('Failed to update program status');
    }
  };

  const diplomaPrograms = programs.filter(p => p.type === 'diploma');
  const certificatePrograms = programs.filter(p => p.type === 'certificate');

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Programs Management
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProgram ? 'Edit Program' : 'Add New Program'}
                </DialogTitle>
                <DialogDescription>
                  {editingProgram 
                    ? 'Update the program details below.' 
                    : 'Fill in the details to create a new program.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Program Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Registered Nursing"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Program Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'diploma' | 'certificate') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diploma">Diploma Course</SelectItem>
                      <SelectItem value="certificate">Certificate Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 Years or 6-12 Months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the program..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active (visible to users)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingProgram ? 'Update' : 'Create'} Program
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diploma Programs */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Full-Time Diploma Courses ({diplomaPrograms.length})
          </h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Program Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : diplomaPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No diploma programs found
                    </TableCell>
                  </TableRow>
                ) : (
                  diplomaPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>{program.duration}</TableCell>
                      <TableCell>
                        <Badge variant={program.is_active ? 'default' : 'secondary'}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(program)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(program)}
                          >
                            <Switch checked={program.is_active} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(program)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Certificate Programs */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificate Courses ({certificatePrograms.length})
          </h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Program Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : certificatePrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No certificate programs found
                    </TableCell>
                  </TableRow>
                ) : (
                  certificatePrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>{program.duration}</TableCell>
                      <TableCell>
                        <Badge variant={program.is_active ? 'default' : 'secondary'}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(program)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(program)}
                          >
                            <Switch checked={program.is_active} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(program)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
