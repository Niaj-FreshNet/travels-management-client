import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Home from "../Pages/Home/Home";
import Airlines from "../Pages/Airlines/Airlines";
import Vendors from "../Pages/Vendors/Vendors";
import NewSale from "../Pages/Sales/NewSale/NewSale";
import ManageSales from "../Pages/Sales/ManageSales/ManageSales";
import ReportList from "../Pages/Sales/ReportList/ReportList";
import Ledger from "../Pages/Ledger/Ledger";
import EditSale from "../Pages/Sales/ManageSales/EditSales";
import NewPayment from "../Pages/Payment/NewPayment/NewPayment";
import PaymentList from "../Pages/Payment/PaymentList/PaymentList";
import RefundList from "../Pages/Payment/RefundList/RefundList";
import Users from "../Pages/Users/Users";
import Login from "../Pages/Login/Login";
import PrivateRoute from "../Routes/PrivateRoute";
import AddUser from "../Pages/Users/AddUser";
import AdminRoute from "./AdminRoute";
import Profile from "../Pages/Profile/Profile";
import PrintPage from "../Components/Print/PrintPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <PrivateRoute><Main /></PrivateRoute>,
        children: [
            // Sales user routes
            {
                path: '/',
                element: <Home />
            },
            {
                path: 'sales/new',
                element: <NewSale />
            },
            {
                path: 'sales/manage',
                element: <ManageSales />
            },
            {
                path: 'sales/reports',
                element: <ReportList />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            // Admin routes only ::::::::: NOT WORKING
            {
                path: 'airlines',
                element: <AdminRoute><Airlines /></AdminRoute>
            },
            {
                path: 'suppliers',
                element: <AdminRoute><Vendors /></AdminRoute>
            },
            {
                path: 'payment/new',
                element: <AdminRoute><NewPayment /></AdminRoute>
            },
            {
                path: 'payment/list',
                element: <AdminRoute><PaymentList /></AdminRoute>
            },
            {
                path: 'payment/refund',
                element: <AdminRoute><RefundList /></AdminRoute>
            },
            {
                path: 'ledger',
                element: <AdminRoute><Ledger /></AdminRoute>
            },
            {
                path: 'users',
                element: <AdminRoute><Users /></AdminRoute>
            },
            {
                path: '/signup',
                element: <AdminRoute><AddUser /></AdminRoute>
            },
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
]);
