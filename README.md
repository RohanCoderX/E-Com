# E-Commerce Application

Amazon-like e-commerce application built with AWS CDK, featuring:

## Features
- 5 sample products (MacBook, iPhone, Nike shoes, Sony headphones, Levi's jeans)
- Shopping cart functionality
- Order placement system
- Responsive web interface
- REST API backend

## Architecture
- **Frontend**: Static website hosted on S3
- **Backend**: Lambda functions with API Gateway
- **Database**: DynamoDB for products and orders
- **API**: RESTful endpoints for products and orders

## Deployment
```bash
npm install
npm run build
cdk deploy
```

## Products Included
1. Wireless Mouse - ₹89
2. Phone Case - ₹45
3. Canvas Shoes - ₹75
4. Bluetooth Earbuds - ₹95
5. Cotton T-Shirt - ₹35

## API Endpoints
- `GET /products` - List all products
- `POST /products` - Add new product
- `POST /orders` - Place order
- `GET /orders` - List orders

The system automatically initializes with sample products on first load.# E-Com
