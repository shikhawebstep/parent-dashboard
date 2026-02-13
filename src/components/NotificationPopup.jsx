import React, { useState } from "react";
import { Plus, X, Check } from "lucide-react";

export const notificationsData = [
    {
        group: "Today",
        items: [
            {
                id: 1,
                title: "New Training Course Added",
                description: "Health and Safety video now released",
                type: "plus",
                color: "blue",
                unread: true,
            }
        ]
    },
    {
        group: "Yesterday",
        items: [
            {
                id: 2,
                title: "Class Cancelled",
                description: "Your class on Saturday 18th May has been cancelled.",
                type: "cross",
                color: "red",
                unread: false,
            }
        ]
    },
    {
        group: "December 11, 2024",
        items: [
            {
                id: 3,
                title: "Annual Training Dates",
                description: "Our Annual Training is on 18th Sept",
                image: "/assets/user.png", // Placeholder for avatar with ball
                unread: false,
            },
            {
                id: 4,
                title: "Birthday Party Booking",
                description: "You've been booked on Sat 19th May",
                image: "/assets/user.png", // Placeholder for avatar with thumbs up
                unread: false,
            }
        ]
    }
];

const NotificationPopup = () => {
    const [hideRead, setHideRead] = useState(false);

    return (
        <div className="absolute top-full right-0 mt-4 w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 p-6 poppins">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[24px] font-bold text-[#282829]">Notifications</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={hideRead}
                            onChange={() => setHideRead(!hideRead)}
                        />
                        <div className="w-5 h-5 border-2 border-[#E2E1E5] rounded-md transition-all peer-checked:bg-[#00A6E3] peer-checked:border-[#00A6E3] flex items-center justify-center">
                            {hideRead && <Check size={14} className="text-white" />}
                        </div>
                    </div>
                    <span className="text-[14px] text-[#717073] font-medium">Hide read notifications</span>
                </label>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {notificationsData.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-6">
                        <h3 className="text-[18px] font-bold text-[#282829] mb-4">{group.group}</h3>
                        <div className="space-y-4">
                            {group.items.map((item) => (
                                (!hideRead || item.unread) && (
                                    <div key={item.id} className="relative bg-[#FAFAFA] rounded-[20px] p-4 flex items-center gap-4 transition-all hover:shadow-md cursor-pointer">
                                        {item.unread && (
                                            <div className="absolute right-4 top-4 w-3.5 h-3.5 bg-[#FF6B6B] rounded-full border-2 border-white" />
                                        )}

                                        <div className="flex-shrink-0">
                                            {item.image ? (
                                                <div className="relative">
                                                    <img src={item.image} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                                                    <div className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-white ${item.id === 3 ? 'bg-[#7C4DFF]' : 'bg-[#00D084]'}`}>
                                                        <div className="w-2 h-2 rounded-full bg-white opacity-40 animate-ping" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${item.color === 'blue' ? 'bg-[#EBF2FF]' : 'bg-[#FFF0F0]'}`}>
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color === 'blue' ? 'bg-[#4B84FF]' : 'bg-[#FF6B6B]'}`}>
                                                        {item.type === 'plus' ? <Plus size={20} className="text-white" /> : <X size={20} className="text-white" />}
                                                    </div>
                                                    {/* Small decorative dots */}
                                                    <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${item.color === 'blue' ? 'bg-[#4B84FF]' : 'bg-[#FF6B6B]'} opacity-40`} />
                                                    <div className={`absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full ${item.color === 'blue' ? 'bg-[#4B84FF]' : 'bg-[#FF6B6B]'} opacity-40`} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="text-[16px] font-bold text-[#282829] line-clamp-1">{item.title}</h4>
                                            <p className="text-[14px] text-[#717073] line-clamp-2">{item.description}</p>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPopup;
