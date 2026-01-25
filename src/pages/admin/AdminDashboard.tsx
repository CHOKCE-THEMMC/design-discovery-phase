import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  FileCheck, 
  Upload,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { MaterialsManagement } from '@/components/admin/MaterialsManagement';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { PendingApprovals } from '@/components/admin/PendingApprovals';
import { UploadMaterial } from '@/components/admin/UploadMaterial';
import { ProgramsManagement } from '@/components/admin/ProgramsManagement';
import { UserApprovals } from '@/components/admin/UserApprovals';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage materials, users, programs, and system settings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap w-full lg:w-auto lg:inline-flex bg-muted/50 h-auto gap-1 p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Materials</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Approvals</span>
            </TabsTrigger>
            <TabsTrigger value="user-approvals" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">User Approvals</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsManagement />
          </TabsContent>

          <TabsContent value="approvals">
            <PendingApprovals />
          </TabsContent>

          <TabsContent value="user-approvals">
            <UserApprovals />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="programs">
            <ProgramsManagement />
          </TabsContent>

          <TabsContent value="upload">
            <UploadMaterial />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
