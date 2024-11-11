
import CardProfile from "../components/Cards/CardProfile";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Add() {

  const [userStatus, setUserStatus] = useState(false);
  const navigate = useNavigate();

    useEffect(() => {
      const checkUserStatus = async () => {
          try {
              let expiry = JSON.parse(localStorage.getItem("accessToken"));
              if (expiry && new Date().getTime() < expiry) {
                  setUserStatus(true);
              } else {
                  setUserStatus(false);
                  console.log("navigating");
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

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full px-4">
          <CardProfile />
        </div>
      </div>
    </>
  );
}