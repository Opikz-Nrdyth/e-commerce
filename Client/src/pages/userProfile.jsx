import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/client/Navbar";
import Profile from "../components/client/profile";
import SideProfile from "../components/client/sideProfile";
import MyOrder from "../components/client/myorder";
import Settings from "../components/client/settings";
import { useEffect, useState } from "react";
import Address from "../components/client/address";

const UserProfile = ({ userData, setUserData, fetchData, categories }) => {
  const path = useParams();
  const params = path["*"];
  const [visibalitySide, setVisibalitySide] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userData) {
        window.location.href = "/auth/login";
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [userData]);

  return (
    <>
      <Navbar categories={categories} userData={userData} />
      <nav className="mt-[90px] bg-base flex w-full">
        <SideProfile
          setVisibalitySide={setVisibalitySide}
          visibalitySide={visibalitySide}
          setUserData={setUserData}
        />
        <main
          className={`${
            visibalitySide ? "w-[80%] ml-[20%]" : "w-[89%] ml-[11%]"
          } border transition-all ease-in-out`}
        >
          {userData && params == "" ? (
            <Profile userData={userData} fetchData={fetchData} />
          ) : params == "myorder" ? (
            <MyOrder userData={userData} />
          ) : params == "setting" ? (
            <Settings />
          ) : params == "alamat" ? (
            <Address userData={userData} />
          ) : null}
        </main>
      </nav>
    </>
  );
};
export default UserProfile;
