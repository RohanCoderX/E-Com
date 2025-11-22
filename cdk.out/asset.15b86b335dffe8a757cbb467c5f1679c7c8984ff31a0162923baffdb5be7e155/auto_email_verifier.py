import json
import boto3
import os

ses = boto3.client('ses')
dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        for record in event['Records']:
            # Parse DynamoDB stream event
            if record['eventName'] == 'INSERT':
                new_image = record['dynamodb']['NewImage']
                email = new_image.get('email', {}).get('S', '')
                
                if email and '@' in email:
                    # Check if email is already verified
                    try:
                        response = ses.list_identities()
                        verified_emails = response.get('Identities', [])
                        
                        if email not in verified_emails:
                            # Auto-verify email for new orders
                            ses.verify_email_identity(EmailAddress=email)
                            print(f"Verification initiated for email: {email}")
                        else:
                            print(f"Email already verified: {email}")
                            
                    except Exception as e:
                        print(f"Error verifying email {email}: {str(e)}")
                        
        return {'statusCode': 200}
        
    except Exception as e:
        print(f"Error in auto email verifier: {str(e)}")
        return {'statusCode': 500}