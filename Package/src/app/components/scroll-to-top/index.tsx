'use client'
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Top: 0 takes us all the way back to the top of the page
  // Behavior: smooth keeps it smooth!
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Button is displayed after scrolling for 500 pixels
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-999">
      <div className="flex items-center gap-2.5">
        <Link href={"/careers"} target="_blank" className="hidden lg:block bg-purple_blue text-sm hover:bg-purple_blue/90 text-dark_black px-4 py-3.5 leading-none rounded-lg font-medium text-nowrap">
          Squarre Careers
        </Link>
        {isVisible && (
          <div
            onClick={scrollToTop}
            aria-label="scroll to top"
            className="back-to-top flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-purple_blue text-dark_black shadow-md transition duration-300 ease-in-out hover:bg-dark"
          >
            <span className="mt-[6px] h-3 w-3 rotate-45 border-l border-t border-dark_black"></span>
          </div>
        )}
      </div>
    </div>
  );
}