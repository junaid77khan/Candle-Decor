import PropTypes from "prop-types";

// components
import bootstrapImage from "../../assets/img/bootstrap.jpg";
import TableDropdown from "../TableDropdown";
import avatar from "../../assets/img/team.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faMultiply } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const token = JSON.parse(localStorage.getItem("Access Token"));
import { Toaster, toast } from "sonner";


const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
  </div>
);


export default function CardTable({ color }) {
  const [selectedOption, setSelectedOption] = useState("COD"); 
  const[codOrders, setCodOrders] = useState([]);
  const[razorPayOrders, setRazorPayOrders] = useState([]);
  const navigate = useNavigate();
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const[deleteLoading, setDeleteLoading] = useState(false);
  const[deleteOrderType, setDeleteOrderType] = useState("");
  const[loading, setLoading] = useState(true);
  const[userStatus, setUserStatus] = useState(false);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

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

    const getCodOrders = async () => {
        try {
            
            let response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/order/all-cod-orders`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                }
              });

              response = await response.json();
              setCodOrders(response.data);
              
              
        } catch (error) {
            console.error('Error getting cod orders:', error);
        } finally {
          setLoading(false);
        }
    };

    getCodOrders();

    const getRazorPayOrders = async () => {
      try {
          
          let response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/get-razorpay-orders`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              }
            });

            response = await response.json();
            setRazorPayOrders(response.data);
            
      } catch (error) {
          console.error('Error getting cod orders:', error);
      }
  };

  getRazorPayOrders();
    
}, []);


const handleDeleteOrder = (order, orderType) => {
  setDeleteOrder(order);
  setDeleteOrderType(orderType)
  setShowDeleteConfirmation(true);
};

const confirmDelete = async () => {
  const orderId = deleteOrder._id
  setDeleteLoading(true);
  if (deleteOrder) {
    if(deleteOrderType.toString() === 'COD') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/order/delete-COD-order/${orderId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            mode: 'cors',
            credentials: 'include',
        });
  
        const data = await response.json();
  
        if (data.success) {
          toast.success("COD Order deleted successfully");
          setCodOrders(codOrders.filter(codO => codO._id !== deleteOrder._id));
        } else {
          throw new Error("Error deleting COD order")
        }
      } catch (error) {
        toast.error("Error deleting COD order");
      } finally {
        setDeleteOrderType("");
        setDeleteOrder(null);
        setShowDeleteConfirmation(false);
        setDeleteLoading(false);
      }
    } else {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/delete-RazorPay-order/${orderId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
  
        const data = await response.json();
  
        if (data.success) {
          toast.success("RazorPay Order deleted successfully");
          setRazorPayOrders(razorPayOrders.filter(razorO => razorO._id !== deleteOrder._id));
        } else {
          throw new Error("Error deleting RazorPay order")
        }
      } catch (error) {
        toast.error("Error deleting RazorPay order");
      } finally {
        setDeleteOrderType("");
        setDeleteOrder(null);
        setShowDeleteConfirmation(false);
        setDeleteLoading(false);
      }
    }
  }
};

const cancelDelete = () => {
  setDeleteOrder(null);
  setDeleteOrderType("");
  setShowDeleteConfirmation(false);
};
  return (
    <>
      <div
        className={
          "relative flex flex-col min-w-0 break-words w-full mb-6  rounded mt-4 "
        }
      >
        <div className="rounded-t  py-3 border-0">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
            <div className="flex justify-between items-center mb-4 ">
              <h2 className="text-2xl font-bold">All Orders</h2>
            </div>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto ">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-md uppercase border-l-0  border-r-0 whitespace-nowrap font-semibold text-left " 
                  }
                >
                  order Id
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-md uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " 
                  }
                >
                  Order Date
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-md uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left " 
                  }
                >
                  Status
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-md uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left "
                  }
                >
                  User name
                </th>
                <th
                  className={
                    "px-6 align-middle border border-solid py-3 text-md uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left "
                  }
                >
                  <select
                    value={selectedOption}
                    onChange={handleOptionChange}
                    className="px-2 py-1 bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="COD">COD</option>
                    <option value="RazorPay">RazorPay</option>
                  </select>
                </th>
                
              </tr>
            </thead>
            <tbody>
            {
              loading || !userStatus ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <div className="h-96 flex justify-center items-center z-50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  </td>
                </tr>
              ): (
                selectedOption === 'COD' ? (
                  !codOrders || codOrders.length === 0 ? (
                    <tr className="w-[100%]">
                      <td colSpan="6" className="w-full h-full text-xl lg:text-2xl py-10 px-5 font-bold">No COD orders yet</td>
                    </tr>
                  ) : (
                    codOrders.map((order) => {
                    return (
                        <tr key={order._id}>
                          <td className="border-t-0 px-6  border-l-0 border-r-0 text-sm whitespace-nowrap p-4 ">
                            {order._id.toString().length > 15 ? `${order._id.toString().substring(0, 15)}...` : order._id} 
                          </td>
                          <td className="border-t-0 px-6  border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                            {
                              new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric',
                                hour12: true
                              })
                            }
                          </td>
                          <td className="border-t-0 px-6 border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                            {order?.status}
                          </td>
                          <td className="border-t-0 px-6 border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                            {order.fullName}
                          </td>
                          <td className="border-t-0 px-6 border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                          <div className="flex flex-wrap justify-start gap-4 items-center">
                            <button
                              onClick={() => navigate(`/${order._id}`, {state: {orderDetails: order}} )}
                              className={`font-semibold bg-orange-500 text-gray-100  py-2 px-4 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative`}
                            >
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order, "COD") }
                              className={`font-semibold bg-orange-500 text-gray-100  py-2 px-4 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative`}
                            >
                              <span>Delete</span>
                            </button>
                          </div>
                          </td>
                        </tr>
                    )
                    })
                  )
              ) : (
                 !razorPayOrders || razorPayOrders.length === 0 ? (
                  <tr className="w-[100%]">
                      <td colSpan="6" className="w-full h-full text-xl lg:text-2xl py-10 px-5 font-bold">No RazorPay orders yet</td>
                  </tr>
                 ) : (
                  razorPayOrders.map((details) => (
                    <tr key={details._id}>
                      <td className="border-t-0 px-6  border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                        {details.razorpay_order_id.toString().length > 15 ? `${details.razorpay_order_id.substring(0, 15)}...` : details.razorpay_order_id}{' '}
                        
                      </td>
                      <td className="border-t-0 px-6  border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                      {details.createdAt ? (
                        new Date(details.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                          hour12: true,
                        })
                      ) : (
                        "N/A" // Or any other message indicating the date is not available
                      )}
                      </td>
                      <td className="border-t-0 px-6  border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                        {details?.orderDetails?.status || 'No status'}
                      </td>
                      <td className="border-t-0 px-6  border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                        {details?.orderDetails?.fullName || 'No fullname'}
                      </td>
                      <td className="border-t-0  px-6  border-l-0 border-r-0 text-sm whitespace-nowrap p-4">
                        <div className="flex flex-wrap justify-start items-center gap-2">
                          <button
                            onClick={() => navigate(`/${details.razorpay_order_id}`, {state: {orderDetails: details?.orderDetails, createdAt: details?.createdAt, razorpay_order_id: details.razorpay_order_id, razorpay_payment_id: details.razorpay_payment_id}} )}
                            className={`font-semibold bg-orange-500 text-gray-100  py-2 px-4 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative`}
                          >
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(details, "RazorPay")}
                            className={`font-semibold bg-orange-500 text-gray-100  py-2 px-4 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative`}
                          >
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                 )
              )
              )
            }
            </tbody>
          </table>
        </div>
        {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent px-4 md:px-2 lg:px-0 bg-opacity-50 z-50">
          <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-md border-gray-300 border">
            <p className="text-lg text-center mb-4">Are you sure to delete this order?</p>
            <p className="text-sm text-center text-gray-600 mb-8">Deleting this order will never recovered. Verify order status</p>
            <div className="flex justify-center gap-2">
                <button
                  className="font-semibold bg-orange-500 px-4 text-gray-100 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative"
                  disabled={deleteLoading} 
                  onClick={confirmDelete}
                >
                  {deleteLoading && <Spinner />}
                  <span className={` ${deleteLoading ? 'invisible' : 'visible'}`}>Delete</span>
                </button>
              <button onClick={cancelDelete} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
