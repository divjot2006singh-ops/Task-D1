import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
doc,
setDoc,
serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../firebase";
import "../Auth.css";

function Signup() {
const navigate = useNavigate();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
        setError("Please enter your full name.");
        return;
    }

    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    if (password.length < 6) {
        setError("Password must contain at least 6 characters.");
        return;
    }

    setLoading(true);

    try {
        // Step 1: Create the Firebase Authentication account.
        const result = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
        );

        const user = result.user;

        // Step 2: Create a Firestore profile using the Firebase UID.
        await setDoc(doc(db, "users", user.uid), {
            name: name.trim(),
            email: user.email,
            uid: user.uid,
            subscription: "Free",
            createdAt: serverTimestamp()
        });

        // Step 3: Inform the user and navigate to Login.
        alert("Account created successfully!");
        navigate("/login");
    } catch (err) {
        console.error("Signup failed:", err);

        switch (err.code) {
            case "auth/email-already-in-use":
                setError("This email is already registered. Please log in.");
                break;

            case "auth/invalid-email":
                setError("Please enter a valid email address.");
                break;

            case "auth/weak-password":
                setError("Please choose a stronger password.");
                break;

            default:
                setError(
                    "Unable to create your account. Please try again."
                );
        }
    } finally {
        setLoading(false);
    }
};

return (
    <div className="auth-container">
        <div className="auth-box">
            <h1>Create Account</h1>

            <p className="auth-subtitle">
                Sign up to get started
            </p>

            <form className="auth-form" onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                />

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) =>
                        setConfirmPassword(e.target.value)
                    }
                    autoComplete="new-password"
                    minLength={6}
                    required
                />

                {error && (
                    <p className="auth-error" role="alert">
                        {error}
                    </p>
                )}

                <button
                    className="auth-button"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <p className="auth-text">
                Already have an account?{" "}
                <Link className="auth-link" to="/login">
                    Login
                </Link>
            </p>
        </div>
    </div>
);


}

export default Signup;
