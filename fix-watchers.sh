#!/bin/bash

echo "🔧 Fixing file watcher limit issue..."

# Check current limit
current_limit=$(cat /proc/sys/fs/inotify/max_user_watches)
echo "Current file watcher limit: $current_limit"

if [ "$current_limit" -lt 524288 ]; then
    echo "⚠️  File watcher limit is too low. Attempting to increase it..."
    
    # Try to increase temporarily
    echo "Attempting temporary fix..."
    sudo sysctl fs.inotify.max_user_watches=524288
    
    # Make it permanent
    echo "Making change permanent..."
    echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
    
    echo "✅ File watcher limit increased to 524288"
    echo "🔄 You may need to restart your terminal or run: sudo sysctl -p"
else
    echo "✅ File watcher limit is already sufficient"
fi

echo ""
echo "Alternative solutions if the above doesn't work:"
echo "1. Use polling mode (already configured in vite.config.ts)"
echo "2. Reduce the number of files being watched"
echo "3. Close other applications that might be using file watchers"
echo ""
echo "If you still have issues, try running the dev server with:"
echo "npm run dev -- --force"