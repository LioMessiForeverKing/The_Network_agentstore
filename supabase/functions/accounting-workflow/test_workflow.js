
// Mock Gaia Response Simulator
const mockGaiaRouter = async (url, options) => {
    const body = JSON.parse(options.body);
    const taskType = body.task_spec.type;

    console.log(`[Mock Gaia] Handling ${taskType}...`);

    if (taskType === "INVOICE_EXTRACTION") {
        return {
            ok: true,
            json: async () => ({
                success: true,
                routes: [{ agent_slug: "invoice-extractor-v1" }],
                execution_result: {
                    vendor: "Uber Technologies",
                    total: "45.50",
                    confidence: 0.98
                }
            })
        };
    }

    if (taskType === "ACCOUNTING_CLASSIFICATION") {
        return {
            ok: true,
            json: async () => ({
                success: true,
                routes: [{ agent_slug: "accounting-classifier-v1" }],
                execution_result: {
                    entries: [{
                        account_code: "6300",
                        account_name: "Travel",
                        debit: 45.50 // Matches extraction
                    }],
                    anomalies: []
                }
            })
        };
    }

    return { ok: false, statusText: "Unknown task" };
};

// Workflow Logic (extracted for testing)
async function runWorkflowSimulation() {
    console.log("--- Starting Accounting Workflow Simulation ---");

    // Mock fetch
    global.fetch = mockGaiaRouter;
    
    // Mock Env
    global.Deno = {
        env: {
            get: (key) => key === 'SUPABASE_URL' ? 'https://mock.supabase.co' : 'mock-key'
        }
    };

    // 1. Extraction
    console.log("Step 1: Extraction");
    const extResp = await fetch('...', {
        method: 'POST',
        body: JSON.stringify({ task_spec: { type: "INVOICE_EXTRACTION" } })
    });
    const extData = (await extResp.json()).execution_result;
    console.log("Extracted:", extData);

    // 2. Classification
    console.log("Step 2: Classification");
    const classResp = await fetch('...', {
        method: 'POST',
        body: JSON.stringify({ task_spec: { type: "ACCOUNTING_CLASSIFICATION" } })
    });
    const classData = (await classResp.json()).execution_result;
    console.log("Classified:", classData);

    // 3. Validation Logic (The code we want to test)
    console.log("Step 3: Validation");
    let status = "PASS";
    const extTotal = parseFloat(extData.total);
    const debit = classData.entries[0].debit;

    if (Math.abs(extTotal - debit) > 0.01) {
        status = "FAIL";
    }
    
    console.log(`Validation Status: ${status} (Total: ${extTotal} vs Debit: ${debit})`);
    
    if (status === "PASS") {
        console.log("✅ SUCCESS: Workflow logic is valid.");
    } else {
        console.error("❌ FAILURE: Logic validation failed.");
    }
}

runWorkflowSimulation();

