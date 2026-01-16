import React from 'react'
import { X, Play, RotateCw, RotateCcw, Volume2, Maximize, MessageSquare, MoreVertical } from 'lucide-react'

const VideoPlayerModal = ({ isOpen, onClose, video }) => {
    if (!isOpen || !video) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full p-5 max-w-[800px] rounded-[20px] shadow-2xl overflow-hidden mx-4 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <h2 className="text-[18px] font-bold text-[#191919] gilory">{video.title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-[#000]" strokeWidth={1.5} />
                    </button>
                </div>

                {/* Video Player Area */}
                {/* <div className="relative bg-[#0CA868] aspect-video w-full flex flex-col justify-between p-8 overflow-hidden">
                 
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 10px 10px, yellow 2px, transparent 0)',
                            backgroundSize: '20px 20px'
                        }}
                    ></div>
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFD600] rounded-full blur-3xl"></div>
                        <div className="absolute top-[20%] right-[10%] w-[10px] h-[10px] bg-[#FFD600] rounded-full"></div>
                        <div className="absolute bottom-[30%] right-[20%] w-[15px] h-[15px] bg-[#FFD600] rounded-full"></div>
                    </div>

                    <div className="flex items-center h-full">
                        <div className="max-w-[50%] space-y-2 z-10">
                            <div className="w-1 h-24 bg-[#FFD600] absolute left-8 top-1/3 rounded-full"></div>
                            <h1 className="text-4xl font-bold text-white/90 leading-tight pl-6 font-serif">
                                Six ways to<br />manipulate the<br />ball with a left<br />foot or you<br />know
                            </h1>
                        </div>
                    </div>

                    <div className="w-full z-20 space-y-2">
                
                        <div className="text-white">
                            <h3 className="text-sm font-bold">6 ways to manipulate the ball with the left foot</h3>
                            <p className="text-[10px] text-white/70">Info Text here</p>
                        </div>

                       
                        <div className="flex items-center gap-4 text-[10px] text-white font-medium">
                            <div className="w-full bg-white/20 h-1 rounded-full relative cursor-pointer">
                                <div className="absolute top-0 left-0 h-full bg-white w-[56%] rounded-full"></div>
                            </div>
                            <span>25:38 / 00:45:00</span>
                        </div>

                    
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-4 text-white">
                                <button className="hover:text-white/80 transition flex items-center justify-center">
                                    <Play size={20} fill="white" />
                                </button>
                                <button className="hover:text-white/80 transition">
                                    <RotateCcw size={18} />
                                </button>
                                <button className="hover:text-white/80 transition">
                                    <RotateCw size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 text-white">
                                <button className="hover:text-white/80 transition">
                                    <Volume2 size={18} />
                                </button>
                                <button className="hover:text-white/80 transition">
                                    <MessageSquare size={18} />
                                </button>
                                <button className="hover:text-white/80 transition">
                                    <Maximize size={18} />
                                </button>
                                <button className="hover:text-white/80 transition">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div> */}

                <img src="/assets/video1.png" alt="" />

                {/* Footer Controls */}
                <div className="p-4 flex items-center justify-end gap-3 bg-white border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-[#F5F5F5] hover:bg-gray-200 text-[#787878] rounded-md text-sm font-semibold transition-colors"
                    >
                        Back
                    </button>
                    <button className="px-4 py-2.5 bg-[#237FEA] hover:bg-[#237FEA] text-white rounded-md text-sm font-semibold transition-colors">
                        Next Video
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayerModal
