# Pure Honey BD

A responsive, bilingual honey storefront built with HTML, CSS and vanilla JavaScript.

## Run locally

Open `index.html` in a modern browser. No build step or dependencies are required. The font link uses Google Fonts; system fonts are used if the service is unavailable.

## Features

- Bangla by default, with an instant Bangla / English switch that remembers the selection in `localStorage`.
- Responsive product collection, FAQ, reviews, brand story and newsletter form.
- Interactive shopping basket with quantity controls, subtotal and a demo checkout form.
- Local SVG illustrations that can be replaced while keeping their filenames.

## Replace the images

All artwork is referenced from `images/`. Replace an image with another image at the same path and filename to update the storefront. Product artwork is in `images/products/`, the hero artwork is in `images/hero/`, the logo is in `images/logo/`, and the story artwork is in `images/lifestyle/`.

The other requested folders (`honey`, `flowers`, `honeycomb`, `bees`, `packaging`, `gallery` and `banners`) are ready for future assets.

## Order handling

Checkout and newsletter submissions are front-end demonstrations. They validate required fields and show confirmation messages, but do not transmit data or create real orders. Connect a trusted backend before accepting customer orders.
