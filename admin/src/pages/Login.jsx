import { useState } from "react";
import AuthForm from "../components/Authform";
import { login } from "../store/authSlice";
import { storeATLS } from "../store/accessToken";
import { setTokenWithExpiry } from "../store/accessToken";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {  toast } from "sonner";

import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErrMessage, setEmailErrMessage] = useState("Empty");
  const [passwordErrMessage, setPasswordErrMessage] = useState("Empty");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailErrMessage("Empty");
    setPasswordErrMessage("Empty");
    try {
      const data = {
        email: email,
        password: password,
      };
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/user/signin`,
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const dataFromServer = await response.json();

      if (!dataFromServer.success) {
        console.log(dataFromServer);
        const data = dataFromServer.data;
        if (data?.emailError?.length > 0) {
          setEmailErrMessage(data.emailError);
        }
        if (data?.passwordError?.length > 0) {
          setPasswordErrMessage(data.passwordError);
        }
        throw new Error("Failed");
      }

      toast.success("Login successful", {
        style: {
          fontSize: "0.9rem",
          padding: "0.5rem",
        },
      });
      dispatch(setTokenWithExpiry({ ttl: 30000 }));
      dispatch(storeATLS(dataFromServer.data.accessToken));
      dispatch(login());
      navigate("/all-products");
    } catch (error) {
      toast.error("Login failed, please try again", {
        style: {
          fontSize: "0.9rem",
          padding: "0.5rem",
        },
      });
      throw new Error("Failed to signin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      isLogin={true}
      handleSubmit={handleSubmit}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      error={error}
      loading={loading}
      emailErrMessage={emailErrMessage}
      passwordErrMessage={passwordErrMessage}
    />
  );
};

export default Login;
