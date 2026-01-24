import apiClient from "../config/ApiClient";

export const getAllExpenses = async () => {
    const response = await apiClient.get(`/expenses`);
  return response.data;
};

export const addExpense = async (expensesData) => {
  console.log(expensesData);
    const response = await apiClient.post(`/expenses`,expensesData);
  return response.data;
};