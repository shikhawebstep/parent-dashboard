import Login from "../../components/auth/Login";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

const LoginPage = () => {
  const [showMobileLogin, setShowMobileLogin] = useState(false);

  return (
    <div className="w-full h-full bg-white  2xl:min-h-[800px] m-auto items-center overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SECTION */}
      <div
        className="w-full h-full p-8 pb-14 flex md:items-end items-center 2xl:items-center bg-[#FFDE14]  justify-center bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/assets/loginBg.png)' }}
      >
        <div>
          <div style={{ backgroundImage: 'url(/assets/Texture.png)' }} className="2xl:max-w-[550px] bg-[#ffde14] lg:max-w-[400px] object-contain m-auto">
            <img
              src="/assets/studentImage.png"
              alt="Kid"
              className="md:block hidden"
            />
            <img
              src="/assets/mobileChild.png"
              alt="Kid"
              className="md:hidden block"
            />
          </div>
          <div className="md:mt-[80px] mt-[40px] max-w-[150px] m-auto">
            <img src="/assets/sss-logo-parents.png" alt="" className="w-full" />
          </div>

          <button
            type="submit"
            onClick={() => setShowMobileLogin(true)}
            className="w-full block md:hidden bg-white text-[#042C89] mt-14  2xl:text-[22px] lg:text-[16px] font-bold py-2.5 rounded-[8px]  transition"
          >
            Log In
          </button>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 bg-white h-screen transition-transform duration-500 ease-in-out md:static md:z-auto md:translate-x-0 ${showMobileLogin ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          onClick={() => setShowMobileLogin(false)}
          className="absolute top-4 left-4 p-2 md:hidden z-10 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
