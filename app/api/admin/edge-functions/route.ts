import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-server'
import { isAdminEmail } from '@/lib/admin-server'
import { promises as fs } from 'fs'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const { data: { user } } = await getCurrentUser()
    
    if (!isAdminEmail(user?.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { function_name, code } = body

    if (!function_name) {
      return NextResponse.json(
        { error: 'Function name is required' },
        { status: 400 }
      )
    }

    // Validate function name (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(function_name)) {
      return NextResponse.json(
        { error: 'Function name must be lowercase alphanumeric with hyphens only' },
        { status: 400 }
      )
    }

    // Create function directory and file
    const functionDir = join(process.cwd(), 'supabase', 'functions', function_name)
    const functionFile = join(functionDir, 'index.ts')

    try {
      // Create directory if it doesn't exist
      await fs.mkdir(functionDir, { recursive: true })
      
      // Write the function file
      await fs.writeFile(functionFile, code || getDefaultFunctionCode(function_name), 'utf-8')

      return NextResponse.json({
        success: true,
        message: 'Edge function created successfully',
        path: `supabase/functions/${function_name}/index.ts`,
        deploy_command: `supabase functions deploy ${function_name}`
      })
    } catch (fileError: any) {
      return NextResponse.json(
        { error: `Failed to create file: ${fileError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function getDefaultFunctionCode(functionName: string): string {
  return `// Supabase Edge Function: ${functionName}
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Your function logic here
    const body = await req.json();
    
    return new Response(
      JSON.stringify({ success: true, message: 'Function executed successfully' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
`
}

