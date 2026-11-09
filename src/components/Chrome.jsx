"use client";

import { Link, NavLink, useLocation, useNavigate } from "../nav";
import { useEffect, useState } from "react";
import { collections, money, nav } from "../data";
import { useStore } from "../store";

function childrenOf(handle) {
  return collections.find((c) => c.handle === handle)?.children || [];
}

export default function Chrome({ children }) {
  const store = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [news, setNews] = useState("");
  const [newsMsg, setNewsMsg] = useState("");
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    document.body.style.overflow = store.drawer || store.searchOpen || store.menuOpen || store.accountOpen ? "hidden" : "";
  }, [store.drawer, store.searchOpen, store.menuOpen, store.accountOpen]);

  if (pathname.startsWith("/checkout") || pathname.startsWith("/admin")) return <div className="site bare">{children}</div>;

  function closePopup() {
    sessionStorage.setItem("armas-popup", "1");
    store.setPopup(false);
  }

  function onSearch(e) {
    e.preventDefault();
    store.setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const popular = store.visible.filter((p) => p.collections.includes("new-arrivals")).slice(0, 4);

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>
      <div className="announce">FREE SHIPPING ON ALL PREPAID ORDERS WITHIN PAKISTAN</div>
      <header className="header">
        <div className="header-inner">
          <button className="icon-btn burger" aria-label="Menu" onClick={() => store.setMenuOpen(true)}>
            <span /><span /><span />
          </button>
          <Link to="/" className="logo" aria-label="VARIETY BY HA">VARIETY BY HA</Link>
          <nav className="desk-nav" aria-label="Primary">
            {nav.map((item) => {
              const kids = childrenOf(item.handle).map((h) => collections.find((c) => c.handle === h)).filter(Boolean);
              return (
                <div
                  className="nav-item"
                  key={item.handle}
                  onMouseEnter={() => setOpenMenu(item.handle)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <NavLink to={`/collections/${item.handle}`}>{item.title}</NavLink>
                  {kids.length > 0 && openMenu === item.handle && (
                    <div className="dropdown">
                      <Link to={`/collections/${item.handle}`}>Go to {item.title}</Link>
                      {kids.map((k) => (
                        <Link key={k.handle} to={`/collections/${k.handle}`}>{k.title}</Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="header-tools">
            <button className="icon-btn" aria-label="Search" onClick={() => store.setSearchOpen(true)}>
              <SearchIcon />
            </button>
            <button className="icon-btn" aria-label="Log in" onClick={() => store.setAccountOpen(true)}>
              <UserIcon />
            </button>
            <Link to="/cart" className="icon-btn cart-link" aria-label={`Cart ${store.count} items`}>
              <BagIcon />
              <span className="count">{store.count}</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h2>Support</h2>
            <Link to="/pages/return-exchange-policy">Return/Exchange Policy</Link>
            <a href="https://form.jotform.com/armasclothing/exchange-request-form" target="_blank" rel="noreferrer">Raise a Return/Exchange Request</a>
            <Link to="/pages/international-shipping-policy">International Shipping Policy</Link>
            <Link to="/pages/terms-conditions">Terms & Conditions</Link>
            <Link to="/pages/privacy-policy">Privacy Policy</Link>
            <Link to="/pages/general-payment-order-policies">General Payment & Order Policies</Link>
          </div>
          <div>
            <h2>Contact Us</h2>
            <Link to="/search">Search</Link>
            <Link to="/pages/contact-us">Contact Us</Link>
            <Link to="/pages/about-us">About VARIETY BY HA</Link>
            <Link to="/admin">Admin</Link>
          </div>
          <div>
            <h2>About Us</h2>
            <p>30 KM Multan Road,<br />Lahore<br />Phone: (042)111-276-271<br />E-mail: info@varietybyha.com</p>
            <div className="socials">
              <a href="https://www.facebook.com/armas.clothing" aria-label="Facebook" target="_blank" rel="noreferrer">f</a>
              <a href="https://instagram.com/armas_clothing" aria-label="Instagram" target="_blank" rel="noreferrer">◎</a>
              <a href="https://www.pinterest.com/Armasclothing/" aria-label="Pinterest" target="_blank" rel="noreferrer">p</a>
              <a href="https://www.tiktok.com/@armasclothing" aria-label="TikTok" target="_blank" rel="noreferrer">♪</a>
              <a href="https://www.youtube.com/@armas_clothing" aria-label="YouTube" target="_blank" rel="noreferrer">▶</a>
            </div>
          </div>
          <div>
            <h2>Newsletter Sign Up</h2>
            <p>Sign up for exclusive updates, new arrivals & insider only discounts</p>
            <form
              className="news"
              onSubmit={(e) => {
                e.preventDefault();
                if (!news.includes("@")) return;
                setNewsMsg("Thanks for subscribing!");
                setNews("");
              }}
            >
              <input value={news} onChange={(e) => setNews(e.target.value)} type="email" required placeholder="Enter your email address" aria-label="Email" />
              <button type="submit">Submit</button>
            </form>
            {newsMsg && <p className="ok">{newsMsg}</p>}
          </div>
        </div>
        <div className="paymarks" aria-label="Payment methods">
          <span>Payment methods</span>
          <b className="visa">VISA</b>
          <b className="mc">Mastercard</b>
          <b className="ep">Easypaisa</b>
          <b className="jc">JazzCash</b>
        </div>
      </footer>

      <a className="wa" href="https://wa.me/923104644418" target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="#fff" d="M19.1 17.4c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8 8 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.4.2-.4a1.7 1.7 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.5 4 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.6-.3z"/><path fill="#fff" d="M16.1 3A13 13 0 0 0 4.7 20.4L3 29l8.8-1.6A13 13 0 1 0 16.1 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-5.2 1 1-5.1-.3-.4A10.6 10.6 0 1 1 16.1 26.6z"/></svg>
      </a>
      <button className="float-left" aria-label="Shopping cart" onClick={() => store.setDrawer(true)}>
        <BagIcon />
      </button>

      {store.menuOpen && (
        <div className="overlay" onClick={() => store.setMenuOpen(false)}>
          <aside className="drawer left" onClick={(e) => e.stopPropagation()}>
            <header><b>Menu</b><button onClick={() => store.setMenuOpen(false)} aria-label="Close">×</button></header>
            <div className="drawer-body">
              {nav.map((item) => (
                <div key={item.handle} className="m-block">
                  <Link to={`/collections/${item.handle}`} onClick={() => store.setMenuOpen(false)}>{item.title}</Link>
                  {childrenOf(item.handle).map((h) => {
                    const c = collections.find((x) => x.handle === h);
                    return c ? <Link key={h} className="sub" to={`/collections/${h}`} onClick={() => store.setMenuOpen(false)}>{c.title}</Link> : null;
                  })}
                </div>
              ))}
              <button className="text-link" onClick={() => { store.setMenuOpen(false); store.setAccountOpen(true); }}>Log in</button>
            </div>
          </aside>
        </div>
      )}

      {store.searchOpen && (
        <div className="overlay dark" onClick={() => store.setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={onSearch}>
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search" />
              <button type="submit" aria-label="Search"><SearchIcon /></button>
              <button type="button" aria-label="Close" onClick={() => store.setSearchOpen(false)}>×</button>
            </form>
            <h3>Popular Products</h3>
            <div className="mini-grid">
              {popular.map((p) => (
                <Link key={p.handle} to={`/products/${p.handle}`} onClick={() => store.setSearchOpen(false)}>
                  <img src={p.images[0]} alt="" />
                  <span>{p.title}</span>
                  <b>{money(p.price)}</b>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {store.accountOpen && (
        <div className="overlay" onClick={() => store.setAccountOpen(false)}>
          <aside className="drawer right account" onClick={(e) => e.stopPropagation()}>
            <header><b>{store.user ? "Account" : "Login"}</b><button onClick={() => store.setAccountOpen(false)} aria-label="Close">×</button></header>
            <div className="drawer-body">
              {store.user ? (
                <>
                  <p>Signed in as {store.user}</p>
                  <button className="btn ghost" onClick={() => { localStorage.removeItem("armas-user"); store.setUser(""); }}>Log out</button>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    localStorage.setItem("armas-user", email);
                    store.setUser(email);
                    store.setAccountOpen(false);
                  }}
                >
                  <label>Email Address *<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
                  <label>Password *<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
                  <button className="btn" type="submit">Sign in</button>
                  <p className="fine">Forgot your password? Create account uses the same form. This preview keeps the sign-in on this device only.</p>
                </form>
              )}
            </div>
          </aside>
        </div>
      )}

      {store.drawer && (
        <div className="overlay" onClick={() => store.setDrawer(false)}>
          <aside className="drawer right cart-drawer" onClick={(e) => e.stopPropagation()}>
            <header>
              <b>Shopping Cart</b>
              <button onClick={() => store.setDrawer(false)} aria-label="Close">×</button>
            </header>
            <p className="fine pad">{store.count} items</p>
            <div className="drawer-body">
              {store.cart.length === 0 && <p>Your cart is empty</p>}
              {store.cart.map((l) => (
                <div className="line" key={l.handle + l.size}>
                  <img src={l.image} alt="" />
                  <div>
                    <Link to={`/products/${l.handle}`} onClick={() => store.setDrawer(false)}>{l.title}</Link>
                    <small>{l.size}</small>
                    <b>{money(l.price)}</b>
                    <div className="qty">
                      <button onClick={() => store.update(l.handle, l.size, l.qty - 1)} aria-label="Decrease">−</button>
                      <span>{l.qty}</span>
                      <button onClick={() => store.update(l.handle, l.size, l.qty + 1)} aria-label="Increase">+</button>
                    </div>
                  </div>
                  <button className="x" onClick={() => store.remove(l.handle, l.size)} aria-label="Remove">×</button>
                </div>
              ))}
              {store.cart.length > 0 && (
                <>
                  <h3 className="also">You May Also Like</h3>
                  <Link className="also-card" to="/products/femi-jade" onClick={() => store.setDrawer(false)}>
                    <img src={store.catalog.find((p) => p.handle === "femi-jade")?.images[0]} alt="" />
                    <span>Femi Jade<br />{money(9995)}<br /><u>Details</u></span>
                  </Link>
                  <div className="totals">
                    <span>Subtotal:</span><b>{money(store.subtotal)}</b>
                    <span>Total:</span><b>{money(store.subtotal)}</b>
                  </div>
                  <p className="fine">Tax included and shipping calculated at checkout</p>
                  <Link className="btn" to="/checkout" onClick={() => store.setDrawer(false)}>Checkout</Link>
                  <Link className="btn ghost" to="/cart" onClick={() => store.setDrawer(false)}>View cart</Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {store.popup && (
        <div className="overlay dark" onClick={closePopup}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="x abs" onClick={closePopup} aria-label="Close">×</button>
            <p className="eyebrow">Discover New Addition to VARIETY BY HA</p>
            <h3>Explore the Latest Arrivals!</h3>
            <p>Unveil a world of style and sophistication. Shop now and redefine your wardrobe</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                closePopup();
              }}
            >
              <input required type="email" placeholder="Your email" aria-label="Email" />
              <button className="btn" type="submit">Submit</button>
            </form>
            <button className="text-link" onClick={closePopup}>No, thanks</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" /><path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}
