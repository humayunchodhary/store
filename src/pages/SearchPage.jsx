"use client";

import { Link, useSearchParams } from "../nav";
import { useStore } from "../store";
import ProductCard from "../components/ProductCard";

export default function SearchPage() {
  const store = useStore();
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim().toLowerCase();
  const list = store.visible.filter((p) => !q || `${p.title} ${p.summary} ${p.type} ${p.color}`.toLowerCase().includes(q));
  return (
    <div className="wrap page">
      <p className="crumbs"><Link to="/">Home</Link> <span>›</span> Search</p>
      <h1 className="search-title">{list.length} results found for “{q || "all"}”</h1>
      <div className="grid">
        {list.map((p) => <ProductCard key={p.handle} product={p} />)}
      </div>
    </div>
  );
}
