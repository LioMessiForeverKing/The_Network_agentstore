#!/bin/bash

# Test script to verify Gaia router deployment
# Usage: ./scripts/test-gaia-deployment.sh

echo "Testing Gaia Router Deployment..."
echo ""

# Get project details from environment or prompt
read -p "Enter your Supabase project URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase service role key: " SERVICE_KEY

echo ""
echo "Testing Gaia router endpoint..."

# Test the endpoint
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${SUPABASE_URL}/functions/v1/gaia-router" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SERVICE_KEY}" \
  -d '{
    "task_spec": {
      "type": "EVENT_PLANNING",
      "user_id": "test-user-id",
      "stella_handle": "@test.network",
      "context": {
        "event_details": {
          "date": "2025-12-06",
          "location": "San Francisco, CA"
        }
      }
    }
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" == "404" ]; then
  echo "❌ ERROR: Function not found (404)"
  echo ""
  echo "Possible issues:"
  echo "1. Function 'gaia-router' is not deployed"
  echo "2. Function name mismatch (check for typos)"
  echo "3. Wrong project URL"
  echo ""
  echo "To deploy:"
  echo "  supabase functions deploy gaia-router"
elif [ "$HTTP_CODE" == "401" ]; then
  echo "❌ ERROR: Unauthorized (401)"
  echo "Check your service role key"
elif [ "$HTTP_CODE" == "200" ]; then
  echo "✅ SUCCESS: Gaia router is working!"
else
  echo "⚠️  Unexpected status code: $HTTP_CODE"
  echo "Response: $BODY"
fi

