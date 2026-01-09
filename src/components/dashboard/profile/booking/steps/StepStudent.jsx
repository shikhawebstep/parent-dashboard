import { useState } from "react";

const students = [
  {
    id: 1,
    name: "Ben Johnson",
    dob: "2018-07-15",
    age: 7,
    gender: "M",
    classRange: "4–7 years",
  },
  {
    id: 2,
    name: "Steve Johnson",
    dob: "2014-07-15",
    age: 10,
    gender: "M",
    classRange: "10–12 years",
  },
];

export default function StepStudent() {
  const [activeTab, setActiveTab] = useState("existing");
  const [selectedStudent, setSelectedStudent] = useState(1);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    age: "",
    gender: "",
    medical: "",
    class: "",
  });

  /* ---------------- HELPERS ---------------- */

  const handleFieldChange = (field, value) => {
    let updated = { ...data, [field]: value };

    if (field === "dob") {
      const birthYear = new Date(value).getFullYear();
      const age = new Date().getFullYear() - birthYear;
      updated.age = age;
      updated.class = age <= 7 ? "4–7 years" : "10–12 years";
    }

    setData(updated);
  };

  const inputClass = () =>
    "mt-1 w-full mainShadow p-3 placeholder:text-[#494949] placeholder:text-[15px] rounded-md capitalize text-sm border";

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-[720px] mx-auto bg-white p-6 font-poppins">
      {/* Title */}
      <h2 className="text-center text-[20px] poppins font-semibold mb-6">
        Student 1 information
      </h2>

      {/* Tabs */}
      <div className="flex justify-center gap-6 mb-6">
        <button
          onClick={() => setActiveTab("existing")}
          className={`px-4 py-2 rounded-md  poppins text-sm font-medium ${
            activeTab === "existing"
              ? "bg-[#E8F1FF] text-[#2A7BE4]"
              : "text-gray-500"
          }`}
        >
          Select an existing child
        </button>

        <button
          onClick={() => setActiveTab("new")}
          className={`text-sm poppins font-medium ${
            activeTab === "new" ? "text-[#2A7BE4]" : "text-gray-500"
          }`}
        >
          Add a new child
        </button>
      </div>

      {/* EXISTING STUDENT */}
      {activeTab === "existing" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all
                ${
                  selectedStudent === student.id
                    ? "border-[#2A7BE4]"
                    : "border-[#E5E7EB]"
                }`}
            >
              <h3 className="text-[#2A7BE4] poppins font-semibold mb-3">
                {student.name}
              </h3>

              <div className="grid poppins grid-cols-2 gap-y-3 text-sm text-gray-600">
                <div>
                  <p className="text-xs text-gray-400 poppins">Date of birth</p>
                  <p>{student.dob}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 poppins">Age</p>
                  <p>{student.age}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 poppins">Gender</p>
                  <p>{student.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 poppins">Class</p>
                  <p>{student.classRange}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD NEW STUDENT */}
      {activeTab === "new" && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <label className="text-sm poppins"> First name</label>
            <input
              value={data.firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              placeholder="Enter first name"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="text-sm poppins"> Last name</label>
            <input
              value={data.lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              placeholder="Enter last name"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="text-sm poppins"> Date of birth</label>
            <input
              type="date"
              value={data.dob}
              onChange={(e) => handleFieldChange("dob", e.target.value)}
              className={inputClass()}
            />
          </div>

          <div>
            <label className="text-sm poppins"> Age</label>
            <input readOnly value={data.age} className={inputClass()} />
          </div>

          <div>
            <label className="text-sm poppins"> Gender</label>
            <select
              value={data.gender}
              onChange={(e) => handleFieldChange("gender", e.target.value)}
              className={inputClass()}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div>
            <label className="text-sm poppins"> Medical information</label>
            <input
              value={data.medical}
              onChange={(e) => handleFieldChange("medical", e.target.value)}
              placeholder="Enter medical information"
              className={inputClass()}
            />
          </div>

          <div>
            <label className="text-sm poppins"> Class</label>
            <input readOnly value={data.class} className={inputClass()} />
          </div>
          <div>
            <label className="text-sm poppins"> Time</label>
            <input readOnly value={data.class} className={inputClass()} />
          </div>
        </div>
      )}

    
    </div>
  );
}
