// src/services/apiService.js
import apiClient from "../config/ApiClient";

export async function getAllExpenses() {
  const response = await apiClient.get("/expenses");
  return response.data;
}

export async function addExpense(expensesData) {
  const response = await apiClient.post("/expenses", expensesData);
  return response.data;
}



