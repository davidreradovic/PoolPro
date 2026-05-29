import { useEffect, useRef } from "react";

const O = "#f15a24";
const OD = "#d94514";
const OL = "#fff3ee";

export function LearnMorePage({ setPage }) {
  const rootRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const els = rootRef.current?.querySelectorAll("[data-anim]");
    if (!els) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = "1";
            e.target.style.transform = "translateY(0)";
          }
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const anim = (delay = 0) => ({
    opacity: 0,
    transform: "translateY(24px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
  });

  const s = {
    root: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: "#fcfcfc",
      color: "#2d3748",
      minHeight: "100vh",
    },
    // NAV
    nav: {
      position: "sticky",
      top: 0,
      zIndex: 200,
      background: "rgba(255,255,255,0.97)",
      borderBottom: "1px solid #edf2f7",
      padding: "0 40px",
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
    },
    logo: { fontSize: "1.1rem", fontWeight: 700, color: "#2d3748" },
    logoSpan: { color: O },
    navLinks: { display: "flex", alignItems: "center", gap: 28 },
    navLink: { fontSize: "0.9rem", fontWeight: 500, color: "#4a5568", cursor: "pointer" },
    navLinkActive: { fontSize: "0.9rem", fontWeight: 500, color: O, cursor: "pointer" },
    contactBtn: {
      background: "transparent", border: `1.5px solid ${O}`, color: O,
      padding: "8px 20px", borderRadius: 6, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
    },
    backBtn: {
      background: "transparent", border: "none", color: "#4a5568",
      fontSize: "0.9rem", fontWeight: 500, cursor: "pointer", padding: "0 4px",
    },
    // HERO
    hero: {
      position: "relative", height: "68vh", minHeight: 420,
      display: "flex", alignItems: "flex-end", overflow: "hidden",
    },
    heroImg: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" },
    heroOverlay: {
      position: "absolute", inset: 0,
      background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)",
    },
    heroContent: { position: "relative", zIndex: 2, padding: "0 60px 60px", maxWidth: 780 },
    eyebrow: {
      display: "inline-block", fontSize: "0.7rem", fontWeight: 600,
      letterSpacing: 2, textTransform: "uppercase", color: O,
      background: "rgba(241,90,36,0.15)", border: "1px solid rgba(241,90,36,0.35)",
      padding: "5px 14px", borderRadius: 4, marginBottom: 16,
    },
    heroTitle: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "3.2rem", fontWeight: 700, color: "#fff",
      lineHeight: 1.1, marginBottom: 14, letterSpacing: -1,
    },
    heroSub: { fontSize: "1.1rem", color: "rgba(255,255,255,0.88)", lineHeight: 1.6 },
    // CONTAINER
    container: { maxWidth: 1100, margin: "0 auto", padding: "0 40px" },
    // SECTIONS
    section: { padding: "80px 0" },
    slabel: { fontSize: "0.7rem", fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: O, marginBottom: 10, display: "block" },
    stitle: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "2.2rem", color: "#1a202c", fontWeight: 700, lineHeight: 1.2, marginBottom: 20,
    },
    sbody: { fontSize: "1.05rem", lineHeight: 1.8, color: "#4a5568" },
    divider: { width: 48, height: 3, background: O, borderRadius: 2, margin: "0 0 24px" },
    // INTRO
    introGrid: {
      display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64,
      alignItems: "center", borderBottom: "1px solid #edf2f7", paddingBottom: 80,
    },
    statPanel: {
      background: OL, borderRadius: 16, padding: "40px 36px",
      borderLeft: `4px solid ${O}`,
    },
    stat: { marginBottom: 28 },
    statNum: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "2.8rem", color: O, fontWeight: 700, lineHeight: 1,
    },
    statLbl: { fontSize: "0.9rem", color: "#718096", marginTop: 4, fontWeight: 500 },
    // SERVICES BG
    svcBg: { background: "#f8fafc", padding: "80px 0" },
    svcGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 48 },
    svcCard: {
      background: "#fff", borderRadius: 14, padding: "36px 32px",
      border: "1px solid #e8edf3", boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      transition: "transform 0.25s, box-shadow 0.25s",
    },
    svcIcon: {
      width: 48, height: 48, background: OL, borderRadius: 12,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "1.4rem", marginBottom: 20,
    },
    svcTitle: { fontSize: "1.2rem", fontWeight: 600, color: "#2d3748", marginBottom: 16 },
    svcUl: { listStyle: "none", padding: 0, margin: 0 },
    svcLi: {
      fontSize: "0.97rem", color: "#4a5568", padding: "8px 0",
      borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "flex-start",
      gap: 10, lineHeight: 1.5,
    },
    bullet: { color: O, fontWeight: 700, fontSize: "1.1rem", flexShrink: 0, marginTop: 1 },
    // LAGUNA
    lagunaWrap: {
      background: "#f8fafc", borderRadius: 24, overflow: "hidden",
      display: "grid", gridTemplateColumns: "1fr 1fr", marginTop: 40,
    },
    lagunaText: { padding: "52px 48px", display: "flex", flexDirection: "column", justifyContent: "center" },
    lagunaH3: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "1.7rem", color: "#1a202c", fontWeight: 700, margin: "12px 0 16px",
    },
    lagunaImgs: {
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gridTemplateRows: "1fr 1fr", minHeight: 420,
    },
    imgMain: { gridColumn: "1/3", overflow: "hidden" },
    imgWrap: { overflow: "hidden" },
    lagunaImg: { width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.35s" },
    // WHY
    whyGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginTop: 48 },
    whyCard: {
      background: "#fff", border: "1px solid #edf2f7", borderRadius: 14,
      padding: "32px 24px", textAlign: "center",
    },
    whyIcon: { fontSize: "2rem", marginBottom: 14, display: "block" },
    whyTitle: { fontSize: "1rem", fontWeight: 600, color: "#2d3748", marginBottom: 10 },
    whyText: { fontSize: "0.88rem", color: "#718096", lineHeight: 1.6 },
    // CTA
    ctaWrap: {
      background: "#1a202c", borderRadius: 20, padding: "60px 52px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 40, margin: "80px 0",
    },
    ctaTitle: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "2rem", color: "#fff", fontWeight: 700, marginBottom: 20,
    },
    ctaDetail: { fontSize: "0.95rem", color: "rgba(255,255,255,0.75)", lineHeight: 2.1 },
    ctaBtn: {
      background: O, color: "#fff", border: "none", padding: "16px 36px",
      borderRadius: 8, fontSize: "1rem", fontWeight: 600, cursor: "pointer",
      whiteSpace: "nowrap", flexShrink: 0, fontFamily: "inherit",
    },
  };

  const items1 = [
    "Premium water pumps: deep well, borehole, centrifugal pumps, and more",
    "Complete well equipment for efficient water extraction",
    "Advanced water purification & filtration for clean, crystal-clear water",
    "Extensive spare parts catalogue",
  ];
  const items2 = [
    "Full-service swimming pool construction from design to finish",
    "Supply & installation of premium modern pool equipment",
    "Top-tier maintenance products for a beautiful, pristine pool",
    "Leading pool experts in the Prnjavor region and beyond",
  ];
  const whyItems = [
    { icon: "🤝", title: "Family-Owned", text: "Built on trust and lasting relationships with every single client we serve." },
    { icon: "⏳", title: "18+ Years Experience", text: "Proudly serving homeowners and contractors across the region since 2007." },
    { icon: "🏆", title: "Regional Leader", text: "A proven track record in major pool and water infrastructure projects." },
    { icon: "🛠️", title: "All-in-One Solution", text: "From wholesale supply to expert on-site installation and retail — under one roof." },
  ];

  return (
    <div ref={rootRef} style={s.root}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.logo}><span style={s.logoSpan}>METAL-GUMA</span>: PoolPro</div>
        <div style={s.navLinks}>
          <button style={s.backBtn} onClick={() => setPage("home")}>← Back</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <img style={s.heroImg} src="https://cdn.5280.com/2022/06/WEB_courtesy-of-four-seasons-Denver-1536x1152.jpg" alt="Plava Laguna" />
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <div style={s.eyebrow}>About Us</div>
          <h1 style={s.heroTitle}>Welcome to<br />METAL-GUMA & PoolPro</h1>
          <p style={s.heroSub}>Your Trusted Partner for Water & Leisure — Since 2007</p>
        </div>
      </section>

      {/* INTRO */}
      <div style={s.container}>
        <section style={s.section}>
          <div style={s.introGrid}>
            <div data-anim style={anim(0)}>
              <span style={s.slabel}>Our Story</span>
              <h2 style={s.stitle}>A Family Business Built on Water</h2>
              <div style={s.divider} />
              <p style={s.sbody}>
                At <strong>METAL-GUMA d.o.o. Prnjavor</strong>, we are passionate about bringing water to life.
                Founded on <strong>February 9, 2007</strong>, as a dedicated family-owned business, we have grown
                into a regional leader in water pump systems, pool construction, and aquatic engineering.
              </p>
              <p style={{ ...s.sbody, marginTop: 16 }}>
                Headquartered in Donja Ilova bb (Prnjavor, Bosnia and Herzegovina) and led by Director{" "}
                <strong>Goran Tomić</strong>, our company combines decades of family values with cutting-edge
                technical expertise.
              </p>
              <p style={{ ...s.sbody, marginTop: 16 }}>
                Whether you are a homeowner dreaming of a backyard oasis or a professional contractor looking
                for industrial-grade equipment, we are here to deliver excellence.
              </p>
            </div>
            <div data-anim style={anim(0.15)}>
              <div style={s.statPanel}>
                {[
                  { num: "2007", lbl: "Founded — February 9th" },
                  { num: "18+", lbl: "Years of regional experience" },
                  { num: "2", lbl: "Core divisions: Pumps & PoolPro" },
                  { num: "Prnjavor", lbl: "Donja Ilova bb, BiH — Headquarters" },
                ].map((st, i) => (
                  <div key={i} style={{ ...s.stat, marginBottom: i === 3 ? 0 : 28 }}>
                    <div style={s.statNum}>{st.num}</div>
                    <div style={s.statLbl}>{st.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SERVICES */}
      <div style={s.svcBg}>
        <div style={s.container}>
          <div data-anim style={{ ...anim(0), textAlign: "center" }}>
            <span style={{ ...s.slabel, textAlign: "center" }}>What We Do</span>
            <h2 style={{ ...s.stitle, textAlign: "center" }}>Two Divisions, One Standard of Excellence</h2>
            <p style={{ ...s.sbody, textAlign: "center", maxWidth: 580, margin: "0 auto" }}>
              We specialize in wholesale, retail, and professional installation across two core divisions.
            </p>
          </div>
          <div style={s.svcGrid}>
            {[{ icon: "💧", title: "Water Pumps & Filtration Systems", items: items1 },
              { icon: "🏊", title: "PoolPro: Dream Pools Built to Last", items: items2 }
            ].map((card, ci) => (
              <div key={ci} data-anim style={{ ...s.svcCard, ...anim(ci * 0.1) }}>
                <div style={s.svcIcon}>{card.icon}</div>
                <div style={s.svcTitle}>{card.title}</div>
                <ul style={s.svcUl}>
                  {card.items.map((item, ii) => (
                    <li key={ii} style={{ ...s.svcLi, borderBottom: ii === card.items.length - 1 ? "none" : "1px solid #f0f4f8" }}>
                      <span style={s.bullet}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LAGUNA */}
      <div style={s.container}>
        <section style={s.section}>
          <div data-anim style={{ ...anim(0), textAlign: "center" }}>
            <span style={{ ...s.slabel, textAlign: "center" }}>Our Flagship</span>
            <h2 style={{ ...s.stitle, textAlign: "center" }}>Our Pride: "Plava Laguna" Pools</h2>
          </div>
          <div data-anim style={{ ...s.lagunaWrap, ...anim(0.1) }}>
            <div style={s.lagunaText}>
              <span style={s.slabel}>Blue Lagoon · Donja Ilova</span>
              <h3 style={s.lagunaH3}>A Sanctuary for Relaxation & Family Fun</h3>
              <p style={s.sbody}>
                Our passion for water and community comes together at{" "}
                <strong>"Plava Laguna" (Blue Lagoon)</strong>, our privately owned pool complex located
                in Donja Ilova, right near Prnjavor.
              </p>
              <p style={{ ...s.sbody, marginTop: 12 }}>
                Plava Laguna has grown into a favourite local destination and a booming regional attraction.
                Designed as a family-oriented resort, it offers the perfect escape for all generations looking
                for refreshment, relaxation, and fun.
              </p>
              <p style={{ ...s.sbody, marginTop: 12 }}>
                It is a living testament to the quality and care we put into every pool construction and
                maintenance project we undertake.
              </p>
            </div>
            <div style={s.lagunaImgs}>
              <div style={s.imgMain}>
                <img style={s.lagunaImg} src="https://www.prnjavorinfo.com/wp-content/uploads/2022/06/plava-laguna.jpg" alt="Plava Laguna aerial" />
              </div>
              <div style={s.imgWrap}>
                <img style={s.lagunaImg} src="https://www.posavskenovosti.com/wp-content/uploads/2023/06/viber_slika_2023-06-19_15-13-10-761.jpg" />
              </div>
              <div style={s.imgWrap}>
                <img style={s.lagunaImg} src="https://scontent.fbnx1-1.fna.fbcdn.net/v/t51.75761-15/511557408_18281669263257226_729116344629019418_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=127cfc&_nc_ohc=6LP5sy6g-9cQ7kNvwFtLD8p&_nc_oc=AdqrUa8AeZtbwepxUlYYRxoICZv1vW0y0_Bvdaay9gGTRkJLKEkxjT3EwpZibmf6EMM&_nc_zt=23&_nc_ht=scontent.fbnx1-1.fna&_nc_gid=3QR8wl9LTPszHvdvq8cgqA&_nc_ss=7b289&oh=00_Af7LhFWm_8DaYStUj5YlSNtXdsbox-XPKlqkUMeynCKRsA&oe=6A151CB3" alt="Plava Laguna resort" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* WHY */}
      <div style={s.svcBg}>
        <div style={s.container}>
          <div data-anim style={{ ...anim(0), textAlign: "center", paddingTop: 80 }}>
            <span style={{ ...s.slabel, textAlign: "center" }}>Why Choose Us</span>
            <h2 style={{ ...s.stitle, textAlign: "center" }}>Family Values, Professional Standards</h2>
            <p style={{ ...s.sbody, textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
              As a family-run business, we don't just build pools and install pumps — we build lasting
              relationships based on trust, quality, and unmatched customer service.
            </p>
          </div>
          <div style={{ ...s.whyGrid, paddingBottom: 80 }}>
            {whyItems.map((w, i) => (
              <div key={i} data-anim style={{ ...s.whyCard, ...anim(i * 0.08) }}>
                <span style={s.whyIcon}>{w.icon}</span>
                <div style={s.whyTitle}>{w.title}</div>
                <div style={s.whyText}>{w.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTACT CTA */}
      <div style={s.container}>
        <div data-anim style={{ ...s.ctaWrap, ...anim(0) }}>
          <div>
            <div style={s.ctaTitle}>Let's Build Something Great Together</div>
            <div style={s.ctaDetail}>
              <strong style={{ color: "#fff" }}>"METAL-GUMA" d.o.o. Prnjavor</strong><br />
              📍 Donja Ilova bb, 78430 Prnjavor, BiH<br />
              📞 +387 (0)51 663 097<br />
              💼 Director: Goran Tomić
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnMorePage;
