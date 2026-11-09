"use client";

import { Link } from "../nav";
import { useEffect, useState } from "react";
import { money } from "../data";
import { useStore } from "../store";
import ProductCard from "../components/ProductCard";

export default function CartPage() {
  const store = useStore();
  const [secs, setSecs] = useState(58 * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs((n) => (n > 0 ? n - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const best = store.visible.filter((p) => ["femi-coco", "femi-jade", "ruhi-mehr", "ruhi-nur"].includes(p.handle));

  return (
    <div className="wrap page">
      <p className="crumbs"><Link to="/">Home</Link> <span>›</span> Your Cart</p>
      {store.cart.length > 0 && (
        <div className="disclaimer">
          Disclaimer: Do not make any payment to the courier rider for COD orders until you have received the parcel at your doorstep. {mm}:{ss} minutes.
        </div>
      )}
      {store.cart.length === 0 ? (
        <div className="empty-cart">
          <h1>Your cart is empty</h1>
          <Link className="btn" to="/collections/new-arrivals">Continue shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-head"><span>Product</span><span>Price</span><span>Quantity</span><span>Total</span></div>
            {store.cart.map((l) => (
              <div className="cart-row" key={l.handle + l.size}>
                <div className="prod">
                  <img src={l.image} alt="" />
                  <div>
                    <Link to={`/products/${l.handle}`}>{l.title}</Link>
                    <small>{l.size}</small>
                    <small>{l.vendor}</small>
                  </div>
                </div>
                <span>{money(l.price)}</span>
                <div className="qty box">
                  <button onClick={() => store.update(l.handle, l.size, l.qty - 1)} aria-label="Decrease">−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => store.update(l.handle, l.size, l.qty + 1)} aria-label="Increase">+</button>
                </div>
                <span>{money(l.price * l.qty)}</span>
                <button className="x" onClick={() => store.remove(l.handle, l.size)} aria-label="Remove">×</button>
              </div>
            ))}
            <label className="note">Additional Comments
              <textarea value={store.note} onChange={(e) => store.setNote(e.target.value)} placeholder="Special instruction for seller..." />
            </label>
            <p className="secure">Secure Shopping Guarantee</p>
          </div>
          <aside className="summary">
            <h2>Order Summary</h2>
            <p><span>Subtotal</span><b>{money(store.subtotal)}</b></p>
            <label>Coupon Code
              <input value={store.coupon} onChange={(e) => store.setCoupon(e.target.value)} placeholder="Enter Coupon Code" />
            </label>
            <p className="fine">Coupon code will be applied on the checkout page</p>
            <p className="grand"><span>Total:</span><b>{money(store.subtotal)}</b></p>
            <p className="fine">Tax included and shipping calculated at checkout</p>
            <Link className="btn" to="/checkout">Proceed to checkout</Link>
            <Link className="btn ghost" to="/collections/new-arrivals">Continue shopping</Link>
          </aside>
        </div>
      )}
      <section className="related">
        <h2>Best Sellers</h2>
        <div className="grid">
          {best.map((p) => <ProductCard key={p.handle} product={p} />)}
        </div>
      </section>
    </div>
  );
}
