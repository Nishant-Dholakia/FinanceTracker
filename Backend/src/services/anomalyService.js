import fetch from "node-fetch";

const ML_SERVICE_URL = `${process.env.ML_API_URL}/anomaly-detect`;

export async function detect_anomaly(expense) {
    if (!expense || typeof expense !== "object") {
        throw new Error("Request body missing or invalid");
    }

    var {
        amount,
        category_code,
        is_discretionary,
        transaction_date,
    } = expense;

    // ✅ FORCE boolean → int
    if (typeof is_discretionary === "boolean") {
        is_discretionary = is_discretionary ? 1 : 0;
    }
    // console.log(expense);
    // Strict validation
    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        typeof category_code !== "string" ||
        typeof is_discretionary !== "number" ||

        typeof transaction_date !== "string"
    ) {
        throw new Error("Invalid anomaly request payload");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let response;

    try {
        response = await fetch(ML_SERVICE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount,
                category_code,
                is_discretionary,
                transaction_date,
            }),
            signal: controller.signal,
        });
    } catch (err) {
        // 🚨 Network / timeout error
        console.error("❌ ML NETWORK ERROR");
        console.error("URL:", ML_SERVICE_URL);
        console.error("MESSAGE:", err.message);

        throw new Error(`ML service network error: ${err.message}`);
    }
    finally {
        clearTimeout(timeout);
    }

    /* ---------- HTTP ERROR HANDLING ---------- */

    if (!response.ok) {
        const errorText = await response.text();

        console.error("❌ ML HTTP ERROR");
        console.error("URL:", ML_SERVICE_URL);
        console.error("STATUS:", response.status);
        console.error("DATA:", errorText);

        throw new Error(`ML service error ${response.status}: ${errorText}`);
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `ML service error (${response.status}): ${text}`
        );
    }

    return response.json();
}
