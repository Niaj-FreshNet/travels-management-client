import axios from "axios";

const axiosUser = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

const useAxiosUser = () => {
    return axiosUser;
}

export default useAxiosUser;