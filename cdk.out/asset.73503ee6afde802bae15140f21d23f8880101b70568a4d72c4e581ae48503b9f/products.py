import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['PRODUCTS_TABLE'])

# Sample products data
SAMPLE_PRODUCTS = [
    {
        'productId': '1',
        'name': 'MacBook Pro 16"',
        'price': Decimal('2499.99'),
        'description': 'Apple MacBook Pro with M3 chip, 16GB RAM, 512GB SSD',
        'category': 'Electronics',
        'image': 'https://via.placeholder.com/300x200?text=MacBook+Pro',
        'stock': 25
    },
    {
        'productId': '2',
        'name': 'iPhone 15 Pro',
        'price': Decimal('999.99'),
        'description': 'Latest iPhone with A17 Pro chip, 128GB storage',
        'category': 'Electronics',
        'image': 'https://via.placeholder.com/300x200?text=iPhone+15+Pro',
        'stock': 50
    },
    {
        'productId': '3',
        'name': 'Nike Air Max 270',
        'price': Decimal('129.99'),
        'description': 'Comfortable running shoes with Air Max technology',
        'category': 'Shoes',
        'image': 'https://via.placeholder.com/300x200?text=Nike+Air+Max',
        'stock': 100
    },
    {
        'productId': '4',
        'name': 'Sony WH-1000XM5',
        'price': Decimal('349.99'),
        'description': 'Wireless noise-canceling headphones',
        'category': 'Electronics',
        'image': 'https://via.placeholder.com/300x200?text=Sony+Headphones',
        'stock': 30
    },
    {
        'productId': '5',
        'name': 'Levi\'s 501 Jeans',
        'price': Decimal('79.99'),
        'description': 'Classic straight-fit jeans, 100% cotton',
        'category': 'Clothing',
        'image': 'https://via.placeholder.com/300x200?text=Levis+Jeans',
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