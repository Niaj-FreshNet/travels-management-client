import axios from "axios";

const axiosUser = axios.create({
    // baseURL: 'http://51.79.201.174:30015',
    // baseURL: 'https://api.quickway2services.com',
    baseURL: 'http://api.quickway2services.com/api',
    // baseURL: 'https://server.quickway2services.com/api',
    // baseURL: 'http://localhost:5010/api',
    // baseURL: 'https://travels-management-server-xsw9.onrender.com',
    // baseURL: 'https://travels-management-server.vercel.app',
    headers: {
        'Content-Type': 'application/json'
    }
});

const useAxiosUser = () => {
    return axiosUser;
}

export default useAxiosUser;