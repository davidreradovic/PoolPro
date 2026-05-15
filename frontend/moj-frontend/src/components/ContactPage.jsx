import { useState } from "react";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>Have questions about our products or services? We're here to help.</p>
      {sent ? (
        <div className="alert alert-success">Thank you! We'll get back to you soon.</div>
      ) : (
        <>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 120 }}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button className="btn-primary" onClick={() => setSent(true)}>
            Send Message
          </button>
        </>
      )}
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
