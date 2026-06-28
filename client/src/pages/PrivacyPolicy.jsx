export default function PrivacyPolicy() {
  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Privacy Policy</h1>
      <p>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>1. Information We Collect</h2>
        <p>When you use our Lost & Found platform, we collect information you provide directly to us, such as your username, email address, location, contact details, and the contents of your posts, messages, and claims.</p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information to facilitate the return of lost items, communicate with you, ensure platform safety, and improve our services. Your public profile and posts will be visible to other users.</p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>3. User Privacy and Data Handling</h2>
        <p>We take appropriate measures to secure your personal information against unauthorized access. We do not sell your personal data to third parties. Sensitive contact information provided during registration or item claims is only shared when necessary to facilitate an item's return.</p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>4. Your Responsibilities</h2>
        <p>You are responsible for the accuracy of the information you submit. Please avoid sharing sensitive financial or government-issued IDs publicly unless strictly required for a claim.</p>
      </section>
    </div>
  );
}
