import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['PRODUCTS_TABLE'])

import os

# Get S3 bucket URL from environment
IMAGES_BUCKET = os.environ.get('IMAGES_BUCKET', 'ecommerce-images')
IMAGES_BASE_URL = f"https://{IMAGES_BUCKET}.s3.us-west-2.amazonaws.com"

# Sample products data with S3 images
SAMPLE_PRODUCTS = [
    {
        'productId': '1',
        'name': 'Wireless Mouse',
        'price': Decimal('89'),
        'description': 'Ergonomic wireless mouse with long battery life',
        'category': 'Electronics',
        'image': f'{IMAGES_BASE_URL}/wireless-mouse.jpg',
        'stock': 25
    },
    {
        'productId': '2',
        'name': 'Phone Case',
        'price': Decimal('45'),
        'description': 'Protective phone case with shock absorption',
        'category': 'Electronics',
        'image': f'{IMAGES_BASE_URL}/phone-case.jpg',
        'stock': 50
    },
    {
        'productId': '3',
        'name': 'Canvas Shoes',
        'price': Decimal('75'),
        'description': 'Comfortable canvas shoes for daily wear',
        'category': 'Shoes',
        'image': f'{IMAGES_BASE_URL}/canvas-shoes.jpg',
        'stock': 100
    },
    {
        'productId': '4',
        'name': 'Bluetooth Earbuds',
        'price': Decimal('95'),
        'description': 'Wireless earbuds with noise cancellation',
        'category': 'Electronics',
        'image': f'{IMAGES_BASE_URL}/bluetooth-earbuds.jpg',
        'stock': 30
    },
    {
        'productId': '5',
        'name': 'Cotton T-Shirt',
        'price': Decimal('35'),
        'description': 'Premium cotton t-shirt, comfortable fit',
        'category': 'Clothing',
        'image': f'{IMAGES_BASE_URL}/cotton-tshirt.jpg',
        'stock': 75
    }
]

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def handler(event, context):
    method = event['httpMethod']
    
    try:
        if method == 'GET':
            # Get all products
            response = table.scan()
            products = response.get('Items', [])
            
            # If no products, initialize with sample data
            if not products:
                for product in SAMPLE_PRODUCTS:
                    table.put_item(Item=product)
                products = SAMPLE_PRODUCTS
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps(products, default=decimal_default)
            }
            
        elif method == 'POST':
            # Add new product
            body = json.loads(event['body'])
            body['price'] = Decimal(str(body['price']))
            
            table.put_item(Item=body)
            
            return {
                'statusCode': 201,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({'message': 'Product created successfully'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({'error': str(e)})
        }