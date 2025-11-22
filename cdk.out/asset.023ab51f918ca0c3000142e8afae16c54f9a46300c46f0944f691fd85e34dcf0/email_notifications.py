import json
import boto3
import os

ses = boto3.client('ses')

def handler(event, context):
    from_email = os.environ['FROM_EMAIL']
    
    for record in event['Records']:
        try:
            # Parse SNS message
            message = json.loads(record['Sns']['Message'])
            
            email = message.get('email')
            customer_name = message.get('customerName', 'Valued Customer')
            order_id = message.get('orderId')
            status = message.get('status')
            items = message.get('items', [])
            total = message.get('total', 0)
            
            if not email:
                print(f"No email provided for order {order_id}")
                continue
            
            # Generate email content based on status
            subject, body = generate_email_content(customer_name, order_id, status, items, total)
            
            # Send email
            ses.send_email(
                Source=from_email,
                Destination={'ToAddresses': [email]},
                Message={
                    'Subject': {'Data': subject},
                    'Body': {'Html': {'Data': body}}
                }
            )
            
            print(f"Email sent to {email} for order {order_id} with status {status}")
            
        except Exception as e:
            print(f"Error sending email: {str(e)}")
    
    return {'statusCode': 200}

def generate_email_content(customer_name, order_id, status, items, total):
    items_html = ""
    for item in items:
        items_html += f"<li>{item.get('name', 'Unknown Item')} - Qty: {item.get('quantity', 1)} - ₹{item.get('price', 0)}</li>"
    
    if status == 'pending':
        subject = f"Order Confirmation - #{order_id}"
        body = f"""
        <html>
        <body>
            <h2>Thank you for your order, {customer_name}!</h2>
            <p>We've received your order and it's being processed.</p>
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> {order_id}</p>
            <p><strong>Status:</strong> Order Received</p>
            <ul>{items_html}</ul>
            <p><strong>Total:</strong> ₹{total}</p>
            <p>We'll send you another email when your order ships.</p>
            <p>Thank you for shopping with us!</p>
        </body>
        </html>
        """
    elif status == 'processing':
        subject = f"Order Processing - #{order_id}"
        body = f"""
        <html>
        <body>
            <h2>Your order is being processed, {customer_name}!</h2>
            <p><strong>Order ID:</strong> {order_id}</p>
            <p><strong>Status:</strong> Processing</p>
            <p>Your order is currently being prepared for shipment.</p>
            <ul>{items_html}</ul>
            <p><strong>Total:</strong> ₹{total}</p>
        </body>
        </html>
        """
    elif status == 'shipped':
        subject = f"Order Shipped - #{order_id}"
        body = f"""
        <html>
        <body>
            <h2>Great news, {customer_name}! Your order has shipped!</h2>
            <p><strong>Order ID:</strong> {order_id}</p>
            <p><strong>Status:</strong> Shipped</p>
            <p>Your order is on its way to you.</p>
            <ul>{items_html}</ul>
            <p><strong>Total:</strong> ₹{total}</p>
            <p>You should receive it within 3-5 business days.</p>
        </body>
        </html>
        """
    elif status == 'delivered':
        subject = f"Order Delivered - #{order_id}"
        body = f"""
        <html>
        <body>
            <h2>Your order has been delivered, {customer_name}!</h2>
            <p><strong>Order ID:</strong> {order_id}</p>
            <p><strong>Status:</strong> Delivered</p>
            <p>We hope you enjoy your purchase!</p>
            <ul>{items_html}</ul>
            <p><strong>Total:</strong> ₹{total}</p>
            <p>Thank you for choosing us!</p>
        </body>
        </html>
        """
    else:
        subject = f"Order Update - #{order_id}"
        body = f"""
        <html>
        <body>
            <h2>Order Update, {customer_name}</h2>
            <p><strong>Order ID:</strong> {order_id}</p>
            <p><strong>Status:</strong> {status}</p>
            <ul>{items_html}</ul>
            <p><strong>Total:</strong> ₹{total}</p>
        </body>
        </html>
        """
    
    return subject, body