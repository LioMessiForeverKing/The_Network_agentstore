# Phase 2: Accounting v1 Workflow - Implementation Plan

## Objective
Build a reliable, audit-ready accounting workflow that takes a raw invoice and produces a validated, classified accounting entry.

## 1. The Agents

We will create two specialized agents in the `agents` table.

### Agent A: Invoice Extractor (`invoice-extractor-v1`)
*   **Role**: The "Data Entry Clerk".
*   **Domain**: `FINANCE`
*   **Task Type**: `INVOICE_EXTRACTION`
*   **Capability**: Extracts structured data from unstructured text/PDF.
*   **Input**: Raw text or JSON wrapper around file content.
*   **Output Schema**:
    ```json
    {
      "vendor": "String",
      "invoice_number": "String",
      "date": "YYYY-MM-DD",
      "total_amount": Number,
      "currency": "USD",
      "line_items": [{ "description": "String", "amount": Number }]
    }
    ```
*   **Implementation**: Initially wraps a strong LLM (e.g., GPT-4o) with a strict system prompt enforcing JSON output.

### Agent B: Accounting Classifier (`accounting-classifier-v1`)
*   **Role**: The "Bookkeeper".
*   **Domain**: `FINANCE`
*   **Task Type**: `ACCOUNTING_CLASSIFICATION`
*   **Capability**: Maps invoice data to a Chart of Accounts.
*   **Input**: The JSON output from Agent A + a Chart of Accounts context.
*   **Output Schema**:
    ```json
    {
      "debit_account": { "code": "String", "name": "String" },
      "credit_account": { "code": "String", "name": "String" },
      "description": "String",
      "confidence": Number
    }
    ```
*   **Implementation**: Wraps an LLM with context about standard accounting categories (e.g., knowing "Stripe" -> "Fees" or "Software").

## 2. The Workflow (`accounting-workflow` Edge Function)

This function acts as the **Orchestrator**. It does *not* use AI itself; it coordinates the AI agents.

### Logic Flow
1.  **Receive Request**: Accepts `POST /accounting-workflow` with `{ "invoice_text": "..." }`.
2.  **Step 1 (Extraction)**:
    *   Calls `gaia-router` with `task_type: "INVOICE_EXTRACTION"`.
    *   Passes the raw text.
    *   Receives structured JSON.
3.  **Step 2 (Classification)**:
    *   Calls `gaia-router` with `task_type: "ACCOUNTING_CLASSIFICATION"`.
    *   Passes the extraction result.
    *   Receives accounting entry.
4.  **Step 3 (Validation)**:
    *   Calls `validator-agent` (via Gaia or direct).
    *   Asks: "Does the extracted total match the classification? Is the date valid?"
5.  **Return Result**:
    *   Returns the final object with Extraction, Classification, and Validation Status.

## 3. Implementation Steps

1.  **SQL Migration**: Create `20250104_create_accounting_agents.sql` to insert the agents.
2.  **Edge Function**: Create `agent_store/supabase/functions/accounting-workflow/index.ts`.
3.  **Testing**: Use `curl` to send a sample invoice text and verify the full chain.

## 4. Why This is "Enterprise Grade"
*   **Separation of Concerns**: Extractor doesn't classify; Classifier doesn't extract.
*   **Audit Trail**: Every step is routed through Gaia, generating an `agent_usage_log`.
*   **Validation**: The workflow includes an explicit check step.

