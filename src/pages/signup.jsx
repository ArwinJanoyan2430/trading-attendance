import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../index.css";
import bg from "../assets/bg.jpg";
import { Mail, Lock, Check   } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState("");

  async function signUp() {
    setLoading(true);
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    // Safely insert user if available
    if (data.user) {
      await supabase.from("users").upsert({
        id: data.user.id,
        email: data.user.email,
        role: "beginner",
        is_new: true,
        has_invited: false,
      });
    }

    setEmail("");
    setPassword("");
    setLoading(false);

    alert("Account created! Please login.");
    navigate("/login");
  }
return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bg})` }}>
      <div className="card flex items-center justify-center">
        <div className="flex flex-col gap-4">
          <h1 className="mx-auto my-1 text-2xl font-bold">Sign Up</h1>

          <div className="group">
            <Mail className="icon my-3.5" />
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="group">
            <Lock className="icon my-3.5" />
            <input
              type="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="group">
            <Check className="icon my-3.5" />
            <input
              type="password"
              placeholder="Retype Password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            onClick={signUp}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <p className="text-sm text-center">
            Already have an account?{" "}
            <span
              className="text-blue-500 underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}