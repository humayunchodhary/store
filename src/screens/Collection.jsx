"use client";

import { Link, useParams } from "../nav";
import { useEffect, useMemo, useState } from "react";
import { collections } from "../data";
import { useStore } from "../store";
import ProductCard from "../components/ProductCard";

const SORTS = [
  ["featured", "Featured"],
  ["relevant", "Most relevant"],
  ["best", "Best selling"],
  ["az", "Alphabetically, A-Z"],
  ["za", "Alphabetically, Z-A"],
  ["low", "Price, low to high"],
  ["high", "Price, high to low"],
  ["old", "Date, old to new"],
  ["new", "Date, new to old"],
];
const PER = [10, 15, 20, 25, 30, 50];

export default function Collection() {
  const { handle } = useParams();
  const store = useStore();
  const meta = collections.find((c) => c.handle === handle);
  const title = meta?.title || handle;
  const all = useMemo(() => store.inCollection(handle), [handle, store]);
  const [open, setOpen] = useState(null);
  const [colour, setColour] = useState([]);
  const [includes, setIncludes] = useState([]);
  const [fabric, setFabric] = useState([]);
  const [size, setSize] = useState([]);
  const [express, setExpress] = useState(false);
  const [sort, setSort] = useState("featured");
  const [per, setPer] = useState(50);
  const [shown, setShown] = useState(50);

  useEffect(() => {
    setColour([]);
    setIncludes([]);
    setFabric([]);
    setSize([]);
    setExpress(false);
    setSort("featured");
    setShown(50);
    setPer(50);
  }, [handle]);

  const colours = count(all, "color");
  const pieces = count(all, "includes");
  const fabrics = count(all, "fabric");

  let list = all.filter((p) => {
    if (colour.length && !colour.includes(p.color)) return false;
    if (includes.length && !includes.includes(p.includes)) return false;
    if (fabric.length && !fabric.includes(p.fabric)) return false;
    if (size.length && !size.some((s) => p.sizes.includes(s))) return false;
    if (express && !p.ready) return false;
    return true;
  });
  list = sortList(list, sort);
  const visible = list.slice(0, shown);

  function toggle(list, set, value) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setShown(per);
  }
  function clear() {
    setColour([]); setIncludes([]); setFabric([]); setSize([]); setExpress(false);
  }

  return (
    <div className="wrap page">
      <p className="crumbs"><Link to="/">Home</Link> <span>›</span> {title}</p>
      <div className="filters">
        <span className="filter-label">Filter by</span>
        <Filter name="Colour" open={open} setOpen={setOpen}>
          {colours.map(([name, n]) => (
            <label key={name}><input type="checkbox" checked={colour.includes(name)} onChange={() => toggle(colour, setColour, name)} /> {name} <em>({n})</em></label>
          ))}
        </Filter>
        <Filter name="Inculdes" open={open} setOpen={setOpen}>
          {pieces.map(([name, n]) => (
            <label key={name}><input type="checkbox" checked={includes.includes(name)} onChange={() => toggle(includes, setIncludes, name)} /> {name} <em>({n})</em></label>
          ))}
        </Filter>
        <Filter name="Fabric" open={open} setOpen={setOpen}>
          {fabrics.map(([name, n]) => (
            <label key={name}><input type="checkbox" checked={fabric.includes(name)} onChange={() => toggle(fabric, setFabric, name)} /> {name} <em>({n})</em></label>
          ))}
        </Filter>
        <Filter name="Size" open={open} setOpen={setOpen}>
          {["XS", "S", "M", "L", "XL", "XXL"].map((name) => (
            <label key={name}><input type="checkbox" checked={size.includes(name)} onChange={() => toggle(size, setSize, name)} /> {name}</label>
          ))}
        </Filter>
        <Filter name="Express Shipping" open={open} setOpen={setOpen}>
          <label><input type="checkbox" checked={express} onChange={() => setExpress((v) => !v)} /> Ready to Ship <em>({all.filter((p) => p.ready).length})</em></label>
        </Filter>
        {(colour.length || includes.length || fabric.length || size.length || express) ? <button className="text-link" onClick={clear}>Clear all</button> : null}
      </div>
      <div className="toolbar">
        <span>{list.length} results</span>
        <label>Items per page
          <select value={per} onChange={(e) => { setPer(+e.target.value); setShown(+e.target.value); }}>
            {PER.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label>Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>
      {list.length === 0 ? <p className="empty">No pieces match these filters.</p> : (
        <div className="grid">
          {visible.map((p) => <ProductCard key={p.handle} product={p} />)}
        </div>
      )}
      {shown < list.length && (
        <p className="more"><button className="btn ghost" onClick={() => setShown((n) => n + per)}>Show more</button></p>
      )}
    </div>
  );
}

function Filter({ name, open, setOpen, children }) {
  const on = open === name;
  return (
    <div className={"filter" + (on ? " on" : "")}>
      <button onClick={() => setOpen(on ? null : name)}>{name} <span>{on ? "–" : "+"}</span></button>
      {on && <div className="panel">{children}</div>}
    </div>
  );
}

function count(list, key) {
  const map = new Map();
  list.forEach((p) => map.set(p[key], (map.get(p[key]) || 0) + 1));
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function sortList(list, sort) {
  const arr = [...list];
  if (sort === "az") arr.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "za") arr.sort((a, b) => b.title.localeCompare(a.title));
  if (sort === "low") arr.sort((a, b) => a.price - b.price);
  if (sort === "high") arr.sort((a, b) => b.price - a.price);
  if (sort === "new") arr.reverse();
  if (sort === "best") arr.sort((a, b) => (b.salePct || 0) - (a.salePct || 0));
  return arr;
}
