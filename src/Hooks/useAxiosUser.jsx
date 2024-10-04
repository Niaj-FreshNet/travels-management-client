import axios from "axios";

const axiosUser = axios.create({
    baseURL: 'https://travels-management-server.vercel.app',
    headers: {
        'Content-Type': 'application/json'
    }
});

const useAxiosUser = () => {
    return axiosUser;
}

export default useAxiosUser;