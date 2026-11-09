"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useParams as nextParams, useSearchParams as nextSearch } from "next/navigation";

export function Link({ to, href, ...props }) {
  return <NextLink href={href || to || "/"} {...props} />;
}

export function NavLink({ to, href, end, className, ...props }) {
  const path = usePathname() || "/";
  const dest = href || to || "/";
  const active = end ? path === dest : path === dest || path.startsWith(`${dest}/`);
  const cls =
    typeof className === "function"
      ? className({ isActive: active })
      : [className, active ? "active" : ""].filter(Boolean).join(" ");
  return <NextLink href={dest} className={cls} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return (to) => router.push(to);
}

export function useLocation() {
  return { pathname: usePathname() || "/" };
}

export function useParams() {
  return nextParams() || {};
}

export function useSearchParams() {
  return [nextSearch()];
}
