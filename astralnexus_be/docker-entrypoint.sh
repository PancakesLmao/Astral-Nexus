#!/bin/sh
set -e

echo "🔍 Validating required environment variables..."

REQUIRED_VARS="NODE_ENV PORT DATABASE_URL SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY SESSION_DOMAIN CORS_ORIGIN"

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
  exit 1
fi

echo ""
echo "✅ All required environment variables are set!"
echo ""

exec ./server
