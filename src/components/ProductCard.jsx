"use client";

import { Link } from "../nav";
import { money } from "../data";

export default function ProductCard({ product }) {
  const hover = product.images[1] || product.images[0];
  return (
    <article className="card">
      <Link to={`/products/${product.handle}`} className="shot">
        {product.badge && <span className={product.badge.startsWith("Sale") ? "badge sale" : "badge"}>{product.badge}</span>}
        <img src={product.images[0]} alt={product.title} />
        {hover && <img className="hover" src={hover} alt="" />}
      </Link>
      <h3><Link to={`/products/${product.handle}`}>{product.title}</Link></h3>
      <p className="price">
        {product.compare ? (
          <>
            <s>{money(product.compare)}</s>
            <b className="sale-price">{money(product.price)}</b>
          </>
        ) : (
          <b>{money(product.price)}</b>
        )}
      </p>
    </article>
  );
}
