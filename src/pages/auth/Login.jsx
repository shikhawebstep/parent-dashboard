import Login from "../../components/auth/Login";

const LoginPage = () => {
  return (
    <div className="w-full bg-[#0DD180] min-h-screen m-auto items-center rounded-xl overflow-hidden shadow-lg grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SECTION */}
      <div
        className="hidden w-full h-full p-8 md:flex items-center bg-[#FFDE14]  justify-center bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/assets/loginBg.png)' }}
      >
        <div>
          <div className="2xl:max-w-[550px] lg:max-w-[400px] object-contain m-auto">
            <img
              src="/assets/studentImage.png"
              alt="Kid"
              className=""
            />
          </div>
          <div className="mt-8 max-w-[150px] m-auto">
            <img src="/assets/sss-logo-parents.png" alt="" className="w-full" />
          </div>
        </div>
      </div>


      <Login />
    </div>

  );
};

export default LoginPage;
