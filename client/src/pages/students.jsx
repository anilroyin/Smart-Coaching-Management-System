import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./students.css";

function Students() {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    const isSuperAdmin = user?.role === "super_admin";
    const permissions = user?.permissions || {};

    const hasPermission = (permission) => {
        return (
            isSuperAdmin ||
            permissions[permission] === true
        );
    };

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        studentId: "",
        phone: "",
        dateOfBirth: "",
        address: "",
        guardianName: "",
        guardianPhone: ""
    });


    // ========================================
    // FETCH STUDENTS
    // ========================================

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:3000/api/students",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to fetch students"
                );
            }

            setStudents(data.students || []);

        } catch (error) {
            console.error(
                "Failed to load students:",
                error
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (hasPermission("students")) {
            fetchStudents();
        } else {
            setLoading(false);
            setError(
                "You do not have permission to view students."
            );
        }
    }, []);


    // ========================================
    // FILTER STUDENTS
    // ========================================

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {

            const name =
                student.user?.name?.toLowerCase() || "";

            const studentId =
                student.studentId?.toLowerCase() || "";

            const phone =
                student.phone?.toLowerCase() || "";

            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                !searchValue ||
                name.includes(searchValue) ||
                studentId.includes(searchValue) ||
                phone.includes(searchValue);

            const matchesStatus =
                statusFilter === "all" ||
                student.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }, [students, search, statusFilter]);


    // ========================================
    // FORM INPUT
    // ========================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // ========================================
    // CREATE STUDENT
    // ========================================

    const handleCreateStudent = async (event) => {
        event.preventDefault();

        try {
            setError("");

            const response = await fetch(
                "http://localhost:3000/api/students",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to create student"
                );
            }

            setFormData({
                name: "",
                email: "",
                password: "",
                studentId: "",
                phone: "",
                dateOfBirth: "",
                address: "",
                guardianName: "",
                guardianPhone: ""
            });

            setShowAddForm(false);

            await fetchStudents();

        } catch (error) {
            console.error(
                "Failed to create student:",
                error
            );

            setError(error.message);
        }
    };


    // ========================================
    // UPDATE STUDENT STATUS
    // ========================================

    const handleStatusChange = async (
        studentId,
        newStatus
    ) => {
        try {
            setError("");

            const response = await fetch(
                `http://localhost:3000/api/students/${studentId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update student status"
                );
            }

            setStudents((previousStudents) =>
                previousStudents.map((student) =>
                    student._id === studentId
                        ? {
                              ...student,
                              status:
                                  data.student?.status ||
                                  newStatus
                          }
                        : student
                )
            );

        } catch (error) {
            console.error(
                "Failed to update student status:",
                error
            );

            setError(error.message);
        }
    };


    // ========================================
    // STATUS LABEL
    // ========================================

    const getStatusLabel = (status) => {
        if (status === "active") {
            return "Active";
        }

        if (status === "paused") {
            return "Paused";
        }

        return "Inactive";
    };


    // ========================================
    // RENDER
    // ========================================

    return (
        <div className="students-page">

            {/* Header */}

            <div className="students-header">

                <div>
                    <h1>Students</h1>

                    <p>
                        Manage students enrolled in
                        Smart Coaching.
                    </p>
                </div>

                <button
                    className="add-student-button"
                    onClick={() =>
                        setShowAddForm(true)
                    }
                >
                    + Add Student
                </button>

            </div>


            {/* Error */}

            {error && (
                <div className="students-error">
                    {error}
                </div>
            )}


            {/* Add Student Form */}

            {showAddForm && (
                <div className="student-form-card">

                    <div className="form-header">

                        <div>
                            <h2>Add Student</h2>

                            <p>
                                Create a new student
                                account.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="close-form-button"
                            onClick={() =>
                                setShowAddForm(false)
                            }
                        >
                            ×
                        </button>

                    </div>


                    <form
                        onSubmit={
                            handleCreateStudent
                        }
                    >

                        <div className="form-grid">

                            <div className="form-group">
                                <label>
                                    Student Name
                                </label>

                                <input
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Student ID
                                </label>

                                <input
                                    name="studentId"
                                    value={
                                        formData.studentId
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Phone
                                </label>

                                <input
                                    name="phone"
                                    value={
                                        formData.phone
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={
                                        formData.dateOfBirth
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Guardian Name
                                </label>

                                <input
                                    name="guardianName"
                                    value={
                                        formData.guardianName
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />
                            </div>


                            <div className="form-group">
                                <label>
                                    Guardian Phone
                                </label>

                                <input
                                    name="guardianPhone"
                                    value={
                                        formData.guardianPhone
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />
                            </div>


                            <div className="form-group form-group-full">
                                <label>
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={
                                        formData.address
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    rows="3"
                                />
                            </div>

                        </div>


                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() =>
                                    setShowAddForm(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-student-button"
                            >
                                Create Student
                            </button>

                        </div>

                    </form>

                </div>
            )}


            {/* Filters */}

            <div className="students-toolbar">

                <input
                    className="student-search"
                    type="text"
                    placeholder="Search by name, student ID or phone..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />


                <div className="student-filters">

                    <button
                        className={
                            statusFilter === "all"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setStatusFilter("all")
                        }
                    >
                        All
                    </button>

                    <button
                        className={
                            statusFilter === "active"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setStatusFilter("active")
                        }
                    >
                        Active
                    </button>

                    <button
                        className={
                            statusFilter === "paused"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setStatusFilter("paused")
                        }
                    >
                        Paused
                    </button>

                </div>

            </div>


            {/* Students Table */}

            <div className="students-table-card">

                {loading ? (

                    <div className="students-empty">
                        Loading students...
                    </div>

                ) : filteredStudents.length === 0 ? (

                    <div className="students-empty">
                        No students found.
                    </div>

                ) : (

                    <div className="students-table-wrapper">

                        <table className="students-table">

                            <thead>
                                <tr>
                                    <th>
                                        Student ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Guardian
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>


                            <tbody>

                                {filteredStudents.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student._id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        student.studentId
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="student-name">
                                                    {
                                                        student
                                                            .user
                                                            ?.name ||
                                                        "N/A"
                                                    }
                                                </div>

                                                <div className="student-email">
                                                    {
                                                        student
                                                            .user
                                                            ?.email ||
                                                        ""
                                                    }
                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    student.phone ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    student.guardianName ||
                                                    "N/A"
                                                }
                                            </td>

                                            <td>

                                                <span
                                                    className={`student-status ${student.status}`}
                                                >
                                                    {getStatusLabel(
                                                        student.status
                                                    )}
                                                </span>

                                            </td>

                                            <td>

                                                <div className="student-actions">

                                                    {/* View */}

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/students/${student._id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    {/* Resume */}

                                                    {student.status ===
                                                        "paused" && (

                                                        <button
                                                            className="resume-button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    student._id,
                                                                    "active"
                                                                )
                                                            }
                                                        >
                                                            Resume
                                                        </button>

                                                    )}


                                                    {/* Pause */}

                                                    {student.status ===
                                                        "active" && (

                                                        <button
                                                            className="pause-button"
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    student._id,
                                                                    "paused"
                                                                )
                                                            }
                                                        >
                                                            Pause
                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Students;