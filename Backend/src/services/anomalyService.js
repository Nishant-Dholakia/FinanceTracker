import fetch from "node-fetch";

const ML_SERVICE_URL = `${process.env.ML_API_URL}/anomaly-detect-batch`;

export async function detectMonthlyAnomaliesBatch(expenses) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(ML_SERVICE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": process.env.ML_API_KEY },
            body: JSON.stringify({ expenses }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`ML error ${response.status}: ${text}`);
        }

        return response.json();
    } finally {
        clearTimeout(timeout);
    }
}
