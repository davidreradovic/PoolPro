import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export function ProductPage({ product, setPage, addToCart }) {
  const { user } = useAuth();
  const [item, setItem] = useState(product);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [comments, setComments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewDesc, setReviewDesc] = useState("");
  const [message, setMessage] = useState("");
  const itemId = item?.idItem || item?.id || product?.idItem || product?.id;
  const clientId = user?.id || user?.idUser;
  const userReview = user?.role === "CLIENT"
    ? reviews.find((review) => Number(review.clientId) === Number(clientId))
    : null;
  const reviewScores = reviews
    .map((review) => Number(review.review))
    .filter((score) => Number.isFinite(score));
  const averageReview = reviewScores.length
    ? reviewScores.reduce((sum, score) => sum + score, 0) / reviewScores.length
    : null;

  const fetchItem = async () => {
    try {
      const res = await apiFetch(`/items/${itemId}`);
      if (res && typeof res === "object") {
        setItem(res);
      }
    } catch (e) {
      console.error("Failed to load item details", e);
    }
  };

  const loadComments = async () => {
    try {
      const res = await apiFetch(`/item-comments/item/${itemId}`);
      if (Array.isArray(res)) {
        setComments(res);
      }
    } catch (e) {
      console.error("Failed to load comments", e);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await apiFetch(`/reviews/item/${itemId}`);
      if (Array.isArray(res)) {
        setReviews(res);
      }
    } catch (e) {
      console.error("Failed to load reviews", e);
    }
  };

  const loadPhotos = async () => {
    try {
      const res = await apiFetch(`/item-photos/item/${itemId}`);
      if (Array.isArray(res)) {
        setPhotos(res);
      }
    } catch (e) {
      console.error("Failed to load photos", e);
    }
  };

  useEffect(() => {
    if (!product) return;
    fetchItem();
    loadComments();
    loadReviews();
    loadPhotos();
  }, [product, user]);

  useEffect(() => {
    if (!userReview) {
      setReviewScore(5);
      setReviewDesc("");
      return;
    }

    setReviewScore(Number(userReview.review) || 5);
    setReviewDesc(userReview.description || "");
  }, [userReview?.clientId, userReview?.itemId, userReview?.review, userReview?.description]);

  const handleAdd = () => {
    addToCart(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const submitComment = async () => {
    if (!commentText.trim() || !user) {
      setMessage("Please sign in and write a comment.");
      return;
    }
    try {
      await apiFetch(
        "/item-comments",
        {
          method: "POST",
          body: JSON.stringify({
            itemId,
            content: commentText,
          }),
        },
        user.token
      );
      setCommentText("");
      setMessage("Comment submitted.");
      loadComments();
    } catch (e) {
      console.error("Failed to submit comment", e);
      setMessage("Failed to submit comment.");
    }
  };

  const submitReview = async () => {
    if (!reviewDesc.trim() || !user) {
      setMessage("Please sign in and write your review.");
      return;
    }
    try {
      await apiFetch(
        "/reviews",
        {
          method: userReview ? "PUT" : "POST",
          body: JSON.stringify({
            clientId,
            itemId,
            review: reviewScore,
            description: reviewDesc,
          }),
        },
        user.token
      );
      if (!userReview) {
        setReviewDesc("");
      }
      setMessage(userReview ? "Review updated." : "Review submitted.");
      loadReviews();
    } catch (e) {
      console.error("Failed to submit review", e);
      setMessage(userReview ? "Failed to update review." : "Failed to submit review.");
    }
  };

  return (
    <div>
      <div style={{ padding: "20px 40px" }}>
        <div className="breadcrumb">
          <span onClick={() => setPage("home")}>Home</span> / {" "}
          <span onClick={() => setPage("shop")}>Shop</span> / {item?.title}
        </div>
      </div>
      <div className="detail-layout">
     <div className="detail-img">
  {photos.length > 0 ? (
    <img src={photos[0].imgUrl || photos[0].img} alt={item?.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
  ) : (
    <div style={{ background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", width: "100%", height: "100%" }}>
      📦
    </div>
  )}
</div>
        <div>
          <h1 className="detail-name">{item?.title}</h1>
          <div className="detail-price">{item?.unitPrice?.toFixed(2) || "0.00"} KM</div>
          <p style={{ color: "var(--mid)", marginBottom: 20, lineHeight: 1.7 }}>
            <strong>Category:</strong> {item?.category}
          </p>
          <p style={{ color: "var(--mid)", marginBottom: 20, lineHeight: 1.7 }}>
            <strong>Available Stock:</strong> {item?.quantity || 0}
          </p>
          {item?.quantity === 0 && (
            <div className="alert alert-danger" style={{ marginBottom: 12 }}>
              Out of stock
            </div>
          )}
          <div style={{ fontSize: "0.85rem", color: "var(--mid)", marginBottom: 8 }}>Quantity</div>
          <div className="detail-qty">
            <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} disabled={item?.quantity === 0}>
              −
            </button>
            <span className="qty-val">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(qty + 1)} disabled={item?.quantity === 0 || qty >= item?.quantity}>
              +
            </button>
          </div>
          {added && (
            <div className="alert alert-success" style={{ marginBottom: 12 }}>
              Added to cart!
            </div>
          )}
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleAdd} disabled={item?.quantity === 0}>
            {item?.quantity === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
      <div className="product-feedback">
        <div className="product-feedback-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Reviews</h2>
          </div>
          <div className="average-review">
            <div>
              <div className="average-review-value">
                {averageReview === null ? "-" : averageReview.toFixed(1)}
              </div>
              <div className="average-review-label">Average review</div>
            </div>
            <div className="average-review-count">
              {reviewScores.length} {reviewScores.length === 1 ? "review" : "reviews"}
            </div>
          </div>
          {reviews.length === 0 ? (
            <div className="empty" style={{ padding: 16 }}>
              <div className="empty-icon">⭐</div>
              <p>No reviews yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {reviews.map((review, idx) => (
                <div key={`${review.clientUsername || idx}-${review.itemId}`} style={{ padding: 16, background: "var(--light)", borderRadius: 10 }}>
                  <div style={{ fontWeight: 700 }}>{review.clientUsername || "Customer"}</div>
                  <div style={{ color: "var(--mid)", fontSize: "0.9rem", marginBottom: 8 }}>Rating: {review.review || "-"}</div>
                  <div>{review.description}</div>
                </div>
              ))}
            </div>
          )}
          {user?.role === "CLIENT" && (
            <div className="feedback-form">
              <div style={{ fontWeight: 700 }}>
                {userReview ? "Edit Your Review" : "Leave a Review"}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <label className="form-label" style={{ margin: 0 }}>Score</label>
                <select className="form-select" value={reviewScore} onChange={(e) => setReviewScore(Number(e.target.value))}>
                  {[5, 4, 3, 2, 1].map((score) => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </div>
              <textarea
                className="form-textarea"
                placeholder="Write your review..."
                value={reviewDesc}
                onChange={(e) => setReviewDesc(e.target.value)}
              />
              <button className="btn-primary" onClick={submitReview}>
                {userReview ? "Update Review" : "Submit Review"}
              </button>
            </div>
          )}
        </div>
        <div className="product-feedback-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Comments</h2>
          </div>
          {comments.length === 0 ? (
            <div className="empty" style={{ padding: 16 }}>
              <div className="empty-icon">🗨️</div>
              <p>No comments yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {comments.map((comment) => (
                <div key={comment.idItemComment} style={{ padding: 16, background: "var(--light)", borderRadius: 10 }}>
                  <div style={{ fontWeight: 700 }}>{comment.username}</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--mid)", marginBottom: 8 }}>{comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ""}</div>
                  <div>{comment.content}</div>
                </div>
              ))}
            </div>
          )}
          {user && (
            <div className="feedback-form">
              <textarea
                className="form-textarea"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button className="btn-primary" onClick={submitComment}>
                Add Comment
              </button>
            </div>
          )}
        </div>
        {message && (
          <div className="alert alert-success" style={{ marginTop: 10 }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
