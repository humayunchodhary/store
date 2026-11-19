import json
import threading
import time
from copy import deepcopy
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).parent / "data"
CATALOG = json.loads((ROOT / "catalog.json").read_text())


def choose_state_path():
    probe = ROOT / ".write-probe"
    try:
        probe.write_text("")
        probe.unlink(missing_ok=True)
        return ROOT / "state.json"
    except OSError:
        return Path("/tmp/vha-state.json")


STATE_PATH = choose_state_path()
LOCK = threading.Lock()

EMPTY_ACCOUNTS = {
    "easypaisa": {"name": "", "number": ""},
    "jazzcash": {"name": "", "number": ""},
    "bank": {"title": "", "bank": "", "iban": ""},
}
STATUSES = {"Awaiting confirmation", "Paid", "Packed", "Fulfilled", "Cancelled"}
PRODUCT_FIELDS = {"title", "price", "compare", "stock", "badge", "ready", "hidden", "type", "images", "summary", "collections", "sizes", "color", "fabric", "includes"}
DEFAULT_SETTINGS = {
    "facebook": "https://www.facebook.com/armas.clothing",
    "instagram": "https://instagram.com/armas_clothing",
    "pinterest": "https://www.pinterest.com/Armasclothing/",
    "tiktok": "https://www.tiktok.com/@armasclothing",
    "youtube": "https://www.youtube.com/@armas_clothing",
    "whatsapp": "923104644418",
    "visa": "VISA", "mastercard": "Mastercard",
    "easypaisaLabel": "Easypaisa", "jazzcashLabel": "JazzCash",
}



def load_state():
    if not STATE_PATH.exists():
        return {"overrides": {}, "addedProducts": [], "orders": [], "accounts": deepcopy(EMPTY_ACCOUNTS), "home": {}, "settings": deepcopy(DEFAULT_SETTINGS)}
    data = json.loads(STATE_PATH.read_text())
    accounts = deepcopy(EMPTY_ACCOUNTS)
    for key, value in (data.get("accounts") or {}).items():
        if key in accounts and isinstance(value, dict):
            for field in accounts[key]:
                if field in value:
                    accounts[key][field] = value[field]
    return {
        "overrides": data.get("overrides") or {},
        "addedProducts": data.get("addedProducts") or [],
        "settings": {**DEFAULT_SETTINGS, **(data.get("settings") or {})},
        "orders": data.get("orders") or [],
        "accounts": accounts,
        "home": data.get("home") or {},
    }


def save_state(state):
    STATE_PATH.write_text(json.dumps(state))


def merged_products(state):
    merged = []
    for product in [*CATALOG["products"], *state.get("addedProducts", [])]:
        patch = state["overrides"].get(product["handle"]) or {}
        merged.append({**product, **patch})
    return merged


def snapshot(state):
    home = state["home"] or {}
    return {
        "products": merged_products(state),
        "orders": state["orders"],
        "accounts": state["accounts"],
        "settings": state["settings"],
        "home": home,
        "slides": home.get("slides") or CATALOG["slides"],
        "categories": home.get("categories") or CATALOG["categories"],
        "baseSlides": CATALOG["slides"],
        "baseCategories": CATALOG["categories"],
    }


def find_product(handle, state=None):
    items = [*CATALOG["products"], *((state or {}).get("addedProducts") or [])]
    return next((product for product in items if product["handle"] == handle), None)


def normalize_product(body, existing=None):
    from urllib.parse import urlparse
    from re import fullmatch
    data = dict(existing or {})
    data.update({key: value for key, value in body.items() if key in PRODUCT_FIELDS or key == "handle"})
    handle = str(data.get("handle") or "").strip()
    if not fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", handle):
        raise HTTPException(400, "Handle must contain lowercase letters, digits and hyphens")
    title = str(data.get("title") or "").strip()
    if not title:
        raise HTTPException(400, "Product title required")
    try:
        price = int(data.get("price") or 0)
        stock = int(data.get("stock") or 0)
        compare = int(data["compare"]) if data.get("compare") not in (None, "") else None
    except (ValueError, TypeError):
        raise HTTPException(400, "Prices and stock must be numbers")
    if price < 0 or stock < 0 or (compare is not None and compare <= price):
        raise HTTPException(400, "Compare-at price must exceed sale price; all amounts must be nonnegative")
    images = data.get("images") or []
    if not isinstance(images, list) or not images or not all(isinstance(url, str) and urlparse(url).scheme in ("http", "https") and urlparse(url).netloc for url in images):
        raise HTTPException(400, "At least one valid image URL is required")
    for field in ("collections", "sizes"):
        if not isinstance(data.get(field), list):
            raise HTTPException(400, f"{field} must be a list")
    return {
        **data, "handle": handle, "title": title, "price": price, "stock": stock,
        "compare": compare, "images": images, "vendor": "VARIETY BY HA",
        "badge": str(data.get("badge") or ""), "hidden": bool(data.get("hidden", False)),
        "ready": bool(data.get("ready", False)),
    }


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/shop")
def shop():
    with LOCK:
        return snapshot(load_state())


@app.patch("/api/products/{handle}")
def patch_product(handle: str, patch: dict):
    with LOCK:
        state = load_state()
        base = find_product(handle, state)
        if not base:
            raise HTTPException(404, "Unknown product")
        current = dict(state["overrides"].get(handle) or {})
        for key, value in patch.items():
            if key in PRODUCT_FIELDS:
                current[key] = value
        validated = normalize_product({**base, **current})
        state["overrides"][handle] = {key: validated[key] for key in PRODUCT_FIELDS if key in current}
        save_state(state)
        return validated


@app.delete("/api/products/{handle}")
def reset_product(handle: str):
    with LOCK:
        state = load_state()
        base = find_product(handle)
        if not base:
            raise HTTPException(404, "Unknown product")
        state["overrides"].pop(handle, None)
        save_state(state)
        return base


@app.post("/api/products")
def create_product(body: dict):
    with LOCK:
        state = load_state()
        data = normalize_product({
            "type": "Pret", "images": [], "summary": "",
            "collections": ["new-arrivals"], "sizes": ["XS", "S", "M", "L", "XL"],
            "stock": 0, "ready": False, "hidden": False, "vendor": "VARIETY BY HA",
            **body,
        })
        if find_product(data["handle"], state):
            raise HTTPException(409, "Product handle already exists")
        state["addedProducts"].append(data)
        save_state(state)
        return data


@app.delete("/api/products/{handle}/created")
def delete_created_product(handle: str):
    with LOCK:
        state = load_state()
        before = len(state["addedProducts"])
        state["addedProducts"] = [p for p in state["addedProducts"] if p["handle"] != handle]
        if len(state["addedProducts"]) == before:
            raise HTTPException(404, "Only newly created products can be deleted")
        state["overrides"].pop(handle, None)
        save_state(state)
        return {"deleted": handle}


@app.put("/api/settings")
def save_settings(body: dict):
    from urllib.parse import urlparse
    with LOCK:
        state = load_state()
        next_settings = dict(state["settings"])
        for key, value in body.items():
            if key not in DEFAULT_SETTINGS or not isinstance(value, str):
                continue
            val = value.strip()
            if key in ("facebook", "instagram", "pinterest", "tiktok", "youtube") and val:
                parsed = urlparse(val)
                if parsed.scheme != "https" or not parsed.netloc:
                    raise HTTPException(400, "Social links must use https://")
            if key == "whatsapp":
                from re import fullmatch
                val = val.replace("+", "").replace(" ", "").replace("-", "")
                if val and not fullmatch(r"[0-9]{8,15}", val):
                    raise HTTPException(400, "WhatsApp number must include country code, digits only")
            next_settings[key] = val
        state["settings"] = next_settings
        save_state(state)
        return next_settings


@app.post("/api/orders")
def create_order(order: dict):
    with LOCK:
        state = load_state()
        catalog = {product["handle"]: product for product in merged_products(state)}
        lines = []
        for line in order.get("lines") or []:
            product = catalog.get(line.get("handle"))
            if not product:
                continue
            qty = max(1, int(line.get("qty") or 1))
            current = dict(state["overrides"].get(product["handle"]) or {})
            stock = current.get("stock", product["stock"])
            current["stock"] = max(0, int(stock) - qty)
            state["overrides"][product["handle"]] = current
            lines.append(
                {
                    "handle": product["handle"],
                    "title": line.get("title") or product["title"],
                    "image": line.get("image") or (product.get("images") or [None])[0],
                    "price": int(line.get("price") if line.get("price") is not None else product["price"]),
                    "size": line.get("size") or "",
                    "qty": qty,
                    "vendor": "VARIETY BY HA",
                }
            )
        saved = {
            "id": "VH-" + str(1042 + len(state["orders"])),
            "status": "Awaiting confirmation",
            "createdAt": int(time.time() * 1000),
            "email": order.get("email") or "",
            "name": order.get("name") or "",
            "phone": order.get("phone") or "",
            "city": order.get("city") or "",
            "address": order.get("address") or "",
            "country": order.get("country") or "",
            "pay": order.get("pay") or "",
            "ref": order.get("ref") or "",
            "payTo": order.get("payTo") or "",
            "note": order.get("note") or "",
            "coupon": order.get("coupon") or "",
            "total": int(order.get("total") or sum(line["price"] * line["qty"] for line in lines)),
            "lines": lines,
        }
        state["orders"].insert(0, saved)
        save_state(state)
        return {"order": saved, "products": merged_products(state), "orders": state["orders"]}


@app.patch("/api/orders/{order_id}")
def set_status(order_id: str, body: dict):
    with LOCK:
        state = load_state()
        status = body.get("status")
        if status not in STATUSES:
            raise HTTPException(400, "Unknown status")
        found = None
        for current in state["orders"]:
            if current["id"] == order_id:
                current["status"] = status
                found = current
        if not found:
            raise HTTPException(404, "Unknown order")
        save_state(state)
        return found


@app.put("/api/accounts")
def save_accounts(body: dict):
    with LOCK:
        state = load_state()
        accounts = deepcopy(EMPTY_ACCOUNTS)
        for key in accounts:
            incoming = body.get(key) or {}
            if isinstance(incoming, dict):
                for field in accounts[key]:
                    accounts[key][field] = str(incoming.get(field) or "")
        state["accounts"] = accounts
        save_state(state)
        return accounts


@app.put("/api/home")
def save_home(body: dict):
    with LOCK:
        state = load_state()
        home = dict(state["home"] or {})
        if "slides" in body:
            home["slides"] = body["slides"]
        if "categories" in body:
            home["categories"] = body["categories"]
        state["home"] = home
        save_state(state)
        return home


@app.delete("/api/home")
def reset_home():
    with LOCK:
        state = load_state()
        state["home"] = {}
        save_state(state)
        return {}
