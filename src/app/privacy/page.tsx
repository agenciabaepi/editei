import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Canva Clone',
  description: 'Privacy Policy for Canva Clone design platform',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Welcome to Canva Clone (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our design platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
              <p className="text-gray-700 mb-4">We collect information you provide directly to us, such as:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Name and email address when you create an account</li>
                <li>Profile information and preferences</li>
                <li>Payment information for subscription services</li>
                <li>Communications with our support team</li>
                <li>Feedback, surveys, and contest entries</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Design Content</h3>
              <p className="text-gray-700 mb-4">We store and process:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Designs, templates, and projects you create</li>
                <li>Images, text, and other content you upload</li>
                <li>Collaboration data and shared projects</li>
                <li>Usage patterns and design preferences</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Technical Information</h3>
              <p className="text-gray-700 mb-4">We automatically collect:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system and screen resolution</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage subscriptions</li>
                <li>Send important updates and notifications</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Personalize your experience and recommend content</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">With Your Consent</h3>
              <p className="text-gray-700 mb-4">When you explicitly agree to share information, such as collaborating on designs or sharing projects publicly.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Service Providers</h3>
              <p className="text-gray-700 mb-4">We work with third-party service providers for:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Payment processing (Stripe, PayPal)</li>
                <li>Cloud storage and hosting</li>
                <li>Analytics and performance monitoring</li>
                <li>Email delivery and communications</li>
                <li>Customer support tools</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Legal Requirements</h3>
              <p className="text-gray-700 mb-4">We may disclose information when required by law or to protect our rights, users, or the public.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">We implement appropriate security measures to protect your information:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-gray-700 mb-4">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 mb-4">We retain your information for as long as:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Your account is active</li>
                <li>Needed to provide our services</li>
                <li>Required by law or for legitimate business purposes</li>
                <li>Necessary to resolve disputes or enforce agreements</li>
              </ul>
              <p className="text-gray-700 mb-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where retention is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              <p className="text-gray-700 mb-4">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="text-gray-700 mb-4">
                To exercise these rights, please contact us using the information provided below.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze site usage and performance</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings, but disabling them may affect site functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@canva-clone.com<br />
                  <strong>Data Protection Officer:</strong> dpo@canva-clone.com<br />
                  <strong>Address:</strong> 123 Design Street, Creative City, CC 12345<br />
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-8">
              <p className="text-blue-800">
                <strong>Note:</strong> This Privacy Policy is effective as of the date listed above and applies to all users of our platform. 
                By using Canva Clone, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
