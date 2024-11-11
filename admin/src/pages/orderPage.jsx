import { faTemperature0 } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

const OrderDetails = () => {
  const location = useLocation();
  const {orderDetails} = location.state; 
  const {razorpay_order_id} = location.state
  const{razorpay_payment_id} = location.state
  const{createdAt} = location.state;
  const navigate = useNavigate()
  const [selectedOption, setSelectedOption] = useState(orderDetails.status); 
  const [loading, setLoading] = useState(false);
  const token = JSON.parse(localStorage.getItem("Access Token"));

  const handleOptionChange = async (event) => {
    const temp = event.target.value;
    setSelectedOption(temp);
    try {
        const orderId = orderDetails._id
        let response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/order/edit-order-status`,
          {
            method: "POST",
            body: JSON.stringify({ "status":temp, orderId}),
            headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              mode: 'cors',
            credentials: 'include'
          }
        );
  
        let data = await response.json();
  
        if (data.success) {
          toast.success("Status updated successfully!");
          navigate("/orders");
        } else {
          throw new Error("failed");
        }
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("An error occurred. Please try again later.");
      }
  };

  return (
    <div className="relative md:ml-64 bg-orange-50">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 rounded-lg py-10">
          <div className="mx-auto p-8 w-full bg-white px-4 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200">
            <div className="text-start">
              <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-between">
                  <h6 className="text-blueGray-700 text-xl font-bold">
                    Order Details
                  </h6>
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="flex flex-wrap gap-4">
                    <img className="h-36 w-36 rounded-lg object-cover" src={orderDetails?.product?.images[0]}/>
                    <div className="">
                        <h1 className="rounded-lg object-cover font-semibold">{orderDetails?.product?.name}</h1>
                        <h1 className="rounded-lg object-cover font-semibold">{orderDetails?.product?.stock > 0 ? <span className="text-green-500">Available</span> : <span className="text-red-500">Out of stock</span>}</h1>
                        <h1 className="rounded-lg object-cover">Price: ₹ {orderDetails?.product?.salePrice}</h1>
                        <button
                                onClick={() => navigate(`/all-products/edit-product`,{state: orderDetails?.product} )}
                                className={`mt-2 text-sm font-semibold bg-orange-500 text-gray-100  py-2 px-2 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative`}
                            >
                                <span>View Product</span>
                            </button>
                    </div>
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <div className="flex gap-1 mb-10 flex-col justify-cemter items-start">
                <h1 className=" font-semibold text-sm"><span className="text-black font-bold">Note: </span>Deleting pending or cancelled order will automatically update order's stock and it's units sold</h1>
                <label htmlFor="status">Order status</label>
                            <select
                                name="status"
                                value={selectedOption}
                                onChange={handleOptionChange}
                                className="px-2 py-1 mt-2 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                </div>
                <div className="flex flex-wrap mt-3">
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                      {razorpay_order_id ? "Razorpay Order Id" : "Order Id"}
                      </label>
                      <p>{razorpay_order_id ? razorpay_order_id : orderDetails._id}</p>
                    </div>
                  </div>
                  {
                    razorpay_payment_id && 
                    <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                            RazorPay Payment ID
                        </label>
                        <p>{razorpay_payment_id}</p>
                        </div>
                    </div>
                  }
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Full Name
                      </label>
                      <p>{orderDetails.fullName}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Email
                      </label>
                      <p>{orderDetails.email}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Phone
                      </label>
                      <p>{orderDetails.phone}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Address
                      </label>
                      <p>{orderDetails.address}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        City
                      </label>
                      <p>{orderDetails.city}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        State
                      </label>
                      <p>{orderDetails.state}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Pin
                      </label>
                      <p>{orderDetails.pin}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Payment Method
                      </label>
                      <p>{orderDetails.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Overall Price
                      </label>
                      <p>₹ {orderDetails.overAllPrice}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Discount Amount
                      </label>
                      <p>₹ {orderDetails.discountAmount}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        User Pay Amount
                      </label>
                      <p>₹ {orderDetails.userPayAmount}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-6/12 px-4">
                    <div className="relative w-full mb-3">
                      <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2">
                        Created At
                      </label>
                      <p>
                        {
                            createdAt ? (
                                new Date(createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                    hour12: true,
                                })
                            ) : (
                                new Date(orderDetails.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric',
                                    hour12: true,
                                })
                            )
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
