
// Supabase Edge Function: accounting-workflow
// Orchestrates the Invoice Extraction -> Classification -> Validation chain

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const input = await req.json();
    console.log("Accounting Workflow received input:", JSON.stringify(input).substring(0, 200));

    // 1. Ingest Input
    const rawInvoice = input.raw_message || input.description || input.invoice_text || "Unknown Invoice Content";
    const userId = input.user_id || "demo-user-workflow";
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const GAIA_URL = `${SUPABASE_URL}/functions/v1/gaia-router`;

    if (!SUPABASE_URL || !SERVICE_KEY) {
        throw new Error("Missing Supabase environment variables");
    }

    // Helper to call Gaia
    async function callGaia(taskSpec: any) {
        console.log(`[Workflow] Calling Gaia for ${taskSpec.type}...`);
        const response = await fetch(GAIA_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'apikey': SERVICE_KEY
            },
            body: JSON.stringify({ task_spec: taskSpec })
        });
        
        if (!response.ok) {
            const txt = await response.text();
            console.error(`[Workflow] Gaia call failed: ${txt}`);
            throw new Error(`Gaia call failed: ${txt}`);
        }
        return await response.json();
    }

    // ---------------------------------------------------------
    // Step 1: Invoice Extraction
    // ---------------------------------------------------------
    const extractionTask = {
        type: "INVOICE_EXTRACTION",
        user_id: userId,
        raw_message: rawInvoice,
        stella_handle: "@workflow.orchestrator"
    };
    
    const extractionResponse = await callGaia(extractionTask);
    if (!extractionResponse.success) {
        throw new Error(`Extraction agent failed: ${JSON.stringify(extractionResponse)}`);
    }
    
    // Gaia returns { execution_result: { ...agent_output... } }
    const extractedInvoice = extractionResponse.execution_result;
    console.log("[Workflow] Extraction complete. Vendor:", extractedInvoice.vendor);

    // ---------------------------------------------------------
    // Step 2: Accounting Classification
    // ---------------------------------------------------------
    const classificationTask = {
        type: "ACCOUNTING_CLASSIFICATION",
        user_id: userId,
        context: {
            invoice_data: extractedInvoice,
            // In a real app, we'd fetch the specific client's Chart of Accounts here
            chart_of_accounts: [
                { code: "6100", name: "Office Supplies" },
                { code: "6200", name: "Software Subscriptions" },
                { code: "6300", name: "Travel & Meals" },
                { code: "6900", name: "Miscellaneous Expenses" },
                { code: "2000", name: "Accounts Payable" }
            ]
        },
        stella_handle: "@workflow.orchestrator"
    };

    const classificationResponse = await callGaia(classificationTask);
    if (!classificationResponse.success) {
        throw new Error(`Classification agent failed: ${JSON.stringify(classificationResponse)}`);
    }

    const accountingEntry = classificationResponse.execution_result;
    console.log("[Workflow] Classification complete. Code:", accountingEntry.entries?.[0]?.account_code);

    // ---------------------------------------------------------
    // Step 2.5: Transaction Matching (Reconciliation)
    // ---------------------------------------------------------
    // Mock Bank Feed for matching
    const MOCK_BANK_FEED = [
        { id: "txn_001", date: "2023-10-24", amount: 45.50, vendor: "UBER" },
        { id: "txn_002", date: "2023-10-24", amount: 24.50, vendor: "UBER" },
        { id: "txn_003", date: "2023-11-01", amount: 135.50, vendor: "AWS" }, // Matches AWS sample total
        { id: "txn_004", date: "2023-11-12", amount: 12.85, vendor: "STARBUCKS" }
    ];

    const extractedTotal = parseFloat(extractedInvoice.total || "0");
    const invoiceDate = extractedInvoice.invoice_date || "";
    
    // Simple matching logic: Amount matches +/- 0.01 AND Date matches exactly
    const bankMatch = MOCK_BANK_FEED.find(t => 
        Math.abs(t.amount - extractedTotal) < 0.01 &&
        t.date === invoiceDate
    );

    const matchingResult = bankMatch ? {
        status: "MATCHED",
        transaction_id: bankMatch.id,
        confidence: 1.0,
        details: `Matched to bank txn ${bankMatch.id}: ${bankMatch.vendor} $${bankMatch.amount}`
    } : {
        status: "UNMATCHED",
        transaction_id: null,
        confidence: 0.0,
        details: "No matching transaction found in bank feed."
    };

    console.log(`[Workflow] Transaction Match: ${matchingResult.status}`);

    // ---------------------------------------------------------
    // Step 3: Validation (The "Self-Correction" Check)
    // ---------------------------------------------------------
    // We explicitly call the Validator to check the consistency of the extraction vs classification
    // E.g. "Does the extracted total match the debit amount?"
    
    // Note: Gaia usually auto-validates, but we want an explicit workflow validation step 
    // that considers *both* extraction and classification together.
    
    // We can reuse the generic validator or a custom logic. 
    // For v0, we'll verify simple math logic right here in the workflow, 
    // mimicking what a "Validator Agent" would do, to ensure reliability.
    
    let validationStatus = "PASS";
    let validationRationale = "All checks passed.";
    
    // extractedTotal is already defined above
    const entryDebit = parseFloat(accountingEntry.entries?.[0]?.debit || "0");
    
    if (Math.abs(extractedTotal - entryDebit) > 0.01) {
        validationStatus = "FAIL";
        validationRationale = `Mismatch: Extracted total ($${extractedTotal}) != Entry debit ($${entryDebit})`;
    } else if (extractedInvoice.confidence < 0.7) {
        validationStatus = "NEEDS_REVIEW";
        validationRationale = "Low confidence in extraction.";
    } else if (accountingEntry.anomalies && accountingEntry.anomalies.length > 0) {
        validationStatus = "NEEDS_REVIEW";
        validationRationale = `Anomalies detected: ${accountingEntry.anomalies.join(", ")}`;
    }

    console.log(`[Workflow] Validation Status: ${validationStatus} (${validationRationale})`);

    // ---------------------------------------------------------
    // 4. Final Response
    // ---------------------------------------------------------
    
    return new Response(
      JSON.stringify({
        success: true,
        workflow_id: `wf_${Date.now()}`,
        status: validationStatus === "FAIL" ? "FAILED" : "COMPLETED",
        validation: {
            status: validationStatus,
            rationale: validationRationale
        },
        data: {
            raw_invoice_summary: rawInvoice.substring(0, 50) + "...",
            extracted_invoice: extractedInvoice,
            accounting_entry: accountingEntry,
            transaction_matching: matchingResult // Added matching result
        },
        meta: {
            latency_ms: Date.now(), // Placeholder
            agents: [
                extractionResponse.routes[0].agent_slug,
                classificationResponse.routes[0].agent_slug
            ]
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Workflow failed:", error);
    return new Response(
      JSON.stringify({ 
          success: false, 
          error: error.message || String(error),
          stage: "WORKFLOW_ERROR" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
