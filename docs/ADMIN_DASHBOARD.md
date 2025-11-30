# Admin Dashboard

## Overview

The Admin Dashboard provides comprehensive management capabilities for agents and edge functions. When logged in as `admin@thenetwork.life`, the dashboard shows all agent usage across the entire platform (not just for the admin user).

## Features

### 1. **Admin-Only View**
- When logged in as admin, the agents page shows:
  - All agent usage across all users
  - Total uses (all users combined)
  - Active users count
  - Overall success rate
  - Top agents by usage

### 2. **Agent Management**
- **Location**: `/admin/manage`
- **Features**:
  - View all agents in a table
  - Create new agents
  - Configure agent details:
    - Name, slug, description
    - Domain (task type)
    - Invocation type (INTERNAL_FUNCTION or EXTERNAL_API)
    - Function name, endpoint, method
  - Automatically creates `agent_capabilities` entry

### 3. **Edge Function Creation**
- **Location**: `/admin/manage`
- **Features**:
  - Create new Supabase Edge Functions
  - Generates function file at: `supabase/functions/{function_name}/index.ts`
  - Provides default template code
  - Includes CORS headers and error handling
  - Shows deployment command after creation

## Admin Detection

The system detects admin users by:
- **Client-side**: Checks for `agent_store_auth_token` in localStorage
- **Server-side**: Checks if email matches `admin@thenetwork.life`

## API Routes

### `GET /api/admin/agents`
- Returns all agents (admin only)
- Requires admin authentication

### `POST /api/admin/agents`
- Creates a new agent
- Validates required fields
- Checks for duplicate slugs
- Creates default capabilities entry
- **Body**:
  ```json
  {
    "name": "Agent Name",
    "slug": "agent-slug",
    "description": "Agent description",
    "domain": "task_type",
    "invocation_type": "INTERNAL_FUNCTION",
    "invocation_config": {
      "method": "POST",
      "endpoint": "/functions/v1/function-name",
      "function_name": "function-name"
    }
  }
  ```

### `POST /api/admin/edge-functions`
- Creates a new edge function file
- Validates function name (lowercase alphanumeric + hyphens)
- Creates directory structure
- Writes function code
- **Body**:
  ```json
  {
    "function_name": "my-function",
    "code": "// function code here"
  }
  ```

## Usage

### Accessing Admin Dashboard

1. Log in with `admin@thenetwork.life`
2. Navigate to `/agents` - you'll see admin stats
3. Click "Manage Agents" button to go to `/admin/manage`

### Creating an Agent

1. Go to `/admin/manage`
2. Click "+ Add Agent"
3. Fill in the form:
   - **Name**: Display name (e.g., "Prime")
   - **Slug**: URL-friendly identifier (e.g., "prime")
   - **Description**: What the agent does
   - **Domain**: Task type it handles (e.g., "event_planning")
   - **Invocation Type**: INTERNAL_FUNCTION or EXTERNAL_API
   - **Function Name**: Edge function name (e.g., "prime-agent")
   - **Endpoint**: API endpoint (e.g., "/functions/v1/prime-agent")
   - **Method**: HTTP method (usually POST)
4. Click "Create Agent"
5. Agent is created with default capabilities

### Creating an Edge Function

1. Go to `/admin/manage`
2. Click "+ Create Edge Function"
3. Enter function name (lowercase, alphanumeric, hyphens only)
4. Click "Create Edge Function"
5. Function file is created at `supabase/functions/{name}/index.ts`
6. Deploy using: `supabase functions deploy {name}`

## Default Edge Function Template

The created edge function includes:
- Supabase client setup
- Environment variable checks
- CORS headers
- OPTIONS request handling
- Error handling
- JSON response format

## Security

- All admin routes require authentication
- Server-side checks verify admin email
- Client-side checks verify auth token
- Non-admin users are redirected to `/agents`

## Files Created/Modified

### New Files
- `lib/admin.ts` - Client-side admin utilities
- `lib/admin-server.ts` - Server-side admin utilities
- `app/(dashboard)/admin/manage/page.tsx` - Admin management UI
- `app/api/admin/agents/route.ts` - Agent management API
- `app/api/admin/edge-functions/route.ts` - Edge function creation API

### Modified Files
- `app/(dashboard)/agents/page.tsx` - Added admin view with all usage stats

## Future Enhancements

- Edit/delete agents
- Deploy edge functions directly from UI
- View edge function logs
- Agent performance analytics
- Bulk operations
- Agent templates

