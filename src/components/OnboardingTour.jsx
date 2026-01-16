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
            icon: '/assets/step1.png'
        },
        {
            title: "Check out your Services",
            description: "In the service history parent profile you can edit your profile and check your schedule",
            icon: '/assets/step2.png',
        },
        {
            title: "Look at your Rewards",
            description: "Check out the benefits of Refer a Friend, know your referrals and manage your loyalty points.",
            icon: '/assets/step3.png',
        },
        {
            title: "Check out your Surveys",
            description: "In Surveys you can create and edit your surveys. You can also check your status.",
            icon: '/assets/step4.png',
        },
        {
            title: "Access settings",
            description: "Set up your account information, your profile, payment methods, security, and notifications in just a few steps.",
            icon: '/assets/step5.png',
        },
        {
            title: "Congratulations John!",
            description: "You have successfully completed the tour guide, you are ready to go.",
            icon: '/assets/step6.png',
        }
    ];

    if (!isOpen) return null;

    const currentStepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-[30px] p-8 max-w-[400px] w-full flex flex-col items-center text-center shadow-2xl relative animate-scaleIn">
                <img src={currentStepData.icon} className='w-full h-full object-cover' alt="" />


                <h2 className="text-[26px] font-bold text-[#191919] my-3">{currentStepData.title}</h2>
                <p className="text-[16px] font-semibold text-[#667085] mb-8 max-w-xs leading-5">
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
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[16px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Skip
                        </button>
                    ) : (
                        <button
                            onClick={handleBack}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-[16px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    {currentStep < steps.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="flex-1 py-2.5 rounded-lg bg-[#237FEA] text-white text-[16px] font-bold hover:bg-[#037ecc] transition-colors shadow-md"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleClose}
                            className="flex-1 py-2.5 rounded-lg bg-[#237FEA] text-white text-[16px] font-bold hover:bg-[#037ecc] transition-colors shadow-md"
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
