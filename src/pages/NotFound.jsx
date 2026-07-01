import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-4 py-16 font-['Poppins',sans-serif]">
            <div className="text-center max-w-lg">

                {/* Ball + 404 */}
                <div className="flex items-center justify-center gap-4 mb-2 select-none">
                    <span className="text-[96px] sm:text-[120px] font-extrabold text-[#1e3a6e] leading-none tracking-tight">4</span>
                    <span className="relative w-[76px] h-[76px] sm:w-[96px] sm:h-[96px] shrink-0 animate-[bounce_2.2s_ease-in-out_infinite]">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                            <circle cx="50" cy="50" r="48" fill="#fff" stroke="#1e3a6e" strokeWidth="3" />
                            <g fill="#1e3a6e">
                                <polygon points="50,28 61,36 57,49 43,49 39,36" />
                                <polygon points="50,28 50,14 38,10" fill="none" stroke="#1e3a6e" strokeWidth="2.5" />
                                <polygon points="50,28 62,14 74,20" fill="none" stroke="#1e3a6e" strokeWidth="2.5" />
                                <polygon points="61,36 78,32 86,44" fill="none" stroke="#1e3a6e" strokeWidth="2.5" />
                                <polygon points="57,49 68,60 62,74" fill="none" stroke="#1e3a6e" strokeWidth="2.5" />
                                <polygon points="43,49 32,60 38,74" fill="none" stroke="#1e3a6e" strokeWidth="2.5" />
                                <polygon points="39,36 22,32 14,44" fill="none" stroke="#1e3a6e" strokeWidth="2.5" />
                            </g>
                        </svg>
                    </span>
                    <span className="text-[96px] sm:text-[120px] font-extrabold text-[#1e3a6e] leading-none tracking-tight">4</span>
                </div>

                {/* Dashed pitch line */}
                <div className="w-40 h-[2px] mx-auto mb-6 border-t-2 border-dashed border-[#bcd0f5]" />

                <h1 className="text-[28px] sm:text-[32px] font-bold text-[#1f2733] mb-2.5 tracking-tight">
                    Offside! This page doesn't exist.
                </h1>
                <p className="text-[#6b7685] text-[15px] leading-relaxed mb-9 max-w-sm mx-auto">
                    Looks like it left the pitch before kick-off. It may have moved, been renamed, or never existed at all.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3b7df6] hover:bg-[#2f6ae0] text-white font-semibold text-[15px] rounded-[30px] px-7 py-3 transition-colors shadow-[0_8px_20px_rgba(59,125,246,0.25)]"
                    >
                        <Home size={17} />
                        Back to home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#eaf1fe] text-[#1e3a6e] font-semibold text-[15px] rounded-[30px] px-7 py-3 border border-[#e7ebf1] transition-colors"
                    >
                        <ArrowLeft size={17} />
                        Go back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;