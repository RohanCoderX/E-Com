#!/bin/bash
echo "Setting up Git hooks for auto-deployment..."

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
echo "Auto-deploying to AWS..."
npm run build
cdk deploy --require-approval never
EOF

chmod +x .git/hooks/pre-push
echo "Git hook installed! Now 'git push' will auto-deploy."