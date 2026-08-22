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

import AdminLayout from "./layouts/adminlayout";

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
                    ADMIN PANEL
                    ======================================== */}

                <Route element={<AdminLayout />}>

                    {/* Dashboard */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* Students */}

                    <Route
                        path="/students"
                        element={<Students />}
                    />


                    {/* Student Profile */}

                    <Route
                        path="/students/:id"
                        element={<StudentProfile />}
                    />

                    <Route
                        path="/teachers"
                        element={<Teachers />}
                    />
                    <Route
                        path="/teachers/:id"
                        element={<TeacherProfile />}
                     />

                     <Route
                      path="/settings"
                      element={<Settings />}
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