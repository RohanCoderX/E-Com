import json
import boto3
import base64
import os
from uuid import uuid4

s3 = boto3.client('s3')

def handler(event, context):
    try:
        bucket_name = os.environ['IMAGES_BUCKET']
        
        # Parse request
        body = json.loads(event['body']) if 'body' in event else event
        
        image_data = body.get('image')  # base64 encoded image
        filename = body.get('filename', f'product-{uuid4()}.jpg')
        content_type = body.get('contentType', 'image/jpeg')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Image data is required'})
            }
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_data)
        
        # Upload to S3
        s3.put_object(
            Bucket=bucket_name,
            Key=filename,
            Body=image_bytes,
            ContentType=content_type,
            ACL='public-read'
        )
        
        # Return image URL
        image_url = f"https://{bucket_name}.s3.us-west-2.amazonaws.com/{filename}"
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': 'Image uploaded successfully',
                'imageUrl': image_url,
                'filename': filename
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }