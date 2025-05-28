import React, { useEffect, useState } from "react";

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
        const response = await fetch("http://localhost:5000/api/classes", {
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
        `http://localhost:5000/api/classes/${classId}`,
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
        "http://localhost:5000/api/classes/lookup",
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
      // Directly add the previewed class
      const response = await fetch("http://localhost:5000/api/classes", {
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
    <div className="p-4 w-full text-white bg-[#92223D] min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Your Tracked Classes</h1>

      {/* List of tracked classes */}
      <ul className="space-y-4">
        {classes.map((cls) => (
          <li
            key={cls._id}
            className="p-4 bg-[#A23A56] rounded shadow-md flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-bold">{cls.title}</h2>
              <p className="text-sm">Course: {cls.course}</p>
              <p className="text-sm">
                Instructors: {cls.instructors.join(", ")}
              </p>
              <p className="text-sm">Term: {cls.term}</p>
            </div>
            <button
              onClick={() => handleDelete(cls._id)}
              className="text-white bg-red-600 hover:bg-red-700 w-8 h-8 rounded flex items-center justify-center text-base font-bold"
            >
              X
            </button>
          </li>
        ))}
      </ul>

      {/* Always display the Add a Class box */}
      <div
        onClick={() => setShowAddClassModal(true)}
        className="flex items-center cursor-pointer p-4 mt-4 bg-gray-600 rounded shadow-md hover:bg-gray-700 transition duration-200"
      >
        <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xl mr-4">
          +
        </div>
        <span className="text-white text-base">Add a class</span>
      </div>

      {/* Modal for adding a class */}
      {showAddClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded p-6 w-80">
            <h2 className="text-lg font-bold mb-4 text-black">Add a Class</h2>
            <input
              type="text"
              placeholder="Enter class number"
              className="border border-gray-300 rounded px-3 py-2 w-full mb-4 text-black"
              onChange={(e) => setNewClassNumber(e.target.value)}
            />

            {/* Preview button */}
            <button
              onClick={handlePreview}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded w-full mb-2"
            >
              {loading ? "Loading..." : "Preview"}
            </button>

            {/* Class preview info */}
            {previewClass && (
              <div className="bg-gray-200 p-2 rounded mb-2 text-black space-y-1">
                <h3 className="font-bold">{previewClass.title}</h3>
                <p><span className="font-semibold">Course:</span> {previewClass.course}</p>
                <p><span className="font-semibold">Instructors:</span> {previewClass.instructors.join(", ")}</p>
                <p><span className="font-semibold">Days:</span> {previewClass.days}</p>
                <p><span className="font-semibold">Start Time:</span> {previewClass.startTime}</p>
                <p><span className="font-semibold">End Time:</span> {previewClass.endTime}</p>
                <p><span className="font-semibold">Location:</span> {previewClass.location}</p>
                <p><span className="font-semibold">Dates:</span> {previewClass.dates}</p>
                <p><span className="font-semibold">Units:</span> {previewClass.units}</p>
                <p><span className="font-semibold">Seat Status:</span> {previewClass.seatStatus}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAddClassModal(false);
                  setPreviewClass(null);
                }}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                disabled={loading || !previewClass}
                className={`px-3 py-1 ${
                  loading || !previewClass
                    ? "bg-green-300"
                    : "bg-green-600 hover:bg-green-700"
                } text-white rounded`}
              >
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesPage;
