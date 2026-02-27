import React, { useState } from 'react';
import CalendarWidget from './CalendarWidget';
import { Search, ChevronDown, ChevronRight, FileText, Send, ArrowLeft, Trash2 } from 'lucide-react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const BookFreeTrial = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [errors, setErrors] = useState({});
    const [dialCodes, setDialCodes] = useState("+1");
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
        parents: [{
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            relation: '',
            hearAbout: ''
        }],
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
                const firstParent = formData.parents[0];
                setFormData(prev => ({
                    ...prev,
                    emergencySameAsParent: true,
                    emergencyFirstName: firstParent.firstName,
                    emergencyLastName: firstParent.lastName,
                    emergencyPhone: firstParent.phone,
                    emergencyRelation: firstParent.relation
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

    const handleParentChange = (index, e) => {
        const { name, value } = e.target;
        const updatedParents = [...formData.parents];
        updatedParents[index] = { ...updatedParents[index], [name]: value };

        setFormData(prev => ({
            ...prev,
            parents: updatedParents
        }));

        // Handle auto-fill emergency contact if enabled and editing first parent
        if (index === 0 && formData.emergencySameAsParent) {
            const fieldMap = {
                firstName: 'emergencyFirstName',
                lastName: 'emergencyLastName',
                phone: 'emergencyPhone',
                relation: 'emergencyRelation'
            };
            if (fieldMap[name]) {
                setFormData(prev => ({
                    ...prev,
                    [fieldMap[name]]: value
                }));
            }
        }

        // Clear errors
        if (errors[`parents[${index}].${name}`]) {
            setErrors(prev => ({ ...prev, [`parents[${index}].${name}`]: null }));
        }
    };

    const handleParentPhoneChange = (index, value) => {
        const updatedParents = [...formData.parents];
        updatedParents[index] = { ...updatedParents[index], phone: value };
        setFormData(prev => ({ ...prev, parents: updatedParents }));

        if (index === 0 && formData.emergencySameAsParent) {
            setFormData(prev => ({ ...prev, emergencyPhone: value }));
        }

        if (errors[`parents[${index}].phone`]) {
            setErrors(prev => ({ ...prev, [`parents[${index}].phone`]: null }));
        }
    }

    const handleAddParent = () => {
        setFormData(prev => ({
            ...prev,
            parents: [...prev.parents, {
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                relation: '',
                hearAbout: ''
            }]
        }));
    };

    const handleRemoveParent = (index) => {
        if (formData.parents.length > 1) {
            const updatedParents = formData.parents.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, parents: updatedParents }));
        }
    };

    const validate = () => {
        const newErrors = {};
        const required = ['studentFirstName', 'studentLastName', 'dob', 'class', 'time', 'emergencyFirstName', 'emergencyPhone'];

        required.forEach(field => {
            if (!formData[field]) newErrors[field] = 'Required';
        });

        // Basic Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            // Main email is removed from root, check logic if needed elsewhere
        }

        // Validate Parents
        formData.parents.forEach((parent, index) => {
            if (!parent.firstName) newErrors[`parents[${index}].firstName`] = 'Required';
            if (!parent.lastName) newErrors[`parents[${index}].lastName`] = 'Required';
            if (!parent.email) newErrors[`parents[${index}].email`] = 'Required';
            if (!parent.phone) newErrors[`parents[${index}].phone`] = 'Required';

            if (parent.email && !/\S+@\S+\.\S+/.test(parent.email)) {
                newErrors[`parents[${index}].email`] = 'Invalid email';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            alert('Booking Successful!');
        } else {
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
    const inputClass = (error) => `w-full bg-white border ${error ? 'border-red-500' : 'border-[#E2E1E5'} rounded-[12px] px-4 py-3 text-[16px] focus:ring-2 focus:ring-[#0496FF] focus:border-transparent outline-none transition-all placeholder-gray-400`;
    const labelClass = "text-[16px] font-medium text-[#282829] mb-1 block";

    return (
        <>

            <div className="bg-[#3D444F] rounded-[20px] p-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-1">
                    <button className="hover:bg-white/10 p-1 rounded-full"><ArrowLeft size={24} /></button>
                    <h1 className="font-bold text-[26px]">Book a Free Trial</h1>
                </div>
                <div className="flex gap-4">
                    <button className="w-8 h-8"><img src="/assets/pound.png" className='w-full' alt="" /></button>
                    <button className="w-8 h-8"><img src="/assets/calendar-circle.png" className='w-full' alt="" /></button>
                    <button className="w-8 h-8"><img src="/assets/files.png" className='w-full' alt="" /></button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 py-6 min-h-screen animate-fadeIn">

                {/* Left Column */}
                <div className="w-full 2xl:w-[25%] lg:w-[30%] flex-shrink-0 space-y-6">
                    {/* Enter Information */}
                    <div className="bg-white p-6 rounded-[20px] shadow-sm">
                        <h3 className="text-[#282829] font-bold text-[24px] mb-4">Enter Information</h3>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className={labelClass}>Venue</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-7.5 -translate-y-1/2 text-gray-400" size={16} />
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
                                    <ChevronDown className="absolute right-3 top-7.5 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Select Trial Date */}
                    <div>

                        <CalendarWidget selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                    </div>
                </div>

                {/* Right Column - Main Form */}
                <div className="flex-1 2xl:w-[75%] lg:w-[70%] space-y-6">

                    {/* Header */}


                    <div className="bg-white rounded-[30px] p-8 shadow-sm "> {/* Overlap header visual */}

                        {/* Student Info */}
                        <div className="mb-8">
                            <h3 className="text-[#282829] font-bold text-[24px] mb-6">Student information</h3>
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
                                        <ChevronDown className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Class</label>
                                    <div className="relative">
                                        <select name="class" className={`${inputClass(errors.class)} appearance-none`} value={formData.class} onChange={handleInputChange}>
                                            <option value="">4-7 years</option>
                                            <option value="8-12 years">8-12 years</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Time</label>
                                    <div className="relative">
                                        <select name="time" className={`${inputClass(errors.time)} appearance-none`} value={formData.time} onChange={handleInputChange}>
                                            <option value="">Automatic entry</option>
                                            <option value="10:00 AM">10:00 AM</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Parent Info Section */}
                    <div className="bg-white rounded-[30px] p-8 shadow-sm ">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[#282829] font-bold text-[24px]">Parent information</h3>
                            <button disabled={formData.parents.length >= 2} onClick={handleAddParent} className={`bg-[#237FEA] text-white px-4 py-2 rounded-[12px] text-[14px] font-semibold shadow-sm hover:bg-[#037ecc] ${formData.parents.length >= 2 ? "cursor-not-allowed" : ""} `}>Add Parent</button>
                        </div>

                        {formData.parents.map((parent, index) => (
                            <div key={index} className={`mb-8 relative ${index > 0 ? "pt-8 border-t border-gray-200" : ""}`}>
                                {index > 0 && (
                                    <button
                                        onClick={() => handleRemoveParent(index)}
                                        className="absolute right-0 top-6 text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                    >
                                        <Trash2 size={16} /> Remove
                                    </button>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>First name</label>
                                        <input
                                            name="firstName"
                                            placeholder="Enter first name"
                                            className={inputClass(errors[`parents[${index}].firstName`])}
                                            value={parent.firstName}
                                            onChange={(e) => handleParentChange(index, e)}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last name</label>
                                        <input
                                            name="lastName"
                                            placeholder="Enter last name"
                                            className={inputClass(errors[`parents[${index}].lastName`])}
                                            value={parent.lastName}
                                            onChange={(e) => handleParentChange(index, e)}
                                        />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Email</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="Enter email address"
                                            className={inputClass(errors[`parents[${index}].email`])}
                                            value={parent.email}
                                            onChange={(e) => handleParentChange(index, e)}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone number</label>
                                        <div className={`poppins flex items-center  ${inputClass(errors[`parents[${index}].phone`])}`}>
                                            <div className="2xl:w-[10%] w-[14%]">
                                                <PhoneInput
                                                    country="us"
                                                    value={dialCodes}
                                                    disableDropdown={true}
                                                    disableCountryCode={true}
                                                    countryCodeEditable={false}
                                                    inputStyle={{
                                                        display: "none",
                                                    }}
                                                />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className={`poppins 2xl:ps-3 ps-4 text-[14px] border-l border-gray-300 outline-none w-full`}
                                                value={parent.phone}
                                                onChange={(e) => handleParentPhoneChange(index, e.target.value)}
                                                placeholder=""
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Relation to child</label>
                                        <div className="relative">
                                            <select
                                                name="relation"
                                                className={`${inputClass()} appearance-none`}
                                                value={parent.relation}
                                                onChange={(e) => handleParentChange(index, e)}
                                            >
                                                <option value="">Mother</option>
                                                <option value="Father">Father</option>
                                                <option value="Guardian">Guardian</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>How did you hear about us?</label>
                                        <div className="relative">
                                            <select
                                                name="hearAbout"
                                                className={`${inputClass()} appearance-none`}
                                                value={parent.hearAbout}
                                                onChange={(e) => handleParentChange(index, e)}
                                            >
                                                <option value="">Select from drop down</option>
                                                <option value="Google">Google</option>
                                                <option value="Friend">Friend</option>
                                                <option value="Facebook">Facebook</option>
                                                <option value="Instagram">Instagram</option>
                                                <option value="Referral">Referral</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-[30px] p-8 shadow-sm "> {/* Overlap header visual */}

                        {/* Emergency Contact */}
                        <div className="mb-8">
                            <div className="flex flex-col mb-6">
                                <h3 className="text-[#282829] font-bold text-[24px] mb-1">Emergency contact details</h3>
                                <label className="flex items-center gap-2 cursor-pointer mt-1">
                                    <input
                                        type="checkbox"
                                        name="emergencySameAsParent"
                                        checked={formData.emergencySameAsParent}
                                        onChange={handleInputChange}
                                        className="rounded border-gray-300 text-[#0496FF] focus:ring-[#0496FF]"
                                    />
                                    <span className="text-[16px] text-[#717073] font-medium">Fill same as above</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className={labelClass}>First name</label><input name="emergencyFirstName" placeholder="Enter first name" className={inputClass(errors.emergencyFirstName)} value={formData.emergencyFirstName} onChange={handleInputChange} /></div>
                                <div><label className={labelClass}>Last name</label><input name="emergencyLastName" placeholder="Enter last name" className={inputClass()} value={formData.emergencyLastName} onChange={handleInputChange} /></div>

                                <div>
                                    <label className={labelClass}>Phone number</label>


                                    <div className={`poppins flex items-center  ${inputClass()}`}>
                                        <div className="2xl:w-[10%] w-[14%]">
                                            <PhoneInput
                                                country="us"
                                                value={dialCodes}
                                                disableDropdown={true}
                                                disableCountryCode={true}
                                                countryCodeEditable={false}
                                                inputStyle={{
                                                    display: "none",

                                                }}
                                            />
                                        </div>
                                        <input
                                            type="tel"
                                            name="emergencyPhone"
                                            placeholder="+44"
                                            className={`poppins 2xl:ps-3 ps-4 text-[14px] border-l border-gray-300 outline-none w-full`}

                                            value={formData.emergencyPhone}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Relation to child</label>
                                    <div className="relative">
                                        <select name="emergencyRelation" className={`${inputClass()} appearance-none`} value={formData.emergencyRelation} onChange={handleInputChange}>
                                            <option value="">Mother</option>
                                            <option value="Father">Father</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-8 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-[24px]  mb-8 cursor-pointer hover:bg-gray-50">
                        <h3 className="text-[#282829] font-bold text-[24px]">Key information</h3>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4">
                        <button className="px-8 py-3 rounded-[12px] border text-[#717073] border-[#717073] text-[18px] font-semibold hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-[#0496FF] text-white px-8 py-3 rounded-[12px] text-[18px] font-semibold hover:bg-[#037ecc] transition-colors"
                        >
                            Book FREE Trial
                        </button>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white rounded-[20px] p-8 shadow-sm">
                        <h3 className="text-[#282829] font-bold text-[24px] mb-4">Comment</h3>
                        <div className="flex gap-2 items-center mb-8">
                            <img src="/assets/Ellipse.png" className='w-13' alt="" />
                            <input
                                value={formData.comments}
                                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                                placeholder="Add a comment"
                                className="flex-1 bg-white border border-[#E2E1E5] rounded-[12px] px-4 py-3 text-[16px] focus:ring-2 focus:ring-[#0496FF] outline-none"
                            />
                            <button
                                onClick={handleAddComment}
                                className="bg-[#237FEA] text-white w-12 py-4 rounded-[12px] flex items-center justify-center hover:bg-[#037ecc]"
                            >
                                <Send size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {commentsHistory.map((comment) => (
                                <div key={comment.id} className="bg-[#F9F9F9] p-4 rounded-xl">
                                    <p className="text-[16px] text-[#717073] mb-2 leading-relaxed">{comment.text}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <img src="/assets/Ethan-test1.png" className='w-13' alt="" />
                                            <span className="text-[16px] font-semibold text-[#282829]">{comment.user}</span>
                                        </div>
                                        <span className="text-[16px] text-[#717073]">{comment.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookFreeTrial;
