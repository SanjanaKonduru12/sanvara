# LuminaMart

A full-stack e-commerce web application built with React, Tailwind CSS, Spring Boot, and MySQL.

## What’s included

- User authentication with JWT
- Product listing, search, category filters, mood/occasion shopping
- Cart, checkout, wishlist, order history
- Reviews, ratings, price trend insight, and alerts
- Simple virtual try-on preview using HTML canvas
- Responsive modern UI with Tailwind CSS

## Folder structure

- `backend/`
  - `pom.xml` - Spring Boot backend build configuration
  - `src/main/java/com/luminamart/ecommerce/` - backend source code
    - `config/` - security and CORS configuration
    - `controller/` - REST API controllers
    - `model/` - JPA entities for products, users, orders, alerts, etc.
    - `repository/` - Spring Data JPA repositories
    - `service/` - business logic, auth, data initialization
    - `dto/` - request/response payload definitions
    - `exception/` - centralized API error handling
    - `security/` - JWT utilities and auth filter
  - `src/main/resources/application.yml` - data source, JPA, JWT, and CORS settings

- `frontend/`
  - `package.json` - React + Vite package configuration
  - `src/` - React application source
    - `components/` - reusable UI components
    - `pages/` - page components for routes
    - `services/api.js` - Axios API client with JWT interceptor

## Database schema overview

The backend data model supports:

- `users` - shopper accounts and roles
- `products` - catalog products with mood/occasion tags and try-on metadata
- `categories` - normalized product categories
- `occasions` - mood/occasion tags for personalized shopping
- `price_history` - product pricing timeline for trend analysis
- `price_alerts` - user-defined price drop alerts
- `cart_items` - saved cart items per user
- `wishlist_items` - user wishlists
- `customer_orders` - completed orders with shipping and payment details
- `order_items` - order-level product snapshots
- `reviews` - user ratings and comments per product

## API endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`

### Products
- `GET /api/home`
- `GET /api/categories`
- `GET /api/occasions`
- `GET /api/products`
- `GET /api/products/{id}`
- `GET /api/recommendations?occasionId={id}`

### Shopper features
- `GET /api/shop/cart`
- `POST /api/shop/cart`
- `PATCH /api/shop/cart/{itemId}`
- `DELETE /api/shop/cart/{itemId}`
- `POST /api/shop/checkout`
- `GET /api/shop/orders`
- `POST /api/shop/reviews/{productId}`
- `GET /api/shop/wishlist`
- `POST /api/shop/wishlist?productId={id}`
- `DELETE /api/shop/wishlist/{productId}`
- `GET /api/shop/alerts`
- `POST /api/shop/alerts`
- `PATCH /api/shop/alerts/{alertId}?enabled={true|false}`
- `GET /api/shop/dashboard`

## Run locally

### Backend

The backend can run locally without MySQL. It falls back to a local H2 database and seeds demo catalog data automatically.

Run:

```bash
cd backend
mvn spring-boot:run
```

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run the app:

```bash
npm run dev
```

The frontend runs on Vite locally and calls the API configured by `VITE_API_BASE_URL`.

## Deploy on Render with Aiven MySQL

This repo includes `render.yaml` for a Render backend web service and frontend static site.

### Backend environment variables

Set these in the Render backend service:

```env
SPRING_PROFILES_ACTIVE=prod
PORT=8080
MYSQLHOST=mysql-acdf045-sanvara.l.aivencloud.com
MYSQLPORT=10406
MYSQLDATABASE=defaultdb
MYSQLUSER=avnadmin
MYSQLPASSWORD=your_aiven_password
MYSQL_SSL_MODE=REQUIRED
APP_SEED_ENABLED=true
APP_JWT_SECRET=generate_a_long_random_secret
APP_CORS_ALLOWED_ORIGINS=https://luminamart-frontend.onrender.com
```

If your Render frontend URL is different, replace `APP_CORS_ALLOWED_ORIGINS` with the exact frontend URL. Multiple origins must be comma-separated.

### Frontend environment variables

Set this in the Render frontend static site:

```env
VITE_API_BASE_URL=https://luminamart-backend.onrender.com
```

If your Render backend URL is different, replace the value with the exact backend URL.

### Important security note

Do not commit real database passwords or JWT secrets. Keep them only in Render/Aiven environment variable dashboards.

## Notes

- Update `APP_CORS_ALLOWED_ORIGINS` if the frontend runs on a different host.
- The backend bootstraps demo categories, moods, and sample products on first startup.
