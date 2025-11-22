import boto3
import json
import random

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
products_table = dynamodb.Table('products')

# Updated products with better images and descriptions
updated_products = [
    {"productId": "1", "name": "Sony WH-1000XM4 Headphones", "price": 299, "description": "Industry-leading noise canceling with Dual Noise Sensor technology", "image": "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "2", "name": "Apple Watch Series 8", "price": 399, "description": "Advanced health monitoring with ECG and blood oxygen sensors", "image": "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "3", "name": "Anker PowerCore 26800", "price": 149, "description": "Ultra-high capacity portable charger with fast charging technology", "image": "https://images.unsplash.com/photo-1609592806596-4b8e1b5e8b5e?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "4", "name": "Logitech MX Master 3", "price": 179, "description": "Advanced wireless mouse with ultra-fast scrolling and precision tracking", "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "5", "name": "Belkin USB-C Hub Pro", "price": 129, "description": "12-in-1 connectivity hub with 4K HDMI, USB 3.0, and fast charging", "image": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "6", "name": "JBL Charge 5 Speaker", "price": 249, "description": "Waterproof portable speaker with 20 hours playtime and powerbank feature", "image": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "7", "name": "Lamicall Adjustable Stand", "price": 99, "description": "Premium aluminum phone stand with 360° rotation and height adjustment", "image": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "8", "name": "Belkin Wireless Charger", "price": 159, "description": "15W fast wireless charging pad with LED indicator and foreign object detection", "image": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "9", "name": "Philips Hue Go Light", "price": 189, "description": "Portable smart LED lamp with 16 million colors and app control", "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "10", "name": "Corsair K95 RGB Keyboard", "price": 399, "description": "Mechanical gaming keyboard with Cherry MX switches and RGB backlighting", "image": "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "11", "name": "Logitech C920 HD Webcam", "price": 219, "description": "Full HD 1080p webcam with auto-focus and built-in stereo microphones", "image": "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "12", "name": "Peak Design Phone Case", "price": 119, "description": "Everyday case with magnetic mounting system and drop protection", "image": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "13", "name": "Twelve South BookArc", "price": 139, "description": "Space-saving vertical stand for MacBook and laptops with cable management", "image": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "14", "name": "iOttie Easy One Touch", "price": 109, "description": "Dashboard car mount with one-touch locking and 360° rotation", "image": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop", "stock": random.randint(25, 50)},
    {"productId": "15", "name": "Apple Sport Loop Band", "price": 89, "description": "Soft, breathable sport loop band for Apple Watch with hook-and-loop fastener", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop", "stock": random.randint(25, 50)}
]

def update_products():
    """Update products with better images and descriptions"""
    print("Updating products with better images and descriptions...")
    for product in updated_products:
        try:
            products_table.put_item(Item=product)
            print(f"Updated: {product['name']} - ₹{product['price']} (Stock: {product['stock']})")
        except Exception as e:
            print(f"Error updating product {product['name']}: {e}")

if __name__ == "__main__":
    update_products()
    print("\nProducts updated successfully!")
    print("- Better product names with brands")
    print("- Improved descriptions with key features")
    print("- High-quality product images")
    print("- Consistent image sizing (400x300)")