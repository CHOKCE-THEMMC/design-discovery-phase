import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, Upload, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PDFPreview } from '@/components/materials/PDFPreview';

type Material = {
  id: string;
  title: string;
  description: string | null;
  type: 'book' | 'lecture_note' | 'past_paper' | 'tutorial';
  department: string;
  year: number | null;
  year_level: number | null;
  author: string | null;
  file_url: string | null;
  file_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

import { ALL_PROGRAMS, GROUPED_PROGRAMS } from '@/lib/programs';

const materialTypes = [
  { value: 'book', label: 'Book' },
  { value: 'lecture_note', label: 'Lecture Note' },
  { value: 'past_paper', label: 'Past Paper' },
  { value: 'tutorial', label: 'Tutorial' },
];

const yearLevels = [
  { value: 1, label: 'Year 1' },
  { value: 2, label: 'Year 2' },
  { value: 3, label: 'Year 3' },
];

export default function MyMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: 'book' | 'lecture_note' | 'past_paper' | 'tutorial';
    department: string;
    year: number;
    yearLevel: number | null;
    author: string;
  }>({
    title: '',
    description: '',
    type: 'lecture_note',
    department: '',
    year: new Date().getFullYear(),
    yearLevel: null,
    author: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const fetchMaterials = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch materials');
      console.error(error);
    } else {
      setMaterials(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('materials')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('materials')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleAdd = async () => {
    if (!user || !formData.title || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    let fileUrl = null;
    let fileName = null;

    if (file) {
      fileUrl = await uploadFile(file);
      fileName = file.name;
      if (!fileUrl) {
        toast.error('Failed to upload file');
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase.from('materials').insert({
      title: formData.title,
      description: formData.description || null,
      type: formData.type,
      department: formData.department,
      year: formData.year,
      year_level: formData.yearLevel,
      author: formData.author || null,
      file_url: fileUrl,
      file_name: fileName,
      uploaded_by: user.id,
      status: 'pending',
    });

    setUploading(false);

    if (error) {
      toast.error('Failed to add material');
      console.error(error);
    } else {
      toast.success('Material submitted for approval');
      setIsAddOpen(false);
      resetForm();
      fetchMaterials();
    }
  };

  const handleEdit = async () => {
    if (!selectedMaterial || !formData.title || !formData.department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    let fileUrl = selectedMaterial.file_url;
    let fileName = selectedMaterial.file_name;

    if (file) {
      const newUrl = await uploadFile(file);
      if (newUrl) {
        fileUrl = newUrl;
        fileName = file.name;
      }
    }

    const { error } = await supabase
      .from('materials')
      .update({
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        department: formData.department,
        year: formData.year,
        year_level: formData.yearLevel,
        author: formData.author || null,
        file_url: fileUrl,
        file_name: fileName,
        status: 'pending', // Reset to pending after edit
      })
      .eq('id', selectedMaterial.id)
      .eq('uploaded_by', user?.id);

    setUploading(false);

    if (error) {
      toast.error('Failed to update material');
      console.error(error);
    } else {
      toast.success('Material updated and resubmitted for approval');
      setIsEditOpen(false);
      resetForm();
      fetchMaterials();
    }
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', selectedMaterial.id)
      .eq('uploaded_by', user?.id);

    if (error) {
      toast.error('Failed to delete material');
      console.error(error);
    } else {
      toast.success('Material deleted');
      setIsDeleteOpen(false);
      setSelectedMaterial(null);
      fetchMaterials();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'lecture_note',
      department: '',
      year: new Date().getFullYear(),
      yearLevel: null,
      author: '',
    });
    setFile(null);
    setSelectedMaterial(null);
  };

  const openEdit = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      title: material.title,
      description: material.description || '',
      type: material.type,
      department: material.department,
      year: material.year || new Date().getFullYear(),
      yearLevel: material.year_level,
      author: material.author || '',
    });
    setIsEditOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const stats = {
    total: materials.length,
    approved: materials.filter(m => m.status === 'approved').length,
    pending: materials.filter(m => m.status === 'pending').length,
    rejected: materials.filter(m => m.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              My Materials
            </h1>
            <p className="text-muted-foreground">
              Upload, manage, and track your educational materials
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" /> Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter material title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the material"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {materialTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Program *</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(GROUPED_PROGRAMS).map(([group, programs]) => (
                          <SelectGroup key={group}>
                            <SelectLabel className="text-xs font-semibold text-muted-foreground">{group}</SelectLabel>
                            {programs.map((program) => (
                              <SelectItem key={program} value={program}>
                                {program}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year Level *</Label>
                    <Select value={formData.yearLevel?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, yearLevel: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearLevels.map(level => (
                          <SelectItem key={level.value} value={level.value.toString()}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Author name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">PDF File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleAdd} disabled={uploading} className="bg-primary text-primary-foreground">
                  {uploading ? 'Uploading...' : 'Submit for Approval'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Materials Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : materials.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground">No materials yet. Click "Add Material" to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell className="capitalize">{material.type.replace('_', ' ')}</TableCell>
                      <TableCell>{material.department}</TableCell>
                      <TableCell>{getStatusBadge(material.status)}</TableCell>
                      <TableCell>{new Date(material.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {material.file_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedMaterial(material); setIsPreviewOpen(true); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(material)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => { setSelectedMaterial(material); setIsDeleteOpen(true); }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(GROUPED_PROGRAMS).map(([group, programs]) => (
                        <SelectGroup key={group}>
                          <SelectLabel className="text-xs font-semibold text-muted-foreground">{group}</SelectLabel>
                          {programs.map((program) => (
                            <SelectItem key={program} value={program}>
                              {program}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year Level *</Label>
                  <Select value={formData.yearLevel?.toString() || ''} onValueChange={(value) => setFormData({ ...formData, yearLevel: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearLevels.map(level => (
                        <SelectItem key={level.value} value={level.value.toString()}>{level.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-file">Replace PDF File (optional)</Label>
                <Input
                  id="edit-file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
                {selectedMaterial?.file_name && !file && (
                  <p className="text-sm text-muted-foreground">Current: {selectedMaterial.file_name}</p>
                )}
                {file && <p className="text-sm text-muted-foreground">New: {file.name}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleEdit} disabled={uploading} className="bg-primary text-primary-foreground">
                {uploading ? 'Updating...' : 'Update Material'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Material</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete "{selectedMaterial?.title}"? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PDF Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedMaterial?.title}</DialogTitle>
            </DialogHeader>
            {selectedMaterial?.file_url && (
              <iframe
                src={`${selectedMaterial.file_url}#toolbar=0`}
                className="w-full h-full border-0 rounded-lg"
                title={selectedMaterial.title}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
