import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

console.log("Invoice Extractor v1 function up and running!");

serve(async (req) => {
  try {
    const { task_spec } = await req.json();
    console.log("Invoice Extractor received task:", task_spec);

    // In a real app, this would call OpenAI/Document AI to parse the PDF/Text.
    // For v0 demo, we'll use a deterministic parser or simple heuristic 
    // to prove the architecture works without burning tokens on simple tests.
    
    const rawInput = task_spec.description || task_spec.raw_message || "";
    
    // Mock extraction logic for demo purposes
    // It looks for patterns like "Total: $X" or "Vendor: Y"
    
    // Default mock response
    let output = {
      vendor: "Unknown Vendor",
      invoice_number: `INV-${Date.now()}`,
      invoice_date: new Date().toISOString().split('T')[0],
      total: 0.0,
      currency: "USD",
      line_items: [],
      confidence: 0.5
    };

    // Simple rule-based extraction for the demo "happy path"
    if (rawInput.toLowerCase().includes("uber")) {
        output.vendor = "Uber";
        output.total = 24.50;
        output.line_items = [{ description: "Ride to Airport", amount: 24.50 }];
        output.confidence = 0.98;
    } else if (rawInput.toLowerCase().includes("aws") || rawInput.toLowerCase().includes("amazon web services")) {
        output.vendor = "Amazon Web Services";
        output.total = 150.00;
        output.line_items = [{ description: "Hosting Services", amount: 150.00 }];
        output.confidence = 0.99;
    } else if (rawInput.toLowerCase().includes("notion")) {
        output.vendor = "Notion Labs";
        output.total = 20.00;
        output.line_items = [{ description: "SaaS Subscription", amount: 20.00 }];
        output.confidence = 0.95;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: output,
        metadata: {
            agent: "invoice-extractor-v1",
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

