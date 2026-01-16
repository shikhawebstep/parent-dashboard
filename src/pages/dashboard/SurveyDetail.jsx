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
        <div className="p-8 min-h-screen m-7 bg-[#fff] rounded-[30px] animate-fadeIn">
            <h2 className="text-[#191919] font-bold text-2xl mb-8">Survey title</h2>

            <div className="bg-white rounded-[30px] p-10 border border-[#D0CFD1] max-w-[990px]">

                <div className="relative">
                    {/* Vertical Line for Stepper */}
                    <div className="absolute left-[15px] rounded-[15px] top-4 bottom-20 w-[6px] bg-[#D9D9D9] h-full"></div>

                    <div className="space-y-12">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="relative flex gap-8">
                                {/* Step Number */}
                                <div className="z-10 flex-shrink-0 w-8 h-8 mt-10 rounded-full bg-[#0DD180] text-white text-sm font-bold flex items-center justify-center border-4 border-[#D6EFDD] shadow-sm">
                                    {idx + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-white shadow-[2px_5px_20px_0px_rgba(0,0,0,0.08)] rounded-[20px] p-4">
                                    <h3 className="text-[#34AE56] font-bold text-[16px] ">Question {idx + 1}</h3>
                                    <h3 className="text-[#191919] font-bold text-[20px] mb-4">{q.text}</h3>
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
                                                <span className="text-[16px] text-gray-600 font-medium group-hover:text-gray-900">{option}</span>
                                            </label>
                                        ))}
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>


                </div>

                {/* Google/Trustpilot Review Section */}
                <div className="mt-8 ml-16 bg-[#FFFCE6] border-[6px] border-[#FFDE14] rounded-xl p-6 relative">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-[20px] text-gray-800">Google</span>
                                <span className="text-gray-400"><img src="/assets/star1.png" className='w-6' alt="" /></span>
                                <span className="font-bold text-[20px] text-green-600">Trustpilot</span>
                            </div>
                            <h4 className="font-bold text-[#191919] text-[20px] mb-1">
                                Would you like to upload the review to Google / Trustpilot?
                            </h4>
                            <p className="text-[16px] font-medium text-gray-500 mb-4">
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
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34AE56]"></div>
                                </div>
                                <span className="text-[16px] font-semibold text-gray-700">Yes, Upload</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-4 mt-8 ml-16">
                    <button
                        onClick={() => navigate('/surveys')}
                        className="px-8 py-3 rounded-xl text-gray-500 font-bold border border-[#E2E1E5] text-[18px] hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-[#042C89] text-white px-10 py-3 rounded-xl font-bold text-[18px]hover:bg-[#032066] transition-colors shadow-lg"
                    >
                        Complete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SurveyDetail;
