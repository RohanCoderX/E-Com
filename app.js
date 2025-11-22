#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const ecommerce_stack_1 = require("./lib/ecommerce-stack");
const app = new cdk.App();
// Main application stack
new ecommerce_stack_1.ECommerceStack(app, 'ECommerceStack', {
    env: {
        account: '503767747826',
        region: 'us-west-2',
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxtQ0FBbUM7QUFDbkMsMkRBQXVEO0FBRXZELE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLHlCQUF5QjtBQUN6QixJQUFJLGdDQUFjLENBQUMsR0FBRyxFQUFFLGdCQUFnQixFQUFFO0lBQ3hDLEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxjQUFjO1FBQ3ZCLE1BQU0sRUFBRSxXQUFXO0tBQ3BCO0NBQ0YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IEVDb21tZXJjZVN0YWNrIH0gZnJvbSAnLi9saWIvZWNvbW1lcmNlLXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcblxuLy8gTWFpbiBhcHBsaWNhdGlvbiBzdGFja1xubmV3IEVDb21tZXJjZVN0YWNrKGFwcCwgJ0VDb21tZXJjZVN0YWNrJywge1xuICBlbnY6IHtcbiAgICBhY2NvdW50OiAnNTAzNzY3NzQ3ODI2JyxcbiAgICByZWdpb246ICd1cy13ZXN0LTInLFxuICB9LFxufSk7Il19