import { useEffect, useRef, useState } from "react";
import { MOCK_PRODUCTS } from "../data/mockData";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

const PRODUCT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=700";
const PROJECT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1558617320-e695f0d420de?q=80&w=1170&auto=format&fit=crop";

export function HomePage({ setPage, setSelectedProduct, setMessageDraft }) {
  const { user } = useAuth();
  const [featured, setFeatured] = useState(MOCK_PRODUCTS.slice(0, 6));
  const [publicProjects, setPublicProjects] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const draftCounterRef = useRef(0);

  useEffect(() => {
    const normalizeProduct = (item) => ({
      ...item,
      id: item.idItem || item.id,
      name: item.title || item.name,
      price: item.unitPrice ?? item.price ?? 0,
      img: item.imgUrl || item.img || PRODUCT_FALLBACK_IMAGE,
    });

    const loadHomeData = async () => {
      try {
        const items = await apiFetch("/items/featured");
        if (Array.isArray(items) && items.length > 0) {
          setFeatured(items.slice(0, 6).map(normalizeProduct));
        }
      } catch (e) {
        console.warn("Unable to load featured items", e);
      }

      try {
        const projects = await apiFetch("/projects/public-showcase");
        if (Array.isArray(projects)) {
          setPublicProjects(projects);
        }
      } catch (e) {
        console.warn("Unable to load public projects", e);
      }
    };

    loadHomeData();
  }, []);

  const openProduct = (product) => {
    setSelectedProduct(product);
    setPage("product");
  };

  const openProjectMessage = (project) => {
    draftCounterRef.current += 1;
    setMessageDraft({
      id: `${project.idProject}-${draftCounterRef.current}`,
      text: `Zainteresovan sam za ${project.title} tip bazena.`,
    });
    setPage(user ? "messages" : "auth");
  };

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-tag">METAL-GUMA PoolPro</div>
          <h1 className="hero-title">
            Bazeni,<br />
            oprema i radovi
          </h1>
          <p className="hero-sub">
            Pogledajte opremu koju klijenti najvise traze i projekte koje smo zavrsili na terenu.
          </p>
          <button className="btn-primary" onClick={() => setPage("shop")}> 
            Pogledaj proizvode
          </button>
        </div>
        <div
          className="hero-right"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1558617320-e695f0d420de?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
      </div>

      <div className="section" style={{ background: "var(--white)" }}>
        <div className="home-projects-header">
          <h2 className="section-title">Uradjeni projekti</h2>
          <p className="section-sub">Javni projekti sa nazivom, opisom i slikama zadataka</p>
        </div>
        {publicProjects.length > 0 ? (
          <div className="project-list-showcase">
            {publicProjects.map((project) => {
              const photos = project.photos || [];
              return (
                <div
                  key={project.idProject}
                  className="project-list-card"
                  onClick={() => openProjectMessage(project)}
                >
                  <div className="project-list-copy">
                    <h3>{project.title}</h3>
                    <p>{project.description || "Detalji projekta dostupni su u prikazu projekta."}</p>
                  </div>
                  <div className="project-task-gallery">
                    {photos.length > 0 ? (
                      photos.map((photo) => (
                        <figure key={photo.idPhoto}>
                          <img
                            src={photo.imgUrl}
                            alt={photo.taskTitle || project.title}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewPhoto({
                                src: photo.imgUrl,
                                title: photo.taskTitle || project.title,
                              });
                            }}
                          />
                          {photo.taskTitle && <figcaption>{photo.taskTitle}</figcaption>}
                        </figure>
                      ))
                    ) : (
                      <figure>
                        <img src={PROJECT_FALLBACK_IMAGE} alt={project.title} />
                        <figcaption>Nema dodanih slika zadataka</figcaption>
                      </figure>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty" style={{ paddingTop: 10 }}>
            <p>Trenutno nema javno oznacenih projekata za prikaz.</p>
          </div>
        )}
      </div>

      {previewPhoto && (
        <div className="image-preview-overlay" onClick={() => setPreviewPhoto(null)}>
          <button className="image-preview-close" onClick={() => setPreviewPhoto(null)}>
            ×
          </button>
          <img
            src={previewPhoto.src}
            alt={previewPhoto.title}
            className="image-preview"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Top Sellers */}
      <div className="section" style={{ background: "var(--light)" }}>
        <h2 className="section-title">Najprodavaniji proizvodi</h2>
        <p className="section-sub">Oprema i materijali koje klijenti najcesce biraju</p>
        <div className="products-row">
          {featured.map((p) => (
            <div
              key={p.id}
              className="product-card"
              onClick={() => openProduct(p)}
            >
              <img className="product-card-img" src={p.img} alt={p.name} />
              <div className="product-card-body">
                <div className="product-card-name">{p.name}</div>
                <div className="product-card-price">{p.price.toFixed(2)} KM</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div className="section">
        <h2 className="section-title">Our Story</h2>
        <p className="section-sub">Built for You</p>
        <div className="story-box">
          <p>
            At METAL-GUMA: PoolPro, we're passionate about providing the best possible products and
            customer service. Whether you're a pool owner or a professional contractor, we've got everything
            you need to build and maintain a beautiful swimming pool.
          </p>
          <button className="btn-secondary" onClick={() => setPage("learn-more")}>Learn More About Us</button>
        </div>
      </div>
    </div>
  );
}
