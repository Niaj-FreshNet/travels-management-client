import axios from "axios";

const axiosUser = axios.create({
    // baseURL: 'http://51.79.201.174:30015',
    baseURL: 'https://api.quickway2services.com',
    // baseURL: 'https://travels-management-server.onrender.com',
    // baseURL: 'http://localhost:5000',
    // baseURL: 'https://travels-management-server.vercel.app',
    headers: {
        'Content-Type': 'application/json'
    }
});

const useAxiosUser = () => {
    return axiosUser;
}

export default useAxiosUser;