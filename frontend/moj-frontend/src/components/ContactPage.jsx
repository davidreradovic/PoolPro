export function ContactPage() {
  return (
    <div className="contact-container">
      <h1>Contact Information</h1>
      <p>For questions about our products or services, please use the details below.</p>
      <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
        {[
          { icon: "📍", label: "Address", val: "Banja Luka, Bosnia" },
          { icon: "📞", label: "Phone", val: "+387 51 000 000" },
          { icon: "✉️", label: "Email", val: "info@metalguma.ba" },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              textAlign: "center",
              padding: 24,
              background: "var(--light)",
              borderRadius: 10,
            }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.label}</div>
            <div style={{ color: "var(--mid)", fontSize: "0.9rem" }}>{c.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
