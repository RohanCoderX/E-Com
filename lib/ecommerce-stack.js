"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECommerceStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
class ECommerceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // DynamoDB Tables
        const productsTable = new aws_cdk_lib_1.aws_dynamodb.Table(this, 'ProductsTable', {
            tableName: 'products',
            partitionKey: { name: 'productId', type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING },
            billingMode: aws_cdk_lib_1.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        const ordersTable = new aws_cdk_lib_1.aws_dynamodb.Table(this, 'OrdersTable', {
            tableName: 'ecommerce-orders',
            partitionKey: { name: 'orderId', type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING },
            billingMode: aws_cdk_lib_1.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            stream: aws_cdk_lib_1.aws_dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
        });
        // SNS Topic for Order Notifications
        const orderNotificationTopic = new aws_cdk_lib_1.aws_sns.Topic(this, 'OrderNotificationTopic', {
            topicName: 'order-notifications',
        });
        // SES Email Identity (replace with your verified email)
        const emailIdentity = new aws_cdk_lib_1.aws_ses.EmailIdentity(this, 'EmailIdentity', {
            identity: aws_cdk_lib_1.aws_ses.Identity.email('noreply@example.com'),
        });
        // S3 Bucket for Frontend
        const websiteBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 'WebsiteBucket', {
            bucketName: `ecommerce-website-${this.account}-${this.region}`,
            websiteIndexDocument: 'index.html',
            publicReadAccess: true,
            blockPublicAccess: aws_cdk_lib_1.aws_s3.BlockPublicAccess.BLOCK_ACLS,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // S3 Bucket for Product Images
        const imagesBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, 'ProductImagesBucket', {
            bucketName: `ecommerce-images-${this.account}-${this.region}`,
            publicReadAccess: true,
            blockPublicAccess: aws_cdk_lib_1.aws_s3.BlockPublicAccess.BLOCK_ACLS,
            cors: [{
                    allowedMethods: [aws_cdk_lib_1.aws_s3.HttpMethods.GET, aws_cdk_lib_1.aws_s3.HttpMethods.PUT, aws_cdk_lib_1.aws_s3.HttpMethods.POST],
                    allowedOrigins: ['*'],
                    allowedHeaders: ['*'],
                }],
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });
        // Lambda Functions
        const productsFunction = new aws_cdk_lib_1.aws_lambda.Function(this, 'ProductsFunction', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'products.handler',
            environment: {
                PRODUCTS_TABLE: productsTable.tableName,
                IMAGES_BUCKET: imagesBucket.bucketName,
            },
        });
        const ordersFunction = new aws_cdk_lib_1.aws_lambda.Function(this, 'OrdersFunction', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'orders.handler',
            environment: {
                ORDERS_TABLE: ordersTable.tableName,
                PRODUCTS_TABLE: productsTable.tableName,
                NOTIFICATION_TOPIC_ARN: orderNotificationTopic.topicArn,
            },
        });
        // Email Notification Lambda
        const emailNotificationFunction = new aws_cdk_lib_1.aws_lambda.Function(this, 'EmailNotificationFunction', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'email_notifications.handler',
            environment: {
                FROM_EMAIL: 'noreply@example.com',
            },
        });
        // Order Status Processor Lambda (triggered by DynamoDB streams)
        const orderStatusProcessor = new aws_cdk_lib_1.aws_lambda.Function(this, 'OrderStatusProcessor', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'order_status_processor.handler',
            environment: {
                NOTIFICATION_TOPIC_ARN: orderNotificationTopic.topicArn,
            },
        });
        // Order Simulator Lambda (for testing status updates)
        const orderSimulator = new aws_cdk_lib_1.aws_lambda.Function(this, 'OrderSimulator', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'order_simulator.handler',
            environment: {
                ORDERS_TABLE: ordersTable.tableName,
            },
        });
        // Email Verifier Lambda
        const emailVerifier = new aws_cdk_lib_1.aws_lambda.Function(this, 'EmailVerifier', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'email_verifier.handler',
        });
        // Auto Email Verifier Lambda (triggered by new orders)
        const autoEmailVerifier = new aws_cdk_lib_1.aws_lambda.Function(this, 'AutoEmailVerifier', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'auto_email_verifier.handler',
        });
        // Email Status Checker Lambda
        const emailStatusChecker = new aws_cdk_lib_1.aws_lambda.Function(this, 'EmailStatusChecker', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'email_status_checker.handler',
        });
        // Image Uploader Lambda
        const imageUploader = new aws_cdk_lib_1.aws_lambda.Function(this, 'ImageUploader', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'image_uploader.handler',
            environment: {
                IMAGES_BUCKET: imagesBucket.bucketName,
            },
        });
        // User Manager Lambda (cost-efficient session management)
        const userManager = new aws_cdk_lib_1.aws_lambda.Function(this, 'UserManager', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.PYTHON_3_11,
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            handler: 'user_manager.handler',
        });
        // Grant permissions
        productsTable.grantReadWriteData(productsFunction);
        imagesBucket.grantReadWrite(productsFunction);
        imagesBucket.grantReadWrite(imageUploader);
        ordersTable.grantReadWriteData(ordersFunction);
        productsTable.grantReadWriteData(ordersFunction);
        ordersTable.grantReadWriteData(orderSimulator);
        ordersTable.grantStreamRead(orderStatusProcessor);
        orderNotificationTopic.grantPublish(ordersFunction);
        orderNotificationTopic.grantPublish(orderStatusProcessor);
        ordersFunction.addToRolePolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
            actions: ['ses:VerifyEmailIdentity'],
            resources: ['*'],
        }));
        emailNotificationFunction.addToRolePolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
            actions: ['ses:SendEmail', 'ses:SendRawEmail'],
            resources: ['*'],
        }));
        emailVerifier.addToRolePolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
            actions: ['ses:VerifyEmailIdentity', 'ses:ListIdentities'],
            resources: ['*'],
        }));
        autoEmailVerifier.addToRolePolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
            actions: ['ses:VerifyEmailIdentity', 'ses:ListIdentities'],
            resources: ['*'],
        }));
        emailStatusChecker.addToRolePolicy(new aws_cdk_lib_1.aws_iam.PolicyStatement({
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
            actions: ['ses:GetIdentityVerificationAttributes'],
            resources: ['*'],
        }));
        // Subscribe email function to SNS topic
        orderNotificationTopic.addSubscription(new aws_cdk_lib_1.aws_sns_subscriptions.LambdaSubscription(emailNotificationFunction));
        // Add DynamoDB stream triggers
        orderStatusProcessor.addEventSource(new aws_cdk_lib_1.aws_lambda_event_sources.DynamoEventSource(ordersTable, {
            startingPosition: aws_cdk_lib_1.aws_lambda.StartingPosition.LATEST,
        }));
        autoEmailVerifier.addEventSource(new aws_cdk_lib_1.aws_lambda_event_sources.DynamoEventSource(ordersTable, {
            startingPosition: aws_cdk_lib_1.aws_lambda.StartingPosition.LATEST,
            filters: [aws_cdk_lib_1.aws_lambda.FilterCriteria.filter({
                    eventName: aws_cdk_lib_1.aws_lambda.FilterRule.isEqual('INSERT')
                })]
        }));
        // API Gateway
        const api = new aws_cdk_lib_1.aws_apigateway.RestApi(this, 'ECommerceApi', {
            restApiName: 'E-Commerce API',
            defaultCorsPreflightOptions: {
                allowOrigins: aws_cdk_lib_1.aws_apigateway.Cors.ALL_ORIGINS,
                allowMethods: aws_cdk_lib_1.aws_apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization'],
            },
        });
        // API Routes
        const products = api.root.addResource('products');
        products.addMethod('GET', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(productsFunction));
        products.addMethod('POST', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(productsFunction));
        const orders = api.root.addResource('orders');
        orders.addMethod('POST', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(ordersFunction));
        orders.addMethod('GET', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(ordersFunction));
        const verify = api.root.addResource('verify-email');
        verify.addMethod('POST', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(emailVerifier));
        const checkStatus = api.root.addResource('email-status');
        checkStatus.addMethod('POST', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(emailStatusChecker));
        const uploadImage = api.root.addResource('upload-image');
        uploadImage.addMethod('POST', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(imageUploader));
        const userAuth = api.root.addResource('auth');
        userAuth.addMethod('POST', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(userManager));
        // Deploy Frontend
        new aws_cdk_lib_1.aws_s3_deployment.BucketDeployment(this, 'DeployWebsite', {
            sources: [aws_cdk_lib_1.aws_s3_deployment.Source.asset('./frontend')],
            destinationBucket: websiteBucket,
        });
        // Outputs
        new cdk.CfnOutput(this, 'WebsiteURL', {
            value: websiteBucket.bucketWebsiteUrl,
        });
        new cdk.CfnOutput(this, 'ImagesURL', {
            value: `https://${imagesBucket.bucketName}.s3.${this.region}.amazonaws.com`,
        });
        new cdk.CfnOutput(this, 'ApiURL', {
            value: api.url,
        });
        new cdk.CfnOutput(this, 'OrderSimulatorFunction', {
            value: orderSimulator.functionName,
        });
        new cdk.CfnOutput(this, 'EmailVerifierFunction', {
            value: emailVerifier.functionName,
        });
    }
}
exports.ECommerceStack = ECommerceStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWNvbW1lcmNlLXN0YWNrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZWNvbW1lcmNlLXN0YWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1DQUFtQztBQUNuQyw2Q0FBMFI7QUFHMVIsTUFBYSxjQUFlLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDM0MsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QixrQkFBa0I7UUFDbEIsTUFBTSxhQUFhLEdBQUcsSUFBSSwwQkFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsZUFBZSxFQUFFO1lBQzlELFNBQVMsRUFBRSxVQUFVO1lBQ3JCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLDBCQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN4RSxXQUFXLEVBQUUsMEJBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtZQUNqRCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1NBQ3pDLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLElBQUksMEJBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUMxRCxTQUFTLEVBQUUsa0JBQWtCO1lBQzdCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLDBCQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN0RSxXQUFXLEVBQUUsMEJBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtZQUNqRCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLE1BQU0sRUFBRSwwQkFBUSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0I7U0FDbkQsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLE1BQU0sc0JBQXNCLEdBQUcsSUFB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QUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztTQUNmLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLEVBQUU7WUFDaEQsS0FBSyxFQUFFLGNBQWMsQ0FBQyxZQUFZO1NBQ25DLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsdUJBQXVCLEVBQUU7WUFDL0MsS0FBSyxFQUFFLGFBQWEsQ0FBQyxZQUFZO1NBQ2xDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQS9QRCx3Q0ErUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgYXdzX2xhbWJkYSBhcyBsYW1iZGEsIGF3c19hcGlnYXRld2F5IGFzIGFwaWdhdGV3YXksIGF3c19keW5hbW9kYiBhcyBkeW5hbW9kYiwgYXdzX3MzIGFzIHMzLCBhd3NfczNfZGVwbG95bWVudCBhcyBzM2RlcGxveSwgYXdzX3NlcyBhcyBzZXMsIGF3c19zbnMgYXMgc25zLCBhd3Nfc25zX3N1YnNjcmlwdGlvbnMgYXMgc3Vic2NyaXB0aW9ucywgYXdzX2lhbSBhcyBpYW0sIGF3c19sYW1iZGFfZXZlbnRfc291cmNlcyBhcyBldmVudHNvdXJjZXMgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGNsYXNzIEVDb21tZXJjZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gRHluYW1vREIgVGFibGVzXG4gICAgY29uc3QgcHJvZHVjdHNUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnUHJvZHVjdHNUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ3Byb2R1Y3RzJyxcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAncHJvZHVjdElkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb3JkZXJzVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ09yZGVyc1RhYmxlJywge1xuICAgICAgdGFibGVOYW1lOiAnZWNvbW1lcmNlLW9yZGVycycsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ29yZGVySWQnLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBzdHJlYW06IGR5bmFtb2RiLlN0cmVhbVZpZXdUeXBlLk5FV19BTkRfT0xEX0lNQUdFUyxcbiAgICB9KTtcblxuICAgIC8vIFNOUyBUb3BpYyBmb3IgT3JkZXIgTm90aWZpY2F0aW9uc1xuICAgIGNvbnN0IG9yZGVyTm90aWZpY2F0aW9uVG9waWMgPSBuZXcgc25zLlRvcGljKHRoaXMsICdPcmRlck5vdGlmaWNhdGlvblRvcGljJywge1xuICAgICAgdG9waWNOYW1lOiAnb3JkZXItbm90aWZpY2F0aW9ucycsXG4gICAgfSk7XG5cbiAgICAvLyBTRVMgRW1haWwgSWRlbnRpdHkgKHJlcGxhY2Ugd2l0aCB5b3VyIHZlcmlmaWVkIGVtYWlsKVxuICAgIGNvbnN0IGVtYWlsSWRlbnRpdHkgPSBuZXcgc2VzLkVtYWlsSWRlbnRpdHkodGhpcywgJ0VtYWlsSWRlbnRpdHknLCB7XG4gICAgICBpZGVudGl0eTogc2VzLklkZW50aXR5LmVtYWlsKCdub3JlcGx5QGV4YW1wbGUuY29tJyksXG4gICAgfSk7XG5cbiAgICAvLyBTMyBCdWNrZXQgZm9yIEZyb250ZW5kXG4gICAgY29uc3Qgd2Vic2l0ZUJ1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1dlYnNpdGVCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiBgZWNvbW1lcmNlLXdlYnNpdGUtJHt0aGlzLmFjY291bnR9LSR7dGhpcy5yZWdpb259YCxcbiAgICAgIHdlYnNpdGVJbmRleERvY3VtZW50OiAnaW5kZXguaHRtbCcsXG4gICAgICBwdWJsaWNSZWFkQWNjZXNzOiB0cnVlLFxuICAgICAgYmxvY2tQdWJsaWNBY2Nlc3M6IHMzLkJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FDTFMsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgLy8gUzMgQnVja2V0IGZvciBQcm9kdWN0IEltYWdlc1xuICAgIGNvbnN0IGltYWdlc0J1Y2tldCA9IG5ldyBzMy5CdWNrZXQodGhpcywgJ1Byb2R1Y3RJbWFnZXNCdWNrZXQnLCB7XG4gICAgICBidWNrZXROYW1lOiBgZWNvbW1lcmNlLWltYWdlcy0ke3RoaXMuYWNjb3VudH0tJHt0aGlzLnJlZ2lvbn1gLFxuICAgICAgcHVibGljUmVhZEFjY2VzczogdHJ1ZSxcbiAgICAgIGJsb2NrUHVibGljQWNjZXNzOiBzMy5CbG9ja1B1YmxpY0FjY2Vzcy5CTE9DS19BQ0xTLFxuICAgICAgY29yczogW3tcbiAgICAgICAgYWxsb3dlZE1ldGhvZHM6IFtzMy5IdHRwTWV0aG9kcy5HRVQsIHMzLkh0dHBNZXRob2RzLlBVVCwgczMuSHR0cE1ldGhvZHMuUE9TVF0sXG4gICAgICAgIGFsbG93ZWRPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnKiddLFxuICAgICAgfV0sXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuICAgIH0pO1xuXG4gICAgLy8gTGFtYmRhIEZ1bmN0aW9uc1xuICAgIGNvbnN0IHByb2R1Y3RzRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdQcm9kdWN0c0Z1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgaGFuZGxlcjogJ3Byb2R1Y3RzLmhhbmRsZXInLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgUFJPRFVDVFNfVEFCTEU6IHByb2R1Y3RzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBJTUFHRVNfQlVDS0VUOiBpbWFnZXNCdWNrZXQuYnVja2V0TmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBvcmRlcnNGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ09yZGVyc0Z1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgaGFuZGxlcjogJ29yZGVycy5oYW5kbGVyJyxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE9SREVSU19UQUJMRTogb3JkZXJzVGFibGUudGFibGVOYW1lLFxuICAgICAgICBQUk9EVUNUU19UQUJMRTogcHJvZHVjdHNUYWJsZS50YWJsZU5hbWUsXG4gICAgICAgIE5PVElGSUNBVElPTl9UT1BJQ19BUk46IG9yZGVyTm90aWZpY2F0aW9uVG9waWMudG9waWNBcm4sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gRW1haWwgTm90aWZpY2F0aW9uIExhbWJkYVxuICAgIGNvbnN0IGVtYWlsTm90aWZpY2F0aW9uRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdFbWFpbE5vdGlmaWNhdGlvbkZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgaGFuZGxlcjogJ2VtYWlsX25vdGlmaWNhdGlvbnMuaGFuZGxlcicsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBGUk9NX0VNQUlMOiAnbm9yZXBseUBleGFtcGxlLmNvbScsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gT3JkZXIgU3RhdHVzIFByb2Nlc3NvciBMYW1iZGEgKHRyaWdnZXJlZCBieSBEeW5hbW9EQiBzdHJlYW1zKVxuICAgIGNvbnN0IG9yZGVyU3RhdHVzUHJvY2Vzc29yID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnT3JkZXJTdGF0dXNQcm9jZXNzb3InLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhJyksXG4gICAgICBoYW5kbGVyOiAnb3JkZXJfc3RhdHVzX3Byb2Nlc3Nvci5oYW5kbGVyJyxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PVElGSUNBVElPTl9UT1BJQ19BUk46IG9yZGVyTm90aWZpY2F0aW9uVG9waWMudG9waWNBcm4sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gT3JkZXIgU2ltdWxhdG9yIExhbWJkYSAoZm9yIHRlc3Rpbmcgc3RhdHVzIHVwZGF0ZXMpXG4gICAgY29uc3Qgb3JkZXJTaW11bGF0b3IgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdPcmRlclNpbXVsYXRvcicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEnKSxcbiAgICAgIGhhbmRsZXI6ICdvcmRlcl9zaW11bGF0b3IuaGFuZGxlcicsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBPUkRFUlNfVEFCTEU6IG9yZGVyc1RhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBFbWFpbCBWZXJpZmllciBMYW1iZGFcbiAgICBjb25zdCBlbWFpbFZlcmlmaWVyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnRW1haWxWZXJpZmllcicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEnKSxcbiAgICAgIGhhbmRsZXI6ICdlbWFpbF92ZXJpZmllci5oYW5kbGVyJyxcbiAgICB9KTtcblxuICAgIC8vIEF1dG8gRW1haWwgVmVyaWZpZXIgTGFtYmRhICh0cmlnZ2VyZWQgYnkgbmV3IG9yZGVycylcbiAgICBjb25zdCBhdXRvRW1haWxWZXJpZmllciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0F1dG9FbWFpbFZlcmlmaWVyJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgaGFuZGxlcjogJ2F1dG9fZW1haWxfdmVyaWZpZXIuaGFuZGxlcicsXG4gICAgfSk7XG5cbiAgICAvLyBFbWFpbCBTdGF0dXMgQ2hlY2tlciBMYW1iZGFcbiAgICBjb25zdCBlbWFpbFN0YXR1c0NoZWNrZXIgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdFbWFpbFN0YXR1c0NoZWNrZXInLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5QWVRIT05fM18xMSxcbiAgICAgIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21Bc3NldCgnbGFtYmRhJyksXG4gICAgICBoYW5kbGVyOiAnZW1haWxfc3RhdHVzX2NoZWNrZXIuaGFuZGxlcicsXG4gICAgfSk7XG5cbiAgICAvLyBJbWFnZSBVcGxvYWRlciBMYW1iZGFcbiAgICBjb25zdCBpbWFnZVVwbG9hZGVyID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnSW1hZ2VVcGxvYWRlcicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLlBZVEhPTl8zXzExLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEnKSxcbiAgICAgIGhhbmRsZXI6ICdpbWFnZV91cGxvYWRlci5oYW5kbGVyJyxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIElNQUdFU19CVUNLRVQ6IGltYWdlc0J1Y2tldC5idWNrZXROYW1lLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIFVzZXIgTWFuYWdlciBMYW1iZGEgKGNvc3QtZWZmaWNpZW50IHNlc3Npb24gbWFuYWdlbWVudClcbiAgICBjb25zdCB1c2VyTWFuYWdlciA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ1VzZXJNYW5hZ2VyJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuUFlUSE9OXzNfMTEsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJ2xhbWJkYScpLFxuICAgICAgaGFuZGxlcjogJ3VzZXJfbWFuYWdlci5oYW5kbGVyJyxcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IHBlcm1pc3Npb25zXG4gICAgcHJvZHVjdHNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEocHJvZHVjdHNGdW5jdGlvbik7XG4gICAgaW1hZ2VzQnVja2V0LmdyYW50UmVhZFdyaXRlKHByb2R1Y3RzRnVuY3Rpb24pO1xuICAgIGltYWdlc0J1Y2tldC5ncmFudFJlYWRXcml0ZShpbWFnZVVwbG9hZGVyKTtcbiAgICBvcmRlcnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEob3JkZXJzRnVuY3Rpb24pO1xuICAgIHByb2R1Y3RzVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKG9yZGVyc0Z1bmN0aW9uKTtcbiAgICBvcmRlcnNUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEob3JkZXJTaW11bGF0b3IpO1xuICAgIG9yZGVyc1RhYmxlLmdyYW50U3RyZWFtUmVhZChvcmRlclN0YXR1c1Byb2Nlc3Nvcik7XG4gICAgb3JkZXJOb3RpZmljYXRpb25Ub3BpYy5ncmFudFB1Ymxpc2gob3JkZXJzRnVuY3Rpb24pO1xuICAgIG9yZGVyTm90aWZpY2F0aW9uVG9waWMuZ3JhbnRQdWJsaXNoKG9yZGVyU3RhdHVzUHJvY2Vzc29yKTtcbiAgICBcbiAgICBvcmRlcnNGdW5jdGlvbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydzZXM6VmVyaWZ5RW1haWxJZGVudGl0eSddLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICB9KSk7XG4gICAgZW1haWxOb3RpZmljYXRpb25GdW5jdGlvbi5hZGRUb1JvbGVQb2xpY3kobmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgICAgYWN0aW9uczogWydzZXM6U2VuZEVtYWlsJywgJ3NlczpTZW5kUmF3RW1haWwnXSxcbiAgICAgIHJlc291cmNlczogWycqJ10sXG4gICAgfSkpO1xuICAgIFxuICAgIGVtYWlsVmVyaWZpZXIuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFsnc2VzOlZlcmlmeUVtYWlsSWRlbnRpdHknLCAnc2VzOkxpc3RJZGVudGl0aWVzJ10sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgIH0pKTtcblxuICAgIGF1dG9FbWFpbFZlcmlmaWVyLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ3NlczpWZXJpZnlFbWFpbElkZW50aXR5JywgJ3NlczpMaXN0SWRlbnRpdGllcyddLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICB9KSk7XG5cbiAgICBlbWFpbFN0YXR1c0NoZWNrZXIuYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFsnc2VzOkdldElkZW50aXR5VmVyaWZpY2F0aW9uQXR0cmlidXRlcyddLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICB9KSk7XG5cbiAgICAvLyBTdWJzY3JpYmUgZW1haWwgZnVuY3Rpb24gdG8gU05TIHRvcGljXG4gICAgb3JkZXJOb3RpZmljYXRpb25Ub3BpYy5hZGRTdWJzY3JpcHRpb24obmV3IHN1YnNjcmlwdGlvbnMuTGFtYmRhU3Vic2NyaXB0aW9uKGVtYWlsTm90aWZpY2F0aW9uRnVuY3Rpb24pKTtcblxuICAgIC8vIEFkZCBEeW5hbW9EQiBzdHJlYW0gdHJpZ2dlcnNcbiAgICBvcmRlclN0YXR1c1Byb2Nlc3Nvci5hZGRFdmVudFNvdXJjZShuZXcgZXZlbnRzb3VyY2VzLkR5bmFtb0V2ZW50U291cmNlKG9yZGVyc1RhYmxlLCB7XG4gICAgICBzdGFydGluZ1Bvc2l0aW9uOiBsYW1iZGEuU3RhcnRpbmdQb3NpdGlvbi5MQVRFU1QsXG4gICAgfSkpO1xuXG4gICAgYXV0b0VtYWlsVmVyaWZpZXIuYWRkRXZlbnRTb3VyY2UobmV3IGV2ZW50c291cmNlcy5EeW5hbW9FdmVudFNvdXJjZShvcmRlcnNUYWJsZSwge1xuICAgICAgc3RhcnRpbmdQb3NpdGlvbjogbGFtYmRhLlN0YXJ0aW5nUG9zaXRpb24uTEFURVNULFxuICAgICAgZmlsdGVyczogW2xhbWJkYS5GaWx0ZXJDcml0ZXJpYS5maWx0ZXIoe1xuICAgICAgICBldmVudE5hbWU6IGxhbWJkYS5GaWx0ZXJSdWxlLmlzRXF1YWwoJ0lOU0VSVCcpXG4gICAgICB9KV1cbiAgICB9KSk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0VDb21tZXJjZUFwaScsIHtcbiAgICAgIHJlc3RBcGlOYW1lOiAnRS1Db21tZXJjZSBBUEknLFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9PUklHSU5TLFxuICAgICAgICBhbGxvd01ldGhvZHM6IGFwaWdhdGV3YXkuQ29ycy5BTExfTUVUSE9EUyxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJ10sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQVBJIFJvdXRlc1xuICAgIGNvbnN0IHByb2R1Y3RzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3Byb2R1Y3RzJyk7XG4gICAgcHJvZHVjdHMuYWRkTWV0aG9kKCdHRVQnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihwcm9kdWN0c0Z1bmN0aW9uKSk7XG4gICAgcHJvZHVjdHMuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocHJvZHVjdHNGdW5jdGlvbikpO1xuXG4gICAgY29uc3Qgb3JkZXJzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ29yZGVycycpO1xuICAgIG9yZGVycy5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihvcmRlcnNGdW5jdGlvbikpO1xuICAgIG9yZGVycy5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKG9yZGVyc0Z1bmN0aW9uKSk7XG5cbiAgICBjb25zdCB2ZXJpZnkgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgndmVyaWZ5LWVtYWlsJyk7XG4gICAgdmVyaWZ5LmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGVtYWlsVmVyaWZpZXIpKTtcblxuICAgIGNvbnN0IGNoZWNrU3RhdHVzID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2VtYWlsLXN0YXR1cycpO1xuICAgIGNoZWNrU3RhdHVzLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGVtYWlsU3RhdHVzQ2hlY2tlcikpO1xuXG4gICAgY29uc3QgdXBsb2FkSW1hZ2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgndXBsb2FkLWltYWdlJyk7XG4gICAgdXBsb2FkSW1hZ2UuYWRkTWV0aG9kKCdQT1NUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oaW1hZ2VVcGxvYWRlcikpO1xuXG4gICAgY29uc3QgdXNlckF1dGggPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnYXV0aCcpO1xuICAgIHVzZXJBdXRoLmFkZE1ldGhvZCgnUE9TVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJNYW5hZ2VyKSk7XG5cbiAgICAvLyBEZXBsb3kgRnJvbnRlbmRcbiAgICBuZXcgczNkZXBsb3kuQnVja2V0RGVwbG95bWVudCh0aGlzLCAnRGVwbG95V2Vic2l0ZScsIHtcbiAgICAgIHNvdXJjZXM6IFtzM2RlcGxveS5Tb3VyY2UuYXNzZXQoJy4vZnJvbnRlbmQnKV0sXG4gICAgICBkZXN0aW5hdGlvbkJ1Y2tldDogd2Vic2l0ZUJ1Y2tldCxcbiAgICB9KTtcblxuICAgIC8vIE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZVVSTCcsIHtcbiAgICAgIHZhbHVlOiB3ZWJzaXRlQnVja2V0LmJ1Y2tldFdlYnNpdGVVcmwsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnSW1hZ2VzVVJMJywge1xuICAgICAgdmFsdWU6IGBodHRwczovLyR7aW1hZ2VzQnVja2V0LmJ1Y2tldE5hbWV9LnMzLiR7dGhpcy5yZWdpb259LmFtYXpvbmF3cy5jb21gLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVSTCcsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ09yZGVyU2ltdWxhdG9yRnVuY3Rpb24nLCB7XG4gICAgICB2YWx1ZTogb3JkZXJTaW11bGF0b3IuZnVuY3Rpb25OYW1lLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0VtYWlsVmVyaWZpZXJGdW5jdGlvbicsIHtcbiAgICAgIHZhbHVlOiBlbWFpbFZlcmlmaWVyLmZ1bmN0aW9uTmFtZSxcbiAgICB9KTtcbiAgfVxufSJdfQ==