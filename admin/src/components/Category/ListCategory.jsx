import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Toaster, toast } from "sonner";

import "react-toastify/dist/ReactToastify.css";

const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
  </div>
);

const ListCategory = ({ products }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const[deleteLoading, setDeleteLoading] = useState(false);
  const token = JSON.parse(localStorage.getItem("Access Token"));
  const [userStatus, setUserStatus] = useState(false);
  const[loading, setLoading] = useState(true);

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

  useEffect(() => {
    try {
      const fetchProductCategories = async () => {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/category/all-categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
          credentials: 'include',
        });
  
        const dataFromServer = await response.json();
  
        if (!dataFromServer.success) {
          throw new Error("Failed to fetch categories")
        }
        setCategories(dataFromServer.data);
      };
  
      fetchProductCategories();
    } catch (error) {
      toast.error("Failed to fetch categories data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteCategory = (category) => {
    setDeleteCategory(category);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    const categoryId = deleteCategory._id;
    setDeleteLoading(true);
    if (deleteCategory) {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/v1/category/delete-category/${categoryId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Category deleted successfully");
          setCategories(
            categories.filter((cat) => cat._id !== deleteCategory._id)
          );
        } else {
          throw new Error("Error deleting category");
        }
      } catch (error) {
        toast.error("Error deleting category");
      } finally {
        setDeleteCategory(null);
        setShowDeleteConfirmation(false);
        setDeleteLoading(false);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteCategory(null);
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="relative md:ml-64 ">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="container w-[100%]  mx-auto lg:px-4 py-8  ">
          <div className="mx-auto p-8  w-full bg-white px-4 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">All Categories</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full ">
              <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                      Picture
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 tracking-wider">
                      Description
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
                  ) : (
                    !categories || categories.length === 0 ? (
                      <tr className="w-[100%]   ">
                          <td colSpan="6" className="w-full h-full text-xl lg:text-2xl py-10 px-5 font-bold">No Categories Available</td>
                        </tr>
                    ) : (
                      categories.map((category) => (
                          <tr className="border-b border-gray-300" key={category._id}>
                            <td className="px-6 py-4">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-12 h-12 rounded-full"
                              />
                            </td>
                            <td className="px-6 py-4">
                              {category.name.length > 30
                                ? category.name.substring(0, 30) + "..."
                                : category.name}
                            </td>
                            {/* Uncomment below line if you want to display description */}
                            {/* <td className="px-6 py-4">{category.description.length > 40 ? category.description.substring(0, 40) + '...' : category.description}</td> */}
                            <td className="px-6 py-4 flex">
                              <button className="text-gray-600 hover:text-gray-900 mr-4">
                                <FontAwesomeIcon
                                  onClick={() =>
                                    navigate("/edit-category", { state: category })
                                  }
                                  icon={faEdit}
                                />
                              </button>
                              <button
                                className="text-gray-600 hover:gray-red-900"
                                onClick={() => handleDeleteCategory(category)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))
                    )
                  )
                }
                </tbody>
              </table>
            </div>

            {showDeleteConfirmation && (
              <div className="fixed inset-0 flex items-center justify-center bg-transparent px-4 md:px-2 lg:px-0 bg-opacity-50 z-50">
                <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-md border-gray-300 border">
                  <p className="text-lg text-center mb-4">
                    Are you sure to delete this category?
                  </p>
                  <p className="text-sm text-center text-gray-600 mb-8">
                    Deleting this category will also delete all associated
                    products.
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      className="font-semibold bg-orange-500 px-4 text-gray-100 py-2 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative"
                      disabled={deleteLoading}
                      onClick={confirmDelete}
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
  );
};

export default ListCategory;
