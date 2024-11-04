import { useEffect, useState } from "react";
import useAuth from "../../Hooks/useAuth";
import useUsers from "../../Hooks/useUsers";
import { Spin } from "antd";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const UserCard = () => {
    const axiosSecure = useAxiosSecure(); // Axios instance that automatically adds the JWT token
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const response = await axiosSecure.get(`/user`);
          setCurrentUser(response.data);
        } catch (error) {
          message.error('Failed to fetch user data');
        }
      };
  
      fetchUser(); // Fetch user data on component mount
    }, []);
  
    if (!currentUser) {
      return (
        <div className="flex justify-center items-center">
          <Spin size="small" tip="Loading..." />
        </div>
      );
    }

    return (
        <div className="border-2 border-white bg-white rounded-xl shadow-lg p-4">
            <div className="">
                <div className="pb-2 px-2">
                    <h2 className="text-xl font-semibold">User Info</h2>
                </div>
                <div className="py-2">
                    <div className="border-2 rounded-md">
                        <div className="px-3 pt-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Role</p>
                                <div className="flex items-center gap-2">
                                    <div className="badge badge-lg uppercase badge-primary text-white">{currentUser?.role}</div>
                                </div>
                            </div>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="px-3 pb-3 rounded-lg">
                            <div className="flex justify-between items-center">
                                <p className="text-md">Position</p>
                                <div className="flex items-center gap-2">
                                    <div className="badge badge-lg badge-primary text-white">{currentUser?.position}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;