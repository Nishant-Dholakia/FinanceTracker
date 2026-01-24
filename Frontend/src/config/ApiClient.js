import axios from 'axios';
const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/'}`,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true,
    // timeout: 10000
});
export default apiClient;
// apiClient.interceptors.request.use((config) => {

   
// })
