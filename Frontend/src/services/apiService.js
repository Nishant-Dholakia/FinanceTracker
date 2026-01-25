// src/services/apiService.js
import apiClient from "../config/ApiClient";

export async function getAllExpenses() {
  const response = await apiClient.get("/expenses");
  return response.data;
}

<<<<<<< HEAD
export async function addExpense(expensesData) {
  const response = await apiClient.post("/expenses", expensesData);
  return response.data;
}

=======
export const addExpense = async (expensesData) => {
  // console.log(expensesData);
    const response = await apiClient.post(`/expenses`,expensesData);
  return response.data;
};

export const addIncomeToMonth = async (incomeData) => {
  console.log(incomeData);
    const response = await apiClient.post(`/income`,incomeData);
  return response.data;
};
>>>>>>> 4a1226b87510df3104e19e2a66c773e6fc2868a8


