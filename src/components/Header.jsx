import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
const { user, loading, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = async () => {
    try {
        await logout();
        navigate("/");
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Unable to log out. Please try again.");
    }
};

return (
    <header className="navbar">
        <Link to="/" className="logo">
            DEV@Deakin
        </Link>

        <input
            type="text"
            placeholder="Search..."
            className="search-bar"
        />

        <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/pricing">Pricing</Link>

            {!loading && (
                user ? (
                    <>
                        <Link to="/post">Post</Link>
                        <span className="user-email">
                            {user.email}
                        </span>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="nav-button"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </>
                )
            )}
        </nav>
    </header>
);

}

export default Header;
