import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

import Students from "./pages/students";
import StudentProfile from "./pages/studentProfile";

import Teachers from "./pages/teachers";
import TeacherProfile from "./pages/teacherProfile";

import Settings from "./pages/settings";

import DashboardLayout from "./layouts/dashboardLayout";

import MyProfile from "./pages/myProfile";

import TeacherPayments from "./pages/teacherPayments";
import TeacherPaymentManagement from "./pages/teacherPaymentManagement";
import StudentFeeManagement from "./pages/studentFeeManagement";

import CreateNotification from "./pages/CreateNotification";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ========================================
                    PUBLIC
                ======================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />


                {/* ========================================
                    MAIN APPLICATION
                ======================================== */}

                <Route element={<DashboardLayout />}>


                    {/* ====================================
                        DASHBOARD
                    ==================================== */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* ====================================
                        STUDENTS
                    ==================================== */}

                    <Route
                        path="/students"
                        element={<Students />}
                    />

                    <Route
                        path="/students/:id"
                        element={<StudentProfile />}
                    />


                    {/* ====================================
                        TEACHERS
                    ==================================== */}

                    <Route
                        path="/teachers"
                        element={<Teachers />}
                    />

                    <Route
                        path="/teachers/:id"
                        element={<TeacherProfile />}
                    />


                    {/* ====================================
                        TEACHER
                    ==================================== */}

                    <Route
                        path="/teacher/my-profile"
                        element={<MyProfile />}
                    />

                    <Route
                        path="/teacher/my-payments"
                        element={<TeacherPayments />}
                    />


                    {/* ====================================
                        SUPER ADMIN — TEACHER PAYMENTS
                    ==================================== */}

                    <Route
                        path="/admin/teacher-payments"
                        element={
                            <TeacherPaymentManagement />
                        }
                    />


                    {/* ====================================
                        ADMIN / SUPER ADMIN — STUDENT FEES
                    ==================================== */}

                    <Route
                        path="/admin/student-fees"
                        element={
                            <StudentFeeManagement />
                        }
                    />


                    {/* ====================================
                        STUDENT — MY PROFILE
                    ==================================== */}

                    <Route
                        path="/student/my-profile"
                        element={<MyProfile />}
                    />


                    {/* ====================================
                        ADMIN / SUPER ADMIN — SETTINGS
                    ==================================== */}

                    <Route
                        path="/admin/settings"
                        element={<Settings />}
                    />


                    {/* ====================================
                        STUDENT — MY FEES
                    ==================================== */}

                    <Route
                        path="/student/my-fees"
                        element={
                            <div>
                                My Fees
                            </div>
                        }
                    />


                    {/* ====================================
                        SUPER ADMIN — CREATE NOTIFICATION
                    ==================================== */}

                    <Route
                        path="/notifications/create"
                        element={
                            <CreateNotification />
                        }
                    />

                </Route>


                {/* ========================================
                    UNKNOWN URL
                ======================================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;