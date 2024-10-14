import { BiLinkExternal } from "react-icons/bi";
import useAirlines from "../../Hooks/useAirlines";
import useSuppliers from "../../Hooks/useSuppliers";
import { NavLink } from "react-router-dom";
import useAuth from "../../Hooks/useAuth";
import useAdmin from "../../Hooks/useAdmin";
import { Spin } from "antd"; // Import Spin from Ant Design

const WelcomeCard = () => {
    const { airlines } = useAirlines();
    const { suppliers } = useSuppliers();
    const auth = useAuth();
    const [isAdmin, isAdminLoading] = useAdmin();

    // if (isAdminLoading) {
    //     // Render loading state while checking admin status
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <Spin size="large" />
    //         </div>
    //     );
    // }

    return (
        <>
            {isAdmin ? (
                // Render if the user role is "Admin" or isAdmin true
                <div className="border-2 border-white bg-white rounded-xl shadow-lg p-4">
                    <div className="">
                        <div className="pb-2 px-2">
                            <h2 className="text-xl font-semibold">Welcome, {auth.user?.displayName}</h2>
                        </div>
                        <div className="py-2">
                            <div className="border-2 rounded-md">
                                <div className="px-3 pt-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="text-md">No. of Airline Codes</p>
                                        <div className="flex items-center gap-2">
                                            <div className="badge badge-lg badge-primary text-white">{airlines.length}</div>
                                            <NavLink to="/airlines">
                                                <div className="btn btn-outline btn-sm bg-gray">
                                                    <BiLinkExternal size={20} />
                                                </div>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>
                                <div className="divider my-1"></div>
                                <div className="px-3 pb-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <p className="text-md">No. of Vendors</p>
                                        <div className="flex items-center gap-2">
                                            <div className="badge badge-lg badge-secondary text-white">{suppliers.length}</div>
                                            <NavLink to="/suppliers">
                                                <div className="btn btn-outline btn-sm bg-gray">
                                                    <BiLinkExternal size={20} />
                                                </div>
                                            </NavLink>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Render if the user role is "Sales"
                <div className="border-2 border-white bg-white rounded-xl shadow-lg p-4">
                    <div className="">
                        <div className="pb-2 px-2">
                            <h2 className="text-xl font-semibold">Welcome</h2>
                        </div>
                        <div className="py-4">
                            <div className="border-2 rounded-md">
                                <div className="bg-black px-4 py-3 rounded-lg">
                                    <div className="flex justify-center items-center">
                                        <p className="text-4xl text-center text-white">{auth.user?.displayName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WelcomeCard;