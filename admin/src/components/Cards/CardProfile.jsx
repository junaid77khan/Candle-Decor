import upload_area from "../../../public/image.png";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";

import "react-toastify/dist/ReactToastify.css";

const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
  </div>
);

const CardProfile = (props) => {
  const [productDetails, setProductDetails] = useState({
    name: "",
    description: "",
    features: [],
    specifications: [],
    actualPrice: 0,
    salePrice: 0,
    stock: 0,
    categoryId: null,
    images: [null, null, null],
  });

  const[selectedCategoryId, setSelectedCategoryId] = useState("Categories");
  const[categories, setCategories] = useState([])
  const[loading, setLoading] = useState(false);
  const[initalLoading, setInitalLoading] = useState(true);
  const[userStatus, setUserStatus] = useState(false);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/category/all-categories`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setInitalLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      const selectedCategory = categories.find(
        (category) => category._id === value
      );
      setProductDetails({
        ...productDetails,
        category: selectedCategory || null,
      });
      setSelectedCategoryId(value);
    } else {
      setProductDetails({
        ...productDetails,
        [name]: value,
      });
    }
  };

  const handleFeaturesChange = (e, index) => {
    const newFeatures = [...productDetails.features];
    newFeatures[index] = e.target.value;
    setProductDetails({
      ...productDetails,
      features: newFeatures,
    });
  };

  const handleAddFeature = () => {
    setProductDetails({
      ...productDetails,
      features: [...productDetails.features, ""],
    });
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = [...productDetails.features];
    newFeatures.splice(index, 1);
    setProductDetails({
      ...productDetails,
      features: newFeatures,
    });
  };

  const handleSpecificationChange = (e, index, key) => {
    const newSpecifications = [...productDetails.specifications];
    newSpecifications[index][key] = e.target.value;
    setProductDetails({
      ...productDetails,
      specifications: newSpecifications,
    });
  };

  const handleAddSpecification = () => {
    setProductDetails({
      ...productDetails,
      specifications: [
        ...productDetails.specifications,
        { name: "", value: "" },
      ],
    });
  };

  const handleRemoveSpecification = (index) => {
    const newSpecifications = [...productDetails.specifications];
    newSpecifications.splice(index, 1);
    setProductDetails({
      ...productDetails,
      specifications: newSpecifications,
    });
  };

  const handleImage = (e, index) => {
    const newImages = [...productDetails.images];
    console.log(newImages);
    newImages[index] = e.target.files[0];
    console.log("New IMae", newImages);
    setProductDetails({
      ...productDetails,
      images: newImages,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log(productDetails);
      const formData = new FormData();
      formData.append("name", productDetails.name);
      formData.append("description", productDetails.description);
      formData.append("actualPrice", parseFloat(productDetails.actualPrice));
      formData.append("salePrice", parseFloat(productDetails.salePrice));
      formData.append("stock", parseInt(productDetails.stock));
      formData.append("categoryId", selectedCategoryId);

      productDetails.features.forEach((feature, index) => {
        formData.append(`features[${index}]`, feature);
      });

      productDetails.specifications.forEach((specification, index) => {
        formData.append(`specifications[${index}][name]`, specification.name);
        formData.append(`specifications[${index}][value]`, specification.value);
      });

      productDetails.images.forEach((image, index) => {
        if (image) {
          formData.append(`image${index + 1}`, image);
        }
      });

      const addProductResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/product/add-product`,
        {
          method: "POST",
          body: formData,
          mode: 'cors',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const addProductData = await addProductResponse.json();

      console.log(addProductData.data.error);

      if (addProductData.data?.error?.length > 0) {
        console.log("reched");
        toast.error(`${addProductData.data?.error}`);
        return;
      }

      toast.success("Product added successfully!");
      setProductDetails({
        name: "",
        description: "",
        features: [],
        specifications: [],
        actualPrice: 0,
        salePrice: 0,
        stock: 0,
        categoryId: null,
        images: [null, null, null],
      });
      setSelectedCategoryId(null);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative md:ml-64 ">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="relative flex flex-col min-w-0  py-8 break-words bg-orange-50 w-full mb-6  rounded-lg  ">
          {initalLoading || !userStatus ? (
            <div className="h-96 lg:h-screen flex justify-center items-center z-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="mx-auto p-8  w-full bg-white px-2 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200 ">
              <div className="text-start ">
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-center flex justify-between">
                    <h6 className="text-slate-700 text-xl font-bold">
                      Add Product
                    </h6>
                  </div>
                </div>
                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                  <form onSubmit={handleSubmit}>
                    <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
                      Order Information
                    </h6>
                    <div className="flex flex-wrap">
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-slate-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={productDetails.name}
                            onChange={handleChange}
                            className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            required
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-slate-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Stock{" "}
                          </label>
                          <input
                            type="email"
                            name="stock"
                            value={productDetails.stock}
                            onChange={handleChange}
                            required
                            className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-slate-600 text-xs font-bold mb-2"
                            htmlFor=""
                          >
                            Actual price
                          </label>
                          <input
                            type="text"
                            name="actualPrice"
                            value={productDetails.actualPrice}
                            onChange={handleChange}
                            required
                            className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-slate-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Sale Price
                          </label>
                          <input
                            type="text"
                            name="salePrice"
                            value={productDetails.salePrice}
                            onChange={handleChange}
                            required
                            className="border-0 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          />
                        </div>
                      </div>
                    </div>

                    <hr className="mt-6 border-b-1 border-slate-300" />

                    <h6 className="text-slate-400 text-sm mt-3 mb-6 font-bold uppercase">
                      Description & category
                    </h6>
                    <div className="flex flex-wrap">
                      <div className="w-full lg:w-12/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-slate-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Select Category
                          </label>
                          <select
                            name="category"
                            value={selectedCategoryId}
                            onChange={handleChange}
                            className="border-0 text-center bg-transparent px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-slate-600 text-xs font-bold mb-2"
                            htmlFor=""
                          >
                            Description
                          </label>
                          <textarea
                            type="text"
                            name="description"
                            value={productDetails.description}
                            onChange={handleChange}
                            required
                            className="border-2 border-gray-200 px-3 py-3 placeholder-slate-300 text-slate-600 bg-white rounded text-sm shadow outline-none focus:ring w-full ease-linear transition-all duration-150"
                            rows="4"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="mt-10  text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <h4 className="text-lg font-semibold">Features</h4>
                    {productDetails.features.map((feature, index) => (
                      <div key={index} className="mb-2 flex items-center">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeaturesChange(e, index)}
                          className="flex-grow bg-transparent border-b border-gray-400 placeholder-slate-300 text-slate-600 bg-white focus:ring outline-none px-2 py-1 "
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="ml-2 text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="mt-2 text-orange-500"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-10 py-10 border-t border-slate-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <h4 className="text-lg font-semibold mb-2">
                      Specifications
                    </h4>
                    {productDetails.specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="mb-2 flex flex-col lg:flex-row items-center gap-4"
                      >
                        <input
                          type="text"
                          value={spec.name}
                          onChange={(e) =>
                            handleSpecificationChange(e, index, "name")
                          }
                          placeholder="Name"
                          className="flex-grow bg-transparent border-b border-gray-400 placeholder-slate-300 text-slate-600 bg-white focus:ring  outline-none px-2 py-1"
                        />
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) =>
                            handleSpecificationChange(e, index, "value")
                          }
                          placeholder="Value"
                          className="flex-grow bg-transparent border-b placeholder-slate-300 text-slate-600 bg-white focus:ring border-gray-400 outline-none px-2 py-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecification(index)}
                          className="ml-2 text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="mt-2 text-orange-500"
                    >
                      Add Specification
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-10 py-10 border-t border-slate-200 text-center">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-9/12 px-4">
                    <h4 className="text-lg font-semibold">Product Images</h4>
                    <div className="flex flex-col lg:flex-row justify-center items-center gap-4  mt-4">
                      {productDetails.images.map((image, index) => (
                        <div key={index}>
                          <input
                            type="file"
                            id={`file-input-${index}`}
                            hidden
                            onChange={(e) => handleImage(e, index)}
                          />
                          <img
                            src={
                              image ? URL.createObjectURL(image) : upload_area
                            }
                            className="h-36 w-36 rounded-lg my-3"
                            alt=""
                          />
                          <label
                            htmlFor={`file-input-${index}`}
                            className="cursor-pointer  bg-orange-500 text-white active:bg-orange-600 font-bold uppercase text-xs px-4 py-2  rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                          >
                            Image {index + 1}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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
                    Add Product
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardProfile;
