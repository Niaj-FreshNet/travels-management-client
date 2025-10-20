import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth";

const axiosSecure = axios.create({
    // baseURL: 'http://51.79.201.174:30015',
    baseURL: 'https://api.quickway2services.com',
    // baseURL: 'https://travels-management-server.onrender.com',
    // baseURL: 'http://localhost:5000',
    // baseURL: 'https://travels-management-server.vercel.app',
    headers: {
        'Content-Type': 'application/json'
    }
})

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut } = useAuth();

    // request interceptor to add authorization header for every secure call to the api
    axiosSecure.interceptors.request.use(function (config) {
        const token = localStorage.getItem('access-token')
        // console.log('request stopped by interceptors', token)
        config.headers.authorization = ` (---------client---------): ${token}`;
        // console.log('config token:', config.headers.authorization)
        return config;
    }, function (error) {
        // Do something with request error
        return Promise.reject(error);
    })

    // interceptor 401 and 403 status
    axiosSecure.interceptors.response.use(function (response) {
        return response;
    }, async (error) => {
        const status = error.response.status;
        // console.log('status code in the interceptor', status);
        // for 401 or 403 logout the user and move the user to the login page
        if (status === 401 || status === 403) {
            // await logOut();
            // localStorage.removeItem('access-token');
            // navigate('/login');
        }
        return Promise.reject(error);
    })


    return axiosSecure;
};

export default useAxiosSecure;