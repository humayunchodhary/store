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
PRODUCT_FIELDS = {"title", "price", "compare", "stock", "badge", "ready", "hidden"}


def load_state():
    if not STATE_PATH.exists():
        return {"overrides": {}, "orders": [], "accounts": deepcopy(EMPTY_ACCOUNTS), "home": {}}
    data = json.loads(STATE_PATH.read_text())
    accounts = deepcopy(EMPTY_ACCOUNTS)
    for key, value in (data.get("accounts") or {}).items():
        if key in accounts and isinstance(value, dict):
            for field in accounts[key]:
                if field in value:
                    accounts[key][field] = value[field]
    return {
        "overrides": data.get("overrides") or {},
        "orders": data.get("orders") or [],
        "accounts": accounts,
        "home": data.get("home") or {},
    }


def save_state(state):
    STATE_PATH.write_text(json.dumps(state))


def merged_products(state):
    merged = []
    for product in CATALOG["products"]:
        patch = state["overrides"].get(product["handle"]) or {}
        merged.append({**product, **patch})
    return merged


def snapshot(state):
    home = state["home"] or {}
    return {
        "products": merged_products(state),
        "orders": state["orders"],
        "accounts": state["accounts"],
        "home": home,
        "slides": home.get("slides") or CATALOG["slides"],
        "categories": home.get("categories") or CATALOG["categories"],
        "baseSlides": CATALOG["slides"],
        "baseCategories": CATALOG["categories"],
    }


def find_product(handle):
    return next((product for product in CATALOG["products"] if product["handle"] == handle), None)


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
        base = find_product(handle)
        if not base:
            raise HTTPException(404, "Unknown product")
        current = dict(state["overrides"].get(handle) or {})
        for key, value in patch.items():
            if key in PRODUCT_FIELDS:
                current[key] = value
        state["overrides"][handle] = current
        save_state(state)
        return {**base, **current}


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
