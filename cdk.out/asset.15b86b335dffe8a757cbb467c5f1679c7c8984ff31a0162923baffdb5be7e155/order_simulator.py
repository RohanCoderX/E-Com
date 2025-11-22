import json
import boto3
import os
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    table_name = os.environ.get('ORDERS_TABLE', 'ecommerce-orders')
    table = dynamodb.Table(table_name)
    
    try:
        # Get order ID from event
        order_id = event.get('orderId')
        new_status = event.get('status', 'processing')
        
        if not order_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'orderId is required'})
            }
        
        # Update order status
        response = table.update_item(
            Key={'orderId': order_id},
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': new_status},
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Order {order_id} status updated to {new_status}',
                'order': response['Attributes']
            }, default=str)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }