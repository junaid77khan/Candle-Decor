import { Toaster, toast } from "sonner";
import { State, City } from "country-state-city";
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center bg-opacity-50 ">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = location.state || {};
  const[loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState("");
  const [shippingCost] = useState(0); 
  const [totalPrice, setTotalPrice] = useState(
    product?.quantity * product?.salePrice
  );
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [coupons, setCoupons] = useState([]);
  const [numSubtract, setNumSubtract] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    address: "",
    country: "IN",
    state: "",
    city: "",
    pinCode: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const states = State.getStatesOfCountry(formData.country);
  const cities = formData.state
    ? City.getCitiesOfState(formData.country, formData.state)
    : [];

  useEffect(() => {
    try {
      if (!product || product.length === 0) {
        navigate("/");
      }
      const fetchCoupons = async () => {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/coupon/get-coupons`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const dataFromServer = await response.json();

        if (!dataFromServer.success) {
          throw new Error("Error Getting Coupons");
        }
        setCoupons(dataFromServer.data);
      };

      fetchCoupons();
    } catch (error) {
      console.log("Error fetching coupons", error);
    }
  }, []);

  useEffect(() => {
    validateForm();
  }, [discount, shippingCost, formData, product]);

  const calculateTotal = (curDiscountValue, minRange) => {
    let price = product?.salePrice * product?.quantity;
    if(price < minRange) {
      toast.error(`Minimum price range is ${minRange}`);
      return;
    }
    const temp = (price / 100) * curDiscountValue;
    setNumSubtract(temp);
    price -= temp;
    if (price < 0) {
      price = 0;
    }
    price += shippingCost;
    setTotalPrice(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const applyDiscount = () => {
    let curDiscountValue = -1;
    let minRange = -1;
    coupons.map((coupon) => {
      
      if (coupon.couponId.toString() === discount.toString()) {
        curDiscountValue = coupon.discountValue;
        minRange = coupon.minRange;
      }
    });
    if (curDiscountValue !== -1) {
      calculateTotal(curDiscountValue, minRange);
    } else {
      toast.error("Invalid coupon");
    }
  };

  const handleOrderPlacement = async () => {
    validateForm();
    if (isFormValid) {
      try {
        let response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/order/add-order`,
          {
            method: "POST",
            body: JSON.stringify({
              productId: product._id,
              quantity: product.quantity,
              overAllPrice: product?.quantity * product?.salePrice,
              discountAmount: numSubtract,
              userPayAmount: totalPrice,
              email: formData.email,
              phone: formData.contact,
              fullName: formData.name,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pin: formData.pinCode,
              paymentMethod: "COD",
            }),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        response = await response.json();
        if (!response.success) {
          throw new Error("Order failed!!");
        }
        
        const now = new Date(); 
        const currentDate = now.toISOString().split('T')[0]; 
        const currentTime = now.toTimeString().split(' ')[0];

        await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/user/send-success-sms`,
          {
            method: "POST",
            body: JSON.stringify({
              phoneNumer: formData.contact,
              fullName: formData.name,
              email: formData.email,
              productName: product.name,
              quantity: product.quantity,
              date: currentDate,
              time: currentTime,
            }),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        setLoading(false)

        toast.success("Order placed successfully!");
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/v1/user/send-order-mail-admin`,
              {
                method: "POST",
                body: JSON.stringify({
                  fullName: formData.name,
                  phoneNumber: formData.contact,
                  productName: product.name,
                  quantity: product.quantity,
                  date: currentDate,
                  time: currentTime
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );
        navigate("/paymentsuccess", { state: { orderId: "", paymentId: "" } });
      } catch (error) {
        console.log(error);
        toast.error("Order failed, please try again");
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false);
      alert("Please fill all the required fields correctly.");
    }


  };

  const checkoutHandler = async () => {
    validateForm();
    if (isFormValid) {
      try {
        let response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/order/add-order`,
          {
            method: "POST",
            body: JSON.stringify({
              productId: product._id,
              quantity: product.quantity,
              overAllPrice: product?.quantity * product?.salePrice,
              discountAmount: numSubtract,
              userPayAmount: totalPrice,
              email: formData.email,
              phone: formData.contact,
              fullName: formData.name,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pin: formData.pinCode,
              paymentMethod: "RazorPay",
            }),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        response = await response.json();
        if (!response.success) {
          throw new Error("Order failed!!");
        }
        const order_Id = response.data;

        if (!order_Id) {
          throw new Error("Order failed!!");
        }

        setLoading(false);

        const {
          data: { key },
        } = await axios.get(`${import.meta.env.VITE_API_URL}/api/getkey`);
        const {
          data: { order },
        } = await axios.post(`${import.meta.env.VITE_API_URL}/api/checkout`, {
          amount: totalPrice, // Amount in paise
        });

        const options = {
          key,
          amount: order.amount, // This should be in paise
          currency: "INR",
          name: formData.name,
          description: "Your Order",
          image:
            "https://beforeigosolutions.com/pascale-atkinson/attachment/dummy-profile-pic-300x300-1/",
          order_id: order.id,
          callback_url: `${
            import.meta.env.VITE_API_URL
          }/api/paymentverification`,
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.contact,
          },
          notes: {
            address: formData.address,
          },
          theme: {
            color: "#121212",
          },
          handler: async function (response) {
            const orderId = response?.razorpay_order_id;
            const paymentId = response?.razorpay_payment_id;
            const result = await fetch(
              `${import.meta.env.VITE_API_URL}/api/payment/add-payment-details`,
              {
                method: "POST",
                body: JSON.stringify({
                  razorpay_order_id: orderId,
                  razorpay_payment_id: paymentId,
                  order_Id,
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );

            const now = new Date(); 
            const currentDate = now.toISOString().split('T')[0]; 
            const currentTime = now.toTimeString().split(' ')[0];
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/v1/user/send-success-sms`,
              {
                method: "POST",
                body: JSON.stringify({
                  phoneNumer: formData.contact,
                  fullName: formData.name,
                  email: formData.email,
                  productName: product.name,
                  quantity: product.quantity,
                  date: currentDate,
                  time: currentTime,
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );
            alert("Payment Successfull");
            
            await fetch(
              `${import.meta.env.VITE_API_URL}/api/v1/user/send-order-mail-admin`,
              {
                method: "POST",
                body: JSON.stringify({
                  fullName: formData.name,
                  phoneNumber: formData.contact,
                  productName: product.name,
                  quantity: product.quantity,
                  date: currentDate,
                  time: currentTime
                }),
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );
            navigate("/paymentsuccess", { state: { orderId, paymentId } });
          },
          modal: {
            ondismiss: async function () {
              const response = await fetch(
                `${
                  import.meta.env.VITE_API_URL
                }/api/v1/order/delete-order/${order_Id}`,
                {
                  method: "GET",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log(response);
              alert("Payment Failed. Please try again.");
            },
          },
        };

        const razor = new window.Razorpay(options);
        razor.open();
      } catch (error) {
        console.error("Error during adding order:", error);
        toast.error("An error occurred during checkout. Please try again.");
      }
    } else {
      setLoading(false)
      alert("Please fill all the required fields.");
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.email) errors.email = "Email is required";
    if (!formData.contact) errors.contact = "Contact is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.city) errors.city = "City is required";
    if (!formData.state) errors.state = "State is required";
    if (!formData.pinCode) errors.pinCode = "PIN Code is required";
    if (formData.contact.length !== 10) {
      errors.contact = "Phone number must be exactly 10 digits";
    }

    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between gap-4 p-4 bg-orange-50">
      <div className="container mx-auto p-4 lg:w-1/2 bg-white shadow-2xl">
        <div className="  rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">User Details</h1>
          <form>
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded-md"
              />
              {formErrors.email && (
                <span className="text-red-500">{formErrors.email}</span>
              )}

              <div className="col-span-1 md:col-span-2">
                <label className="block mb-1"></label>
                <input
                  type="text"
                  name="contact"
                  placeholder="Phone(10 digits only)"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  className="w-full p-2 border rounded-md"
                />
                {formErrors.contact && (
                  <span className="text-red-500">{formErrors.contact}</span>
                )}
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Delivery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                  />
                  {formErrors.name && (
                    <span className="text-red-500">{formErrors.name}</span>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                  />
                  {formErrors.address && (
                    <span className="text-red-500">{formErrors.address}</span>
                  )}
                </div>

                <div>
                  <label className="block mb-1">State</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.state && (
                    <span className="text-red-500">{formErrors.state}</span>
                  )}
                </div>

                <div>
                  <label className="block mb-1">City</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.state}
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.city && (
                    <span className="text-red-500">{formErrors.city}</span>
                  )}
                </div>
                <div>
                  <label className="block mb-1">PIN Code</label>
                  <input
                    type="text"
                    name="pinCode"
                    placeholder="PIN Code"
                    value={formData.pinCode}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded-md"
                  />
                  {formErrors.pinCode && (
                    <span className="text-red-500">{formErrors.pinCode}</span>
                  )}
                </div>
              </div>
            </section>
          </form>
        </div>
      </div>

      <div className="container mx-auto shadow-2xl p-4 lg:w-1/2 bg-white">
        <div className=" rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Order Summary</h1>
          {
            paymentMethod === 'cod' ? (
              <p className="mt-6 text-red-500">
                Discounts are only available for online payments.
              </p>    
            ) : (
              <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Discount Code</h2>
                <input
                  type="text"
                  name="discount"
                  placeholder="Enter discount code"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded mt-2"
                  onClick={applyDiscount}
                >
                  Apply
                </button>
              </section>
            )
          }

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Order Details</h2>
            {product && (
              <div className="mb-4">
                <img
                  className="h-36 w-36 rounded-lg mb-4"
                  src={product.images[0]}
                />
                <div className="flex justify-between">
                  <span className="font-semibold">{product.name}</span>
                  <span>₹{product.salePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity: {product.quantity}</span>
                </div>
              </div>
            )}
            <div className="flex justify-between mt-2">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>Discount:</span>
              <span>- ₹{numSubtract}</span>
            </div>

            <div className="flex justify-between mt-4 font-bold">
              <span>Total:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
            <div className="border rounded-md p-4">
              <div className="mb-4">
                <label className="inline-flex px-4 items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={paymentMethod === "online"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    className="form-radio "
                  />
                  <span className="ml-2">Online Payment </span>
                </label>
                <label className="inline-flex items-center mt-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                    className="form-radio"
                  />
                  <span className="ml-2">Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>
          </section>

          <button
            className="mt-5 font-semibold bg-orange-500 text-gray-100 w-full py-4 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative"
            onClick={() => {
              setLoading(true);
              paymentMethod === "online" ? checkoutHandler() : handleOrderPlacement();
            }}
            disabled={loading}
          >
            {loading && <Spinner />}
            <span className={`ml-3 ${loading ? "invisible" : "visible"}`}>
              {paymentMethod === "online" ? "Pay Now" : "Place Order"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
