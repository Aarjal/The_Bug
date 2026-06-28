export default function TermsOfService() {
  return (
    <div className="page-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Terms of Service</h1>
      <p>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>1. Acceptance of Terms</h2>
        <p>By creating an account on our Lost & Found platform, you agree to abide by these Terms of Service.</p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>2. Responsible Platform Usage</h2>
        <p>This platform is intended solely for reporting lost and found items. You agree to use the platform in good faith to facilitate the return of lost property.</p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>3. Prohibited Activities</h2>
        <p>Users are strictly prohibited from:</p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li>Submitting false reports or fake claims.</li>
          <li>Impersonating other users or property owners.</li>
          <li>Harassment, threats, or abusive behavior towards other members.</li>
          <li>Fraud, scams, or requesting unwarranted fees for the return of items.</li>
          <li>Misuse of recovery requests.</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>4. Disclaimer and Liability</h2>
        <p>You are solely responsible for the accuracy of submitted information. The platform operators are not liable for lost items, damages, or disputes arising between users. You may face account suspension or legal consequences for intentional misuse or fraudulent activities on this platform.</p>
      </section>
    </div>
  );
}
