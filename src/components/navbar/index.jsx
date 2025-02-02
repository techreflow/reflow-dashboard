import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Navbar = ({ dashboardRoute }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    setCurrentUser(sessionStorage.getItem("username"));
  }, []);
  return (
    <>
      <div className="bg-white fixed w-full border-b border-stone-300 py-4 px-10 flex justify-between items-center z-10">
        <div className="">
          <img src="/assets/nav-logo.svg" alt="logo" className="h-12 w-auto" />
        </div>
        <div className="flex gap-10 justify-center items-center">
          <button
            className="bg-[#1B1B1B] text-white text-sm font-medium tracking-wide rounded-full px-5 py-3"
            onClick={() => {
              if (dashboardRoute) {
                router.push('/');
              } else {
                sessionStorage.removeItem("username");
                router.push("https://reflowtech.in/loginned");
              }
            }}
          >
            {dashboardRoute ? "Back to Dashboard" : "Back to Home"}
          </button>

          {currentUser && (
            <div>
              <button
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                <div className="rounded-full p-3 bg-[#D2D2D2]">
                  <img
                    alt="user image"
                    src="/icons/user.svg"
                    className="h-5 w-auto"
                  />
                </div>
                {isOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#1B1B1B"
                  >
                    <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#1B1B1B"
                  >
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
