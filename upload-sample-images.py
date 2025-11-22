#!/usr/bin/env python3
import boto3
import requests
from io import BytesIO

# Sample product images from Unsplash (free to use)
SAMPLE_IMAGES = {
    'wireless-mouse.jpg': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
    'phone-case.jpg': 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop',
    'canvas-shoes.jpg': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop',
    'bluetooth-earbuds.jpg': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',
    'cotton-tshirt.jpg': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop'
}

def upload_images():
    s3 = boto3.client('s3')
    bucket_name = 'ecommerce-images-016430248234-us-west-2'
    
    for filename, url in SAMPLE_IMAGES.items():
        try:
            # Download image
            response = requests.get(url)
            if response.status_code == 200:
                # Upload to S3
                s3.put_object(
                    Bucket=bucket_name,
                    Key=filename,
                    Body=response.content,
                    ContentType='image/jpeg'
                )
                print(f"✅ Uploaded {filename}")
            else:
                print(f"❌ Failed to download {filename}")
        except Exception as e:
            print(f"❌ Error uploading {filename}: {str(e)}")

if __name__ == "__main__":
    upload_images()