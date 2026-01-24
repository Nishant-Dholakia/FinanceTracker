import { useEffect } from "react";
import { getAllExpenses } from "../services/apiService";

export default function Check() {
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const expenseData = await getAllExpenses();
                console.log(expenseData);
            } catch (err) {
                console.error("Failed to fetch expenses:", err);
            }
        };


        fetchExpenses();
    }, []);


    return <>Testing Page</>;
}