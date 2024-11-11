/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import { Toaster, toast } from "sonner";

import "react-toastify/dist/ReactToastify.css";

const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
  </div>
);

const ListCoupon = () => {
    const navigate = useNavigate();
    const[coupons,setCoupons] = useState([]);
    const [deleteCoupon, setDeleteCoupon] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const[deleteLoading, setDeleteLoading] = useState(false);
    const token = JSON.parse(localStorage.getItem("Access Token"));
    const [userStatus, setUserStatus] = useState(false);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const checkUserStatus = async () => {
        try {
          let expiry = JSON.parse(localStorage.getItem("accessToken"));
          if (expiry && new Date().getTime() < expiry) {
            setUserStatus(true);
          } else {
            setUserStatus(false);
            navigate("/");
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setUserStatus(false);
          navigate("/");
        }
      };

      checkUserStatus();
      const fetchCoupons = async () => {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/coupon/get-coupons`,
          {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            mode: 'cors',
            credentials: 'include',
          });

        const dataFromServer = await response.json();

        if (!dataFromServer.success) {
          throw new Error("Error Getting Coupons");
        }
        setCoupons(dataFromServer.data);
      };

      fetchCoupons();
    } catch (error) {
      console.log("Error fetching coupons data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteCoupon = (coupon) => {
    setDeleteCoupon(coupon);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    const couponId = deleteCoupon._id;
    setDeleteLoading(true);
    if (deleteCoupon) {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/v1/coupon/delete-coupon/${couponId}`,
          {
            method: "GET",
            mode: 'cors',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Coupon deleted successfully");
          setCoupons(coupons.filter((co) => co._id !== deleteCoupon._id));
        } else {
          throw new Error("Error deleting coupon");
        }
      } catch (error) {
        toast.error("Error deleting coupon");
      } finally {
        setDeleteCoupon(null);
        setShowDeleteConfirmation(false);
        setDeleteLoading(false);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteCoupon(null);
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="relative md:ml-64 ">
      <div className="md:px-10 mx-auto w-full py-10">
        <div className="  w-[100%]  bg-white px-4 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200">
          <div className="flex justify-between items-center mt-4 ">
            <div className="flex justify-between items-center mb-6 ">
              <h2 className="text-2xl font-bold">All Coupons</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full ">
              <thead className="border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-3  text-left text-sm  text-gray-600 tracking-wider font-bold">
                    CouponId
                  </th>
                  <th className="px-6 py-3  text-left text-sm font-semibold text-gray-600 tracking-wider">
                    Discount Value
                  </th>
                  <th className="px-6 py-3  text-left text-sm font-semibold text-gray-600 tracking-wider">
                    Minimum price range
                  </th>
                </tr>
              </thead>
              <tbody>
              {loading || !userStatus ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <div className="h-96 flex justify-center items-center z-50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                !coupons || coupons.length === 0 ? (
                  <tr className="w-[100%]">
                      <td colSpan="6" className="w-full h-full text-xl lg:text-2xl py-10 px-5 font-bold">No Coupons Available</td>
                  </tr>
                ) : (
                  coupons?.length > 0 &&
                      coupons?.map((coupon) => (
                        <tr key={coupon._id} className="border-b border-gray-300">
                          <td className="px-6 py-4 ">{coupon.couponId}</td>
                          <td className="px-6 py-4 ">{coupon.discountValue}</td>
                          <td className="px-6 py-4 ">{coupon.minRange}</td>

                          <td className="px-6 py-4 flex gap-2">
                            <button
                              className="text-gray-600 hover:gray-red-900"
                              onClick={() => handleDeleteCoupon(coupon)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                )
              )}
              </tbody>
            </table>
          </div>

          {showDeleteConfirmation && (
            <div className="fixed inset-0 flex items-center justify-center bg-transparent px-4 md:px-2 lg:px-0 bg-opacity-50 z-50">
              <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-md border-gray-300 border">
                <p className="text-lg text-center mb-4">
                  Are you sure to delete this coupon?
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    className="font-semibold bg-orange-500 px-4 text-gray-100 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative"
                    disabled={deleteLoading}
                    onClick={() => confirmDelete()}
                  >
                    {deleteLoading && <Spinner />}
                    <span
                      className={` ${deleteLoading ? "invisible" : "visible"}`}
                    >
                      Delete
                    </span>
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListCoupon;
