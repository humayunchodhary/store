# Admin store controls — deployment notes

The storefront can now read editable social URLs, WhatsApp number, payment-method display labels and newly created or edited products from the shop API.

## Pages
- `/admin/settings`: social links, WhatsApp number, payment badge display labels.
- `/admin/payments`: the existing receiving-account information (bank/IBAN, Easypaisa, JazzCash).
- `/admin/products`: products, search, sale filtering, edit links.
- `/admin/products/new`: add a product with a unique URL handle, at least one externally hosted image URL, sizes and collection handles.
- `/admin/products/[handle]`: edit listing details, compare-at (original) price, sale price, stock, visibility and badges.

**Payment labels only change visual text. They do not configure Visa/Mastercard processing, accept card numbers, or create a payment gateway.**

## Before production deployment — required

1. **Admin access**: The existing admin passcode is stored in frontend code, and mutating API routes currently lack server-side authorization. Replace it with server-validated sessions and protect all product/settings/order/account/home mutations before using the admin portal on a public store.
2. **Persistent storage**: Current FastAPI state is a JSON file. On hosted serverless platforms such as Vercel, local or `/tmp` writes are not durable across deployments/instances. Move product edits, settings, accounts and orders to a hosted database or persistent storage service before relying on them.
3. **Review and test**: Run `npm run build`, launch the FastAPI service, and verify create/edit/restore, sale display, WhatsApp links, footer changes and checkout.
4. **Image hosting**: This version accepts hosted HTTPS image URLs, not product image file uploads. For uploaded assets, add object storage and authenticated upload endpoints.

This feature branch is intentionally separate from the previous responsive-layout PR.
