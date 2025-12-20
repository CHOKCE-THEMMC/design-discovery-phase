import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-primary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                Privacy Policy
              </h1>
            </div>
            <p className="text-white/80 max-w-2xl">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2>Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                upload materials, or contact us for support. This may include your name, email address, 
                and any materials you choose to upload.
              </p>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process uploads and downloads of educational materials</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>

              <h2>Information Sharing</h2>
              <p>
                We do not sell or share your personal information with third parties for their 
                marketing purposes. We may share your information only in the following circumstances:
              </p>
              <ul>
                <li>With your consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and the rights of others</li>
              </ul>

              <h2>Data Security</h2>
              <p>
                We take reasonable measures to help protect your personal information from loss, 
                theft, misuse, and unauthorized access. However, no internet transmission is 
                completely secure, and we cannot guarantee absolute security.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
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

export default Privacy;
