import { supabase } from "../supabaseClient.js";

export async function getMonthlySummary({ from, to }) {

    let query = supabase
        .from("monthly_summary")
        .select("*")
        .order("month", { ascending: true });

    if (from) {
        query = query.gte("month", from);
    }

    if (to) {
        query = query.lte("month", to);
    }

    const { data, error } = await query;

    if (error) {
        console.error(error);
        throw new Error("Failed to fetch monthly summary");
    }

    return data;
}

export async function getMonthlySummaryByMonth(month) {
    if (!/^\d{4}-\d{2}-01$/.test(month)) {
        throw new Error("Month must be in YYYY-MM-01 format");
    }

    const { data, error } = await supabase
        .from("monthly_summary")
        .select("*")
        .eq("month", month)
        .single();

    if (error && error.code !== "PGRST116") {
        console.error(error);
        throw new Error("Failed to fetch monthly summary");
    }

    return data || null;
}