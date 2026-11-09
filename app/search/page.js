import { Suspense } from "react";
import SearchPage from "../../src/pages/SearchPage";

export default function Page() {
  return (
    <Suspense fallback={<p className="wrap page">Loading search…</p>}>
      <SearchPage />
    </Suspense>
  );
}
