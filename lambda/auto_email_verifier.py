import json
import boto3
import os

ses = boto3.client('ses')
dynamodb = boto3.resource('dynamodb')
orders_table = dynamodb.Table('ecommerce-orders')

def handler(event, context):
    try:
        for record in event['Records']:
            # Parse DynamoDB stream event
            if record['eventName'] == 'INSERT':
                new_image = record['dynamodb']['NewImage']
                email = new_image.get('email', {}).get('S', '')
                
                order_id = new_image.get('orderId', {}).get('S', '')
                
                if email and '@' in email and order_id:
                    try:
                        # Auto-verify email for new orders
                        ses.verify_email_identity(EmailAddress=email)
                        print(f"Verification initiated for email: {email}")
                        
                        # Update order status to Email Verified
                        orders_table.update_item(
                            Key={'orderId': order_id},
                            UpdateExpression='SET #status = :status, emailVerified = :verified',
                            ExpressionAttributeNames={'#status': 'status'},
                            ExpressionAttributeValues={
                                ':status': 'Email Verified',
                                ':verified': True
                            }
                        )
                        print(f"Order {order_id} status updated to Email Verified")
                        
                    except Exception as e:
                        print(f"Error verifying email {email}: {str(e)}")
                        # Update status to indicate verification failed
                        try:
                            orders_table.update_item(
                                Key={'orderId': order_id},
                                UpdateExpression='SET #status = :status',
                                ExpressionAttributeNames={'#status': 'status'},
                                ExpressionAttributeValues={':status': 'Email Verification Failed'}
                            )
                        except Exception as update_error:
                            print(f"Failed to update order status: {str(update_error)}")
                        
        return {'statusCode': 200}
        
    except Exception as e:
        print(f"Error in auto email verifier: {str(e)}")
        return {'statusCode': 500}