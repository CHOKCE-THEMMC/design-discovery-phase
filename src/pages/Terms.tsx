import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { FileText } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Terms of Service
              </h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing and using the DTI Library platform, you agree to be bound by these 
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <h2>Use of Services</h2>
              <p>
                Our platform provides access to educational materials including books, lecture notes, 
                past papers, and tutorials. You agree to use these services only for lawful purposes 
                and in accordance with these Terms.
              </p>

              <h2>User Accounts</h2>
              <p>
                To access certain features, you may need to create an account. You are responsible 
                for maintaining the confidentiality of your account credentials and for all activities 
                that occur under your account.
              </p>

              <h2>Content Guidelines</h2>
              <p>When uploading materials, you agree that:</p>
              <ul>
                <li>You have the right to share the content</li>
                <li>The content does not infringe on any intellectual property rights</li>
                <li>The content is educational and appropriate for academic use</li>
                <li>You will not upload malicious or harmful content</li>
              </ul>

              <h2>Intellectual Property</h2>
              <p>
                All materials uploaded to the platform should respect intellectual property rights. 
                Users are responsible for ensuring they have permission to share any content they upload.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                DTI Library is provided "as is" without warranties of any kind. We are not liable 
                for any damages arising from your use of our services.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the platform 
                after changes constitutes acceptance of the new terms.
              </p>

              <h2>Contact</h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a href="mailto:library@dti.edu">library@dti.edu</a>.
              </p>

              <p className="text-muted-foreground text-sm mt-8">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
