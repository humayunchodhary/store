"use client";

import { Link, useParams } from "../nav";
import { useMemo, useState } from "react";
import { money } from "../data";
import { useStore } from "../store";
import ProductCard from "../components/ProductCard";

export default function Product() {
  const { handle } = useParams();
  const store = useStore();
  const product = store.catalog.find((p) => p.handle === handle);
  const [size, setSize] = useState("XS");
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const [openDesc, setOpenDesc] = useState(false);
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const related = useMemo(() => {
    if (!product) return [];
    return store.visible.filter((p) => p.handle !== product.handle && p.collections.some((c) => product.collections.includes(c))).slice(0, 4);
  }, [product, store.visible]);

  if (!product) {
    return <div className="wrap page"><p>This piece is not in the shop.</p><Link to="/collections/new-arrivals">Continue shopping</Link></div>;
  }

  const url = `${window.location.origin}/products/${product.handle}`;

  return (
    <div className="wrap page">
      <p className="crumbs"><Link to="/">Home</Link> <span>›</span> {product.title}</p>
      <div className="pdp">
        <div className="gallery">
          <div className="stage">
            {product.badge && <span className={product.badge.startsWith("Sale") ? "badge sale" : "badge"}>{product.badge}</span>}
            <button className="nav-arrow left" aria-label="Previous" onClick={() => setPhoto((n) => (n + product.images.length - 1) % product.images.length)}>‹</button>
            <img src={product.images[photo]} alt={product.title} />
            <button className="nav-arrow right" aria-label="Next" onClick={() => setPhoto((n) => (n + 1) % product.images.length)}>›</button>
          </div>
          {product.images.length > 1 && (
            <div className="thumbs">
              {product.images.map((src, i) => (
                <button key={src} className={i === photo ? "on" : ""} onClick={() => setPhoto(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="buy">
          <h1>{product.title}</h1>
          <p className="piece">{product.includes}</p>
          <p className="ptype">Product Type: {product.type}</p>
          <p className="price big">
            {product.compare && <s>{money(product.compare)}</s>}
            <b className={product.compare ? "sale-price" : ""}>{money(product.price)}</b>
          </p>
          {product.stock <= 8 && <p className="low">Only {product.stock} left in stock</p>}
          <p className="size-guide">Size Guide</p>
          <p className="label">Size: {size}</p>
          <div className="sizes">
            {product.sizes.map((s) => (
              <button key={s} className={s === size ? "on" : ""} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
          <p className="label">Quantity:</p>
          <div className="qty box">
            <button onClick={() => setQty((n) => Math.max(1, n - 1))} aria-label={`Decrease quantity for ${product.title}`}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((n) => n + 1)} aria-label={`Increase quantity for ${product.title}`}>+</button>
          </div>
          <div className="buy-row">
            <button className="btn" onClick={() => store.add(product, size, qty)}>Add to cart</button>
            <button className="icon-btn share" aria-label="Share" onClick={() => setShare((v) => !v)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 11l8-4M8 13l8 4" stroke="currentColor" strokeWidth="1.6"/></svg>
            </button>
          </div>
          {share && (
            <div className="share-box">
              <span>Copy link</span>
              <input readOnly value={url} onFocus={(e) => e.target.select()} />
              <button
                className="btn"
                onClick={() => {
                  navigator.clipboard?.writeText(url);
                  setCopied(true);
                }}
              >{copied ? "Copied" : "Copy link"}</button>
            </div>
          )}
          <Link className="btn buy-now" to="/checkout" onClick={() => store.add(product, size, qty, { open: false })}>Buy it now</Link>
          <button className="accordion" onClick={() => setOpenDesc((v) => !v)}>
            Description <span>{openDesc ? "−" : "+"}</span>
          </button>
          {openDesc && <p className="desc">{product.summary || "A cut from the current VARIETY BY HA collection."}</p>}
        </div>
      </div>
      <section className="related">
        <h2>Related Products</h2>
        <div className="grid">
          {related.map((p) => <ProductCard key={p.handle} product={p} />)}
        </div>
      </section>
    </div>
  );
}
