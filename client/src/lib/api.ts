import axios from 'axios';

const api = axios.create({
  baseURL: 'https://billiard-api-2210.onrender.com',
  timeout: 10000,
});

export default api;
