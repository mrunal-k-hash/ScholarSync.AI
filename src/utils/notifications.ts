import { supabase, getSessionId } from './supabase';
import { SCHOLARSHIPS } from './scholarshipsDb';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface AppNotification {
  id: string;
  scholarship_id: string;
  title: string;
  message: string;
  type: 'tracking_started' | 'deadline_warning' | 'deadline_urgent' | 'deadline_passed' | 'info';
  is_read: boolean;
  created_at: string;
}

// ─── Browser Notification Permission ────────────────────────────────────────
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendBrowserNotification(title: string, body: string, icon?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      icon: icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: `scholarsync-${Date.now()}`,
    });
  } catch (e) {
    console.warn('Failed to send browser notification:', e);
  }
}

// ─── Tracked Scholarships (localStorage + Supabase) ─────────────────────────
const TRACKED_KEY = 'tracked_scholarships';

function getTrackedLocal(): string[] {
  try {
    return JSON.parse(localStorage.getItem(TRACKED_KEY) || '[]');
  } catch {
    return [];
  }
}

function setTrackedLocal(ids: string[]) {
  localStorage.setItem(TRACKED_KEY, JSON.stringify(ids));
}

export function isTracked(scholarshipId: string): boolean {
  return getTrackedLocal().includes(scholarshipId);
}

export function getTrackedScholarships(): string[] {
  return getTrackedLocal();
}

export async function trackScholarship(scholarshipId: string): Promise<void> {
  // Update localStorage
  const tracked = getTrackedLocal();
  if (!tracked.includes(scholarshipId)) {
    tracked.push(scholarshipId);
    setTrackedLocal(tracked);
  }

  // Persist to Supabase
  const userId = await getSessionId();
  if (userId) {
    await supabase.from('tracked_scholarships').upsert(
      { user_id: userId, scholarship_id: scholarshipId },
      { onConflict: 'user_id, scholarship_id' }
    );
  }

  // Find scholarship name
  const sch = SCHOLARSHIPS.find(s => s.id === scholarshipId);
  const name = sch?.name || scholarshipId;

  // Create a "tracking started" notification
  await addNotification(scholarshipId, {
    title: '🔔 Tracking Active',
    message: `You're now tracking "${name}". You'll receive alerts as the deadline approaches.`,
    type: 'tracking_started',
  });

  // Send browser push
  const hasPermission = await requestNotificationPermission();
  if (hasPermission) {
    sendBrowserNotification(
      'Tracking Active — ScholarSync AI',
      `You'll receive alerts for "${name}" as the deadline approaches.`
    );
  }
}

export async function untrackScholarship(scholarshipId: string): Promise<void> {
  // Update localStorage
  const tracked = getTrackedLocal().filter(id => id !== scholarshipId);
  setTrackedLocal(tracked);

  // Remove from Supabase
  const userId = await getSessionId();
  if (userId) {
    await supabase.from('tracked_scholarships').delete().match({
      user_id: userId,
      scholarship_id: scholarshipId,
    });
  }
}

export async function syncTrackedFromSupabase(): Promise<void> {
  const userId = await getSessionId();
  if (!userId) return;

  const { data } = await supabase
    .from('tracked_scholarships')
    .select('scholarship_id')
    .eq('user_id', userId);

  if (data && data.length > 0) {
    const ids = data.map((row: any) => row.scholarship_id);
    // Merge with local (union)
    const local = getTrackedLocal();
    const merged = [...new Set([...local, ...ids])];
    setTrackedLocal(merged);
  }
}

// ─── In-App Notifications (localStorage + Supabase) ─────────────────────────
const NOTIF_KEY = 'app_notifications';

function getNotificationsLocal(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
  } catch {
    return [];
  }
}

function setNotificationsLocal(notifs: AppNotification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

async function addNotification(
  scholarshipId: string,
  data: { title: string; message: string; type: AppNotification['type'] }
): Promise<void> {
  const notification: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    scholarship_id: scholarshipId,
    title: data.title,
    message: data.message,
    type: data.type,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // Save locally
  const notifs = getNotificationsLocal();
  notifs.unshift(notification);
  // Keep max 50 notifications
  setNotificationsLocal(notifs.slice(0, 50));

  // Save to Supabase
  const userId = await getSessionId();
  if (userId) {
    await supabase.from('notifications').insert({
      user_id: userId,
      scholarship_id: scholarshipId,
      title: data.title,
      message: data.message,
      type: data.type,
    });
  }
}

export function getNotifications(): AppNotification[] {
  return getNotificationsLocal();
}

export function getUnreadCount(): number {
  return getNotificationsLocal().filter(n => !n.is_read).length;
}

export async function markAllRead(): Promise<void> {
  // Update local
  const notifs = getNotificationsLocal().map(n => ({ ...n, is_read: true }));
  setNotificationsLocal(notifs);

  // Update Supabase
  const userId = await getSessionId();
  if (userId) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }
}

export async function clearAllNotifications(): Promise<void> {
  setNotificationsLocal([]);

  const userId = await getSessionId();
  if (userId) {
    await supabase.from('notifications').delete().eq('user_id', userId);
  }
}

// ─── Deadline Check Engine ──────────────────────────────────────────────────
// Milestones in days; each triggers a different severity notification
const DEADLINE_MILESTONES = [
  { days: 30, type: 'deadline_warning' as const, emoji: '📅', label: '30 days left' },
  { days: 14, type: 'deadline_warning' as const, emoji: '⏳', label: '2 weeks left' },
  { days: 7,  type: 'deadline_urgent' as const,  emoji: '⚠️', label: '1 week left' },
  { days: 3,  type: 'deadline_urgent' as const,  emoji: '🔴', label: '3 days left' },
  { days: 1,  type: 'deadline_urgent' as const,  emoji: '🚨', label: 'Tomorrow!' },
  { days: 0,  type: 'deadline_passed' as const,  emoji: '❌', label: 'Deadline passed' },
];

const LAST_CHECK_KEY = 'deadline_last_check';
const FIRED_MILESTONES_KEY = 'deadline_fired_milestones';

function getFiredMilestones(): Record<string, number[]> {
  try {
    return JSON.parse(localStorage.getItem(FIRED_MILESTONES_KEY) || '{}');
  } catch {
    return {};
  }
}

function setFiredMilestones(data: Record<string, number[]>) {
  localStorage.setItem(FIRED_MILESTONES_KEY, JSON.stringify(data));
}

export async function checkDeadlineNotifications(): Promise<number> {
  const tracked = getTrackedLocal();
  if (tracked.length === 0) return 0;

  // Rate limit: only check once per hour
  const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0');
  const now = Date.now();
  if (now - lastCheck < 60 * 60 * 1000) return 0; // 1 hour cooldown
  localStorage.setItem(LAST_CHECK_KEY, now.toString());

  const firedMilestones = getFiredMilestones();
  let newNotificationCount = 0;

  for (const schId of tracked) {
    const sch = SCHOLARSHIPS.find(s => s.id === schId);
    if (!sch) continue;

    const deadlineDate = new Date(sch.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadlineDate.setHours(0, 0, 0, 0);

    const daysLeft = Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Track which milestones we've already fired for this scholarship
    const fired = firedMilestones[schId] || [];

    for (const milestone of DEADLINE_MILESTONES) {
      // Fire if days remaining is at or below the milestone and we haven't fired it yet
      if (daysLeft <= milestone.days && !fired.includes(milestone.days)) {
        fired.push(milestone.days);

        const title = milestone.days === 0
          ? `${milestone.emoji} Deadline Passed`
          : `${milestone.emoji} ${milestone.label}`;

        const message = milestone.days === 0
          ? `The deadline for "${sch.name}" has passed.`
          : `"${sch.name}" deadline is ${milestone.label}! Apply before ${sch.deadline}.`;

        await addNotification(schId, { title, message, type: milestone.type });
        newNotificationCount++;

        // Send browser push for urgent ones
        if (milestone.type === 'deadline_urgent' || milestone.type === 'deadline_passed') {
          sendBrowserNotification(title, message);
        }
      }
    }

    firedMilestones[schId] = fired;
  }

  setFiredMilestones(firedMilestones);
  return newNotificationCount;
}

// ─── Time Formatting ────────────────────────────────────────────────────────
export function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
