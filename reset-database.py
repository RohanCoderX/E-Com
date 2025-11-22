import boto3
import json
import random

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
products_table = dynamodb.Table('products')
orders_table = dynamodb.Table('ecommerce-orders')

# New products data (₹100-500 range, stock 25-50)
new_products = [
    {"productId": "1", "name": "Wireless Bluetooth Headphones", "price": 299, "description": "High-quality wireless headphones with noise cancellation", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "stock": random.randint(25, 50)},
    {"productId": "2", "name": "Smart Fitness Tracker", "price": 199, "description": "Track your health and fitness with this smart wearable device", "image": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400", "stock": random.randint(25, 50)},
    {"productId": "3", "name": "Portable Power Bank", "price": 149, "description": "10000mAh portable charger for all your devices", "image": "https://images.unsplash.com/photo-1609592806596-4b8e1b5e8b5e?w=400", "stock": random.randint(25, 50)},
    {"productId": "4", "name": "Wireless Gaming Mouse", "price": 179, "description": "Precision gaming mouse with RGB lighting", "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", "stock": random.randint(25, 50)},
    {"productId": "5", "name": "USB-C Hub", "price": 129, "description": "Multi-port USB-C hub with HDMI and USB 3.0", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", "stock": random.randint(25, 50)},
    {"productId": "6", "name": "Bluetooth Speaker", "price": 249, "description": "Waterproof portable speaker with excellent sound quality", "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", "stock": random.randint(25, 50)},
    {"productId": "7", "name": "Smartphone Stand", "price": 99, "description": "Adjustable phone stand for desk and bedside", "image": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400", "stock": random.randint(25, 50)},
    {"productId": "8", "name": "Wireless Charger Pad", "price": 159, "description": "Fast wireless charging pad for smartphones", "image": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400", "stock": random.randint(25, 50)},
    {"productId": "9", "name": "LED Desk Lamp", "price": 189, "description": "Adjustable LED lamp with touch controls", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", "stock": random.randint(25, 50)},
    {"productId": "10", "name": "Mechanical Keyboard", "price": 399, "description": "RGB mechanical keyboard for gaming and typing", "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400", "stock": random.randint(25, 50)},
    {"productId": "11", "name": "Webcam HD", "price": 219, "description": "1080p HD webcam for video calls and streaming", "image": "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400", "stock": random.randint(25, 50)},
    {"productId": "12", "name": "Phone Case", "price": 119, "description": "Protective case with card holder", "image": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400", "stock": random.randint(25, 50)},
    {"productId": "13", "name": "Tablet Stand", "price": 139, "description": "Adjustable stand for tablets and e-readers", "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "stock": random.randint(25, 50)},
    {"productId": "14", "name": "Car Phone Mount", "price": 109, "description": "Secure phone mount for car dashboard", "image": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400", "stock": random.randint(25, 50)},
    {"productId": "15", "name": "Smart Watch Band", "price": 89, "description": "Replacement band for smart watches", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "stock": random.randint(25, 50)}
]

def clear_tables():
    """Clear all existing data"""
    print("Clearing existing data...")
    
    # Clear products
    try:
        response = products_table.scan()
        for item in response['Items']:
            products_table.delete_item(Key={'productId': item['productId']})
        print("Products table cleared")
    except Exception as e:
        print(f"Error clearing products: {e}")
    
    # Clear orders
    try:
        response = orders_table.scan()
        for item in response['Items']:
            orders_table.delete_item(Key={'orderId': item['orderId']})
        print("Orders table cleared")
    except Exception as e:
        print(f"Error clearing orders: {e}")

def add_products():
    """Add new products"""
    print("Adding new products...")
    for product in new_products:
        try:
            products_table.put_item(Item=product)
            print(f"Added: {product['name']} - ₹{product['price']} (Stock: {product['stock']})")
        except Exception as e:
            print(f"Error adding product {product['name']}: {e}")

if __name__ == "__main__":
    clear_tables()
    add_products()
    print("\nDatabase reset complete!")
    print("- 15 new products added (₹89-499)")
    print("- All products have stock between 25-50")
    print("- All order history cleared")