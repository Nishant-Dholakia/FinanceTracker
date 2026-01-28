import axios from 'axios';

const URL = import.meta.env.VITE_API_URL;
console.log(URL)
const apiClient = axios.create({
    baseURL: `${URL}`,
    headers: {
        'Content-Type': 'application/json',
    },
    // withCredentials: true,
    // timeout: 10000
});
export default apiClient;
// apiClient.interceptors.request.use((config) => {

   
// })
