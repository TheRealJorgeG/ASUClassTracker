import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaEye, FaClock, FaMapMarkerAlt, FaUser, FaCalendarAlt } from "react-icons/fa";
import config from "../config/api";

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassNumber, setNewClassNumber] = useState("");
  const [previewClass, setPreviewClass] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${config.API_BASE_URL}/api/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }

        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchClasses();
  }, []);

  const handleDelete = async (classId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this class from your tracked classes?"
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/classes/${classId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      setClasses(classes.filter((cls) => cls._id !== classId));
    } catch (error) {
      console.error(error);
    }
  };

  const handlePreview = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newClassNumber) return;

    setLoading(true);
    setPreviewClass(null);

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/classes/lookup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ number: newClassNumber }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to preview class");
      }

      const data = await response.json();
      setPreviewClass(data);
    } catch (error) {
      console.error(error);
      alert("Failed to preview class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!previewClass) {
      alert("Please preview the class before adding.");
      return;
    }

    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/classes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(previewClass),
      });

      if (!response.ok) {
        throw new Error("Failed to add class");
      }

      const data = await response.json();
      setClasses([...classes, data]);
      setShowAddClassModal(false);
      setNewClassNumber("");
      setPreviewClass(null);
    } catch (error) {
      console.error(error);
      alert("Failed to add class. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Removed the background override - now inherits from App.jsx
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[#ffcb25]">Your Tracked Classes</h1>
          <p className="text-xl text-gray-200">Monitor your classes and get notified when spots open up</p>
        </div>

        {/* Classes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-white/20 hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#ffcb25] mb-2">{cls.title}</h3>
                  <p className="text-gray-200 font-medium">{cls.course}</p>
                </div>
                <button
                  onClick={() => handleDelete(cls._id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-all duration-200"
                >
                  <FaTrash size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-300">
                  <FaUser className="mr-2 text-[#ffcb25]" />
                  <span>{cls.instructors.join(", ")}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-300">
                  <FaClock className="mr-2 text-[#ffcb25]" />
                  <span>{cls.time && cls.time !== "N/A" ? `${cls.time} | ${cls.days}` : "Time TBD"}</span>
                </div>

                <div className="flex items-center text-sm text-gray-300">
                  <FaMapMarkerAlt className="mr-2 text-[#ffcb25]" />
                  <span>{cls.location && cls.location !== "N/A" ? cls.location : "Location TBD"}</span>
                </div>

                <div className="flex items-center text-sm text-gray-300">
                  <FaCalendarAlt className="mr-2 text-[#ffcb25]" />
                  <span>{cls.dates && cls.dates !== "N/A" ? cls.dates : "Dates TBD"}</span>
                </div>

                <div className="pt-2 border-t border-white/20">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    cls.seatStatus === 'Open' ? 'bg-green-500/20 text-green-300' : 
                    cls.seatStatus === 'Waitlist' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {cls.seatStatus}
                  </span>
                  <span className="ml-2 text-sm text-gray-400">{cls.units && cls.units !== "N/A" ? `${cls.units} units` : "Units TBD"}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add Class Card */}
          <div
            onClick={() => setShowAddClassModal(true)}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl border-2 border-dashed border-white/30 hover:border-[#ffcb25] hover:bg-white/10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] group"
          >
            <FaPlus className="text-4xl text-[#ffcb25] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-xl font-bold text-[#ffcb25] mb-2">Add New Class</h3>
            <p className="text-gray-300 text-center">Track a new class and get notified when spots open</p>
          </div>
        </div>

        {/* Empty State */}
        {classes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-400 mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Classes Tracked Yet</h3>
            <p className="text-gray-400 mb-6">Start by adding your first class to track</p>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="bg-[#ffcb25] hover:bg-[#e6b622] text-[#92223D] font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Add Your First Class
            </button>
          </div>
        )}

        {/* Modal */}
        {showAddClassModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-[#92223D]">Add New Class</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Class Number</label>
                <input
                  type="text"
                  placeholder="e.g., 12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92223D] focus:border-transparent text-gray-900"
                  value={newClassNumber}
                  onChange={(e) => setNewClassNumber(e.target.value)}
                />
              </div>

              <button
                onClick={handlePreview}
                disabled={loading}
                className="w-full py-3 bg-[#92223D] hover:bg-[#6b1a2f] text-white rounded-xl font-medium mb-4 flex items-center justify-center transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaEye className="mr-2" />
                    Preview Class
                  </>
                )}
              </button>

              {previewClass && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border">
                  <h3 className="font-bold text-[#92223D] mb-2">{previewClass.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div><strong>Course:</strong> {previewClass.course}</div>
                    <div><strong>Units:</strong> {previewClass.units}</div>
                    <div><strong>Instructors:</strong> {previewClass.instructors.join(", ")}</div>
                    <div><strong>Days:</strong> {previewClass.days}</div>
                    <div><strong>Time:</strong> {previewClass.startTime} - {previewClass.endTime}</div>
                    <div><strong>Location:</strong> {previewClass.location}</div>
                    <div><strong>Dates:</strong> {previewClass.dates}</div>
                    <div><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        previewClass.seatStatus === 'Open' ? 'bg-green-100 text-green-800' : 
                        previewClass.seatStatus === 'Waitlist' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {previewClass.seatStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowAddClassModal(false);
                    setNewClassNumber("");
                    setPreviewClass(null);
                  }}
                  className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClass}
                  disabled={loading || !previewClass}
                  className="flex-1 py-3 bg-[#ffcb25] hover:bg-[#e6b622] text-[#92223D] rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? "Adding..." : "Add Class"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;