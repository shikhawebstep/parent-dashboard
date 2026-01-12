import React, { useState } from 'react';
import CalendarWidget from './components/CalendarWidget';
import { Search, ChevronDown, ChevronRight, ChevronLeft, HelpCircle, FileText, Send } from 'lucide-react';

const BookFreeTrial = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        venue: '',
        numStudents: '',
        studentFirstName: '',
        studentLastName: '',
        dob: '',
        age: '',
        gender: '',
        medicalInfo: '',
        class: '',
        time: '',
        parentFirstName: '',
        parentLastName: '',
        email: '',
        phone: '',
        relation: '',
        hearAbout: '',
        emergencySameAsParent: false,
        emergencyFirstName: '',
        emergencyLastName: '',
        emergencyPhone: '',
        emergencyRelation: '',
        comments: '',
    });

    const [commentsHistory, setCommentsHistory] = useState([
        { id: 1, user: 'Rithan', time: '8 min ago', text: 'Not 100% sure she can attend but if she cant she will email us.' },
        { id: 2, user: 'Nilo Dagg', time: '8 min ago', text: 'Not 100% sure she can attend but if she cant she will email us. Not 100% sure she can attend but if she cant she will email us.' },
    ]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'emergencySameAsParent') {
            if (checked) {
                setFormData(prev => ({
                    ...prev,
                    emergencySameAsParent: true,
                    emergencyFirstName: prev.parentFirstName,
                    emergencyLastName: prev.parentLastName,
                    emergencyPhone: prev.phone,
                    emergencyRelation: prev.relation
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    emergencySameAsParent: false,
                    emergencyFirstName: '',
                    emergencyLastName: '',
                    emergencyPhone: '',
                    emergencyRelation: ''
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            // Clear error on change
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: null }));
            }
        }
    };

    const validate = () => {
        const newErrors = {};
        const required = [
            'studentFirstName', 'studentLastName', 'dob', 'class', 'time',
            'parentFirstName', 'parentLastName', 'email', 'phone',
            'emergencyFirstName', 'emergencyPhone'
        ];

        required.forEach(field => {
            if (!formData[field]) newErrors[field] = 'Required';
        });

        // Basic Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            console.log('Form Submitted', formData, selectedDate);
            alert('Booking Successful!');
        } else {
            console.log('Validation Failed', errors);
            // Scroll to top or show toast
        }
    };

    const handleAddComment = () => {
        if (formData.comments.trim()) {
            setCommentsHistory([
                { id: Date.now(), user: 'You', time: 'Just now', text: formData.comments },
                ...commentsHistory
            ]);
            setFormData(prev => ({ ...prev, comments: '' }));
        }
    };

    // Shared Input Styles
    const inputClass = (error) => `w-full bg-white border ${error ? 'border-red-500' : 'border-gray-200'} rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] focus:border-transparent outline-none transition-all placeholder-gray-400`;
    const labelClass = "text-xs font-bold text-[#191919] mb-1 block";

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-[#F9F9F9] animate-fadeIn">

            {/* Left Column */}
            <div className="w-full lg:w-[350px] flex-shrink-0 space-y-6">
                {/* Enter Information */}
                <div className="bg-white p-6 rounded-[20px] shadow-sm">
                    <h3 className="text-[#191919] font-bold text-sm mb-4">Enter Information</h3>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className={labelClass}>Venue</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    name="venue"
                                    placeholder="Acton"
                                    className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none"
                                    value={formData.venue}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className={labelClass}>Number of students</label>
                            <div className="relative">
                                <select
                                    name="numStudents"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none appearance-none text-gray-500"
                                    value={formData.numStudents}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Choose number of students</option>
                                    <option value="1">1 Student</option>
                                    <option value="2">2 Students</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Select Trial Date */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-[#191919] font-bold text-sm">Select trial date</h3>
                    </div>
                    <CalendarWidget selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                </div>
            </div>

            {/* Right Column - Main Form */}
            <div className="flex-1 space-y-6">

                {/* Header */}
                <div className="bg-[#414856] rounded-t-[20px] p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <button className="hover:bg-white/10 p-1 rounded-full"><ChevronLeft size={20} /></button>
                        <h1 className="font-bold text-sm">Book a Free Trial</h1>
                    </div>
                    <div className="flex gap-2">
                        <button className="w-8 h-8 flex items-center justify-center bg-white text-[#414856] rounded-full text-xs font-bold">£</button>
                        <button className="w-8 h-8 flex items-center justify-center bg-white text-[#414856] rounded-full"><FileText size={14} /></button>
                        <button className="w-8 h-8 flex items-center justify-center bg-white text-[#414856] rounded-full"><FileText size={14} /></button>
                    </div>
                </div>

                <div className="bg-white rounded-b-[20px] p-8 shadow-sm -mt-6"> {/* Overlap header visual */}

                    {/* Student Info */}
                    <div className="mb-8">
                        <h3 className="text-[#191919] font-bold text-sm mb-6">Student information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>First name</label><input name="studentFirstName" placeholder="Enter first name" className={inputClass(errors.studentFirstName)} value={formData.studentFirstName} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Last name</label><input name="studentLastName" placeholder="Enter last name" className={inputClass(errors.studentLastName)} value={formData.studentLastName} onChange={handleInputChange} /></div>

                            <div><label className={labelClass}>Date of birth</label><input type="date" name="dob" className={inputClass(errors.dob)} value={formData.dob} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Age</label><input disabled placeholder="Automatic entry" className={`${inputClass()} bg-gray-50`} value={formData.age} /></div>

                            <div><label className={labelClass}>Gender</label><input name="gender" placeholder="Enter gender" className={inputClass()} value={formData.gender} onChange={handleInputChange} /></div>
                            <div>
                                <label className={labelClass}>Medical information</label>
                                <div className="relative">
                                    <select name="medicalInfo" className={`${inputClass()} appearance-none`} value={formData.medicalInfo} onChange={handleInputChange}>
                                        <option value="">Enter medical information</option>
                                        <option value="None">None</option>
                                        <option value="Asthma">Asthma</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Class</label>
                                <div className="relative">
                                    <select name="class" className={`${inputClass(errors.class)} appearance-none`} value={formData.class} onChange={handleInputChange}>
                                        <option value="">4-7 years</option>
                                        <option value="8-12 years">8-12 years</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Time</label>
                                <div className="relative">
                                    <select name="time" className={`${inputClass(errors.time)} appearance-none`} value={formData.time} onChange={handleInputChange}>
                                        <option value="">Automatic entry</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 my-8" />

                    {/* Parent Info */}
                    <div className="mb-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[#191919] font-bold text-sm">Parent information</h3>
                            <button className="bg-[#0496FF] text-white px-4 py-1.5 rounded-md text-xs font-bold shadow-sm hover:bg-[#037ecc]">Joint Parent</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>First name</label><input name="parentFirstName" placeholder="Enter first name" className={inputClass(errors.parentFirstName)} value={formData.parentFirstName} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Last name</label><input name="parentLastName" placeholder="Enter last name" className={inputClass(errors.parentLastName)} value={formData.parentLastName} onChange={handleInputChange} /></div>

                            <div><label className={labelClass}>Email</label><input name="email" type="email" placeholder="Enter email address" className={inputClass(errors.email)} value={formData.email} onChange={handleInputChange} /></div>
                            <div>
                                <label className={labelClass}>Phone number</label>
                                <div className="flex gap-2">
                                    <select className="bg-white border border-gray-200 rounded-lg px-2 py-3 text-sm text-gray-500 outline-none w-20">
                                        <option>🇬🇧</option>
                                    </select>
                                    <input name="phone" placeholder="+44" className={inputClass(errors.phone)} value={formData.phone} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Relation to child</label>
                                <div className="relative">
                                    <select name="relation" className={`${inputClass()} appearance-none`} value={formData.relation} onChange={handleInputChange}>
                                        <option value="">Mother</option>
                                        <option value="Father">Father</option>
                                        <option value="Guardian">Guardian</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>How did you hear about us?</label>
                                <div className="relative">
                                    <select name="hearAbout" className={`${inputClass()} appearance-none`} value={formData.hearAbout} onChange={handleInputChange}>
                                        <option value="">Select from drop down</option>
                                        <option value="Google">Google</option>
                                        <option value="Friend">Friend</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100 my-8" />

                    {/* Emergency Contact */}
                    <div className="mb-8">
                        <div className="flex flex-col mb-6">
                            <h3 className="text-[#191919] font-bold text-sm mb-1">Emergency contact details</h3>
                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input
                                    type="checkbox"
                                    name="emergencySameAsParent"
                                    checked={formData.emergencySameAsParent}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-[#0496FF] focus:ring-[#0496FF]"
                                />
                                <span className="text-xs text-gray-400 font-medium">Fill same as above</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className={labelClass}>First name</label><input name="emergencyFirstName" placeholder="Enter first name" className={inputClass(errors.emergencyFirstName)} value={formData.emergencyFirstName} onChange={handleInputChange} /></div>
                            <div><label className={labelClass}>Last name</label><input name="emergencyLastName" placeholder="Enter last name" className={inputClass()} value={formData.emergencyLastName} onChange={handleInputChange} /></div>

                            <div>
                                <label className={labelClass}>Phone number</label>
                                <div className="flex gap-2">
                                    <select className="bg-white border border-gray-200 rounded-lg px-2 py-3 text-sm text-gray-500 outline-none w-20">
                                        <option>🇬🇧</option>
                                    </select>
                                    <input name="emergencyPhone" placeholder="+44" className={inputClass(errors.emergencyPhone)} value={formData.emergencyPhone} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Relation to child</label>
                                <div className="relative">
                                    <select name="emergencyRelation" className={`${inputClass()} appearance-none`} value={formData.emergencyRelation} onChange={handleInputChange}>
                                        <option value="">Mother</option>
                                        <option value="Father">Father</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Check Key Information Toggle */}
                    <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-8 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg">
                        <h3 className="text-[#191919] font-bold text-sm">Key information</h3>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4">
                        <button className="px-8 py-3 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-[#0496FF] text-white px-8 py-3 rounded-lg text-xs font-bold hover:bg-[#037ecc] transition-colors shadow-md"
                        >
                            Book FREE Trial
                        </button>
                    </div>

                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-[20px] p-8 shadow-sm">
                    <h3 className="text-[#191919] font-bold text-sm mb-4">Comment</h3>
                    <div className="flex gap-2 mb-8">
                        <input
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            placeholder="Add a comment"
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0496FF] outline-none"
                        />
                        <button
                            onClick={handleAddComment}
                            className="bg-[#0496FF] text-white w-12 rounded-lg flex items-center justify-center hover:bg-[#037ecc]"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {commentsHistory.map((comment) => (
                            <div key={comment.id} className="bg-[#F9F9F9] p-4 rounded-xl">
                                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{comment.text}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-[#191919]">{comment.user}</span>
                                    <span className="text-[10px] text-gray-400">{comment.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookFreeTrial;
