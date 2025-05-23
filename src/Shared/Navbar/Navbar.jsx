import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Drawer } from 'antd';
import SideMenu from '../SideMenu/SideMenu';
import { CgMenuLeftAlt } from "react-icons/cg";
import { AuthContext } from "../../providers/AuthProvider";
import { PiSignOutBold } from "react-icons/pi";
import { FaSignOutAlt } from "react-icons/fa";

const Navbar = () => {
    const { user, logOut } = useContext(AuthContext);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate(); // Use navigate from react-router-dom

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleMenuClick = (item) => {
        toggleDrawer(); // Close the drawer after item selection
        navigate(item.path); // Navigate to the selected path
    };

    const handleLogOut = async () => {
        await logOut();
        localStorage.removeItem('access-token');
        navigate('/login');
    };

    return (
        // <div className="navbar bg-gray-800 sticky top-0 z-50">
        <div className="navbar bg-gray-800">
            <div>
                <button tabIndex={0} role="button" className="btn btn-ghost btn-md lg:hidden" onClick={toggleDrawer}>
                    <CgMenuLeftAlt size={28} color="#FFFFFF" />
                </button>
            </div>
            <div className="flex-1">
                <NavLink to="/" className="btn btn-ghost text-white font-bold text-xl">QuickWay 2 Services</NavLink>
            </div>
            <div className="flex-none gap-2">
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-10 rounded-full">
                            {/* <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 512 512">
                                <path
                                    fill="#A7A9AE"
                                    fillRule="nonzero"
                                    d="M256 0c70.69 0 134.69 28.655 181.018 74.982C483.345 121.31 512 185.31 512 256s-28.655 134.69-74.982 181.018C390.69 483.345 326.69 512 256 512s-134.69-28.655-181.018-74.982C28.655 390.69 0 326.69 0 256S28.655 121.31 74.982 74.982C121.31 28.655 185.31 0 256 0zm-49.371 316.575c-.992-1.286 2.594-10.118 3.443-11.546-9.722-8.651-17.404-17.379-19.041-35.34l-1.043.022c-2.408-.032-4.729-.586-6.903-1.825-3.481-1.979-5.93-5.379-7.583-9.212-3.5-8.043-15.031-34.738 2.537-32.628-9.823-18.345 12.409-49.684-25.935-61.275 31.46-39.845 97.839-101.281 146.483-39.654 53.245 5.16 69.853 68.437 34 103.093 2.101.076 4.08.56 5.832 1.498 6.665 3.57 6.884 11.318 5.132 17.819-1.733 5.429-3.934 9.104-6.01 14.397-2.524 7.147-6.215 8.478-13.345 7.708-.362 17.67-8.528 26.343-19.518 36.724l3.007 10.187c-14.737 31.261-75.957 32.518-101.056.032zM78.752 394.224c12.076-51.533 45.656-33.396 110.338-73.867 22.982 47.952 116.386 51.437 135.54 0 55.35 35.384 98.967 20.923 109.958 72.138 28.965-37.841 46.176-85.158 46.176-136.495 0-62.068-25.158-118.26-65.83-158.934C374.26 56.394 318.068 31.236 256 31.236S137.74 56.394 97.066 97.066C56.394 137.74 31.236 193.932 31.236 256c0 52.123 17.744 100.099 47.516 138.224z"
                                />
                            </svg> */}
                            <FaSignOutAlt size={40} />
                        </div>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-32 p-2 shadow">
                        {user ? (
                            <li> <NavLink onClick={handleLogOut} className={({ isActive }) => isActive ? ' font-bold' : ''}>Sign Out <PiSignOutBold /></NavLink></li>
                        ) : (
                            <li><NavLink to="/login" className={({ isActive }) => isActive ? ' font-bold' : ''}>Sign In</NavLink></li>
                        )}
                    </ul>
                </div>
            </div>
            <Drawer
                placement="left"
                closable={true}
                onClose={toggleDrawer}
                open={drawerOpen} // Updated from visible to open
                styles={{
                    body: { padding: 0, margin: 0 },
                    header: { backgroundColor: '#001529', color: 'white' }, // Updated from headerStyle
                }}
                closeIcon={<span style={{ color: 'white' }}>✖</span>}
                height="100%"
                width={220}
                style={{ zIndex: 1000 }}
            >
                <SideMenu onMenuClick={handleMenuClick} />
            </Drawer>


        </div>
    );
};

export default Navbar;
