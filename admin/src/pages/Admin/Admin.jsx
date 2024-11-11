import { Route, Routes, useLocation } from "react-router-dom";
import ListProduct from "../../components/Product/ListProduct";

import AddCategory from "../../components/Category/AddCategory";
import ListCategory from "../../components/Category/ListCategory";
import Sidebar from "../../components/Cards/Sidebar";
import Tables from "../Tables";
import Add from "../AddProduct";
import Messages from "../Messages";
import EditCategory from "../../components/Category/EditCategory";
import EditProduct from "../../components/Product/EditProduct";
import ListCoupon from "../../components/Coupon/ListCoupon";
import AddCoupon from "../../components/Coupon/AddCoupon";
import Login from "../Login";
import Logout from "../Logout";
import AccountSettings from "../AccountSetting";
import OrderDetails from "../orderPage";

const Admin = () => {
  const location = useLocation();

  const isRootPath = location.pathname === "/";

  return (
    <div className="bg-orange-50 min-h-screen">
      {!isRootPath && <Sidebar />}
      <Routes>
        <Route path="/all-products" element={<ListProduct/>} />
        <Route path="/addproduct" element={<Add/>} />
        <Route path="all-products/edit-product" element={<EditProduct/>} />
        <Route path="/add-categories" element={<AddCategory />} />
        <Route path="/all-categories" element={<ListCategory />} />
        <Route path="/edit-category" element={<EditCategory />} />
        <Route path="/add-coupon" element={<AddCoupon />} />
        <Route path="/all-coupons" element={<ListCoupon/>} />
        <Route path="/" element={<Login />} />
        <Route path="/account-setting" element={<AccountSettings />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/orders" element={<Tables/>} />
        <Route path="/:orderId" element={<OrderDetails/>} />
        <Route path="/messages" element={<Messages/>} />
      </Routes>
    </div>
  );
};

export default Admin;
