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

export const router = createBrowserRouter([
    {
      path: "/",
      element: <Main />,
      errorElement: null,
      children: [
        {
            path: '/',
            element: <Home />
        },
        {
            path: '/airlines',
            element: <Airlines />
        },
        {
            path: '/suppliers',
            element: <Vendors />
        },
        {
            path: '/sales/new',
            element: <NewSale />
        },
        {
            path: '/sale/:id',
            element: <EditSale />,
            loader: ({ params }) => fetch(`https://travels-management-server.onrender.com/sale/${params.id}`)
        },
        {
            path: '/sales/manage',
            element: <ManageSales />
        },
        {
            path: '/sales/reports',
            element: <ReportList />
        },
        {
            path: '/payment/new',
            element: <NewPayment />
        },
        {
            path: '/payment/list',
            element: <PaymentList />
        },
        {
            path: '/payment/refund',
            element: <RefundList />
        },
        {
            path: '/ledger',
            element: <Ledger />
        },
        {
            path: '/users',
            element: <Users />
        },
      ]
    },
  ]);