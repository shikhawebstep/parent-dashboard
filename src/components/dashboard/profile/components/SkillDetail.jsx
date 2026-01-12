import React, { useState } from 'react'
import { Clock, Play, BarChart3, CheckCircle2, Circle, ArrowLeft } from 'lucide-react'
import VideoPlayerModal from './VideoPlayerModal';

const SkillDetail = ({ skill, onBack }) => {
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Static video data
    const videos = [
        {
            id: 1,
            title: "Video 1",
            duration: "2 minutes",
            brief: "Lorem ipsum dolor sit amet consectetur. Maecenas dignissim euismod id ornare fringilla ut tincidunt venenatis eget.",
            progress: 100,
            status: "Completed",
            myChildCan: [
                { id: 1, label: "Isn't good with the left foot", checked: true },
                { id: 2, label: "Improve in control the ball with the left foot", checked: true },
                { id: 3, label: "Shooting with the left foot", checked: true },
            ]
        },
        {
            id: 2,
            title: "Video 2",
            duration: "2 minutes",
            brief: "Lorem ipsum dolor sit amet consectetur. Maecenas dignissim euismod id ornare fringilla ut tincidunt venenatis eget.",
            progress: 78,
            status: "Continue",
            myChildCan: [
                { id: 1, label: "Isn't good with the left foot", checked: true },
                { id: 2, label: "Improve in control the ball with the left foot", checked: true },
                { id: 3, label: "Shooting with the left foot", checked: false },
            ]
        },
        {
            id: 3,
            title: "Video 3",
            duration: "2 minutes",
            brief: "Lorem ipsum dolor sit amet consectetur. Maecenas dignissim euismod id ornare fringilla ut tincidunt venenatis eget.",
            progress: 0,
            status: "Start training",
            myChildCan: [
                { id: 1, label: "Isn't good with the left foot", checked: true },
                { id: 2, label: "Improve in control the ball with the left foot", checked: true },
                { id: 3, label: "Shooting with the left foot", checked: true },
            ]
        },
        {
            id: 4,
            title: "Video 4",
            duration: "3 minutes",
            brief: "Lorem ipsum dolor sit amet consectetur. Maecenas dignissim euismod id ornare fringilla ut tincidunt venenatis eget.",
            progress: 0,
            status: "Start training",
            myChildCan: [
                { id: 1, label: "Isn't good with the left foot", checked: true },
                { id: 2, label: "Improve in control the ball with the left foot", checked: true },
                { id: 3, label: "Shooting with the left foot", checked: true },
            ]
        },
        {
            id: 5,
            title: "Video 5",
            duration: "2 minutes",
            brief: "Lorem ipsum dolor sit amet consectetur. Maecenas dignissim euismod id ornare fringilla ut tincidunt venenatis eget.",
            progress: 0,
            status: "Start training",
            myChildCan: [
                { id: 1, label: "Isn't good with the left foot", checked: true },
                { id: 2, label: "Improve in control the ball with the left foot", checked: true },
                { id: 3, label: "Shooting with the left foot", checked: true },
            ]
        }
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header / Banner */}
            <div className='relative'>
                <img src="/assets/skillBanner.png" alt="" srcset="" />
            </div>


            {/* Title & Overall Progress */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-[20px] font-bold text-[#191919] w-full md:w-1/2 gilory">
                    {skill.title}
                </h2>
                <div className="flex items-center gap-4 w-full md:w-1/2">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className="h-2 rounded-full bg-[#0DD180]"
                            style={{ width: '78%' }}
                        ></div>
                    </div>
                    <span className="text-sm font-bold text-[#333] whitespace-nowrap gilory">78% completed</span>
                </div>
            </div>

            {/* Video List */}
            <div className="space-y-4">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left: Thumbnail Section */}
                            <div className="lg:w-[35%] w-full">
                                <div
                                    className="aspect-video bg-[#C4C4C4] rounded-[10px] relative flex items-center justify-center mb-3 cursor-pointer group overflow-hidden"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="text-white ml-1" size={20} fill="white" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-2 pointer-events-none">
                                        <div className="bg-[#FFD600] text-[#191919] text-[18px] font-bold px-2 py-1 inline-block rounded-sm">
                                            Part {video.id} <br /> <span className="font-normal">{video.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Info */}
                            <div className="lg:w-[40%] w-full space-y-3">
                                <h3 className="text-lg font-bold text-[#191919] gilory">{video.title}</h3>

                                <div className="space-y-1">
                                    <p className="text-[18px] font-bold text-[#191919] gilory">Brief</p>
                                    <p className="text-[18px] text-[#5B6572] leading-relaxed gilory">
                                        {video.brief}
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${video.status === 'Completed' ? 'bg-[#0DD180]' : 'bg-[#FFC107]'}`}
                                            style={{ width: `${video.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[16px] font-bold text-[#333] whitespace-nowrap gilory">
                                        {video.progress}% completed
                                    </span>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-[16px] text-[#5B6572] font-medium gilory pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        <span>45 mins</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BarChart3 size={14} />
                                        <span>Ability</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <BarChart3 size={14} />
                                        <span>Easy</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Checklist & Action */}
                            <div className="lg:w-[25%] w-full flex flex-col justify-between">
                                <div>
                                    <p className="text-[16px] font-bold text-[#191919] mb-2 gilory">My child can...</p>
                                    <div className="space-y-2">
                                        {video.myChildCan.map((check) => (
                                            <div key={check.id} className="flex items-start gap-2">
                                                {check.checked ? (
                                                    <CheckCircle2 size={14} className="text-[#333] shrink-0 mt-0.5" />
                                                ) : (
                                                    <Circle size={14} className="text-[#333] shrink-0 mt-0.5" />
                                                )}
                                                <span className="text-[16px] text-[#5B6572] leading-tight gilory">{check.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 lg:mt-0 flex justify-end">
                                    {video.status === 'Completed' ? (
                                        <button
                                            onClick={() => setSelectedVideo(video)}
                                            className="px-6 py-2 bg-[#0DD180] text-white rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-[#0bb36d] transition-colors gilory"
                                        >
                                            <CheckCircle2 size={16} /> Completed
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setSelectedVideo(video)}
                                            className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors gilory ${video.status === 'Continue'
                                                ? 'bg-[#FFD600] text-[#191919] hover:bg-[#e6c200]' // Fixed yellow for Continue
                                                : 'bg-[#0B357B] text-white hover:bg-[#092b63]' // Blue for Start
                                                }`}>
                                            {video.status === 'Continue' ? (
                                                <Play size={16} fill="currentColor" />
                                            ) : (
                                                <Play size={16} fill="white" />
                                            )}
                                            {video.status}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Video Player Modal */}
            <VideoPlayerModal
                isOpen={!!selectedVideo}
                onClose={() => setSelectedVideo(null)}
                video={selectedVideo}
            />
        </div>
    )
}

export default SkillDetail
