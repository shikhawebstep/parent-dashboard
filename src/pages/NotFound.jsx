import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <h1 className="text-9xl font-extrabold text-[#237FEA]">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
            <p className="text-gray-600 mt-2 text-lg max-w-md">
                Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <Link
                to="/"
                className="mt-8 bg-[#237FEA] text-white px-8 py-3 rounded-[14px] font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;
