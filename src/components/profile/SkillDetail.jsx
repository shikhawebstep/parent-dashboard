import React, { useState } from 'react'
import { Clock, Play, BarChart3, CheckCircle2, Circle, ArrowLeft, Check } from 'lucide-react'
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
        <div className=" animate-fadeIn">
            {/* Header / Banner */}
            <div className='relative'>
                <img src="/assets/skillBanner.png" alt="" srcset="" className='hidden md:block' />
                <img src="/assets/skillBannerMobile.png" alt="" srcset="" className='block md:hidden' />
            </div>


            {/* Title & Overall Progress */}
            <div className="flex flex-col px-4 lg:px-0 md:flex-row md:items-center justify-between gap-4 mt-10 mb-8">
                <h2 className="2xl:text-[32px] lg:text-[24px] text-[20px] font-bold text-[#191919] lg:leading-[36px] leading-[28px] w-full md:w-6/12 font-semibold">
                    {skill.title}
                </h2>
                <div className="flex items-center gap-4 w-full md:w-4/12">
                    <div className="w-full bg-gray-300 rounded-full h-3">
                        <div
                            className="h-3 rounded-full bg-[#43BE4F]"
                            style={{ width: '78%' }}
                        ></div>
                    </div>
                    <span className="text-[16px] font-bold text-black whitespace-nowrap ">78% completed</span>
                </div>
            </div>

            {/* Video List */}
            <div className="space-y-4 px-4 lg:px-0 ">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-[16px] p-3 border border-[#EBEBEB]">
                        <div className="xl:flex sm:grid grid-cols-2 flex-col md:flex-row xl:items-center md:items-start 2xl:gap-10 md:gap-6 gap-4">
                            {/* Left: Thumbnail Section */}
                            <div className="xl:w-[23%] 2xl:w-[20%] w-full">
                                <div
                                    className="aspect-video bg-[#C4C4C4] xl:h-[250px]  rounded-[12px] relative flex items-center justify-center mb-3  w-full h-full cursor-pointer group overflow-hidden"
                                    onClick={() => setSelectedVideo(video)}
                                >

                                    <img src="/assets/video.png" alt="" srcset="" className='rounded-[8px] h-full object-cover w-full' />
                                    {/* <div className="w-12 h-12 bg-black/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="text-white ml-1" size={20} fill="white" />
                                    </div> */}
                                    <div className="absolute bottom-0 left-0 w-full pointer-events-none w-full">
                                        <div className="bg-[#FFD600] w-full md:p-4 p-2 text-[#191919]  font-bold inline-block rounded-sm">
                                            <span className='text-[#042C89] md:text-[20px] text-[17px] font-bold block'>Part {video.id} </span>
                                            <span className="font-normal text-[#042C89] md:text-[17px] text-[14px]">{video.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Info */}
                            <div className="xl:w-[38%] w-full space-y-3">
                                <h3 className="md:text-[26px] text-[22px] font-bold text-[#191919] ">{video.title}</h3>

                                <div className="space-y-1">
                                    <p className="text-[18px] font-bold text-[#191919] ">Brief</p>
                                    <p className="2xl:text-[18px] text-[15px] text-[#626270] leading-relaxed ">
                                        {video.brief}
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${video.status === 'Completed' ? 'bg-[#43BE4F]' : 'bg-[#F7D02A]'}`}
                                            style={{ width: `${video.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[16px] font-bold text-[#333] whitespace-nowrap ">
                                        {video.progress}% completed
                                    </span>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-[16px] text-[#797A88] font-medium  pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <img src="/assets/clock1.png" alt="" className='w-4' />

                                        <span>45 mins</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">

                                        <img src="/assets/ability.png" alt="" className='w-4' />
                                        <span>Ability</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <img src="/assets/easy.png" alt="" className='w-4' />
                                        <span>Easy</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Checklist & Action */}
                            <div className="xl:w-[27%] 2xl:w-[25%] w-full flex flex-col justify-between">
                                <div>
                                    <p className="text-[16px] 2xl:text-[18px] font-bold text-[#191919] mb-2 ">My child can...</p>
                                    <div className="space-y-2">
                                        {video.myChildCan.map((check) => (
                                            <div key={check.id} className="flex items-start gap-2 py-1">
                                                {check.checked ? (
                                                    <CheckCircle2 size={19} className="text-[#333] shrink-0 mt-0.5" />
                                                ) : (
                                                    <Circle size={19} className="text-[#333] shrink-0 mt-0.5" />
                                                )}
                                                <span className="text-[14px] 2xl:text-[17px] text-[#626270] leading-tight ">{check.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                            <div className="mt-4 lg:mt-0 xl:w-[14%] flex justify-end items-center w-full">
                                {video.status === 'Completed' ? (
                                    <button
                                        onClick={() => setSelectedVideo(video)}
                                        className="2xl:px-6 p-3 py-2 bg-[#43BE4F] text-white rounded-[14px] w-full text-center justify-center text-[16px] font-semibold flex items-center gap-1 hover:bg-[#0bb36d] transition-colors "
                                    >
                                        <Check size={16} /> Completed
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setSelectedVideo(video)}
                                        className={`px-4 py-2 rounded-[14px] 2x:text-[16px] w-full text-center text-[14px] justify-center font-semibold flex items-center gap-1 transition-colors  ${video.status === 'Continue'
                                            ? 'bg-[#F7D02A] text-[#042C89] hover:bg-[#e6c200]' // Fixed yellow for Continue
                                            : 'bg-[#042C89] text-white hover:bg-[#092b63]' // Blue for Start
                                            }`}>
                                        {video.status === 'Continue' ? (
                                            <Play size={16} />
                                        ) : (
                                            <Play size={16} />
                                        )}
                                        {video.status}
                                    </button>
                                )}
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
