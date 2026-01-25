import { useEffect } from "react";
import { getExpenseByMonth } from "../services/apiService";

export default function Check() {
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const expenseData = await getExpenseByMonth('2026-01-01');
                console.log(expenseData);
            } catch (err) {
                console.error("Failed to fetch expenses:", err);
            }
        };


        fetchExpenses();
    }, []);


    return <>Testing Page</>;
}