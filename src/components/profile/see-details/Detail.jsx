import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Payment from './Payment'
import Credits from './Credits'
import Attendance from './Attendance'
import General from './General'

const Detail = () => {
    const location = useLocation()
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'general')
    const navigate = useNavigate()
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(false)

    const booking = location.state?.booking;

    const availableTabs = [
        { id: 'general', label: 'General' },
        ...(booking?.serviceType !== "weekly class trial" ? [{ id: 'payments', label: 'History of Payments' }] : []),
        ...(booking?.serviceType === "weekly class membership" ? [{ id: 'credits', label: 'Credits' }] : []),
        ...(booking?.serviceType !== "one to one" && booking?.serviceType !== "birthday party" && booking.bookingType !== "waiting list" ? [{ id: 'attendance', label: 'Attendance' }] : []),
    ];

    const formattedServices = (service) => {
        const serviceMap = {
            "weeklyclassmembership": "weekly",
            "weeklyclasstrial": "weekly",
            "one to one": "onetoone",
            "birthdayparty": "birthday",
            "holidaycamp": "holiday",
        };

        return serviceMap[service?.toLowerCase()] || service;
    };

    const fetchDetails = useCallback(async () => {
        if (!booking?.serviceType || !booking?.id) return;

        setLoading(true);
        try {
            const token = localStorage.getItem("parentToken");
            const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/';

            // Format serviceType: "one to one" -> "onetoone"
            const serviceType = (booking?.serviceType?.trim() || "")
                .replace(/\s+/g, "")
                .toLowerCase();
            const response = await fetch(
                `${API_URL}api/parent/account-profile/preview?serviceType=${formattedServices(serviceType)}&bookingId=${booking.id}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();
            if (response.ok) {
                setDetails(data?.data || data);
                console.log("Preview details result:", data);
            } else {
                console.error("Failed to fetch details:", data);
            }
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    }, [booking?.serviceType, booking?.id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <General booking={booking} details={details} loading={loading}  fetchDetails={fetchDetails}/>
            case 'payments': return <Payment booking={booking} details={details} loading={loading}  fetchDetails={fetchDetails}/>
            case 'credits': return <Credits booking={booking} details={details} loading={loading} fetchDetails={fetchDetails}/>
            case 'attendance': return <Attendance booking={booking} details={details} loading={loading} fetchDetails={fetchDetails} />
            default: return null
        }
    }

    return (
        <div className="min-h-screen p-8">

            {/* Tab Bar */}

            <div className="flex relative mb-5 items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors mr-2"
                >
                    <img src="/assets/ArrowLeft.png" className='w-6 h-6' alt="" />

                </button>
                <div className="bg-white border w-max rounded-[19px]  border-[#E2E1E5] px-4 py-2 flex items-center justify-between">

                    {availableTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-1.5 rounded-[14px] text-[18px] font-semibold transition-colors ${activeTab === tab.id
                                ? 'bg-[#237FEA] text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'credits' && (
                    <button className="bg-blue-600 hover:bg-blue-700 absolute right-0 top-4 text-white text-[18px] font-semibold px-4 py-1.5 rounded-[12px] transition-colors">
                        Add Credits
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div>{renderContent()}</div>

        </div>
    )
}

export default Detail