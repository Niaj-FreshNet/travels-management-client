import axios from "axios";

const axiosUser = axios.create({
    baseURL: 'https://travels-management-server.onrender.com',
    headers: {
        'Content-Type': 'application/json'
    }
});

const useAxiosUser = () => {
    return axiosUser;
}

export default useAxiosUser;