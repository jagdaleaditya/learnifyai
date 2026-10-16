import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const LOGS_FILE = path.join(DATA_DIR, 'logins.jsonl');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load existing users
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return Object.create(null);
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    // Null-prototype object so keys like "__proto__" can never pollute Object.prototype.
    return Object.assign(Object.create(null), JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read users database:', err.message);
    return Object.create(null);
  }
}

// Save users
function saveUsers(users) {
  try {
    // Write to a temp file then rename, so a crash mid-write can't corrupt the database. 0600 = owner-only.
    const tmp = USERS_FILE + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(users, null, 2), { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tmp, USERS_FILE);
  } catch (err) {
    console.error('Failed to write users database:', err.message);
  }
}

// Append login audit log
function appendLog(logEntry) {
  try {
    fs.appendFileSync(LOGS_FILE, JSON.stringify(logEntry) + '\n', { encoding: 'utf8', mode: 0o600 });
  } catch (err) {
    console.error('Failed to append login log:', err.message);
  }
}

/**
 * Record a login event and upsert user in database
 */
export function recordLogin({ email, name, avatar, provider = 'google', role = 'Trainer', institute = 'TechSummit Institute', ip = '', userAgent = '' }) {
  if (!email) throw new Error('Email is required to record login');

  const normalizedEmail = email.toLowerCase().trim();
  const users = loadUsers();
  const now = new Date().toISOString();

  let user = users[normalizedEmail];
  if (!user) {
    // New user creation
    user = {
      id: 'usr_' + crypto.randomUUID(),
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0],
      avatar: avatar || null,
      role: role || 'Trainer',
      institute: institute || (normalizedEmail.includes('@gmail.com') ? 'Google Workspace' : normalizedEmail.split('@')[1] || 'TechSummit Institute'),
      provider,
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1,
      lastIp: ip,
      lastUserAgent: userAgent
    };
  } else {
    // Update existing user
    user.name = name || user.name;
    if (avatar) user.avatar = avatar;
    user.lastLoginAt = now;
    user.loginCount = (user.loginCount || 1) + 1;
    user.lastIp = ip;
    user.lastUserAgent = userAgent;
    if (provider) user.provider = provider;
  }

  users[normalizedEmail] = user;
  saveUsers(users);

  // Record audit log entry
  const logEntry = {
    id: 'log_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
    userId: user.id,
    email: normalizedEmail,
    name: user.name,
    provider,
    timestamp: now,
    ip,
    userAgent
  };
  appendLog(logEntry);

  return {
    ok: true,
    user,
    totalUsers: Object.keys(users).length
  };
}

/**
 * Get all registered users from database
 */
export function getUsers() {
  const users = loadUsers();
  return Object.values(users).sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
}

/**
 * Get recent login audit logs
 */
export function getLoginLogs(limit = 100) {
  try {
    if (!fs.existsSync(LOGS_FILE)) return [];
    const lines = fs.readFileSync(LOGS_FILE, 'utf8').trim().split('\n').filter(Boolean);
    const parsed = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
    return parsed.reverse().slice(0, limit);
  } catch (err) {
    console.error('Failed to read login logs:', err.message);
    return [];
  }
}

/**
 * Get auth stats
 */
export function getAuthStats() {
  const users = getUsers();
  const logs = getLoginLogs(1000);
  const byProvider = {};
  for (const u of users) {
    byProvider[u.provider] = (byProvider[u.provider] || 0) + 1;
  }
  return {
    totalUsers: users.length,
    totalLogins: logs.length,
    byProvider,
    recentLogins: logs.slice(0, 10)
  };
}
