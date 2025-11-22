import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e0e5ec] px-4 text-center font-sans">
      <div className="max-w-md w-full bg-[#e0e5ec] rounded-[3rem] p-10 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]">
        <div className="space-y-8">
          {/* Icon or Illustration - Pressed Effect */}
          <div className="flex justify-center">
            <div className="w-28 h-28 bg-[#e0e5ec] rounded-full flex items-center justify-center shadow-[inset_9px_9px_18px_#bebebe,inset_-9px_-9px_18px_#ffffff]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-red-500/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-700 tracking-wide">
              Shop Not Found
            </h1>
            <p className="text-gray-500 font-medium">
              Oops! The shop you are looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Action Button - Extruded Effect */}
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-blue-600 bg-[#e0e5ec] rounded-2xl shadow-[9px_9px_18px_#bebebe,-9px_-9px_18px_#ffffff] hover:shadow-[inset_9px_9px_18px_#bebebe,inset_-9px_-9px_18px_#ffffff] active:shadow-[inset_9px_9px_18px_#bebebe,inset_-9px_-9px_18px_#ffffff] transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer or additional help */}
      <div className="mt-12 text-sm text-gray-500 font-medium">
        <p>
          Want to create your own shop?{" "}
          <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  );
}
