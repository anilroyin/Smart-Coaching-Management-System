import { useEffect, useState } from "react";
import "./myProfile.css";


function MyProfile() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const token = localStorage.getItem("token");


    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        const fetchProfile = async () => {

            try {

                // ========================================
                // TEACHER PROFILE
                // ========================================

                if (user?.role === "teacher") {

                    const response = await fetch(
                        "http://localhost:3000/api/teachers/me",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to fetch profile"
                        );

                    }


                    setProfile(
                        data.teacher
                    );

                    return;
                }


                // ========================================
                // TEMPORARY STUDENT SUPPORT
                // ========================================
                // Student endpoint will be connected
                // after we create the student "me" API.

                if (user?.role === "student") {

                    setProfile(user);

                    return;
                }


                // ========================================
                // OTHER USERS
                // ========================================

                setProfile(user);

            } catch (error) {

                console.error(
                    "MY PROFILE ERROR:",
                    error
                );

                setError(
                    error.message
                );

            } finally {

                setLoading(false);

            }

        };


        fetchProfile();

    }, [token, user?.role]);


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="my-profile-page">

                <div className="my-profile-loading">
                    Loading profile...
                </div>

            </div>
        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div className="my-profile-page">

                <div className="my-profile-error">
                    {error}
                </div>

            </div>
        );

    }


    // =====================================================
    // TEACHER PROFILE DATA
    // =====================================================

    const teacherUser =
        profile?.user || {};


    const isTeacher =
        user?.role === "teacher";


    return (

        <div className="my-profile-page">


            {/* ============================================
                HEADER
            ============================================ */}

            <div className="my-profile-header">

                <div>

                    <h1>
                        My Profile
                    </h1>

                    <p>
                        View your account information
                    </p>

                </div>

            </div>


            {/* ============================================
                PERSONAL INFORMATION
            ============================================ */}

            <div className="my-profile-card">


                <div className="my-profile-card-header">

                    <h2>
                        Personal Information
                    </h2>

                </div>


                <div className="my-profile-information">


                    {/* Name */}

                    <div className="my-profile-field">

                        <span>
                            Name
                        </span>

                        <strong>
                            {isTeacher
                                ? teacherUser.name || "—"
                                : profile?.name || "—"}
                        </strong>

                    </div>


                    {/* Email */}

                    <div className="my-profile-field">

                        <span>
                            Email
                        </span>

                        <strong>
                            {isTeacher
                                ? teacherUser.email || "—"
                                : profile?.email || "—"}
                        </strong>

                    </div>


                    {/* Teacher ID */}

                    {isTeacher && (

                        <div className="my-profile-field">

                            <span>
                                Teacher ID
                            </span>

                            <strong>
                                {profile?.teacherId || "—"}
                            </strong>

                        </div>

                    )}


                    {/* Phone */}

                    {isTeacher && (

                        <div className="my-profile-field">

                            <span>
                                Phone
                            </span>

                            <strong>
                                {profile?.phone || "—"}
                            </strong>

                        </div>

                    )}


                    {/* Specialization */}

                    {isTeacher && (

                        <div className="my-profile-field">

                            <span>
                                Specialization
                            </span>

                            <strong>
                                {profile?.specialization || "—"}
                            </strong>

                        </div>

                    )}


                    {/* Date of Birth */}

                    {isTeacher && (

                        <div className="my-profile-field">

                            <span>
                                Date of Birth
                            </span>

                            <strong>
                                {profile?.dateOfBirth
                                    ? new Date(
                                        profile.dateOfBirth
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )
                                    : "—"}
                            </strong>

                        </div>

                    )}


                    {/* Joining Date */}

                    {isTeacher && (

                        <div className="my-profile-field">

                            <span>
                                Joining Date
                            </span>

                            <strong>
                                {profile?.joiningDate
                                    ? new Date(
                                        profile.joiningDate
                                    ).toLocaleDateString(
                                        "en-IN"
                                    )
                                    : "—"}
                            </strong>

                        </div>

                    )}


                    {/* Address */}

                    {isTeacher && (

                        <div className="my-profile-field">

                            <span>
                                Address
                            </span>

                            <strong>
                                {profile?.address || "—"}
                            </strong>

                        </div>

                    )}


                    {/* Status */}

                    {isTeacher && (

                        <div className="my-profile-field">

                            <span>
                                Status
                            </span>

                            <strong>
                                {profile?.status || "—"}
                            </strong>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}


export default MyProfile;