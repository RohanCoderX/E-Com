import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda, aws_apigateway as apigateway, aws_dynamodb as dynamodb, aws_s3 as s3, aws_s3_deployment as s3deploy, aws_ses as ses, aws_sns as sns, aws_sns_subscriptions as subscriptions, aws_iam as iam, aws_lambda_event_sources as eventsources } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ECommerceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables
    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'products',
      partitionKey: { name: 'productId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: 'ecommerce-orders',
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // SNS Topic for Order Notifications
    const orderNotificationTopic = new sns.Topic(this, 'OrderNotificationTopic', {
      topicName: 'order-notifications',
    });

    // SES Email Identity (replace with your verified email)
    const emailIdentity = new ses.EmailIdentity(this, 'EmailIdentity', {
      identity: ses.Identity.email('noreply@example.com'),
    });

    // S3 Bucket for Frontend
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `ecommerce-website-${this.account}-${this.region}`,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // S3 Bucket for Product Images
    const imagesBucket = new s3.Bucket(this, 'ProductImagesBucket', {
      bucketName: `ecommerce-images-${this.account}-${this.region}`,
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      cors: [{
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Functions
    const productsFunction = new lambda.Function(this, 'ProductsFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'products.handler',
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        IMAGES_BUCKET: imagesBucket.bucketName,
      },
    });

    const ordersFunction = new lambda.Function(this, 'OrdersFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'orders.handler',
      environment: {
        ORDERS_TABLE: ordersTable.tableName,
        PRODUCTS_TABLE: productsTable.tableName,
        NOTIFICATION_TOPIC_ARN: orderNotificationTopic.topicArn,
      },
    });

    // Email Notification Lambda
    const emailNotificationFunction = new lambda.Function(this, 'EmailNotificationFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'email_notifications.handler',
      environment: {
        FROM_EMAIL: 'noreply@example.com',
      },
    });

    // Order Status Processor Lambda (triggered by DynamoDB streams)
    const orderStatusProcessor = new lambda.Function(this, 'OrderStatusProcessor', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'order_status_processor.handler',
      environment: {
        NOTIFICATION_TOPIC_ARN: orderNotificationTopic.topicArn,
      },
    });

    // Order Simulator Lambda (for testing status updates)
    const orderSimulator = new lambda.Function(this, 'OrderSimulator', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'order_simulator.handler',
      environment: {
        ORDERS_TABLE: ordersTable.tableName,
      },
    });

    // Email Verifier Lambda
    const emailVerifier = new lambda.Function(this, 'EmailVerifier', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'email_verifier.handler',
    });

    // Auto Email Verifier Lambda (triggered by new orders)
    const autoEmailVerifier = new lambda.Function(this, 'AutoEmailVerifier', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'auto_email_verifier.handler',
    });

    // Email Status Checker Lambda
    const emailStatusChecker = new lambda.Function(this, 'EmailStatusChecker', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'email_status_checker.handler',
    });

    // Image Uploader Lambda
    const imageUploader = new lambda.Function(this, 'ImageUploader', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'image_uploader.handler',
      environment: {
        IMAGES_BUCKET: imagesBucket.bucketName,
      },
    });

    // User Manager Lambda (cost-efficient session management)
    const userManager = new lambda.Function(this, 'UserManager', {
      runtime: lambda.Runtime.PYTHON_3_11,
      code: lambda.Code.fromAsset('lambda'),
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
    
    ordersFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:VerifyEmailIdentity'],
      resources: ['*'],
    }));
    emailNotificationFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));
    
    emailVerifier.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:VerifyEmailIdentity', 'ses:ListIdentities'],
      resources: ['*'],
    }));

    autoEmailVerifier.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:VerifyEmailIdentity', 'ses:ListIdentities'],
      resources: ['*'],
    }));

    emailStatusChecker.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ses:GetIdentityVerificationAttributes'],
      resources: ['*'],
    }));

    // Subscribe email function to SNS topic
    orderNotificationTopic.addSubscription(new subscriptions.LambdaSubscription(emailNotificationFunction));

    // Add DynamoDB stream triggers
    orderStatusProcessor.addEventSource(new eventsources.DynamoEventSource(ordersTable, {
      startingPosition: lambda.StartingPosition.LATEST,
    }));

    autoEmailVerifier.addEventSource(new eventsources.DynamoEventSource(ordersTable, {
      startingPosition: lambda.StartingPosition.LATEST,
      filters: [lambda.FilterCriteria.filter({
        eventName: lambda.FilterRule.isEqual('INSERT')
      })]
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'ECommerceApi', {
      restApiName: 'E-Commerce API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // API Routes
    const products = api.root.addResource('products');
    products.addMethod('GET', new apigateway.LambdaIntegration(productsFunction));
    products.addMethod('POST', new apigateway.LambdaIntegration(productsFunction));

    const orders = api.root.addResource('orders');
    orders.addMethod('POST', new apigateway.LambdaIntegration(ordersFunction));
    orders.addMethod('GET', new apigateway.LambdaIntegration(ordersFunction));

    const verify = api.root.addResource('verify-email');
    verify.addMethod('POST', new apigateway.LambdaIntegration(emailVerifier));

    const checkStatus = api.root.addResource('email-status');
    checkStatus.addMethod('POST', new apigateway.LambdaIntegration(emailStatusChecker));

    const uploadImage = api.root.addResource('upload-image');
    uploadImage.addMethod('POST', new apigateway.LambdaIntegration(imageUploader));

    const userAuth = api.root.addResource('auth');
    userAuth.addMethod('POST', new apigateway.LambdaIntegration(userManager));

    // Deploy Frontend
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./frontend')],
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