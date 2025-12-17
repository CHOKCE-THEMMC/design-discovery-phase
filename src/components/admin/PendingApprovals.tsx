import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { PDFPreview } from '@/components/materials/PDFPreview';
import type { Database } from '@/integrations/supabase/types';

type Material = Database['public']['Tables']['materials']['Row'];

export function PendingApprovals() {
  const { user } = useAuth();
  const [pendingMaterials, setPendingMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetchPendingMaterials();
  }, []);

  const fetchPendingMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingMaterials(data || []);
    } catch (error) {
      console.error('Error fetching pending materials:', error);
      toast.error('Failed to load pending materials');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (materialId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({
          status: approved ? 'approved' : 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', materialId);

      if (error) throw error;

      toast.success(`Material ${approved ? 'approved' : 'rejected'} successfully`);
      fetchPendingMaterials();
    } catch (error) {
      console.error('Error updating material status:', error);
      toast.error('Failed to update material status');
    }
  };

  const handlePreview = (material: Material) => {
    setSelectedMaterial(material);
    setPreviewOpen(true);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-library-gold" />
            Pending Approvals
          </CardTitle>
          <Badge variant="outline" className="text-library-gold border-library-gold">
            {pendingMaterials.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : pendingMaterials.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">All caught up!</h3>
            <p className="text-muted-foreground">No materials pending approval</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Material</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.author || 'Unknown author'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {material.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{material.department}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(material.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {material.file_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreview(material)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproval(material.id, true)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApproval(material.id, false)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedMaterial && (
        <PDFPreview
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedMaterial(null);
          }}
          fileUrl={selectedMaterial.file_url || ''}
          fileName={selectedMaterial.file_name || 'document.pdf'}
          title={selectedMaterial.title}
        />
      )}
    </Card>
  );
}
