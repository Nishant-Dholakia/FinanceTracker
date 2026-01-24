import apiClient from "../config/ApiClient";

export const getAllExpenses = async () => {
    const response = await apiClient.get(`/expenses`);
  return response.data;
};