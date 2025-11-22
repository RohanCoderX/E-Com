import json
import boto3
import os
from datetime import datetime, timedelta
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')

def handler(event, context):
    try:
        method = event['httpMethod']
        
        if method == 'POST':
            # Simple user session validation (no passwords for cost efficiency)
            body = json.loads(event['body'])
            action = body.get('action')
            
            if action == 'login':
                user_data = {
                    'name': body.get('name'),
                    'email': body.get('email'),
                    'loginTime': datetime.utcnow().isoformat(),
                    'sessionId': f"session_{body.get('email', 'guest')}_{int(datetime.utcnow().timestamp())}"
                }
                
                return {
                    'statusCode': 200,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'user': user_data,
                        'message': 'Login successful'
                    })
                }
            
            elif action == 'validate':
                # Simple session validation
                session_id = body.get('sessionId')
                email = body.get('email')
                
                # For cost efficiency, we just validate format
                if session_id and email and session_id.startswith(f"session_{email}"):
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'valid': True,
                            'message': 'Session valid'
                        })
                    }
                else:
                    return {
                        'statusCode': 200,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'valid': False,
                            'message': 'Session invalid'
                        })
                    }
        
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }