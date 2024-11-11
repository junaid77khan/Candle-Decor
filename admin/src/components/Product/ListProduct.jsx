/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FaEdit } from "react-icons/fa";
import { Toaster, toast } from "sonner";

import "react-toastify/dist/ReactToastify.css";

const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
  </div>
);

const ListProduct = () => {

    const navigate = useNavigate();
    const[products,setProducts] = useState([]);
    const [deleteProduct, setDeleteProduct] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const[deleteLoading, setDeleteLoading] = useState(false);
    const [userStatus, setUserStatus] = useState(false);
    const[loading, setLoading] = useState(true);
    const token = JSON.parse(localStorage.getItem("Access Token"));

    useEffect(() => {
      const checkUserStatus = async () => {
          try {
              let expiry = JSON.parse(localStorage.getItem("accessToken"));
              if (expiry && new Date().getTime() < expiry) {
                  setUserStatus(true);
              } else {
                  setUserStatus(false);
                  navigate("/")
              }
          } catch (error) {
              console.error('Error checking user status:', error);
              setUserStatus(false);
              navigate("/")
          }
      };
  
      checkUserStatus();
  }, []);

  useEffect(() => {
    try {
      const fetchProducts = async () => {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/product/all-products`,
          {
            method: "GET",
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`},
            mode: 'cors',
            credentials: 'include',
          });

        const dataFromServer = await response.json();

        if (!dataFromServer.success) {
          navigate("/error");
        }
        setProducts(dataFromServer.data);
      };

      fetchProducts();
    } catch (error) {
      console.log("Error fetching products data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteProduct = (product) => {
    setDeleteProduct(product);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    const productId = deleteProduct._id;
    setDeleteLoading(true);
    if (deleteProduct) {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/v1/product/delete-product/${productId}`,
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
          toast.success("Product deleted successfully");
          setProducts(products.filter((pro) => pro._id !== deleteProduct._id));
        } else {
          throw new Error("Error deleting product");
        }
      } catch (error) {
        toast.error("Error deleting product");
      } finally {
        setDeleteProduct(null);
        setShowDeleteConfirmation(false);
        setDeleteLoading(false);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteProduct(null);
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="relative md:ml-64 bg-orange-50">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="container w-[100%] lg:px-4 py-8 ">
          <div className=" mx-auto p-8  w-full bg-white px-4 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Products</h2>
            </div>

              <div className="overflow-x-auto">
              <table className="min-w-full">
                  <thead className="border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                        Units sold
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                        Actions
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
                      !products || products?.length === 0 ? (
                        <tr className="w-[100%]   ">
                          <td colSpan="6" className="w-full h-full text-xl lg:text-2xl py-10 px-5 font-bold">No Product Available</td>
                        </tr>
                      ) : (
                        products?.map((product) => (
                          <tr key={product?._id} className="border-b border-gray-300">
                            <td className="px-6 py-4">
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 rounded-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                            </td>
                            <td className="px-6 py-4">{product.categoryId.name}</td>
                            <td className="px-6 py-4">{product.stock}</td>
                            <td className="px-6 py-4">{product.unitsSold}</td>
                            <td className="px-6 py-4 flex gap-2">
                              <button
                                onClick={() => navigate("edit-product", { state: product })}
                                className="text-gray-600 hover:text-gray-900 mr-4"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="text-gray-600 hover:gray-red-900"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>


                {showDeleteConfirmation && (
                  <div className="fixed inset-0 flex items-center justify-center bg-transparent px-4 md:px-2 lg:px-0 bg-opacity-50 z-50">
                    <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-md border-gray-300 border">
                      <p className="text-lg text-center mb-4">
                        Are you sure you want to delete this product?
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          className="font-semibold bg-orange-500 px-4 text-gray-100 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative"
                          disabled={deleteLoading}
                          onClick={() => confirmDelete()}
                        >
                          {deleteLoading && <Spinner />}
                          <span
                            className={` ${
                              deleteLoading ? "invisible" : "visible"
                            }`}
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
      </div>
    </div>
  );
};

export default ListProduct;
