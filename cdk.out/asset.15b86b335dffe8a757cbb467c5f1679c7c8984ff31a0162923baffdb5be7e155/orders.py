import json
import boto3
import os
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
ses = boto3.client('ses')
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
            
            email = body.get('email', '')
            
            # Auto-verify email if provided
            if email and '@' in email:
                try:
                    ses.verify_email_identity(EmailAddress=email)
                    print(f"Email verification initiated for: {email}")
                except Exception as e:
                    print(f"Email verification failed for {email}: {str(e)}")
            
            order = {
                'orderId': str(uuid.uuid4()),
                'customerId': body.get('customerId', 'guest'),
                'customerName': body.get('customerName', 'Guest User'),
                'email': email,
                'items': body['items'],
                'total': body['total'],
                'status': 'pending',
                'timestamp': datetime.utcnow().isoformat(),
                'shippingAddress': body.get('shippingAddress', {})
            }
            
            table.put_item(Item=order)
            
            # Publish notification (will be handled by DynamoDB stream)
            # The stream will automatically trigger email notification
            
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