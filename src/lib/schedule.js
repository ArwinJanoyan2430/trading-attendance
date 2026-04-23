export function getSchedule(user) {
  if (user.role === "beginner") {
    return user.is_new
      ? ["13:30", "14:00", "15:00", "19:30", "20:00"]
      : ["13:30", "19:30"];
  }

  if (user.role === "regular") {
    return user.has_invited
      ? ["13:30", "14:00", "15:00", "16:30", "19:30", "20:00"]
      : ["13:30", "16:30", "19:30"];
  }

  return [];
}