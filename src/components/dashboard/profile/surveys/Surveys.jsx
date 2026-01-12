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
        <div className="p-8 min-h-screen bg-[#F9F9F9] animate-fadeIn">
            <div className="mb-8">
                {/* Provide context if needed, but the sidebar handles the main title usually */}
            </div>

            <div className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 min-h-[500px]">
                <h2 className="text-[#191919] font-bold text-xl mb-8">Surveys</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="pb-4 text-xs font-semibold text-gray-500 w-1/3">Survey Title</th>
                                <th className="pb-4 text-xs font-semibold text-gray-500 w-1/4">Status</th>
                                <th className="pb-4 text-xs font-semibold text-gray-500 w-1/4">Questions</th>
                                <th className="pb-4 text-xs font-semibold text-gray-500"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {surveys.map((survey) => (
                                <tr key={survey.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="py-6">
                                        <div className="font-bold text-[#191919] text-sm">{survey.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">{survey.date}</div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getStatusDot(survey.status)}`}></div>
                                            <span className={`text-xs font-semibold ${getStatusColor(survey.status)}`}>{survey.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="text-sm font-semibold text-[#191919]">{survey.questions}</span>
                                    </td>
                                    <td className="py-6 text-right">
                                        <button
                                            onClick={() => navigate(`/surveys/${survey.id}`)}
                                            className="bg-[#042C89] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#032066] transition-colors shadow-sm"
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
        </div>
    );
};

export default Surveys;
