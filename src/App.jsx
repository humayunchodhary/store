import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Chrome from "./components/Chrome";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import Product from "./pages/Product";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import SearchPage from "./pages/SearchPage";
import StaticPage from "./pages/StaticPage";
import CollectionsIndex from "./pages/CollectionsIndex";
import Admin from "./pages/Admin";

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Chrome>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<CollectionsIndex />} />
          <Route path="/collections/:handle" element={<Collection />} />
          <Route path="/products/:handle" element={<Product />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pages/:handle" element={<StaticPage />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </Chrome>
    </>
  );
}
