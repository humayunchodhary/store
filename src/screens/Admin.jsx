"use client";

import { Link, NavLink, useParams } from "../nav";
import { useMemo, useState } from "react";
import { categories as baseCategories, money, slides as baseSlides } from "../data";
import { useStore } from "../store";

function when(ts) {
  return new Date(ts).toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PAY = {
  card: "Debit / Credit Card",
  easypaisa: "Easypaisa",
  jazzcash: "JazzCash",
  payfast: "PAYFAST",
};

function Shell({ children }) {
  const store = useStore();
  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/admin" className="admin-brand">VARIETY BY HA</Link>
        <p className="admin-kicker">Admin</p>
        <NavLink end to="/admin">Dashboard</NavLink>
        <NavLink to="/admin/products">Products</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
        <NavLink to="/admin/homepage">Homepage</NavLink>
        <NavLink to="/admin/payments">Payments</NavLink>
        <div className="admin-side-foot">
          <Link to="/">View shop</Link>
          <button type="button" onClick={store.signOutAdmin}>Sign out</button>
        </div>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}

function Login() {
  const store = useStore();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="admin-login">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!store.signInAdmin(code)) setErr("That passcode does not open the portal.");
        }}
      >
        <p className="logo">VARIETY BY HA</p>
        <h1>Admin</h1>
        <p>This portal stays in this browser. Homepage, product, and receiving-account edits show on the shop.</p>
        <label>
          Passcode
          <input type="password" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Passcode" autoFocus />
        </label>
        <button className="btn" type="submit">Enter</button>
        {err ? <p className="low">{err}</p> : null}
        <p className="fine">Passcode ha-admin</p>
        <Link to="/">Back to the shop</Link>
      </form>
    </div>
  );
}

function Dash() {
  const store = useStore();
  const low = store.catalog.filter((p) => Number(p.stock) <= 5 && !p.hidden);
  const revenue = store.orders.filter((o) => o.status !== "Cancelled").reduce((n, o) => n + Number(o.total), 0);
  const hidden = store.catalog.filter((p) => p.hidden).length;
  return (
    <Shell>
      <div className="admin-top"><h1>Dashboard</h1></div>
      <div className="stats">
        <div className="stat"><span>Products</span><b>{store.catalog.length}</b></div>
        <div className="stat"><span>Low stock</span><b>{low.length}</b></div>
        <div className="stat"><span>Orders</span><b>{store.orders.length}</b></div>
        <div className="stat"><span>Sales</span><b>{money(revenue)}</b></div>
        <div className="stat"><span>Average order</span><b>{money(store.orders.filter((o) => o.status !== "Cancelled").length ? revenue / store.orders.filter((o) => o.status !== "Cancelled").length : 0)}</b></div>
      </div>
      <Reports />
      <p className="fine">{hidden} hidden from the shop.</p>
      <div className="admin-split">
        <section>
          <h2>Low stock</h2>
          {low.length === 0 ? <p>Nothing is at 5 or below.</p> : (
            <table>
              <thead><tr><th>Product</th><th>Stock</th></tr></thead>
              <tbody>
                {low.slice(0, 8).map((p) => (
                  <tr key={p.handle}>
                    <td><Link to={`/admin/products/${p.handle}`}>{p.title}</Link></td>
                    <td>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section>
          <h2>Latest orders</h2>
          {store.orders.length === 0 ? <p>No preview orders yet. Pay now on checkout adds one here.</p> : (
            <table>
              <thead><tr><th>Order</th><th>When</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {store.orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/admin/orders/${o.id}`}>{o.id}</Link></td>
                    <td>{when(o.createdAt)} PKT</td>
                    <td>{money(o.total)}</td>
                    <td>{o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </Shell>
  );
}

function Products() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("all");
  const list = useMemo(() => {
    return store.catalog.filter((p) => {
      if (only === "low" && Number(p.stock) > 5) return false;
      if (only === "hidden" && !p.hidden) return false;
      if (only === "sale" && !p.compare) return false;
      const hay = `${p.title} ${p.type} ${p.handle}`.toLowerCase();
      return !q || hay.includes(q.trim().toLowerCase());
    });
  }, [store.catalog, q, only]);

  return (
    <Shell>
      <div className="admin-top">
        <h1>Products</h1>
        <span>{list.length}</span>
      </div>
      <div className="admin-tools">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
        <select value={only} onChange={(e) => setOnly(e.target.value)} aria-label="Filter products">
          <option value="all">All</option>
          <option value="low">Low stock</option>
          <option value="sale">On sale</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      <table>
        <thead>
          <tr><th></th><th>Product</th><th>Type</th><th>Price</th><th>Stock</th><th></th></tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.handle}>
              <td><img src={p.images[0]} alt="" /></td>
              <td>
                <Link to={`/admin/products/${p.handle}`}>{p.title}</Link>
                {p.hidden ? <small> Hidden</small> : null}
              </td>
              <td>{p.type}</td>
              <td>
                {money(p.price)}
                {p.compare ? <small> {money(p.compare)}</small> : null}
              </td>
              <td>{p.stock}</td>
              <td><Link to={`/products/${p.handle}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}

function ProductForm({ product, onSave, onReset }) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(String(product.price));
  const [compare, setCompare] = useState(product.compare ? String(product.compare) : "");
  const [stock, setStock] = useState(String(product.stock));
  const [badge, setBadge] = useState(product.badge || "");
  const [ready, setReady] = useState(!!product.ready);
  const [hidden, setHidden] = useState(!!product.hidden);

  return (
    <form
      className="admin-form"
      onSubmit={(e) => {
        e.preventDefault();
        const nextPrice = Math.max(0, Math.round(Number(price) || 0));
        const nextCompare = compare.trim() === "" ? null : Math.max(0, Math.round(Number(compare) || 0));
        onSave({
          title: title.trim() || product.title,
          price: nextPrice,
          compare: nextCompare,
          stock: Math.max(0, Math.round(Number(stock) || 0)),
          badge: badge.trim(),
          ready,
          hidden,
        });
      }}
    >
      <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <div className="split">
        <label>Price (Rs)<input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label>Compare at<input inputMode="numeric" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="Empty if not on sale" /></label>
      </div>
      <div className="split">
        <label>Stock<input inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} /></label>
        <label>Badge<input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="New, Sale 40%" /></label>
      </div>
      <label className="check"><input type="checkbox" checked={ready} onChange={(e) => setReady(e.target.checked)} /> Ready to ship</label>
      <label className="check"><input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} /> Hide from the shop</label>
      <div className="admin-actions">
        <button className="btn" type="submit">Save</button>
        <button className="btn ghost" type="button" onClick={onReset}>Restore original</button>
        <Link to={`/products/${product.handle}`}>View on shop</Link>
      </div>
    </form>
  );
}

function ProductEdit() {
  const { handle } = useParams();
  const store = useStore();
  const product = store.catalog.find((p) => p.handle === handle);
  const [msg, setMsg] = useState("");
  if (!product) {
    return <Shell><p>This product is not in the catalog.</p><Link to="/admin/products">Back to products</Link></Shell>;
  }
  const stamp = [product.title, product.price, product.compare, product.stock, product.badge, product.ready, product.hidden].join("|");
  return (
    <Shell>
      <div className="admin-top">
        <h1>{product.title}</h1>
        <Link to="/admin/products">All products</Link>
      </div>
      {msg ? <p className="saved">{msg}</p> : null}
      <ProductForm
        key={stamp}
        product={product}
        onSave={(patch) => {
          store.saveProduct(product.handle, patch);
          setMsg("Saved. The shop uses this now.");
        }}
        onReset={() => {
          store.resetProduct(product.handle);
          setMsg("Restored to the original catalog.");
        }}
      />
    </Shell>
  );
}

function Orders() {
  const store = useStore();
  return (
    <Shell>
      <div className="admin-top">
        <h1>Orders</h1>
        <span>{store.orders.length}</span>
      </div>
      {store.orders.length === 0 ? (
        <p>No preview orders yet. A Pay now on checkout lands here. No payment is taken.</p>
      ) : (
        <table>
          <thead>
            <tr><th>Order</th><th>When</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {store.orders.map((o) => (
              <tr key={o.id}>
                <td><Link to={`/admin/orders/${o.id}`}>{o.id}</Link></td>
                <td>{when(o.createdAt)} PKT</td>
                <td>{o.name || o.email || "Guest"}</td>
                <td>{o.lines.reduce((n, l) => n + Number(l.qty), 0)}</td>
                <td>{money(o.total)}</td>
                <td>{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Shell>
  );
}

function OrderDetail() {
  const { id } = useParams();
  const store = useStore();
  const order = store.orders.find((o) => o.id === id);
  if (!order) {
    return <Shell><p>That order is not in this browser.</p><Link to="/admin/orders">Back to orders</Link></Shell>;
  }
  const address = [order.address, order.city, order.country].filter(Boolean).join(", ");
  return (
    <Shell>
      <div className="admin-top">
        <h1>{order.id}</h1>
        <Link to="/admin/orders">All orders</Link>
      </div>
      <p className="fine">{when(order.createdAt)} PKT · {PAY[order.pay] || order.pay}{order.ref ? ` · Transaction ${order.ref}` : ""}{order.payTo ? ` · ${order.payTo}` : ""}</p>
      <div className="admin-actions">
        {["Awaiting confirmation", "Paid", "Packed", "Fulfilled", "Cancelled"].map((status) => (
          <button
            key={status}
            type="button"
            className={order.status === status ? "btn" : "btn ghost"}
            onClick={() => store.setOrderStatus(order.id, status)}
          >
            {status}
          </button>
        ))}
      </div>
      <div className="admin-split">
        <section>
          <h2>Items</h2>
          <table>
            <tbody>
              {order.lines.map((l) => (
                <tr key={l.handle + l.size}>
                  <td>{l.title} · {l.size}</td>
                  <td>{l.qty}</td>
                  <td>{money(l.price * l.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="grand"><span>Total</span> <b>{money(order.total)}</b></p>
          {order.coupon ? <p>Coupon note: {order.coupon}</p> : null}
          {order.note ? <p>Note: {order.note}</p> : null}
        </section>
        <section>
          <h2>Customer</h2>
          <p>{order.name || "Guest"}</p>
          <p>{order.email}</p>
          <p>{order.phone}</p>
          <p>{address || "No address entered"}</p>
        </section>
      </div>
    </Shell>
  );
}

const CHART = ["#6b1d32", "#8e2438", "#c47a88", "#4c1424", "#a35a68", "#d7b4bc"];

function piePaths(slices) {
  const total = slices.reduce((n, s) => n + s.value, 0) || 1;
  let angle = -Math.PI / 2;
  return slices.map((s) => {
    const sweep = (s.value / total) * Math.PI * 2;
    const a0 = angle;
    angle += sweep;
    const cx = 90;
    const cy = 90;
    const r = 70;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const d = sweep > Math.PI * 1.999 ? "" : `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    return { ...s, d, full: sweep > Math.PI * 1.999 };
  });
}

function Pie({ title, slices, empty }) {
  const drawn = piePaths(slices);
  return (
    <section className="chart-card">
      <h2>{title}</h2>
      {slices.length === 0 ? <p>{empty}</p> : (
        <div className="chart-row">
          <svg viewBox="0 0 180 180" width="168" height="168" role="img" aria-label={title}>
            {drawn.map((s) => s.full ? <circle key={s.label} cx="90" cy="90" r="70" fill={s.color} /> : <path key={s.label} d={s.d} fill={s.color} />)}
            <circle cx="90" cy="90" r="38" fill="#fff" />
          </svg>
          <ul className="legend">
            {slices.map((s) => (
              <li key={s.label}><i style={{ background: s.color }} /> {s.label} <b>{s.display || s.value}</b></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Reports() {
  const store = useStore();
  const live = store.orders.filter((o) => o.status !== "Cancelled");
  const byPay = {};
  live.forEach((o) => {
    const key = PAY[o.pay] || o.pay || "Other";
    byPay[key] = (byPay[key] || 0) + Number(o.total);
  });
  const paySlices = Object.entries(byPay).map(([label, value], i) => ({ label, value, display: money(value), color: CHART[i % CHART.length] }));

  const byStatus = {};
  store.orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
  const statusSlices = Object.entries(byStatus).map(([label, value], i) => ({ label, value, color: CHART[i % CHART.length] }));

  const byType = {};
  store.catalog.forEach((p) => { byType[p.type || "Other"] = (byType[p.type || "Other"] || 0) + 1; });
  const typeSlices = Object.entries(byType).map(([label, value], i) => ({ label, value, color: CHART[i % CHART.length] }));

  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
    const label = d.toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short" });
    const total = live.filter((o) => new Date(o.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }) === key).reduce((n, o) => n + Number(o.total), 0);
    return { label, total };
  });
  const maxDay = Math.max(1, ...days.map((d) => d.total));

  const products = {};
  live.forEach((o) => o.lines.forEach((l) => {
    products[l.title] = (products[l.title] || 0) + l.price * l.qty;
  }));
  const top = Object.entries(products).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTop = Math.max(1, ...top.map(([, n]) => n));

  return (
    <div className="report-grid">
      <section className="chart-card wide">
        <h2>Sales over time</h2>
        <div className="bars" aria-label="Sales for the last 7 days">
          {days.map((d) => (
            <div key={d.label}>
              <span style={{ height: `${Math.max(4, (d.total / maxDay) * 120)}px` }} title={money(d.total)} />
              <small>{d.label}</small>
            </div>
          ))}
        </div>
      </section>
      <Pie title="Sales by payment method" slices={paySlices} empty="Orders will split this chart by card, Easypaisa, and JazzCash." />
      <Pie title="Orders by status" slices={statusSlices} empty="No orders yet." />
      <section className="chart-card">
        <h2>Top products</h2>
        {top.length === 0 ? <p>Top products appear after the first order.</p> : top.map(([title, value]) => (
          <div className="hbar" key={title}>
            <span>{title}</span>
            <i><b style={{ width: `${(value / maxTop) * 100}%` }} /></i>
            <small>{money(value)}</small>
          </div>
        ))}
      </section>
      <Pie title="Catalog by type" slices={typeSlices} empty="No products." />
    </div>
  );
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function Homepage() {
  const store = useStore();
  const [slides, setSlides] = useState(() => store.slides.map((s) => ({ ...s })));
  const [cats, setCats] = useState(() => store.categories.map((c) => ({ ...c })));
  const [msg, setMsg] = useState("");

  async function put(file, apply) {
    try {
      apply(await readImage(file));
    } catch {
      setMsg("That file could not be used. Paste an image link instead.");
    }
  }

  return (
    <Shell>
      <div className="admin-top">
        <h1>Homepage</h1>
        <button
          className="btn"
          type="button"
          onClick={async () => {
            await store.saveSlides(slides);
            await store.saveCategories(cats);
            setMsg("Saved. The shop homepage uses these images.");
          }}
        >
          Save homepage
        </button>
      </div>
      {store.homeError ? <p className="low">{store.homeError}</p> : null}
      {msg ? <p className="saved">{msg}</p> : null}
      <h2>Hero</h2>
      <div className="media-grid">
        {slides.map((s, i) => (
          <section key={i} className="chart-card">
            <img src={s.image} alt="" />
            <label>Desktop image link<input value={String(s.image).startsWith("data:") ? "" : s.image} placeholder={String(s.image).startsWith("data:") ? "Uploaded image" : ""} onChange={(e) => setSlides((list) => list.map((item, n) => n === i ? { ...item, image: e.target.value } : item))} /></label>
            <label>Mobile image link<input value={String(s.mobile).startsWith("data:") ? "" : s.mobile} placeholder={String(s.mobile).startsWith("data:") ? "Uploaded image" : ""} onChange={(e) => setSlides((list) => list.map((item, n) => n === i ? { ...item, mobile: e.target.value } : item))} /></label>
            <label>Link<input value={s.href} onChange={(e) => setSlides((list) => list.map((item, n) => n === i ? { ...item, href: e.target.value } : item))} /></label>
            <label>Upload<input type="file" accept="image/*" aria-label={`Hero ${i + 1} image`} onChange={(e) => e.target.files?.[0] && put(e.target.files[0], (url) => setSlides((list) => list.map((item, n) => n === i ? { ...item, image: url, mobile: url } : item)))} /></label>
          </section>
        ))}
      </div>
      <h2>Category circles</h2>
      <div className="media-grid">
        {cats.map((c, i) => (
          <section key={c.href + i} className="chart-card">
            <img className="round" src={c.image} alt="" />
            <label>Title<input value={c.title} onChange={(e) => setCats((list) => list.map((item, n) => n === i ? { ...item, title: e.target.value } : item))} /></label>
            <label>Image link<input value={String(c.image).startsWith("data:") ? "" : c.image} placeholder={String(c.image).startsWith("data:") ? "Uploaded image" : ""} onChange={(e) => setCats((list) => list.map((item, n) => n === i ? { ...item, image: e.target.value } : item))} /></label>
            <label>Link<input value={c.href} onChange={(e) => setCats((list) => list.map((item, n) => n === i ? { ...item, href: e.target.value } : item))} /></label>
            <label>Upload<input type="file" accept="image/*" aria-label={`${c.title} image`} onChange={(e) => e.target.files?.[0] && put(e.target.files[0], (url) => setCats((list) => list.map((item, n) => n === i ? { ...item, image: url } : item)))} /></label>
          </section>
        ))}
      </div>
      <button
        className="btn ghost"
        type="button"
        onClick={() => {
          store.resetHome();
          setSlides(baseSlides.map((s) => ({ ...s })));
          setCats(baseCategories.map((c) => ({ ...c })));
          setMsg("Restored the original homepage.");
        }}
      >
        Restore original images
      </button>
    </Shell>
  );
}

function Payments() {
  const store = useStore();
  const [form, setForm] = useState({
    easypaisa: { name: "", number: "", ...store.accounts.easypaisa },
    jazzcash: { name: "", number: "", ...store.accounts.jazzcash },
    bank: { title: "", bank: "", iban: "", ...store.accounts.bank },
  });
  const [msg, setMsg] = useState("");
  function setField(group, field, value) {
    setForm((f) => ({ ...f, [group]: { ...f[group], [field]: value } }));
  }
  return (
    <Shell>
      <div className="admin-top"><h1>Payments</h1></div>
      <p>These are the owner accounts a shopper pays. Checkout shows the matching account and asks for the transaction ID. Card numbers and wallet PINs are not collected.</p>
      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          store.saveAccounts(form);
          setMsg("Saved. Checkout uses these accounts.");
        }}
      >
        <h2>Easypaisa</h2>
        <label>Account name<input value={form.easypaisa.name} onChange={(e) => setField("easypaisa", "name", e.target.value)} aria-label="Easypaisa account name" /></label>
        <label>Mobile number<input value={form.easypaisa.number} onChange={(e) => setField("easypaisa", "number", e.target.value)} aria-label="Easypaisa number" placeholder="03xx xxxxxxx" /></label>
        <h2>JazzCash</h2>
        <label>Account name<input value={form.jazzcash.name} onChange={(e) => setField("jazzcash", "name", e.target.value)} aria-label="JazzCash account name" /></label>
        <label>Mobile number<input value={form.jazzcash.number} onChange={(e) => setField("jazzcash", "number", e.target.value)} aria-label="JazzCash number" placeholder="03xx xxxxxxx" /></label>
        <h2>Card and bank</h2>
        <label>Account title<input value={form.bank.title} onChange={(e) => setField("bank", "title", e.target.value)} aria-label="Bank account title" /></label>
        <label>Bank<input value={form.bank.bank} onChange={(e) => setField("bank", "bank", e.target.value)} aria-label="Bank name" /></label>
        <label>IBAN or account number<input value={form.bank.iban} onChange={(e) => setField("bank", "iban", e.target.value)} aria-label="IBAN" /></label>
        <button className="btn" type="submit">Save accounts</button>
        {msg ? <p className="saved">{msg}</p> : null}
      </form>
    </Shell>
  );
}

export function AdminScreen({ view }) {
  const store = useStore();
  if (!store.admin) return <Login />;
  if (view === "products") return <Products />;
  if (view === "product") return <ProductEdit />;
  if (view === "orders") return <Orders />;
  if (view === "order") return <OrderDetail />;
  if (view === "homepage") return <Homepage />;
  if (view === "payments") return <Payments />;
  return <Dash />;
}
