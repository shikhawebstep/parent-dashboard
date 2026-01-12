import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Trophy, FileText, Settings, PartyPopper } from 'lucide-react';

const OnboardingTour = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    // Persist tour state roughly (simulate trigger on first load)
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
        if (!hasSeenTour) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenOnboardingTour', 'true');
    };

    const handleSkip = () => {
        handleClose();
    };

    const handleNext = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const steps = [
        {
            title: "Welcome John!",
            description: "Take a quick tour of your parent connect account.",
            icon: <div className="relative w-32 h-24 bg-[#E0F7FA] rounded-xl flex items-center justify-center border-2 border-[#B2EBF2]">
                <div className="w-20 h-14 bg-white rounded-md shadow-sm border border-gray-100 flex flex-col p-1">
                    <div className="w-full h-1 bg-green-200 mb-1 rounded"></div>
                    <div className="w-2/3 h-1 bg-gray-200 rounded"></div>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>
        },
        {
            title: "Check out your Services",
            description: "In the service history parent profile you can edit your profile and check your schedule",
            icon: <div className="relative w-32 h-24 flex items-center justify-center">
                <div className="w-24 h-16 bg-[#042C89] rounded-lg shadow-md flex items-center justify-center text-white relative z-10">
                    <Calendar size={24} />
                </div>
                <div className="absolute top-[-10px] right-[-10px] bg-green-500 w-10 h-10 rounded-full flex items-center justify-center transform rotate-12 z-20 border-2 border-white">
                    <div className="w-4 h-4 bg-white rounded-[2px]" />
                </div>
            </div>
        },
        {
            title: "Look at your Rewards",
            description: "Check out the benefits of Refer a Friend, know your referrals and manage your loyalty points.",
            icon: <div className="flex items-center justify-center">
                <Trophy size={64} className="text-[#FFD700] drop-shadow-md" />
            </div>
        },
        {
            title: "Check out your Surveys",
            description: "In Surveys you can create and edit your surveys. You can also check your status.",
            icon: <div className="flex items-center justify-center relative">
                <div className="w-20 h-24 bg-white border-2 border-green-500 rounded-lg p-2 flex flex-col gap-2 shadow-sm">
                    <div className="w-full h-2 bg-gray-100 rounded"></div>
                    <div className="w-full h-2 bg-gray-100 rounded"></div>
                    <div className="w-full h-2 bg-gray-100 rounded"></div>
                    <div className="flex justify-end mt-auto">
                        <Check size={16} className="text-green-500" />
                    </div>
                </div>
                <div className="absolute -left-4 top-4">
                    <div className="w-2 h-24 bg-gray-200 rounded-full flex flex-col justify-between py-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                </div>
            </div>
        },
        {
            title: "Access settings",
            description: "Set up your account information, your profile, payment methods, security, and notifications in just a few steps.",
            icon: <div className="flex items-center justify-center relative">
                <Settings size={48} className="text-[#0496FF] animate-spin-slow" />
                <Settings size={32} className="text-green-400 absolute bottom-0 -right-4 animate-reverse-spin" />
            </div>
        },
        {
            title: "Congratulations John!",
            description: "You have successfully completed the tour guide, you are ready to go.",
            icon: <div className="flex items-center justify-center relative">
                <div className="w-24 h-24 bg-[#FFD700] rounded-full flex items-center justify-center text-[#042C89] shadow-inner">
                    <div className="w-4 h-4 bg-black rounded-full absolute top-8 left-6"></div>
                    <div className="w-4 h-4 bg-black rounded-full absolute top-8 right-6"></div>
                    <div className="w-12 h-6 border-b-4 border-black rounded-b-full absolute bottom-6"></div>
                </div>
                <PartyPopper className="absolute -top-4 -right-4 text-green-500" size={32} />
                <PartyPopper className="absolute -bottom-2 -left-4 text-blue-500 transform scale-x-[-1]" size={32} />
            </div>
        }
    ];

    if (!isOpen) return null;

    const currentStepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[30px] p-8 max-w-[400px] w-full flex flex-col items-center text-center shadow-2xl relative animate-scaleIn">
                {/* Image Area */}
                <div className="w-full h-40 bg-gray-50 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
                    {currentStepData.icon}
                </div>

                <h2 className="text-xl font-bold text-[#191919] mb-3">{currentStepData.title}</h2>
                <p className="text-xs text-gray-500 mb-8 max-w-xs leading-5">
                    {currentStepData.description}
                </p>

                {/* Dots Indicator */}
                {currentStep < steps.length - 1 && (
                    <div className="flex gap-2 mb-8">
                        {steps.slice(0, 5).map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-[#00D285] w-2.5' : 'bg-gray-200'
                                    }`}
                            />
                        ))}
                    </div>
                )}


                {/* Buttons */}
                <div className="flex gap-3 w-full mt-auto">
                    {currentStep === 0 ? (
                        <button
                            onClick={handleSkip}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Skip
                        </button>
                    ) : (
                        <button
                            onClick={handleBack}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 py-2.5 rounded-lg bg-[#0496FF] text-white text-xs font-bold hover:bg-[#037ecc] transition-colors shadow-md"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleClose}
                            className="flex-1 py-2.5 rounded-lg bg-[#0496FF] text-white text-xs font-bold hover:bg-[#037ecc] transition-colors shadow-md"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
