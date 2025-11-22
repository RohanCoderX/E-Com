import boto3
import random

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
products_table = dynamodb.Table('products')

# Replace Hue Go Light with Samsung Galaxy Buds Pro
new_product = {
    "productId": "9", 
    "name": "Samsung Galaxy Buds Pro", 
    "price": 189, 
    "description": "True wireless earbuds with active noise cancellation and 360 Audio", 
    "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop&q=80", 
    "stock": random.randint(25, 50)
}

def replace_product():
    """Replace Philips Hue Go Light with Samsung Galaxy Buds Pro"""
    try:
        products_table.put_item(Item=new_product)
        print(f"Replaced product successfully!")
        print(f"New product: {new_product['name']} - ₹{new_product['price']}")
        print(f"Description: {new_product['description']}")
        print(f"Stock: {new_product['stock']}")
    except Exception as e:
        print(f"Error replacing product: {e}")

if __name__ == "__main__":
    replace_product()
    print("\nProduct replacement complete!")
    print("- Philips Hue Go Light → Samsung Galaxy Buds Pro")
    print("- Same price range (₹189)")
    print("- Better product image match")
    print("- More popular tech product")