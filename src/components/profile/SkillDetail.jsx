import { useState, useEffect } from 'react'
import { Play, CheckCircle2, Check } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayerModal from './VideoPlayerModal';
import axios from 'axios';
import Swal from 'sweetalert2';
import Loader from '../Loader';

const SkillDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [skill, setSkill] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSkillData = async () => {
        const token = localStorage.getItem("parentToken");
        const parentData = JSON.parse(localStorage.getItem("parentData"));
        const parentId = parentData?.id;
        const API_URL = import.meta.env.VITE_API_BASE_URL;

        if (!token || !parentId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);


        try {
            const response = await axios.get(
                `${API_URL}api/parent/student-course/listBy/${id}`,

            );

            setSkill(response.data?.data ?? response.data);
        } catch (err) {
            console.error("Error fetching skill:", err);

            // ✅ Extract API error message safely
            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Something went wrong while fetching feedback.";

            setError(errorMessage);

            // ✅ Show SweetAlert
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
            });

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkillData();
    }, []);

    const handleNextVideo = () => {
        if (!selectedVideo || !skill?.videos) return;
        const currentIndex = skill.videos.findIndex(v => v.id === selectedVideo.id);
        if (currentIndex !== -1 && currentIndex < skill.videos.length - 1) {
            setSelectedVideo(skill.videos[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return <Loader />
    }


    return (
        <div className=" animate-fadeIn md:p-6">
            {/* Header / Banner */}
            <div className="relative">
                {/* Desktop background */}
                <div
                    className="hidden md:block p-[60px] px-[100px] bg-cover bg-center"
                    style={{ backgroundImage: "url('/assets/skillBanner.png')" }}
                >

                    <div className="w-[50%]">
                        <h4 className="recline text-[#042C89] text-[37px] leading-[46px] font-bold">
                            {skill?.title || skill?.courseName}
                        </h4>
                    </div>
                </div>
                <div
                    className="md:hidden p-[60px] min-h-[500px] px-[40px] bg-cover bg-center"
                    style={{ backgroundImage: "url('/assets/skillBannerMobile.png')" }}
                >

                    <div className="text-center">
                        <h4 className="recline text-[#042C89] text-[28px] leading-[32px] font-bold">
                            {skill?.title || skill?.courseName}
                        </h4>
                    </div>
                </div>
            </div>



            {/* Title & Overall Progress */}
            <div className="flex flex-col px-4 lg:px-0 md:flex-row md:items-center justify-between gap-4 mt-10 mb-8">
                <div className="flex items-center cursor-pointer gap-2 w-full md:w-6/12">
                    <img
                        src="/assets/arrow-left.png"
                        alt="Back"
                        className="w-5 h-5 md:w-6 md:h-6"
                        onClick={handleBack}
                    />
                    <h2 className="2xl:text-[32px] lg:text-[24px] text-[20px] font-bold text-[#191919] lg:leading-[36px] leading-[28px] font-semibold">
                        {skill?.title || skill?.courseName}
                    </h2>
                </div>
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
                {Array.isArray(skill?.videos) && skill?.videos.map((video, indx) => (
                    <div key={video.id} className="bg-white rounded-[16px] p-3 border border-[#EBEBEB]">
                        <div className="xl:flex sm:grid grid-cols-2 flex-col md:flex-row xl:items-center md:items-start 2xl:gap-10 md:gap-6 gap-4">
                            {/* Left: Thumbnail Section */}
                            <div className="xl:w-[23%] 2xl:w-[20%] w-full">
                                <div
                                    className="aspect-video bg-[#C4C4C4] xl:h-[250px]  rounded-[12px] relative flex items-center justify-center mb-3  w-full h-full cursor-pointer group overflow-hidden"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    <video src={video.videoUrl} className='rounded-[8px] h-full object-cover w-full'></video>
                                    {/* <img src="/assets/video.png" alt="" srcset="" className='rounded-[8px] h-full object-cover w-full' /> */}
                                    <div className="absolute top-7/12 left-7/12 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play className="text-white ml-1" size={20} fill="white" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full pointer-events-none w-full">
                                        <div className="bg-[#FFD600] w-full md:p-4 p-2 text-[#191919]  font-bold inline-block rounded-sm">
                                            <span className='text-[#042C89] md:text-[20px] text-[17px] font-bold block'>Part {indx + 1} </span>
                                            <span className="font-medium text-[#042C89] md:text-[16px] text-[14px]">| {video.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Info */}
                            <div className="xl:w-[38%] w-full space-y-3">
                                <h3 className="md:text-[26px] text-[22px] capitalize font-bold text-[#191919] ">{video.name}</h3>

                                <div className="space-y-1">
                                    <p className="text-[18px] font-bold text-[#191919] ">Brief</p>
                                    <p className="2xl:text-[18px] text-[15px] text-[#626270] leading-relaxed ">
                                        {video.brief || "Lorem ipsum dolor sit amet consectetur. Maecenas dignissim euismod id ornare fringilla ut tincidunt venenatis eget. Adipiscing pellentesque nisi tincidunt pellentesque elit pellentesque."}
                                    </p>
                                </div>

                                {/* Progress */}
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${video.status === 'Completed' ? 'bg-[#43BE4F]' : 'bg-[#F7D02A]'}`}
                                            style={{ width: `${video.progress || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[16px] font-bold text-[#333] whitespace-nowrap ">
                                        {video.progress || 0}% completed
                                    </span>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-4 text-[16px] text-[#797A88] font-medium  pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <img src="/assets/clock1.png" alt="" className='w-4' />

                                        <span>{skill.duration + ' ' + skill?.durationType}</span>
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
                                        {Array.isArray(video.childFeatures) && video.childFeatures.map((check) => (
                                            <div key={check.id} className="flex items-start gap-2 py-1">
                                                {check.checked ? (
                                                    <CheckCircle2 size={19} className="text-[#333] shrink-0 mt-0.5" />
                                                ) : (
                                                    <CheckCircle2 size={19} className="text-[#333] shrink-0 mt-0.5" />
                                                )}
                                                <span className="text-[14px] 2xl:text-[17px] text-[#626270] leading-tight ">{check}</span>
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
                                        className={`px-4 w-max  py-2 md:py-3 rounded-[14px] 2xl:text-[16px] gap-2 w-full text-center text-[14px] justify-center font-semibold flex items-center gap-1 transition-colors  ${video.status === 'Continue'
                                            ? 'bg-[#F7D02A] text-[#042C89] hover:bg-[#e6c200]' // Fixed yellow for Continue
                                            : 'bg-[#042C89] text-white hover:bg-[#092b63]' // Blue for Start
                                            }`}>
                                        {video.status === 'Continue' ? (
                                            <Play size={18} />
                                        ) : (
                                            <Play size={18} />
                                        )}
                                        {video.status || 'Start training'}
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
                onNext={handleNextVideo}
            />
        </div>
    )
}

export default SkillDetail
