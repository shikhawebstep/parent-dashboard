import React from 'react';

const EmptyState = ({
    message = "You have no booking",
    subMessage = "It looks like you haven't made any bookings yet. Click the button above to add one!"
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-[30px] shadow-sm animate-fadeIn mx-4 md:mx-0">
            <div className="mb-8 w-48 h-48 flex items-center justify-center  overflow-hidden">
                <img
                    src="/assets/empty-bookings.png"
                    alt="No bookings"
                    className="w-full h-full object-contain p-4 opacity-80"
                />
            </div>
            <h3 className="text-[22px] font-bold text-[#282829] mb-3">{message}</h3>
            <p className="text-[#717073] max-w-sm text-[16px] leading-relaxed">
                {subMessage}
            </p>
        </div>
    );
};

export default EmptyState;
