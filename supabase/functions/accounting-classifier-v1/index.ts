
// Supabase Edge Function: accounting-classifier-v1
// Domain: FINANCE
// Task: ACCOUNTING_CLASSIFICATION

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
    const { task_spec } = await req.json();
    
    // Expect input from invoice-extractor
    const invoiceData = task_spec?.context?.invoice_data || {};
    const chartOfAccounts = task_spec?.context?.chart_of_accounts || [];

    console.log(`[Classifier] Classifying for vendor: ${invoiceData.vendor}`);

    const entries: any[] = [];
    const anomalies: string[] = [];

    // Demo Logic: Simple rule-based classification
    // In prod, this uses embeddings or LLM to match description to account name
    
    const vendor = (invoiceData.vendor || "").toLowerCase();
    
    let accountCode = "6900"; // Default: Misc Expense
    let accountName = "Miscellaneous Expenses";
    let reasoning = "Vendor not recognized in rule set; defaulted to Miscellaneous Expenses.";

    if (vendor.includes("uber") || vendor.includes("lyft") || vendor.includes("delta")) {
      accountCode = "6300";
      accountName = "Travel & Meals";
      reasoning = `Vendor '${invoiceData.vendor}' identified as travel/transportation provider.`;
    } else if (vendor.includes("aws") || vendor.includes("github") || vendor.includes("adobe") || vendor.includes("slack")) {
      accountCode = "6200";
      accountName = "Software Subscriptions";
      reasoning = `Vendor '${invoiceData.vendor}' matches known software/SaaS rule list (EC2, Cloud, Licenses).`;
    } else if (vendor.includes("staples") || vendor.includes("office") || vendor.includes("wework")) {
      accountCode = "6100";
      accountName = "Office Supplies & Rent";
      reasoning = `Vendor '${invoiceData.vendor}' matched to office facilities/supplies expense rules.`;
    } else if (vendor.includes("starbucks")) {
      accountCode = "6300";
      accountName = "Travel & Meals";
      reasoning = `Vendor '${invoiceData.vendor}' classified as meals/entertainment category.`;
    }

    // Verify account exists in provided chart
    const validAccount = chartOfAccounts.find((a: any) => a.code === accountCode);
    if (!validAccount && chartOfAccounts.length > 0) {
        // If extracted code isn't in the provided chart, fallback to the first one or flag anomaly
        anomalies.push(`Predicted account ${accountCode} not found in provided Chart of Accounts.`);
        if (chartOfAccounts[0]) {
            accountCode = chartOfAccounts[0].code;
            accountName = chartOfAccounts[0].name;
            reasoning += ` (Note: Original code not found in client chart, mapped to default ${accountCode})`;
        }
    }

    // Create Debit Entry (Expense)
    entries.push({
      account_code: accountCode,
      account_name: accountName,
      debit: invoiceData.total || 0,
      credit: 0,
      description: `Expense: ${invoiceData.vendor}`,
      tags: ["auto-classified", "expense"],
      reasoning: reasoning // Added Reasoning Field
    });

    // Create Credit Entry (Accounts Payable or Cash)
    entries.push({
      account_code: "2000",
      account_name: "Accounts Payable",
      debit: 0,
      credit: invoiceData.total || 0,
      description: `Payable: ${invoiceData.vendor}`,
      tags: ["liability"]
    });

    const result = {
      entries,
      anomalies,
      confidence: 0.95 // High confidence for rule-based demo
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

