import useAuth from "../../Hooks/useAuth";
import useUsers from "../../Hooks/useUsers";

const UserCard = () => {
    const { user } = useAuth();
    const { users } = useUsers();

    // Find the authenticated user's information from the users array
    const currentUser = users.find(u => u.email === user?.email);

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
                                    <div className="badge badge-lg badge-primary text-white">{currentUser?.role}</div>
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