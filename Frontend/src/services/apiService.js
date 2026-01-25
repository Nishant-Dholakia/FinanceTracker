// src/services/apiService.js
import apiClient from "../config/ApiClient";

export async function getAllExpenses() {
  const response = await apiClient.get("/expenses");
  return response.data;
}

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


