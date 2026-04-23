import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getSchedule } from "../lib/schedule";
import Loading from "./Loading";

// ---------- TIME HELPERS ----------
function parseTime(timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function isTimeAvailable(timeStr, completedToday) {
  const now = new Date();
  const start = parseTime(timeStr);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return now >= start && now <= end && !completedToday;
}

// ✅ Sort times properly
function sortTimes(times) {
  return [...times].sort((a, b) => parseTime(a) - parseTime(b));
}

// ---------- COMPONENT ----------
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [checked, setChecked] = useState([]);
  const [streak, setStreak] = useState(0);
  const [completedToday, setCompletedToday] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadUser();
  }, []);

  // ---------- LOAD USER ----------
  async function loadUser() {
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    let { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();

    // If user not in DB
    if (!data) {
      await supabase.from("users").insert({
        id: auth.user.id,
        email: auth.user.email,
        role: "beginner",
        custom_times: [],
      });

      data = {
        id: auth.user.id,
        role: "beginner",
        custom_times: [],
      };
    }

    // ✅ Ensure only valid array
    const userTimes = Array.isArray(data.custom_times)
      ? data.custom_times
      : [];

    const sortedTimes = sortTimes(userTimes);

    setUser(data);
    setSchedule(sortedTimes);

    loadToday(auth.user.id, sortedTimes);
  }

  // ---------- LOAD TODAY ----------
  async function loadToday(userId, customTimes) {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      setStreak(data.streak || 0);
      setCompletedToday(data.completed || false);

      // ✅ Only keep valid checked times
      const safeChecked = (data.checked_times || []).filter((t) =>
        customTimes.includes(t)
      );

      setChecked(safeChecked);
    }
  }

  // ---------- TOGGLE ----------
  async function toggle(time) {
    if (!schedule.includes(time)) return; // extra safety

    const updated = checked.includes(time)
      ? checked.filter((t) => t !== time)
      : [...checked, time];

    setChecked(updated);

    await supabase.from("attendance").upsert({
      user_id: user.id,
      date: today,
      checked_times: updated,
    });
  }

  // ---------- STREAK ----------
  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  async function handleCompletion() {
    if (!user) return;

    const { data: yesterday } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", getYesterday())
      .maybeSingle();

    const newStreak =
      yesterday && yesterday.completed ? yesterday.streak + 1 : 1;

    setStreak(newStreak);
    setCompletedToday(true);

    await supabase.from("attendance").upsert({
      user_id: user.id,
      date: today,
      completed: true,
      streak: newStreak,
      checked_times: checked,
    });
  }

  // ---------- LOADING ----------
  if (!user) return <div className="p-6"><Loading/></div>;

  // ❗ No schedule fallback
  if (!schedule.length) {
    return (
      <div className="p-6 text-center text-gray-500">
        No schedule set. Please complete setup.
      </div>
    );
  }

  const progress = Math.round(
    (checked.length / schedule.length) * 100
  );

  // ---------- UI ----------
  return (
    <div className="max-w-md mx-auto p-4">
      {/* PROGRESS */}
      <p className="mb-2 font-medium">
        Progress: {checked.length}/{schedule.length}
      </p>

      {/* STREAK */}
      <div className="flex mb-4 gap-1 text-lg font-semibold">
        <span className="text-orange-500 animate-pulse">🔥</span>
        <span className="text-orange-500">Streak: {streak}</span>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* TIMES */}
      <ul className="space-y-2">
        {schedule.map((time) => {
          const available = isTimeAvailable(time, completedToday);

          return (
            <li
              key={time}
              className={`p-3 rounded-xl flex justify-between items-center transition
              ${
                available
                  ? "bg-white shadow-sm"
                  : "bg-gray-100 opacity-60"
              }`}
            >
              <span className="font-medium">
                {time} {!available && "(locked)"}
              </span>

              <input
                type="checkbox"
                disabled={!available}
                checked={checked.includes(time)}
                onChange={() => toggle(time)}
                className="w-5 h-5 accent-green-500"
              />
            </li>
          );
        })}
      </ul>

      {/* DONE BUTTON */}
      {checked.length === schedule.length && !completedToday && (
        <button
          onClick={handleCompletion}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
        >
          Done ✅
        </button>
      )}

      {/* STATUS */}
      {completedToday ? (
        <p className="mt-4 text-center text-green-600 font-semibold">
          ✅ All done! Your times will reset tomorrow.
        </p>
      ) : (
        checked.length > 0 &&
        checked.length !== schedule.length && (
          <p className="mt-4 text-center text-red-500 font-semibold">
            ❌ You have {schedule.length - checked.length} missed
          </p>
        )
      )}
    </div>
  );
}