import json
import boto3
import os

ses = boto3.client('ses')

def handler(event, context):
    try:
        # Get email from event
        email = event.get('email')
        
        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email is required'})
            }
        
        # Verify email identity
        response = ses.verify_email_identity(EmailAddress=email)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Verification email sent to {email}',
                'email': email
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }