
import { Menu } from "lucide-react";

const Header = ({ onMenuClick }) => {
  return (
    <header className="w-full bg-white border-b">
      <div className="w-full px-6 py-4 pt-[20px] 2xl:pt-[50px] pb-[20px] flex items-center justify-between">

        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-[#fff]"
            onClick={onMenuClick}
          >
            <Menu size={28} />
          </button>

          <div className="hidden lg:block">
            <p className="text-[18px] lg:text-[26px] font-medium text-[#282829] m-0">Hi John!</p>
            <h1 className="text-[24px] lg:text-[36px] m-0 font-semibold text-gray-900 leading-tight">
              Account Information
            </h1>
          </div>
        </div>
        <img src="/assets/whiteParentLogo.png" alt="" className="block lg:hidden max-w-[200px]" />

        {/* Right Section */}
        <div className="flex items-center 2xl:gap-6 gap-3">

          {/* Back Button */}
          <button className="bg-[#00A6E3] hidden lg:block  hover:bg-sky-600 text-white 2xl:px-6 px-3 glory py-2.5 rounded-full 2xl:text-[18px] text-[16px] font-semibold transition">
            Go back to the website
          </button>

          {/* Notification */}
          <button className="relative hidden lg:flex  border border-[#E2E1E5] rounded-full 2xl:h-[54px] 2xl:w-[54px] h-[40px] w-[40px]  items-center justify-center">
            <img src="/assets/notification-02.png" alt="notification"
              className="2xl:w-6 2xl:h-6 w-4 h-4 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Date */}
          <div className="text-right text-sm text-gray-600 hidden lg:block">
            <p className="font-semibold 2xl:text-[18px] text-[16px] text-gray-900">Monday</p>
            <p className="text-[14px] font-semibold text-[#717073]">8 January, 2023</p>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-2 cursor-pointer lg:border-l border-[#E2E1E5] lg:ps-5">
            <img
              src="/assets/user.png"
              alt="User"
              className="w-[52px] lg:h-[52px] rounded-full object-cover"
            />
            <span className="2xl:text-[18px] text-[14px] hidden lg:block  font-semibold text-[#282829]">
              John Doe
            </span>
            <img src="/assets/Arrows-down.png" alt="notification" className="w-4  hidden lg:block  text-gray-600" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
