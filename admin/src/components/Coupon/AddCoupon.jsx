import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

import "react-toastify/dist/ReactToastify.css";

const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
  </div>
);

const AddCoupon = () => {
  const [loading, setLoading] = useState(false);
  const [couponIdError, setCouponIdError] = useState("EMPTY");
  const [discountValueError, setDiscountValueError] = useState("EMPTY");
  const [minRangeError, setMinRangeError] = useState("EMPTY");
  const navigate = useNavigate();
  const [couponsDetails, setCouponsDetails] = useState({
    couponId: "",
    discountValue: 0,
    minRange: 0
  });
  const [userStatus, setUserStatus] = useState(false);
  const token = JSON.parse(localStorage.getItem("Access Token"));

  useEffect(() => {
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
  }, []);

  const handleChange = (e) => {
    setCouponsDetails({
      ...couponsDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const couponId = couponsDetails.couponId;
    const discountValue = couponsDetails.discountValue;
    const minRange = couponsDetails.minRange;

    try {
      setCouponIdError("EMPTY");
      setDiscountValueError("EMPTY");
      setMinRangeError("EMPTY");
      let response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/coupon/add-coupon/${couponId}/${discountValue}/${minRange}`,
        {
          method: "GET",
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let data = await response.json();

      if (data.success) {
        toast.success("Coupon added successfully!");
        setCouponsDetails({
          couponId: "",
          discountValue: 0,
          minRange: 0
        });
      } else {
        if (data.data.couponIdError) {
          setCouponIdError(data.data.couponIdError);
        }
        if (data.data.discountValueError) {
          setDiscountValueError(data.data.discountValueError);
        }
        if (data.data.minRangeError) {
          setMinRangeError(data.data.minRangeError);
        }
        toast.error("Failed to add coupon. Please try again.");
      }
    } catch (error) {
      console.error("Error adding coupon:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative md:ml-64 ">
      <div className="px-4 md:px-10 mx-auto w-full py-10">
        <div className="w-full  bg-white px-4 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200 ">
          <div className="relative flex flex-col min-w-0 break-words w-full   rounded-lg border-0">
            <div className="rounded-t  mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <h6 className="text-slate-700 text-xl font-bold">Add Coupon</h6>
              </div>
            </div>

            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form onSubmit={handleSubmit}>
                <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Coupon Information
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-slate-600 text-xs font-bold mb-2"
                        htmlFor="grid-password"
                      >
                        Coupon Id
                      </label>
                      <input
                        type="text"
                        name="couponId"
                        value={couponsDetails.couponId}
                        onChange={handleChange}
                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        required
                      />
                      <h1
                        className={`text-red-500 text-xs ${
                          couponIdError !== "EMPTY" ? "visible" : "invisible"
                        } `}
                      >
                        {couponIdError}
                      </h1>
                    </div>
                  </div>
                </div>

                <hr className="mt-6 border-b-1 border-slate-300" />

                <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Discount Value
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-slate-600 text-xs font-bold mb-2"
                        htmlFor=""
                      >
                        Discount Value
                      </label>
                      <input
                        type="text"
                        name="discountValue"
                        value={couponsDetails.discountValue}
                        onChange={handleChange}
                        required
                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                      <h1
                        className={`text-red-500 text-xs ${
                          discountValueError !== "EMPTY"
                            ? "visible"
                            : "invisible"
                        } `}
                      >
                        {discountValueError}
                      </h1>
                    </div>
                  </div>
                </div>

                <hr className="mt-6 border-b-1 border-slate-300" />

                <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Set minimum price range
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-slate-600 text-xs font-bold mb-2"
                        htmlFor=""
                      >
                        Minimum price range
                      </label>
                      <input
                        type="text"
                        name="minRange"
                        value={couponsDetails.minRange}
                        onChange={handleChange}
                        required
                        className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      />
                      <h1
                        className={`text-red-500 text-xs ${
                          minRangeError !== "EMPTY"
                            ? "visible"
                            : "invisible"
                        } `}
                      >
                        {minRangeError}
                      </h1>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="mt-2 py-10  border-t w-full flex flex-wrap justify-center items-center border-slate-200 text-center">
              <button
                type="submit"
                className="mt-5 font-semibold bg-orange-500 px-4 text-gray-100 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading && <Spinner />}
                <span className={` ${loading ? "invisible" : "visible"}`}>
                  Add Coupon
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCoupon;
