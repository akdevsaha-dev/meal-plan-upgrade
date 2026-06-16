import Link from "next/link";
import ChefLogo from "@/app/components/ChefLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 font-sans p-4">
      <div className="text-center max-w-md w-full bg-white rounded-3xl shadow-xl p-8 transform transition-all hover:scale-105 duration-300">
        <div className="flex justify-center mb-6">
          <div className="relative">
             <ChefLogo size={80} />
             <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                404
             </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Oops! Recipe Not Found
        </h1>
        
        <p className="text-gray-500 mb-8 text-lg">
          Looks like this dish isn't on our menu. We searched the kitchen but couldn't find the page you're looking for.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/" 
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Back to Kitchen
          </Link>
        </div>
      </div>
    </div>
  );
}
