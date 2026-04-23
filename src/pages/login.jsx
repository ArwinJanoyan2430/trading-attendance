import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../index.css";
import bg from "../assets/bg.jpg";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function login() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("LOGIN RESULT:", data, error);

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        alert("Please confirm your email first.");
      } else if (error.message.includes("Invalid login credentials")) {
        alert("Wrong email or password.");
      } else {
        alert(error.message);
      }
      return;
    }

    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bg})` }}>
      <div className="card flex items-center justify-center">
        <div className="flex flex-col gap-4">
          <h1 className="mx-auto text-2xl font-bold -mt-4">Login</h1>

          
            <div className="group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="input "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="password"
                  placeholder="Password"
                  className="input pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

              </div>

          <button
            onClick={login}
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-center">
            Don't have an account?{" "}
            <span
              className="text-blue-500 underline cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}