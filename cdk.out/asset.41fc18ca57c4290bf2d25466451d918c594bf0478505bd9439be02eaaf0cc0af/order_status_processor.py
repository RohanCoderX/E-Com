import json
import boto3
import os

sns = boto3.client('sns')

def handler(event, context):
    topic_arn = os.environ['NOTIFICATION_TOPIC_ARN']
    
    for record in event['Records']:
        try:
            # Process DynamoDB stream events
            if record['eventName'] in ['INSERT', 'MODIFY']:
                # Get new image (current state)
                new_image = record['dynamodb'].get('NewImage', {})
                old_image = record['dynamodb'].get('OldImage', {})
                
                # Extract order data
                order_data = {
                    'orderId': new_image.get('orderId', {}).get('S', ''),
                    'customerName': new_image.get('customerName', {}).get('S', ''),
                    'email': new_image.get('email', {}).get('S', ''),
                    'status': new_image.get('status', {}).get('S', ''),
                    'total': float(new_image.get('total', {}).get('N', '0')),
                    'items': []
                }
                
                # Parse items list
                items_list = new_image.get('items', {}).get('L', [])
                for item in items_list:
                    item_data = item.get('M', {})
                    order_data['items'].append({
                        'name': item_data.get('name', {}).get('S', ''),
                        'quantity': int(item_data.get('quantity', {}).get('N', '1')),
                        'price': float(item_data.get('price', {}).get('N', '0'))
                    })
                
                # Check if status changed or new order
                old_status = old_image.get('status', {}).get('S', '') if old_image else ''
                new_status = order_data['status']
                
                # Send notification if status changed or new order
                if record['eventName'] == 'INSERT' or old_status != new_status:
                    sns.publish(
                        TopicArn=topic_arn,
                        Message=json.dumps(order_data),
                        Subject=f'Order Status Update: {new_status}'
                    )
                    print(f"Notification sent for order {order_data['orderId']} with status {new_status}")
                    
        except Exception as e:
            print(f"Error processing DynamoDB stream record: {str(e)}")
    
    return {'statusCode': 200}