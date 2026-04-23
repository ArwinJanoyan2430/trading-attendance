import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../index.css";
import bg from "../assets/bg.jpg";
import { ArrowRightIcon } from "lucide-react";

const TIMES = [
  "1:30 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "7:30 PM",
  "8:00 PM",
];

export default function Setup() {
  const [role, setRole] = useState("beginner");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Remove 4PM automatically if user switches to beginner
  useEffect(() => {
    if (role === "beginner") {
      setSelectedTimes((prev) =>
        prev.filter((t) => t !== "4:00 PM")
      );
    }
  }, [role]);

  function toggleTime(time) {
    // ❌ block 4PM if beginner
    if (role === "beginner" && time === "4:00 PM") return;

    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  }

  async function saveSetup() {
    setLoading(true);

    const { data: auth, error: authError } =
      await supabase.auth.getUser();

    if (authError || !auth.user) {
      alert("User not found");
      setLoading(false);
      return;
    }

    if (selectedTimes.length === 0) {
      alert("Please select at least one time");
      setLoading(false);
      return;
    }

    const sortedTimes = TIMES.filter((t) =>
      selectedTimes.includes(t)
    );

    const { error } = await supabase
      .from("users")
      .upsert({
        id: auth.user.id,
        email: auth.user.email,
        role,
        custom_times: sortedTimes,
        is_new: false,
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    navigate("/dashboard");
  }

return (
  <div
    className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${bg})` }}
  >
    {/* CARD */}
    <div className="bg-white p-6 rounded-xl shadow w-[350px] flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">
        Setup Your Schedule
      </h1>

      {/* ROLE */}
      <div>
        <p className="font-medium mb-2">Select your level:</p>

        <label className="flex gap-2">
          <input
            type="radio"
            checked={role === "beginner"}
            onChange={() => setRole("beginner")}
          />
          Beginner
        </label>

        <label className="flex gap-2">
          <input
            type="radio"
            checked={role === "regular"}
            onChange={() => setRole("regular")}
          />
          Regular
        </label>
      </div>

      {/* TIMES */}
      <div>
        <p className="font-medium mb-2">
          Choose your trading times:
        </p>

        {TIMES.map((time) => {
          const disabled =
            role === "beginner" && time === "4:00 PM";

          return (
            <label
              key={time}
              className={`flex items-center gap-2 mb-1 ${
                disabled ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={selectedTimes.includes(time)}
                onChange={() => toggleTime(time)}
              />
              {time} {disabled && "(Not available for beginners)"}
            </label>
          );
        })}
      </div>

      <button
        onClick={saveSetup}
        disabled={loading}
        className="bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>

    {/* ✅ FOOTER OUTSIDE CARD */}
    <div className="mt-6 text-sm text-slate-400 text-center">
      © {new Date().getFullYear()} Arwin Janoyan. All rights reserved.
    </div>
  </div>
);
}