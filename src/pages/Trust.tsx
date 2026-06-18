import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Trust = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container px-4 md:px-6 lg:px-8 py-12 md:py-20 max-w-3xl">
        <h1 className="font-serif text-3xl md:text-4xl mb-2">Trust & Privacy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          This page is maintained by Bloom &amp; Grace to answer common security and privacy
          questions about our store. It is editable content owned by us and is not an independent
          certification.
        </p>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">Account &amp; Authentication</h2>
          <p className="text-sm leading-relaxed">
            Customers sign in with Google or email. Authenticated sessions are issued and managed by
            our backend provider. Administrator areas require an additional one-time passcode sent
            to a registered phone number.
          </p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">Hosting &amp; Platform</h2>
          <p className="text-sm leading-relaxed">
            The storefront is built on Lovable and uses a managed Postgres database with
            row-level-security policies. Connections to the database and storage are encrypted in
            transit (HTTPS/TLS). Lovable provides the underlying platform; Bloom &amp; Grace is
            responsible for the application logic, content, and customer data handling described on
            this page.
          </p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">Data We Collect</h2>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Account profile (name, email, phone) you provide at sign-up.</li>
            <li>Shipping address and order history needed to fulfil purchases.</li>
            <li>Product reviews and customer-support messages you submit.</li>
            <li>Optional preferences such as language and wishlist.</li>
          </ul>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">How We Use Your Data</h2>
          <p className="text-sm leading-relaxed">
            We use your information to process orders, deliver products, answer your inquiries,
            issue loyalty points, and improve the shopping experience. We do not sell personal
            information.
          </p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">Access Controls</h2>
          <p className="text-sm leading-relaxed">
            Customer records are protected by per-user row-level-security rules so that only the
            account owner (and authorised administrators) can read or change their data. Internal
            admin tools are restricted by role and require additional verification.
          </p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">Cookies</h2>
          <p className="text-sm leading-relaxed">
            We use a minimal set of cookies and local-storage entries to keep you signed in and to
            remember your language and cart.
          </p>
        </section>

        <section className="space-y-3 mb-10">
          <h2 className="font-serif text-2xl">Your Requests</h2>
          <p className="text-sm leading-relaxed">
            To access, correct or delete your personal data, or to report a security concern,
            contact us at <a className="underline" href="/contact">our contact page</a>. We will
            respond as quickly as possible.
          </p>
        </section>

        <p className="text-xs text-muted-foreground mt-12">
          The platform-level statements above describe enabled Lovable capabilities and are not a
          certification by Lovable. Compliance commitments, audits, or regulatory certifications are
          not claimed on this page unless explicitly stated in writing by Bloom &amp; Grace.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Trust;
