#!/bin/sh
set -e

echo "🔍 Validating required environment variables for frontend..."

REQUIRED_VARS="SUPABASE_URL SUPABASE_ANON_KEY"

MISSING_VARS=""

for var in $REQUIRED_VARS; do
  eval "value=\$$var"
  if [ -z "$value" ]; then
    MISSING_VARS="$MISSING_VARS $var"
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

if [ -n "$MISSING_VARS" ]; then
  echo ""
  echo "❌ ERROR: Missing required environment variables:$MISSING_VARS"
  echo "Frontend requires Supabase configuration to access the API"
  exit 1
fi

echo ""
echo "✅ All required environment variables are set!"
echo ""

# Start nginx
exec nginx -g "daemon off;"
