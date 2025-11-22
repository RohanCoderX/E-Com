import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table(os.environ.get('ORDERS_TABLE', 'ecommerce-orders'))

# Default admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

def handler(event, context):
    method = event['httpMethod']
    
    try:
        if method == 'POST':
            body = json.loads(event['body'])
            action = body.get('action')
            
            # Admin login
            if action == 'login':
                username = body.get('username')
                password = body.get('password')
                
                if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'success': True,
                            'message': 'Admin login successful',
                            'token': 'admin-token-123'
                        })
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'message': 'Invalid credentials'})
                    }
            
            # Update order status
            elif action == 'update_status':
                order_id = body.get('orderId')
                new_status = body.get('status')
                
                orders_table.update_item(
                    Key={'orderId': order_id},
                    UpdateExpression='SET #status = :status',
                    ExpressionAttributeNames={'#status': 'status'},
                    ExpressionAttributeValues={':status': new_status}
                )
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'message': 'Order status updated'})
                }
        
        elif method == 'GET':
            # Get all orders for admin
            response = orders_table.scan()
            orders = response.get('Items', [])
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(orders, default=decimal_default)
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }