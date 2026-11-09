"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const emptyAccounts = {
  easypaisa: { name: "", number: "" },
  jazzcash: { name: "", number: "" },
  bank: { title: "", bank: "", iban: "" },
};

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error("Shop request failed");
  return res.json();
}

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [shopError, setShopError] = useState("");
  const [cart, setCart] = useState([]);
  const [stored, setStored] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [popup, setPopup] = useState(false);
  const [user, setUser] = useState("");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState([]);
  const [admin, setAdmin] = useState(false);
  const [accounts, setAccounts] = useState(emptyAccounts);
  const [home, setHome] = useState({});
  const homeRef = useRef({});
  const homeWrite = useRef(Promise.resolve());
  const [defaults, setDefaults] = useState({ slides: [], categories: [] });
  const [homeError, setHomeError] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("armas-cart") || "[]").map((line) => ({
        ...line,
        vendor: "VARIETY BY HA",
      }));
      setCart(saved);
    } catch {
      setCart([]);
    }
    setUser(localStorage.getItem("armas-user") || "");
    setStored(true);
  }, []);

  useEffect(() => {
    if (!stored) return;
    localStorage.setItem("armas-cart", JSON.stringify(cart));
  }, [cart, stored]);

  useEffect(() => {
    if (!stored || !user) return;
    localStorage.setItem("armas-user", user);
  }, [user, stored]);

  useEffect(() => {
    setAdmin(sessionStorage.getItem("vha-admin") === "1");
    api("/api/shop")
      .then((data) => {
        setCatalog(data.products || []);
        setOrders(data.orders || []);
        setAccounts({ ...emptyAccounts, ...(data.accounts || {}) });
        const nextHome = data.home || {};
        homeRef.current = nextHome;
        setHome(nextHome);
        setDefaults({ slides: data.baseSlides || [], categories: data.baseCategories || [] });
        setReady(true);
      })
      .catch(() => {
        setShopError("The shop API is not running.");
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!ready || shopError || sessionStorage.getItem("armas-popup")) return;
    const t = setTimeout(() => setPopup(true), 800);
    return () => clearTimeout(t);
  }, [ready, shopError]);

  function add(product, size = "XS", qty = 1, { open = true } = {}) {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.handle === product.handle && l.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [
        ...prev,
        {
          handle: product.handle,
          title: product.title,
          image: product.images[0],
          price: product.price,
          size,
          qty,
          vendor: product.vendor,
        },
      ];
    });
    if (open) setDrawer(true);
  }

  function update(handle, size, qty) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.handle === handle && l.size === size))
        : prev.map((l) => (l.handle === handle && l.size === size ? { ...l, qty } : l))
    );
  }

  function remove(handle, size) {
    setCart((prev) => prev.filter((l) => !(l.handle === handle && l.size === size)));
  }

  const count = cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = cart.reduce((n, l) => n + l.price * l.qty, 0);
  const visible = useMemo(() => catalog.filter((p) => !p.hidden), [catalog]);
  const slides = home.slides || defaults.slides;
  const categories = home.categories || defaults.categories;

  async function saveProduct(handle, patch) {
    setCatalog((prev) => prev.map((p) => (p.handle === handle ? { ...p, ...patch } : p)));
    const saved = await api(`/api/products/${encodeURIComponent(handle)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    setCatalog((prev) => prev.map((p) => (p.handle === handle ? saved : p)));
  }

  async function resetProduct(handle) {
    const saved = await api(`/api/products/${encodeURIComponent(handle)}`, { method: "DELETE" });
    setCatalog((prev) => prev.map((p) => (p.handle === handle ? saved : p)));
  }

  function inCollection(handle) {
    return visible.filter((p) => p.collections.includes(handle));
  }

  async function placeOrder(order) {
    const data = await api("/api/orders", { method: "POST", body: JSON.stringify(order) });
    setOrders(data.orders);
    setCatalog(data.products);
    return data.order;
  }

  async function setOrderStatus(id, status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const saved = await api(`/api/orders/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? saved : o)));
  }

  async function saveAccounts(next) {
    setAccounts(next);
    const saved = await api("/api/accounts", { method: "PUT", body: JSON.stringify(next) });
    setAccounts(saved);
  }

  function commitHome(next) {
    homeRef.current = next;
    setHome(next);
    homeWrite.current = homeWrite.current
      .catch(() => {})
      .then(async () => {
        try {
          await api("/api/home", { method: "PUT", body: JSON.stringify(homeRef.current) });
          setHomeError("");
        } catch {
          setHomeError("That image is too large to save. Use a link instead.");
        }
      });
    return homeWrite.current;
  }

  function saveSlides(nextSlides) {
    return commitHome({ ...homeRef.current, slides: nextSlides });
  }

  function saveCategories(nextCategories) {
    return commitHome({ ...homeRef.current, categories: nextCategories });
  }

  function resetHome() {
    homeRef.current = {};
    setHome({});
    homeWrite.current = homeWrite.current
      .catch(() => {})
      .then(async () => {
        try {
          await api("/api/home", { method: "DELETE" });
          setHomeError("");
        } catch {
          setHomeError("The homepage could not be restored.");
        }
      });
    return homeWrite.current;
  }

  function signInAdmin(code) {
    if (String(code).trim().toLowerCase() !== "ha-admin") return false;
    sessionStorage.setItem("vha-admin", "1");
    setAdmin(true);
    return true;
  }

  function signOutAdmin() {
    sessionStorage.removeItem("vha-admin");
    setAdmin(false);
  }

  return (
    <Ctx.Provider
      value={{
        ready,
        shopError,
        cart,
        add,
        update,
        remove,
        count,
        subtotal,
        drawer,
        setDrawer,
        searchOpen,
        setSearchOpen,
        menuOpen,
        setMenuOpen,
        accountOpen,
        setAccountOpen,
        popup,
        setPopup,
        user,
        setUser,
        note,
        setNote,
        coupon,
        setCoupon,
        catalog,
        visible,
        saveProduct,
        resetProduct,
        inCollection,
        orders,
        placeOrder,
        setOrderStatus,
        admin,
        signInAdmin,
        signOutAdmin,
        accounts,
        saveAccounts,
        slides,
        categories,
        saveSlides,
        saveCategories,
        resetHome,
        homeError,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  return useContext(Ctx);
}
