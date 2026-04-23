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
    setLoading(false); // ✅ FIX
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
  setConfirmPassword(""); // ✅ reset this too
  setLoading(false);

  navigate("/setup");
}
return (
  <div
    className="flex flex-col min-h-screen items-center justify-center gap-4 bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${bg})` }}
  >
    {/* CARD */}
    <div className="card flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <h1 className="mx-auto my-1 text-2xl font-bold">Sign Up</h1>

        <div className="group relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            className="input pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="group relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            className="input pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="group relative">
          <Check className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-700" />
          {confirmPassword && password === confirmPassword && (
            <Check className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
          )}

          <input
            type="password"
            placeholder="Retype Password"
            className="input pl-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          onClick={signUp}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer hover:bg-blue-600"
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <span
            className="text-blue-500 underline cursor-pointer"
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>

    {/* ✅ FOOTER */}
    <div className="text-sm text-slate-400 text-center mt-4">
      © {new Date().getFullYear()} Arwin Janoyan. All rights reserved.
    </div>
  </div>
);
}