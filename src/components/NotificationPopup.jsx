import React, { useState } from "react";
import { Plus, X, Check } from "lucide-react";

const NotificationPopup = ({ notifications = [], onMarkRead }) => {
    const [hideRead, setHideRead] = useState(false);

    const parentData = JSON.parse(localStorage.getItem("parentData"));

    const groupedData = notifications.reduce((acc, item) => {
        if (!item) return acc;

        const d = new Date(item.createdAt);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let group = d.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
        if (d.toDateString() === today.toDateString()) group = "Today";
        else if (d.toDateString() === yesterday.toDateString()) group = "Yesterday";

        if (!acc[group]) acc[group] = [];

        const recipient =
            item.recipients?.find((r) => r.recipientId === parentData?.id) ||
            item.recipients?.[0];

        acc[group].push({
            ...item,
            unread: recipient ? recipient.isRead === false : false,
            image: item.createdBy?.profile || null,
        });

        return acc;
    }, {});

    const displayData = Object.keys(groupedData).map((group) => ({
        group,
        items: groupedData[group],
    }));

    const totalUnread = notifications.filter((item) => {
        if (!item?.recipients) return false;
        const recipient =
            item.recipients.find((r) => r.recipientId === parentData?.id) ||
            item.recipients[0];
        return recipient?.isRead === false;
    }).length;

    const isEmpty = displayData.every(
        (g) => hideRead ? g.items.every((i) => !i.unread) : false
    ) || displayData.length === 0;

    return (
        <div className="absolute top-full right-0 mt-4 w-[400px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 p-6 poppins">

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[#282829]">Notifications</h2>
                    {totalUnread > 0 && (
                        <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                            {totalUnread}
                        </span>
                    )}
                </div>

                {/* Mark all read button — only shows when there are unread */}
                {totalUnread > 0 && onMarkRead && (
                    <button
                        onClick={onMarkRead}
                        className="text-[12px] text-[#00A6E3] font-semibold hover:underline transition-all"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Hide read toggle */}
          
            {/* List */}
            <div className="max-h-[460px] overflow-y-auto pr-1 custom-scrollbar space-y-6">

                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Check size={22} className="text-gray-400" />
                        </div>
                        <p className="text-[14px] text-[#717073] font-medium">
                            {hideRead ? "No unread notifications" : "No notifications yet"}
                        </p>
                    </div>
                ) : (
                    displayData.map((group, groupIdx) => {
                        const visibleItems = hideRead
                            ? group.items.filter((i) => i.unread)
                            : group.items;

                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={groupIdx}>
                                <h3 className="text-[13px] font-semibold text-[#939395] uppercase tracking-wide mb-3">
                                    {group.group}
                                </h3>
                                <div className="space-y-2">
                                    {visibleItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`relative rounded-[16px] p-4 flex items-center gap-3 transition-all hover:shadow-sm cursor-pointer ${
                                                item.unread
                                                    ? "bg-[#F0F8FF] border border-[#D6EEFF]"
                                                    : "bg-[#FAFAFA]"
                                            }`}
                                        >
                                            {/* Unread dot */}
                                            {item.unread && (
                                                <div className="absolute right-4 top-4 w-2.5 h-2.5 bg-[#00A6E3] rounded-full" />
                                            )}

                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                            item.color === "blue"
                                                                ? "bg-[#EBF2FF]"
                                                                : "bg-[#FFF0F0]"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                                item.color === "blue"
                                                                    ? "bg-[#4B84FF]"
                                                                    : "bg-[#FF6B6B]"
                                                            }`}
                                                        >
                                                            {item.type === "plus" ? (
                                                                <Plus size={16} className="text-white" />
                                                            ) : (
                                                                <X size={16} className="text-white" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[14px] font-semibold text-[#282829] line-clamp-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[13px] text-[#717073] line-clamp-2 leading-snug mt-0.5">
                                                    {item.description}
                                                </p>
                                                <p className="text-[11px] text-[#AEACB0] mt-1">
                                                    {new Date(item.createdAt).toLocaleTimeString("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NotificationPopup;