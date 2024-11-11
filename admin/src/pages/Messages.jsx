import Image from "../assets/img/team.jpg";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faMultiply } from "@fortawesome/free-solid-svg-icons";
import { Toaster, toast } from "sonner";

import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Spinner = () => (
  <div className="absolute inset-0 flex justify-center items-center">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
  </div>
);

function Messages() {
  const [messages, setMessages] = useState([]);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [curUser, setCurUser] = useState("");
  const [curMessage, setCurMessage] = useState("");
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("Access Token"));
  const[loading, setLoading] = useState(true);

  const [userStatus, setUserStatus] = useState(false);

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
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/message/get-messages`,
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
        const data = await response.json();

        if (!data.success) {
          throw new Error("Failed to add message");
        }

        setMessages(data.data);
      } catch (error) {
        console.error("Error adding message:", error);
        toast.error("Failed to get message");
      } finally {
        setLoading(false)
      }
    };
    fetchMessages();
  }, []);

  const handleDeleteMessgae = (message) => {
    setDeleteMessage(message);
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    const messageId = deleteMessage._id;
    setDeleteLoading(true);
    if (deleteMessage) {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/v1/message/delete-message/${messageId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Category deleted successfully");
          setMessages(messages.filter((msg) => msg._id !== deleteMessage._id));
        } else {
          throw new Error("Error deleting category");
        }
      } catch (error) {
        toast.error("Error deleting category");
      } finally {
        setDeleteMessage(null);
        setShowDeleteConfirmation(false);
        setDeleteLoading(false);
      }
    }
  };

  const handleShowMesage = (message) => {
    setCurUser(message.name);
    setCurMessage(message.message);
    setShowMessage(true);
  };

  const handleCloseMessage = () => {
    setShowMessage(false);
    setCurUser("");
    setCurMessage("");
  };

  const cancelDelete = () => {
    setDeleteMessage(null);
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="relative md:ml-64 ">
      <div className="px-4 md:px-10 mx-auto w-full py-10">
        <div className="col-span-full xl:col-span-6 bg-white px-4 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200   ">
          <header className="px-5 py-4 border-b border-gray-100 ">
            <h6 className="text-slate-700 text-xl font-bold">Messages</h6>
          </header>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full ">
                  {/* Table header */}
                  <thead className="text-xs font-semibold uppercase w-full  text-gray-400  ">
                    <tr>
                      <th className="whitespace-nowrap  p-3">
                        <div className="font-semibold text-black text-left ">
                          Name
                        </div>
                      </th>
                      <th className="whitespace-nowrap text-black p-3">
                        <div className="font-semibold text-left ">Email</div>
                      </th>
                      <th className=" whitespace-nowrap text-black  p-3">
                        <div className="font-semibold text-left ">Message</div>
                      </th>
                    </tr>
                  </thead>
                  {/* Table body */}
                  {loading || !userStatus ? (
                    <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <div className="h-96 flex justify-center items-center z-50">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  </td>
                </tr>
                  ) : (
                    !messages || messages.length === 0 ? (
                      <tr className="w-[100%]">
                      <td colSpan="6" className="w-full h-full text-xl lg:text-2xl py-10 px-5 font-bold">No messages yet</td>
                  </tr>
                    ) : (
                      <tbody className="text-sm divide-y divide-gray-100  p-3">
                        {messages.map((message) => {
                          return (
                            <tr key={message._id}>
                              <td className="p-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="font-medium text-gray-800 ">
                                    {message.name}
                                  </div>
                                </div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="text-left">{message.email}</div>
                              </td>
                              <td className="p-2 whitespace-nowrap">
                                <div className="text-left font-medium text-green-500">
                                  {message.message.length > 40
                                    ? message.message.substring(0, 40)
                                    : message.message}
                                  ...
                                </div>
                              </td>
                              <td className="px-6 py-4 flex gap-3">
                                <button className="text-gray-600 hover:text-gray-900 mr-4">
                                  <FontAwesomeIcon
                                    onClick={() => handleShowMesage(message)}
                                    icon={faEye}
                                  />
                                </button>
                                <button
                                  className="text-gray-600 hover:gray-red-900"
                                  onClick={() => handleDeleteMessgae(message)}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    )
                  )}
                </table>
              </div>
              {showDeleteConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-transparent px-4 md:px-2 lg:px-0 bg-opacity-50 z-50">
                  <div className="bg-gray-100 p-8 rounded-lg shadow-lg max-w-md border-gray-300 border">
                    <p className="text-lg text-center mb-4">
                      Are you sure to delete this message?
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

              {showMessage && (
                <div className="fixed inset-0 flex items-center  justify-center bg-transparent px-4 md:px-2 lg:px-0 bg-opacity-50 z-50">
                  <div className="bg-gray-100 p-8 rounded-lg  min-h-44 min-w-64 shadow-xl max-w-md border-gray-300 border relative">
                    <FontAwesomeIcon
                      className="absolute top-2 right-2"
                      onClick={handleCloseMessage}
                      icon={faMultiply}
                    />
                    <p className="text-lg text-start text-gray-400 mb-4">
                      {curUser}
                    </p>
                    <div className="flex justify-center gap-2">
                      <h1 className="text-md w-full">{curMessage}</h1>
                    </div>
                  </div>
                </div>
              )}
            </div>
          
        </div>
      </div>
    </div>
  );
}

export default Messages;
