# Zorvyn Admin

An e-commerce admin dashboard for the [Zorvyn](https://mojumder01.github.io/Zorvyn/) demo store — built with React, TypeScript, Vite and Tailwind CSS.

**Live demo:** https://mojumder01.github.io/zorvyn-admin/ — sign in with the demo account shown on the login page (`admin@zorvyn.demo` / `demo1234`).

> Portfolio demo: there is no server. The data (products, 60 customers and 90 days of orders in ৳) is generated in the browser and every change is saved in that browser only. **Settings → Reset demo data** brings it back. The sign-in is for show, not security.

## Features

- **Dashboard:** revenue, orders, average order and items sold for the last 7 / 30 / 90 days with the change from the previous period; revenue per day chart (hover or arrow keys, table view); orders by status; top products; low-stock alerts; recent orders
- **Orders:** status tabs with counts, search by order ID / customer / phone, pagination, CSV export; order page with items, totals, customer, delivery and payment, a timeline, status actions (confirm → ship → deliver, or cancel with a reason — cancelling puts the items back in stock) and a printable invoice
- **Products:** add, edit, hide/show and delete products with validation, SKU numbering, sale price, sample or uploaded photos (resized in the browser) and stock per size
- **Inventory:** edit stock per size inline, low-stock and out-of-stock highlights, low-stock filter, CSV export
- **Customers:** orders, total spent and last order per customer; customer page with order history
- **Reports:** revenue by month, sales by category, best sellers, top cities and payment methods for a chosen period; product sales CSV
- **Settings:** store details, delivery fees (inside / outside Dhaka), low-stock level, discount codes, reset demo data
- Light and dark mode, responsive layout with a mobile menu, keyboard-friendly dialogs and charts

## Run locally

```bash
npm install
```

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`). One-time setup: **Settings → Pages → Source: GitHub Actions**.

## Project structure

```
src/
  data/        types, demo data generator (seed.ts) and the browser "database" (store.ts)
  lib/         analytics, formatting, hash router, demo sign-in, CSV export, theme
  components/  layout (sidebar, shell), UI pieces and charts
  pages/       one file per screen
```
