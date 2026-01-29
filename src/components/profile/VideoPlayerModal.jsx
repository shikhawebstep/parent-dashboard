import { X } from 'lucide-react'

const VideoPlayerModal = ({ isOpen, onClose, video, onNext }) => {
    if (!isOpen || !video) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full p-5 max-w-[800px] rounded-[20px] shadow-2xl overflow-hidden mx-4 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <h2 className="text-[18px] font-bold text-[#191919] gilory">{video.title || video.name}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-[#000]" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                        src={video.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Footer Controls */}
                <div className="p-4 flex items-center justify-end gap-3 bg-white border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 bg-[#F5F5F5] hover:bg-gray-200 text-[#787878] rounded-md text-sm font-semibold transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={onNext}
                        className="px-4 py-2.5 bg-[#237FEA] hover:bg-[#237FEA] text-white rounded-md text-sm font-semibold transition-colors"
                    >
                        Next Video
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayerModal
