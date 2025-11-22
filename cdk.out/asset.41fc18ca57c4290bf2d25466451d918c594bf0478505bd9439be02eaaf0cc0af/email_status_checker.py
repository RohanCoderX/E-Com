import json
import boto3
import time

ses = boto3.client('ses')

def handler(event, context):
    try:
        email = event.get('email')
        if not email:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email is required'})
            }
        
        # Check verification status
        response = ses.get_identity_verification_attributes(Identities=[email])
        
        verification_attrs = response.get('VerificationAttributes', {})
        email_status = verification_attrs.get(email, {})
        
        status = email_status.get('VerificationStatus', 'NotStarted')
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'email': email,
                'status': status,
                'verified': status == 'Success'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }