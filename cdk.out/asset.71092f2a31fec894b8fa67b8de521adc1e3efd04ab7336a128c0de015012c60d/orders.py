import json
import boto3
import os
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['ORDERS_TABLE'])

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def handler(event, context):
    method = event['httpMethod']
    
    try:
        if method == 'POST':
            # Create new order
            body = json.loads(event['body'], parse_float=Decimal)
            
            order = {
                'orderId': str(uuid.uuid4()),
                'customerId': body.get('customerId', 'guest'),
                'customerName': body.get('customerName', 'Guest User'),
                'email': body.get('email', ''),
                'items': body['items'],
                'total': body['total'],
                'status': 'pending',
                'timestamp': datetime.utcnow().isoformat(),
                'shippingAddress': body.get('shippingAddress', {})
            }
            
            table.put_item(Item=order)
            
            return {
                'statusCode': 201,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps({
                    'message': 'Order placed successfully',
                    'orderId': order['orderId']
                })
            }
            
        elif method == 'GET':
            # Get all orders
            response = table.scan()
            orders = response.get('Items', [])
            
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                'body': json.dumps(orders, default=decimal_default)
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