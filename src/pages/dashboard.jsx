import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getSchedule } from "../lib/schedule";

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

function isTimeAvailable(timeStr) {
  const now = new Date();
  const start = parseTime(timeStr);

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return now >= start && now <= end;
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

    if (!data) {
      await supabase.from("users").insert({
        id: auth.user.id,
        email: auth.user.email,
        role: "beginner",
      });

      data = {
        id: auth.user.id,
        role: "beginner",
        is_new: true,
        has_invited: false,
      };
    }

    setUser(data);
    setSchedule(getSchedule(data));
    loadToday(auth.user.id);
  }

  async function loadToday(userId) {
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      setStreak(data.streak);
      setCompletedToday(data.completed);
    }
  }

  function toggle(time) {
    setChecked((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time]
    );
  }

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
    });
  }

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-0 max-w-xl">
      <h1 className="text-xl font-bold mb-2">Dashboard</h1>

      <p className="mb-2">
        Progress: {checked.length}/{schedule.length}
      </p>

      <p className="mb-4 text-lg">🔥 Streak: {streak}</p>

      <ul className="space-y-2">
        {schedule.map((time) => {
          const enabled = isTimeAvailable(time);

          return (
            
            <li
              key={time}
              className="p-3 bg-gray-100 rounded-xl flex justify-between items-center"
            >
              <span className={!enabled ? "text-gray-400" : ""}>
                {time} {!enabled && "(locked)"}
              </span>

              <input
                type="checkbox"
                disabled={!enabled}
                checked={checked.includes(time)}
                onChange={() => toggle(time)}
                className="w-5 h-5"
              />
            </li>
          );
        })}
      </ul>

      {checked.length === schedule.length && !completedToday && (
        <button
          onClick={handleCompletion}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Done ✅
        </button>
      )}
    </div>
  );
}