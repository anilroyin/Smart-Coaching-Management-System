import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./teachers.css";

function Teachers() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showAddForm, setShowAddForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        teacherId: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        joiningDate: "",
        address: "",
        dateOfBirth: ""
    });


    // =====================================================
    // FETCH TEACHERS
    // =====================================================

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:3000/api/teachers",
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
                    "Failed to fetch teachers"
                );
            }

            setTeachers(data.teachers || []);

        } catch (error) {
            console.error(
                "FETCH TEACHERS ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to load teachers"
            );

        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchTeachers();
    }, []);


    // =====================================================
    // FORM INPUT
    // =====================================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // =====================================================
    // CREATE TEACHER
    // =====================================================

    const handleCreateTeacher = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");

            const response = await fetch(
                "http://localhost:3000/api/teachers",
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
                    "Failed to create teacher"
                );
            }

            // Reset form

            setFormData({
                name: "",
                teacherId: "",
                email: "",
                password: "",
                phone: "",
                specialization: "",
                joiningDate: "",
                address: "",
                dateOfBirth: ""
            });

            // Close form

            setShowAddForm(false);

            // Refresh teachers

            await fetchTeachers();

        } catch (error) {
            console.error(
                "CREATE TEACHER ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to create teacher"
            );

        } finally {
            setSaving(false);
        }
    };


    // =====================================================
    // PAUSE / RESUME TEACHER
    // =====================================================

    const updateTeacherStatus = async (
        teacher,
        newStatus
    ) => {
        try {
            setError("");

            const response = await fetch(
                `http://localhost:3000/api/teachers/${teacher._id}/status`,
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
                    "Failed to update teacher status"
                );
            }

            await fetchTeachers();

        } catch (error) {
            console.error(
                "UPDATE TEACHER STATUS ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to update teacher status"
            );
        }
    };


    // =====================================================
    // SEARCH + FILTER
    // =====================================================

    const filteredTeachers = teachers.filter(
        (teacher) => {

            const name =
                teacher.user?.name || "";

            const email =
                teacher.user?.email || "";

            const teacherId =
                teacher.teacherId || "";

            const phone =
                teacher.phone || "";

            const specialization =
                teacher.specialization || "";

            const searchText =
                search.toLowerCase().trim();

            const matchesSearch =
                name.toLowerCase().includes(searchText) ||
                email.toLowerCase().includes(searchText) ||
                teacherId.toLowerCase().includes(searchText) ||
                phone.toLowerCase().includes(searchText) ||
                specialization
                    .toLowerCase()
                    .includes(searchText);

            const matchesStatus =
                statusFilter === "all" ||
                teacher.status === statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
        }
    );


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="teachers-page">

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="teachers-header">

                <div>

                    <h1>
                        Teachers
                    </h1>

                    <p>
                        Manage teachers in
                        Smart Coaching.
                    </p>

                </div>


                <button
                    className="add-teacher-button"
                    onClick={() =>
                        setShowAddForm(true)
                    }
                >
                    + Add Teacher
                </button>

            </div>


            {/* =================================================
                ERROR
                ================================================= */}

            {error && (

                <div className="teachers-error">
                    {error}
                </div>

            )}


            {/* =================================================
                ADD TEACHER FORM
                ================================================= */}

            {showAddForm && (

                <div className="teacher-form-card">

                    <div className="teacher-form-header">

                        <div>

                            <h2>
                                Add Teacher
                            </h2>

                            <p>
                                Create a new teacher
                                account.
                            </p>

                        </div>


                        <button
                            type="button"
                            className="close-teacher-form-button"
                            onClick={() =>
                                setShowAddForm(false)
                            }
                        >
                            ×
                        </button>

                    </div>


                    <form
                        onSubmit={
                            handleCreateTeacher
                        }
                    >

                        <div className="teacher-form-grid">

                            {/* Teacher Name */}

                            <div className="teacher-form-group">

                                <label>
                                    Teacher Name
                                </label>

                                <input
                                    type="text"
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


                            {/* Teacher ID */}

                            <div className="teacher-form-group">

                                <label>
                                    Teacher ID
                                </label>

                                <input
                                    type="text"
                                    name="teacherId"
                                    value={
                                        formData.teacherId
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />

                            </div>


                            {/* Email */}

                            <div className="teacher-form-group">

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


                            {/* Password */}

                            <div className="teacher-form-group">

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


                            {/* Phone */}

                            <div className="teacher-form-group">

                                <label>
                                    Phone
                                </label>

                                <input
                                    type="tel"
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


                            {/* Specialization */}

                            <div className="teacher-form-group">

                                <label>
                                    Specialization
                                </label>

                                <input
                                    type="text"
                                    name="specialization"
                                    value={
                                        formData.specialization
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="e.g. Mathematics"
                                />

                            </div>


                            {/* Joining Date */}

                            <div className="teacher-form-group">

                                <label>
                                    Joining Date
                                </label>

                                <input
                                    type="date"
                                    name="joiningDate"
                                    value={
                                        formData.joiningDate
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />

                            </div>


                            {/* Date of Birth */}

                            <div className="teacher-form-group">

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


                            {/* Address */}

                            <div className="teacher-form-group teacher-form-group-full">

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
                                    placeholder="Teacher's full address"
                                />

                            </div>

                        </div>


                        {/* Form Actions */}

                        <div className="teacher-form-actions">

                            <button
                                type="button"
                                className="teacher-cancel-button"
                                onClick={() =>
                                    setShowAddForm(false)
                                }
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                className="save-teacher-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Creating..."
                                    : "Create Teacher"}
                            </button>

                        </div>

                    </form>

                </div>

            )}


            {/* =================================================
                TOOLBAR
                ================================================= */}

            <div className="teachers-toolbar">

                <input
                    type="text"
                    className="teacher-search"
                    placeholder="Search by name, teacher ID or phone..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                />


                <div className="teacher-filters">

                    <button
                        className={
                            `filter-button ${
                                statusFilter === "all"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setStatusFilter("all")
                        }
                    >
                        All
                    </button>


                    <button
                        className={
                            `filter-button ${
                                statusFilter === "active"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setStatusFilter("active")
                        }
                    >
                        Active
                    </button>


                    <button
                        className={
                            `filter-button ${
                                statusFilter === "paused"
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setStatusFilter("paused")
                        }
                    >
                        Paused
                    </button>

                </div>

            </div>


            {/* =================================================
                TEACHERS TABLE
                ================================================= */}

            <div className="teachers-table-card">

                {loading ? (

                    <div className="teachers-empty">

                        <p>
                            Loading teachers...
                        </p>

                    </div>

                ) : filteredTeachers.length === 0 ? (

                    <div className="teachers-empty">

                        <p>
                            No teachers found.
                        </p>

                    </div>

                ) : (

                    <div className="teachers-table-wrapper">

                        <table className="teachers-table">

                            <thead>

                                <tr>

                                    <th>
                                        Teacher ID
                                    </th>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Specialization
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

                                {filteredTeachers.map(
                                    (teacher) => (

                                        <tr
                                            key={
                                                teacher._id
                                            }
                                        >

                                            <td>
                                                <strong>
                                                    {
                                                        teacher.teacherId
                                                    }
                                                </strong>
                                            </td>


                                            <td>

                                                <div className="teacher-name">
                                                    {
                                                        teacher
                                                            .user
                                                            ?.name ||
                                                        "N/A"
                                                    }
                                                </div>

                                            </td>


                                            <td>

                                                <div className="teacher-email">
                                                    {
                                                        teacher
                                                            .user
                                                            ?.email ||
                                                        "N/A"
                                                    }
                                                </div>

                                            </td>


                                            <td>
                                                {
                                                    teacher.phone ||
                                                    "N/A"
                                                }
                                            </td>


                                            <td>
                                                {
                                                    teacher.specialization ||
                                                    "N/A"
                                                }
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        `teacher-status ${
                                                            teacher.status
                                                        }`
                                                    }
                                                >
                                                    {
                                                        teacher.status
                                                    }
                                                </span>

                                            </td>


                                            <td>

                                                <div className="teacher-actions">

                                                    {/* View */}

                                                    <button
                                                        className="view-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/teachers/${teacher._id}`
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>


                                                    {/* Resume */}

                                                    {teacher.status ===
                                                        "paused" && (

                                                        <button
                                                            className="resume-button"
                                                            onClick={() =>
                                                                updateTeacherStatus(
                                                                    teacher,
                                                                    "active"
                                                                )
                                                            }
                                                        >
                                                            Resume
                                                        </button>

                                                    )}


                                                    {/* Pause */}

                                                    {teacher.status ===
                                                        "active" && (

                                                        <button
                                                            className="pause-button"
                                                            onClick={() =>
                                                                updateTeacherStatus(
                                                                    teacher,
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

export default Teachers;