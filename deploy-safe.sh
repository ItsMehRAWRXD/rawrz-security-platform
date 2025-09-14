#!/bin/bash

# RawrZ Security Platform - Safe DigitalOcean Deployment Script
set -e

echo "🚀 Starting RawrZ Security Platform deployment to DigitalOcean..."

# Check for required environment variables
if [ -z "$DIGITALOCEAN_ACCESS_TOKEN" ]; then
    echo "❌ DIGITALOCEAN_ACCESS_TOKEN environment variable is required"
    echo "   Export your DigitalOcean token: export DIGITALOCEAN_ACCESS_TOKEN=your_token"
    exit 1
fi

echo "📋 Checking prerequisites..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "📦 Installing doctl CLI..."
    
    # Download and install doctl
    cd /tmp
    wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
    tar xf doctl-1.104.0-linux-amd64.tar.gz
    sudo mv doctl /usr/local/bin
    cd -
    
    echo "✅ doctl installed successfully"
fi

# Authenticate with DigitalOcean
echo "🔐 Authenticating with DigitalOcean..."
doctl auth init --access-token $DIGITALOCEAN_ACCESS_TOKEN

echo "✅ Authentication successful"

# Verify account
echo "👤 Account information:"
doctl account get

echo "📱 Creating DigitalOcean App..."

# Create the app using the spec file
APP_ID=$(doctl apps create --spec .do/app.yaml --format ID --no-header)

if [ -z "$APP_ID" ]; then
    echo "❌ Failed to create app"
    exit 1
fi

echo "✅ App created successfully with ID: $APP_ID"

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
doctl apps get $APP_ID --wait

# Get app info
echo "📊 App deployment status:"
doctl apps get $APP_ID

# Get app URL
APP_URL=$(doctl apps get $APP_ID --format LiveURL --no-header)

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "🌐 Your RawrZ Security Platform is now live at:"
echo "   Main App: $APP_URL"
echo "   Admin Panel: $APP_URL/panel"
echo "   API Health: $APP_URL/api/health"
echo ""
echo "🔧 App ID: $APP_ID"
echo "💡 You can manage your app at: https://cloud.digitalocean.com/apps/$APP_ID"
echo ""
echo "✨ All 110+ security features are now available via web interface!"