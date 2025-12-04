import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Accounting Classifier v1 function up and running!");

// Mock Chart of Accounts
const CHART_OF_ACCOUNTS = {
    "6100": "Software Subscriptions",
    "6200": "Travel & Entertainment",
    "6300": "Office Supplies",
    "6400": "Professional Services",
    "5000": "Hosting & Infrastructure"
};

serve(async (req) => {
  try {
    const { task_spec } = await req.json();
    console.log("Accounting Classifier received task:", task_spec);

    // Input is usually the output from the extractor, passed in via context or extracted_entities
    const invoiceData = task_spec.context || task_spec.extracted_entities || {};
    const vendor = (invoiceData.vendor || "").toLowerCase();
    const description = (invoiceData.description || "").toLowerCase();

    let accountCode = "6300"; // Default: Office Supplies
    let confidence = 0.5;

    // Simple classification logic for demo
    if (vendor.includes("uber") || vendor.includes("lyft") || vendor.includes("hotel")) {
        accountCode = "6200"; // Travel
        confidence = 0.95;
    } else if (vendor.includes("aws") || vendor.includes("google cloud") || vendor.includes("vercel")) {
        accountCode = "5000"; // Hosting
        confidence = 0.98;
    } else if (vendor.includes("notion") || vendor.includes("slack") || vendor.includes("cursor")) {
        accountCode = "6100"; // Software
        confidence = 0.92;
    } else if (vendor.includes("law") || vendor.includes("legal")) {
        accountCode = "6400"; // Legal/Prof Services
        confidence = 0.90;
    }

    const entry = {
        debit: {
            code: accountCode,
            name: CHART_OF_ACCOUNTS[accountCode],
            amount: invoiceData.total || 0
        },
        credit: {
            code: "1000", // Cash
            name: "Operating Cash",
            amount: invoiceData.total || 0
        },
        description: `Expense: ${invoiceData.vendor} - ${invoiceData.line_items?.[0]?.description || 'Service'}`,
        date: invoiceData.invoice_date
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
            entries: [entry],
            confidence: confidence
        },
        metadata: {
            agent: "accounting-classifier-v1",
            version: "1.0.0"
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

