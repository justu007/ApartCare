import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchProfile } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";



function Login() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    
      const { loading, error } = useSelector((state) => state.auth);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await dispatch(loginUser({ email, password })).unwrap();

            const profileData = await dispatch(fetchProfile()).unwrap();

            const userRole = profileData.role;

            if (userRole === 'SUPER_ADMIN') {
                navigate('/super-admin/create-community');
            } else if (userRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (userRole === 'RESIDENT') {
                navigate('/resident/dashboard');
            } else if (userRole === 'STAFF') {
                navigate('/staff/dashboard');
            } else {
                navigate('/profile');
            }

        } catch (err) {

            console.error("Login failed:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">ApartCare Login</h2>
                
                {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full p-2 mt-1 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;