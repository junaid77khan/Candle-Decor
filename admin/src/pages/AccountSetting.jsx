import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from "sonner";

const AccountSettings = () => {
  const navigate = useNavigate();

  // State variables for form inputs and error messages
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [updatedPassword, setUpdatedPassword] = useState('');
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [key, setKey] = useState('');
  const [usernameErrMessage, setUsernameErrMessage] = useState('');
  const [emailErrMessage, setEmailErrMessage] = useState('');
  const [passwordErrMessage, setPasswordErrMessage] = useState('');
  const [keyErrMessage, setKeyErrMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = JSON.parse(localStorage.getItem("accessToken")); // Ensure accessToken is correctly managed

  const Spinner = () => (
    <div className="absolute inset-0 flex justify-center items-center">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
    </div>
  );

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        let expiry = JSON.parse(localStorage.getItem("accessToken"));
        if (expiry && new Date().getTime() < expiry) {
          // Set user status based on token validity
          // setUserStatus(true); // Uncomment if needed
        } else {
          // setUserStatus(false); // Uncomment if needed
          navigate("/");
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // setUserStatus(false); // Uncomment if needed
        navigate("/");
      }
    };

    checkUserStatus();

    const getCurUser = async () => {
      try {
        let response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/cur-user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          mode: 'cors',
          credentials: 'include',
        });

        response = await response.json();
        console.log(response);
        setEmail(response.data.email);
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error getting user data:', error);
        navigate("/");
      }
    };

    getCurUser();

  }, [navigate, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUsernameErrMessage('');
    setEmailErrMessage('');
    setPasswordErrMessage('');
    setKeyErrMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/user/update-user-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          username: updatedUsername || username,
          email: updatedEmail || email,
          password: updatedPassword || "DUMMYPASSWORD",
          key: key
        }),
      });

      const dataFromServer = await response.json();

      if (!dataFromServer.success) {
        setLoading(false);
        const data = dataFromServer.data;
        if (data?.usernameError?.length > 0) {
          setUsernameErrMessage(data.usernameError);
        }
        if (data?.keyError?.length > 0) {
          setKeyErrMessage(data.keyError);
        }
        if (data?.emailError?.length > 0) {
          setEmailErrMessage(data.emailError);
        }
        if (data?.passwordError?.length > 0) {
          setPasswordErrMessage(data.passwordError);
        }
        throw new Error('Error updating account settings');
      }

      toast.success('Account settings updated successfully');
      navigate('/');
    } catch (error) {
      console.error('Error updating account settings:', error);
      toast.error('Error updating account settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative md:ml-64">
      <div className="px-4 md:px-10 mx-auto w-full">
        <div className="container w-full mx-auto lg:px-4 py-8">
          <div className="mx-auto p-8 w-full bg-white px-4 lg:px-10 rounded-lg py-10 shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
            <form className='flex flex-col justify-center items-start gap-4'>
              <div className='flex flex-wrap justify-start items-start gap-4'>
                <div className="">
                  <label htmlFor="usernameFixed" className="block text-sm font-medium text-gray-700">
                    Current username
                  </label>
                  <input
                    disabled={true}
                    type="text"
                    id="usernameFixed"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <p className="text-xs md:text-sm invisible text-red-500"></p>
                </div>
                <div className="">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Update username
                  </label>
                  <input
                    type="text"
                    id="username"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={updatedUsername}
                    onChange={(e) => setUpdatedUsername(e.target.value)}
                    required
                  />
                  <p className={`text-xs md:text-sm text-red-500 ${usernameErrMessage ? 'visible' : 'invisible'}`}>{usernameErrMessage}</p>
                </div>
              </div>

              <div className='flex flex-wrap justify-start items-start gap-4'>
                <div className="">
                  <label htmlFor="emailFixed" className="block text-sm font-medium text-gray-700">
                    Current email
                  </label>
                  <input
                    disabled={true}
                    type="email"
                    id="emailFixed"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs md:text-sm text-red-500"></p>
                </div>
                <div className="">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Update email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={updatedEmail}
                    onChange={(e) => setUpdatedEmail(e.target.value)}
                    required
                  />
                  <p className={`text-xs md:text-sm text-red-500 ${emailErrMessage ? 'visible' : 'invisible'}`}>{emailErrMessage}</p>
                </div>
              </div>

              <div className=''>
                <h1 className='text-sm text-gray-400'>Please choose a strong password</h1>
                <div className='flex flex-wrap justify-start items-start gap-4'>

                  <div className="">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 ">
                      Update password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={updatedPassword}
                      onChange={(e) => setUpdatedPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <p className={`text-xs md:text-sm text-red-500 ${passwordErrMessage ? 'visible' : 'invisible'}`}>{passwordErrMessage}</p>
                  </div>
                  <div className="">
                    <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                      Enter pass key
                    </label>
                    <input
                      type="password"
                      id="key"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <p className={`text-xs md:text-sm text-red-500 ${keyErrMessage ? 'visible' : 'invisible'}`}>{keyErrMessage}</p>
                  </div>
                </div>
              </div>
              <button
                disabled={updatedUsername.length === 0 && updatedEmail.length === 0 && (updatedPassword.length === 0 || key.length === 0)}
                onClick={handleSubmit}
                className={`font-semibold ${updatedUsername.length === 0 && updatedEmail.length === 0 && (updatedPassword.length === 0 || key.length === 0) ? `bg-gray-400` : 'bg-orange-500'} text-gray-100 py-2 px-2 rounded-lg hover:bg-orange-600 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none relative`}
              >
                {loading && <Spinner />}
                <span className={`px-2 ${loading ? 'invisible' : 'visible'}`}>Save changes</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
