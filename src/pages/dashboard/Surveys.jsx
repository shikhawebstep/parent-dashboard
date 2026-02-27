import React from 'react';
import { useNavigate } from 'react-router-dom';

const Surveys = () => {
    const navigate = useNavigate();

    const surveys = [
        {
            id: 1,
            title: 'Survey Title',
            date: 'Created 01/01/2021',
            status: 'Incompleted',
            questions: 4,
        },
        // Add more mock data if needed
    ];

    const getStatusColor = (status) => {
        return status === 'Incompleted' ? 'text-orange-500' : 'text-green-500';
    };

    const getStatusDot = (status) => {
        return status === 'Incompleted' ? 'bg-orange-500' : 'bg-green-500';
    };

    return (
        <div className="lg:p-8 p-5 animate-fadeIn">
            <div className="mb-6">
                <h2 className="text-[#191919] font-bold text-[32px] font-semibold">Surveys</h2>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-[30px] p-6 lg:px-10 border border-[#E2E1E5]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="">
                                <th className="text-[20px] font-semibold text-[#282829] w-1/3">Survey Title</th>
                                <th className="text-[20px] font-semibold text-[#282829] w-1/4">Status</th>
                                <th className="text-[20px] font-semibold text-[#282829] w-1/4">Questions</th>
                                <th className="text-[20px] font-semibold text-[#282829]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {surveys.map((survey) => (
                                <tr key={survey.id} className="transition-colors">
                                    <td className="">
                                        <div className="text-[16px] text-[#717073] mt-1">{survey.date}</div>
                                    </td>
                                    <td className="">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getStatusDot(survey.status)}`}></div>
                                            <span className={`text-[16px]  text-[#717073]  font-semibold `}>{survey.status}</span>
                                        </div>
                                    </td>
                                    <td className="">
                                        <span className="text-sm font-semibold  text-[#717073] ">{survey.questions}</span>
                                    </td>
                                    <td className=" text-right">
                                        <button
                                            onClick={() => navigate(`/surveys/${survey.id}`)}
                                            className="bg-[#042C89] text-white px-6 py-2.5 rounded-[14px] text-[16px] font-bold hover:bg-[#032066] transition-colors shadow-sm"
                                        >
                                            Complete survey
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {surveys.length === 0 && (
                        <div className="text-center py-12 text-gray-400 text-sm">
                            No surveys available at the moment.
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {surveys.map((survey) => (
                    <div key={survey.id} className="bg-white border border-[#E2E1E5] rounded-[24px] p-6">
                        <h3 className="text-[#191919] font-bold text-[18px] mb-1">{survey.title}</h3>
                        <p className="text-[#717073] text-[14px] mb-5">{survey.date}</p>
                        <button
                            onClick={() => navigate(`/surveys/${survey.id}`)}
                            className="bg-[#042C89] text-white px-6 py-3 rounded-[14px] text-[14px] font-bold hover:bg-[#032066] transition-colors shadow-sm"
                        >
                            Complete survey
                        </button>
                    </div>
                ))}
                {surveys.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        No surveys available at the moment.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Surveys;
