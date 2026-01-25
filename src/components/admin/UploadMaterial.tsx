import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2, CheckCircle, Video, Link } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type MaterialType = Database['public']['Enums']['material_type'];

import { ALL_PROGRAMS, GROUPED_PROGRAMS } from '@/lib/programs';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export function UploadMaterial() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadMode, setUploadMode] = useState<'document' | 'video_file' | 'video_link'>('document');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '' as MaterialType | '',
    department: '',
    year: '',
    author: '',
    videoUrl: '',
  });
  const [file, setFile] = useState<File | null>(null);

  // Document file types (up to 1GB)
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ];
  const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];

  // Video file types (up to 5GB)
  const videoTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/webm',
    'video/x-flv',
    'video/x-matroska',
  ];
  const videoExtensions = ['.mp4', '.mpeg', '.mpg', '.mov', '.avi', '.wmv', '.webm', '.flv', '.mkv'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (uploadMode === 'document') {
        const isValidType = documentTypes.includes(selectedFile.type) || documentExtensions.includes(fileExtension);
        if (!isValidType) {
          toast.error('Please upload a PDF, Word document, Excel file, or text file');
          return;
        }
        // Check file size (max 1GB for documents)
        if (selectedFile.size > 1024 * 1024 * 1024) {
          toast.error('Document file size must be less than 1GB');
          return;
        }
      } else if (uploadMode === 'video_file') {
        const isValidType = videoTypes.includes(selectedFile.type) || videoExtensions.includes(fileExtension);
        if (!isValidType) {
          toast.error('Please upload a valid video file (MP4, MOV, AVI, WMV, WebM, FLV, MKV)');
          return;
        }
        // Check file size (max 5GB for videos)
        if (selectedFile.size > 5 * 1024 * 1024 * 1024) {
          toast.error('Video file size must be less than 5GB');
          return;
        }
      }
      
      setFile(selectedFile);
    }
  };

  const isValidVideoUrl = (url: string): boolean => {
    const videoUrlPatterns = [
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/,
      /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/,
      /^(https?:\/\/)?(www\.)?dailymotion\.com\/.+/,
      /^(https?:\/\/)?.+\.(mp4|webm|ogg|avi|mov)(\?.*)?$/i,
      /^https?:\/\/.+/,  // Allow any valid URL for video links
    ];
    return videoUrlPatterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to upload materials');
      return;
    }

    if (uploadMode !== 'video_link' && !file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (uploadMode === 'video_link' && !formData.videoUrl) {
      toast.error('Please enter a video URL');
      return;
    }

    if (uploadMode === 'video_link' && !isValidVideoUrl(formData.videoUrl)) {
      toast.error('Please enter a valid video URL');
      return;
    }

    if (!formData.type) {
      toast.error('Please select a material type');
      return;
    }

    setLoading(true);

    try {
      let fileUrl = '';
      let fileName = '';
      let fileSize = 0;

      if (uploadMode === 'video_link') {
        // For video links, store the URL directly
        fileUrl = formData.videoUrl;
        fileName = 'Video Link';
        fileSize = 0;
      } else if (file) {
        // Upload file to appropriate storage bucket
        const bucket = uploadMode === 'video_file' ? 'videos' : 'materials';
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/${formData.type}/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileName = file.name;
        fileSize = file.size;
      }

      // Insert material record
      const { error: insertError } = await supabase
        .from('materials')
        .insert({
          title: formData.title,
          description: formData.description,
          type: formData.type as MaterialType,
          department: formData.department,
          year: formData.year ? parseInt(formData.year) : null,
          author: formData.author,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          uploaded_by: user.id,
          status: isAdmin ? 'approved' : 'pending',
          approved_by: isAdmin ? user.id : null,
          approved_at: isAdmin ? new Date().toISOString() : null,
          is_video: uploadMode === 'video_file' || uploadMode === 'video_link',
          video_url: uploadMode === 'video_link' ? formData.videoUrl : null,
          content_type: uploadMode,
          preview_pages: uploadMode === 'document' ? 3 : 30, // 3 pages for docs, 30 seconds for videos
        });

      if (insertError) throw insertError;

      setUploadSuccess(true);
      toast.success('Material uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: '',
        department: '',
        year: '',
        author: '',
        videoUrl: '',
      });
      setFile(null);
      
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  const getAcceptedFormats = () => {
    if (uploadMode === 'document') {
      return '.pdf,.doc,.docx,.xls,.xlsx,.txt';
    } else if (uploadMode === 'video_file') {
      return '.mp4,.mpeg,.mpg,.mov,.avi,.wmv,.webm,.flv,.mkv';
    }
    return '';
  };

  const getFileSizeLimit = () => {
    if (uploadMode === 'document') return '1GB';
    if (uploadMode === 'video_file') return '5GB';
    return '';
  };

  const getFormatDescription = () => {
    if (uploadMode === 'document') {
      return 'PDF, DOCX, Excel, TXT (max 1GB)';
    } else if (uploadMode === 'video_file') {
      return 'MP4, MOV, AVI, WMV, WebM, FLV, MKV (max 5GB)';
    }
    return '';
  };

  return (
    <Card className="bg-card border-border max-w-2xl">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload New Material
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isAdmin 
            ? 'Materials uploaded by admins are automatically approved'
            : 'Materials will be reviewed before being published'}
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={uploadMode} onValueChange={(v) => {
          setUploadMode(v as 'document' | 'video_file' | 'video_link');
          setFile(null);
        }} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
            <TabsTrigger value="video_file" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Video File
            </TabsTrigger>
            <TabsTrigger value="video_link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Video Link
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter material title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the material content..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Material Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as MaterialType })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="lecture_note">Lecture Note</SelectItem>
                  <SelectItem value="past_paper">Past Paper</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Program *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
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

          {uploadMode === 'video_link' ? (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Supports YouTube, Vimeo, Dailymotion, and direct video URLs
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file">Upload {uploadMode === 'video_file' ? 'Video' : 'File'} *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="file"
                  accept={getAcceptedFormats()}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      {uploadMode === 'video_file' ? (
                        <Video className="h-8 w-8 text-primary" />
                      ) : (
                        <FileText className="h-8 w-8 text-primary" />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.size >= 1024 * 1024 * 1024 
                            ? `${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB`
                            : `${(file.size / 1024 / 1024).toFixed(2)} MB`
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {uploadMode === 'video_file' ? (
                        <Video className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      ) : (
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      )}
                      <p className="text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">{getFormatDescription()}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || (uploadMode !== 'video_link' && !file) || !formData.title || !formData.type || !formData.department}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Material
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
