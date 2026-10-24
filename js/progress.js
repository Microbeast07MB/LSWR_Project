/* progress.js – Fetches and updates dashboard values from Supabase */
import { supabaseClient } from "./supabase-config.js";

/** Get the current logged‑in user */
async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error) console.error("[Progress] User fetch error:", error);
  return user;
}

/** Record a completed task for a given module */
export async function recordProgress(module, taskId) {
  const user = await getCurrentUser();
  if (!user) return;
  await supabaseClient.from("user_progress").upsert({
    user_id: user.id,
    module,
    task_id: taskId,
    completed: true,
    completed_at: new Date().toISOString()
  });
}

/** Load all progress values and update the UI */
export async function loadProgress() {
  const user = await getCurrentUser();
  if (!user) return;

  // ---- Profile: streak & IELTS goal ----
  const { data: profile } = await supabaseClient
    .from("user_profile")
    .select("learning_streak,ielts_goal")
    .eq("user_id", user.id)
    .single();

  const streakEl = document.querySelector("[data-streak]");
  if (streakEl) streakEl.textContent = `${profile?.learning_streak ?? 0} Days`;

  const goalEl = document.querySelector("[data-ielts-goal]");
  if (goalEl) goalEl.textContent = profile?.ielts_goal ? `Band ${profile.ielts_goal}` : "Not set";

  // ---- Skill progress ----
  const { data: rows } = await supabaseClient
    .from("user_progress")
    .select("module,task_id")
    .eq("user_id", user.id);

  const totalTasks = { listening: 8, speaking: 5, reading: 8, writing: 5 };
  const completed = { listening: 0, speaking: 0, reading: 0, writing: 0 };
  rows?.forEach(r => completed[r.module]++);

  const setSkill = (skill, pct) => {
    const percEl = document.getElementById(`${skill}-perc`);
    const barEl = document.getElementById(`${skill}-bar`);
    if (percEl) percEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
  };

  Object.keys(totalTasks).forEach(skill => {
    const pct = Math.round((completed[skill] / totalTasks[skill]) * 100) || 0;
    setSkill(skill, pct);
  });

  // ---- Overall progress (average of four skills) ----
  const overallPct = Math.round(
    Object.keys(totalTasks).reduce((sum, skill) => {
      return sum + (completed[skill] / totalTasks[skill]) * 100;
    }, 0) / 4
  );
  const overallEl = document.getElementById("overall-percentage");
  if (overallEl) overallEl.textContent = `${overallPct}%`;
}

// Run on every page load
document.addEventListener("DOMContentLoaded", loadProgress);
