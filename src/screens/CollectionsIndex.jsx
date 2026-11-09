"use client";

import { Link } from "../nav";
import { useStore } from "../store";

export default function CollectionsIndex() {
  const store = useStore();
  const categories = store.categories;
  const blocks = [
    { handle: "luxury-pret", title: "Luxury Pret", image: categories[0]?.image },
    { handle: "everyday", title: "Everyday", image: categories[1]?.image },
    { handle: "evening-wear-tropical-series-24", title: "Tropical Series", image: categories[3]?.image },
  ];
  return (
    <div className="wrap page">
      <p className="crumbs"><Link to="/">Home</Link> <span>›</span> Collections</p>
      <h1>Collections</h1>
      <div className="index-grid">
        {blocks.map((b) => (
          <Link key={b.handle} to={`/collections/${b.handle}`}>
            <img src={b.image} alt="" />
            <h2>{b.title}</h2>
            <p>{store.inCollection(b.handle).length} products</p>
            <span className="btn ghost">Shop now</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
