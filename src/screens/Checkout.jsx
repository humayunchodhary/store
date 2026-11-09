"use client";

import { Link } from "../nav";
import { useState } from "react";
import { money } from "../data";
import { useStore } from "../store";

const METHODS = [
  ["card", "Debit / Credit Card", "VISA · MC · AMEX"],
  ["easypaisa", "Easypaisa", "Mobile account"],
  ["jazzcash", "JazzCash", "Mobile account"],
  ["payfast", "PAYFAST", "Card · Wallet · Bank"],
];

const PAY_LABEL = Object.fromEntries(METHODS.map(([id, label]) => [id, label]));

function receiverFor(pay, accounts) {
  if (pay === "easypaisa" && accounts.easypaisa?.number) {
    return { title: "Easypaisa", name: accounts.easypaisa.name, number: accounts.easypaisa.number, line: `Easypaisa ${accounts.easypaisa.number}` };
  }
  if (pay === "jazzcash" && accounts.jazzcash?.number) {
    return { title: "JazzCash", name: accounts.jazzcash.name, number: accounts.jazzcash.number, line: `JazzCash ${accounts.jazzcash.number}` };
  }
  if ((pay === "card" || pay === "payfast") && accounts.bank?.iban) {
    return { title: accounts.bank.bank || "Bank account", name: accounts.bank.title, number: accounts.bank.iban, line: `${accounts.bank.bank} ${accounts.bank.iban}` };
  }
  return null;
}

export default function Checkout() {
  const store = useStore();
  const [done, setDone] = useState(false);
  const [pay, setPay] = useState("card");
  const [refId, setRefId] = useState("");
  const [form, setForm] = useState({
    email: store.user || "",
    news: true,
    country: "Pakistan",
    first: "",
    last: "",
    address: "",
    city: "",
    phone: "",
  });

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  if (store.cart.length === 0 && !done) {
    return (
      <div className="checkout empty-check">
        <p><Link to="/" className="logo">VARIETY BY HA</Link></p>
        <h1>Your cart is empty</h1>
        <Link to="/collections/new-arrivals">Continue shopping</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="checkout thanks">
        <h1>Thank you</h1>
        <p>Order noted for {PAY_LABEL[pay] || pay}. The shop will match transaction {refId || "—"} on the owner account before it is marked paid.</p>
        <Link className="btn" to="/" onClick={() => store.cart.forEach((l) => store.remove(l.handle, l.size))}>Back to the shop</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <header>
        <Link to="/" className="logo">VARIETY BY HA</Link>
        <Link to="/cart" aria-label="Cart">Bag</Link>
      </header>
      <div className="check-grid">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const receiver = receiverFor(pay, store.accounts);
            const saved = await store.placeOrder({
              email: form.email,
              name: [form.first, form.last].filter(Boolean).join(" "),
              phone: form.phone,
              city: form.city,
              address: form.address,
              country: form.country,
              pay,
              ref: refId.trim(),
              payTo: receiver ? receiver.line : "",
              lines: store.cart,
              total: store.subtotal,
              note: store.note,
              coupon: store.coupon,
            });
            if (saved) setDone(true);
          }}
        >
          <h2>Contact</h2>
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} aria-label="Email" />
          <label className="check"><input type="checkbox" checked={form.news} onChange={(e) => set("news", e.target.checked)} /> Email me with news and offers</label>
          <h2>Delivery</h2>
          <label>Country/Region
            <select value={form.country} onChange={(e) => set("country", e.target.value)}>
              {["Pakistan", "United States", "United Kingdom", "United Arab Emirates", "Canada", "Australia"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <div className="split">
            <input placeholder="First name (optional)" value={form.first} onChange={(e) => set("first", e.target.value)} aria-label="First name" />
            <input required placeholder="Last name" value={form.last} onChange={(e) => set("last", e.target.value)} aria-label="Last name" />
          </div>
          <input required placeholder="Address" value={form.address} onChange={(e) => set("address", e.target.value)} aria-label="Address" />
          <div className="split">
            <input required placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} aria-label="City" />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-label="Phone" />
          </div>
          <h2>Shipping method</h2>
          <p className="ship-note">
            {form.address ? (form.country === "Pakistan" ? "Prepaid delivery across Pakistan — free on this preview. COD available on delivery." : "International shipping is calculated after the address is confirmed.") : "Enter your shipping address to view available shipping methods."}
          </p>
          <h2>Payment</h2>
          <p className="fine">Send {money(store.subtotal)} to the shop account, then enter the transaction ID. Your card number and wallet PIN are not collected.</p>
          {METHODS.map(([id, label, mark]) => {
            const receiver = receiverFor(id, store.accounts);
            return (
              <div key={id} className="pay-block">
                <label className={"pay-opt" + (pay === id ? " on" : "")}>
                  <input type="radio" name="pay" checked={pay === id} onChange={() => setPay(id)} />
                  <span>{label}</span>
                  <span className="marks">{mark}</span>
                </label>
                {pay === id && (
                  <div className="card-fields">
                    {receiver ? (
                      <>
                        <p>Pay <b>{money(store.subtotal)}</b> to this {receiver.title} account, then paste the transaction ID.</p>
                        <p className="receiver"><b>{receiver.name || "Account"}</b><span>{receiver.number}</span></p>
                        <input required value={refId} onChange={(e) => setRefId(e.target.value)} placeholder="Transaction ID" aria-label="Transaction ID" />
                      </>
                    ) : (
                      <p>This receiving account is not set yet. Add it in Admin, under Payments.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <button className="btn buy-now" type="submit" disabled={!receiverFor(pay, store.accounts)}>Pay now {money(store.subtotal)}</button>
          <p><Link to="/pages/terms-conditions">Terms and policies</Link></p>
        </form>
        <aside>
          {store.cart.map((l) => (
            <div className="sum-line" key={l.handle + l.size}>
              <img src={l.image} alt="" />
              <span className="bubble">{l.qty}</span>
              <div><b>{l.title}</b><small>{l.size}</small></div>
              <b>{money(l.price * l.qty)}</b>
            </div>
          ))}
          <div className="split coupon">
            <input value={store.coupon} onChange={(e) => store.setCoupon(e.target.value)} placeholder="Discount code" aria-label="Discount code" />
            <button type="button" className="btn ghost">Apply</button>
          </div>
          <p><span>Subtotal</span><b>{money(store.subtotal)}</b></p>
          <p><span>Shipping</span><span>{form.address ? "Free" : "Enter shipping address"}</span></p>
          <p className="grand"><span>Total</span><b>PKR {money(store.subtotal)}</b></p>
        </aside>
      </div>
    </div>
  );
}
