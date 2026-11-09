"use client";

import Chrome from "./components/Chrome";
import { StoreProvider, useStore } from "./store";

function Frame({ children }) {
  const store = useStore();
  if (!store.ready) return <p className="wrap page">Loading the shop…</p>;
  if (store.shopError) return <p className="wrap page">{store.shopError}</p>;
  return <Chrome>{children}</Chrome>;
}

export function Providers({ children }) {
  return (
    <StoreProvider>
      <Frame>{children}</Frame>
    </StoreProvider>
  );
}
