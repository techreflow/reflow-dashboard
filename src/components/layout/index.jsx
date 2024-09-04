import Navbar from "@/components/navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PageLayout = ({ children, pageName }) => {
  const router = useRouter();

  const sidebarItems = [
    { name: "Add Project", icon: "/icons/add.svg", path: "/" },
    { name: "Config Panel", icon: "/icons/analytics.svg", path: "/configpanel" },
    {
      name: "Ai Analytics",
      icon: "/icons/analytics.svg",
      path: "/ai-analytics",
    },
    {
      name: "Subscription",
      icon: "/icons/subscription.svg",
      path: "/subscription",
    },
    {
      name: "Provide Access",
      icon: "/icons/access.svg",
      path: "/provide-access",
    },
  ];
  const [activeButton, setActiveButton] = useState(pageName);

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-auto">
        <Navbar />
        <div className="flex w-full h-full">
          <div className="min-h-screen">
            <div className="w-[300px] flex flex-col gap-3 pt-4 h-full bg-[#1B1B1B]">
              <div className="rounded-full bg-white p-4 w-fit mt-60 mx-auto">
                <img
                  src="/assets/company-logo.svg"
                  alt="logo"
                  className="h-20 w-20"
                />
              </div>
              <div className="text-white text-center text-xl tracking-wide">
                Company Name
              </div>
              <div className="mt-7 grid grid-cols-1 items-start gap-4 px-5">
                {sidebarItems.map((item, index) => (
                  <button
                    className={`${
                      activeButton === item.name
                        ? "bg-white text-[#1B1B1B]"
                        : "bg-[#1B1B1B] text-white"
                    } flex justify-center items-center gap-3 rounded-full w-full py-2`}
                    key={index}
                    onClick={() => router.push(item.path)}
                  >
                    <span className="">
                      <img
                        src={item.icon}
                        className="w-5 h-auto"
                        alt={item.name}
                      />
                    </span>
                    <span className="font-medium tracking-wide text-lg">
                      {item.name}
                    </span>
                  </button>
                ))}
                <button
                  className={`${
                    activeButton === "Settings"
                      ? "bg-white text-[#1B1B1B]"
                      : "bg-[#1B1B1B] text-white"
                  } flex justify-center items-center gap-3 rounded-full w-full py-2`}
                  onClick={() => setActiveButton("Settings")}
                >
                  <span className="">
                    <img
                      src={"/icons/settings.svg"}
                      className="w-5 h-auto"
                      alt={"Settings"}
                    />
                  </span>
                  <span className="font-medium tracking-wide text-lg">
                    {"Settings"}
                  </span>
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      viewBox="0 -960 960 960"
                      width="24px"
                      fill={activeButton === "Settings" ? "#1B1B1B" : "#D2D2D2"}
                    >
                      <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-20">
            <div className="p-5">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PageLayout;
