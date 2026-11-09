"use client";

import { Link } from "../nav";
import { useEffect, useState } from "react";
import { featuredTabs, promos } from "../data";
import { useStore } from "../store";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const store = useStore();
  const slides = store.slides;
  const categories = store.categories;
  const [slide, setSlide] = useState(0);
  const [tab, setTab] = useState(featuredTabs[0].handle);

  useEffect(() => {
    const t = setInterval(() => setSlide((n) => (n + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);
  const featured = store.inCollection(tab).slice(0, 4);

  return (
    <>
      <section className="hero" aria-label="Promotions">
        {slides.map((s, i) => (
          <Link key={s.href + i} to={s.href} className={i === slide ? "on" : ""} aria-hidden={i !== slide}>
            <picture>
              <source media="(max-width: 750px)" srcSet={s.mobile} />
              <img src={s.image} alt="" />
            </picture>
          </Link>
        ))}
        <div className="dots">
          {slides.map((_, i) => (
            <button key={i} className={i === slide ? "on" : ""} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} />
          ))}
        </div>
      </section>

      <section className="wrap cats">
        <h2>Shop by Category</h2>
        <div className="cat-row">
          {categories.map((c) => (
            <Link key={c.title} to={c.href}>
              <img src={c.image} alt="" />
              <span>{c.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap promos">
        {promos.map((p) => (
          <Link key={p.href} to={p.href}>
            <img src={p.image} alt={p.alt} />
          </Link>
        ))}
      </section>

      <section className="wrap featured">
        <h2>Featured Collections</h2>
        <div className="tabs" role="tablist">
          {featuredTabs.map((t) => (
            <button key={t.handle} role="tab" aria-selected={tab === t.handle} className={tab === t.handle ? "on" : ""} onClick={() => setTab(t.handle)}>
              {t.title}
            </button>
          ))}
        </div>
        <div className="grid">
          {featured.map((p) => <ProductCard key={p.handle} product={p} />)}
        </div>
      </section>

      <section className="follow">
        <a className="btn ghost" href="https://www.instagram.com/armas_clothing/" target="_blank" rel="noreferrer">Follow @varietybyha</a>
      </section>
    </>
  );
}
