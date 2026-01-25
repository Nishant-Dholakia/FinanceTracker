// src/services/apiService.js
import apiClient from "../config/ApiClient";

export async function getAllExpenses() {
  const response = await apiClient.get("/expenses");
  return response.data;
}

export async function addExpense(expensesData) {
  const response = await apiClient.post("/expenses", expensesData);
  return response.data;
};

export const getExpenseByMonth = async (month) => {
    const response = await apiClient.get(`/expenses/month/${month}`);
  return response.data;
};



export const addIncomeToMonth = async (incomeData) => {
  console.log(incomeData);
    const response = await apiClient.post(`/income`,incomeData);
  return response.data;
};

export const getMonthlySummaryByMonth = async (month) => {
    const response = await apiClient.get(`/monthly-summary/${month}`);
    console.log(response.data)
  return response.data;
};


