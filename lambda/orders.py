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
products_table = dynamodb.Table(os.environ.get('PRODUCTS_TABLE', 'products'))

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
                'status': 'Pending',
                'timestamp': datetime.utcnow().isoformat(),
                'purchaseTime': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
                'emailVerified': False,
                'shippingAddress': body.get('shippingAddress', {})
            }
            
            # Update stock for each item
            for item in body['items']:
                try:
                    products_table.update_item(
                        Key={'productId': item['productId']},
                        UpdateExpression='ADD stock :quantity',
                        ExpressionAttributeValues={':quantity': -int(item['quantity'])},
                        ConditionExpression='stock >= :quantity'
                    )
                except Exception as e:
                    print(f"Stock update failed for {item['productId']}: {str(e)}")
            
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
            # Get orders (all or by customer email)
            query_params = event.get('queryStringParameters') or {}
            customer_email = query_params.get('email')
            
            if customer_email:
                # Get orders for specific customer
                response = table.scan(
                    FilterExpression='email = :email',
                    ExpressionAttributeValues={':email': customer_email}
                )
            else:
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