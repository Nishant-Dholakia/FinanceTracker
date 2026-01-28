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

export const fetchMonthlyInsights = async (month) => {
  const response = await apiClient.get("/api/monthly-insights", {
    params: { month }, // query string
  });
  console.log(response.data)
  return response.data;
};

export async function fetchAnomalyApi(month) {
  console.log("calling backend for anomaly");

  const res = await apiClient.post(
    `/anomalies/month`,
    { month }
  );

  return res.data;
}
