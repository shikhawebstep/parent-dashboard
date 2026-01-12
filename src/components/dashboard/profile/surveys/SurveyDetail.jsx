import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const SurveyDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [uploadToGoogle, setUploadToGoogle] = useState(true);

    const questions = [
        {
            id: 1,
            text: 'What do you think about Synco?',
            options: ['Bad', 'Good', 'Excellent'],
        },
        {
            id: 2,
            text: 'What do you think about Synco?',
            options: ['Bad', 'Good', 'Excellent'],
        },
        {
            id: 3,
            text: 'What do you think about Synco?',
            options: ['Bad', 'Good', 'Excellent'],
        },
        {
            id: 4,
            text: 'Would you recommend Synco to a friend?',
            options: ['Bad', 'Good', 'Excellent'], // Using same options as per screenshot mockup, though likely yes/no in real life
        }
    ];

    return (
        <div className="p-8 min-h-screen bg-[#F9F9F9] animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                {/* Empty div for layout balance if needed, or breadcrumbs */}
                <div></div>
                <button
                    onClick={() => navigate('/surveys')}
                    className="bg-[#0496FF] text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-[#037ecc] transition-colors flex items-center gap-2"
                >
                    Go back to the website
                </button>
            </div>

            <div className="bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 max-w-4xl mx-auto">
                <h2 className="text-[#191919] font-bold text-2xl mb-12">Survey title</h2>

                <div className="relative">
                    {/* Vertical Line for Stepper */}
                    <div className="absolute left-[15px] top-4 bottom-20 w-0.5 bg-gray-200"></div>

                    <div className="space-y-12">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="relative flex gap-8">
                                {/* Step Number */}
                                <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full bg-[#0DD180] text-white text-sm font-bold flex items-center justify-center border-4 border-white shadow-sm">
                                    {idx + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <h3 className="text-[#191919] font-bold text-base mb-4">{q.text}</h3>
                                    <div className="space-y-3">
                                        {q.options.map((option, optIdx) => (
                                            <label key={optIdx} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name={`question-${q.id}`}
                                                        className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-300 checked:border-[#00D285] checked:bg-[#00D285] transition-all"
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="border-b border-gray-100 mt-8 w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Google/Trustpilot Review Section */}
                    <div className="mt-8 ml-16 bg-[#FFFCE6] border border-[#FFEBA8] rounded-xl p-6 relative">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-sm text-gray-800">Google</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="font-bold text-sm text-green-600">Trustpilot</span>
                                </div>
                                <h4 className="font-semibold text-[#191919] text-sm mb-1">
                                    Would you like to upload the review to Google / Trustpilot?
                                </h4>
                                <p className="text-xs text-gray-500 mb-4">
                                    We'll send you an email with a link for you to verify your review.
                                </p>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={uploadToGoogle}
                                            onChange={() => setUploadToGoogle(!uploadToGoogle)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0DD180]"></div>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">Yes, Upload</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 mt-12 ml-16">
                        <button
                            onClick={() => navigate('/surveys')}
                            className="px-8 py-3 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-[#042C89] text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-[#032066] transition-colors shadow-lg"
                        >
                            Complete
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SurveyDetail;
