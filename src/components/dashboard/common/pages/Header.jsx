
const Header = () => {
  return (
    <header className="w-full bg-white border-b">
      <div className="w-full px-6 py-4 pt-[50px] pb-[20px] flex items-center justify-between">
        
        {/* Left Section */}
        <div>
          <p className="text-[26px]  font-medium text-[#282829]  m-0">Hi John!</p>
          <h1 className="text-[36px] m-0 font-semibold text-gray-900 leading-7">
            Account Information
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          
          {/* Back Button */}
          <button className="bg-[#00A6E3]  hover:bg-sky-600 text-white px-6 glory py-2.5 rounded-full text-[18px] font-semibold transition">
            Go back to the website
          </button>

          {/* Notification */}
          <button className="relative border border-[#E2E1E5] rounded-full h-[54px] w-[54px] flex items-center justify-center">
            <img src="/assets/notification-02.png" alt="notification"
             className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Date */}
          <div className="text-right text-sm text-gray-600 hidden sm:block">
            <p className="font-semibold text-[18px] text-gray-900">Monday</p>
            <p className="text-[14px] font-semibold text-[#717073]">8 January, 2023</p>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 cursor-pointer border-l border-[#E2E1E5] ps-5">
            <img
              src="/assets/user.png"
              alt="User"
              className="w-[52px] h-[52px] rounded-full object-cover"
            />
            <span className="text-[18px] font-semibold text-[#282829]">
              John Doe
            </span>
            <img src="/assets/Arrows-down.png" alt="notification" className="w-4  text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
