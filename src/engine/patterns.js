export const PATTERNS = [

  // ── PEM / Private Key blocks ─────────────────────────────
  {
    id: 'pem_block',
    type: 'key',
    label: 'PRIVATE_KEY',
    name: 'PEM Private Key Block',
    regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
    extract: (m) => m[0],
  },

  // ── AWS ──────────────────────────────────────────────────
  {
    id: 'aws_access',
    type: 'key',
    label: 'AWS_KEY',
    name: 'AWS Access Key ID',
    regex: /\bAKIA[0-9A-Z]{12,20}\b/g,
    extract: (m) => m[0],
  },
  {
    id: 'aws_secret_var',
    type: 'key',
    label: 'AWS_SECRET',
    name: 'AWS Secret Access Key',
    regex: /(?:AWS_SECRET[_A-Z]*|aws[_\-]secret[_\-](?:access[_\-])?key)\s*[=:]\s*["']?([A-Za-z0-9/+!@#$%^&*\-_]{16,})["']?/gi,
    extract: (m) => m[1],
  },

  // ── OpenAI / Anthropic ────────────────────────────────────
  {
    id: 'openai',
    type: 'key',
    label: 'OPENAI_KEY',
    name: 'OpenAI API Key',
    // sk- or sk_ followed by optional "proj-" / "proj_" then 20+ chars
    regex: /\bsk[-_](?:proj[-_])?[A-Za-z0-9\-_]{20,}\b/g,
    extract: (m) => m[0],
  },
  {
    id: 'anthropic',
    type: 'key',
    label: 'ANTHROPIC_KEY',
    name: 'Anthropic API Key',
    regex: /\bsk-ant-[A-Za-z0-9\-_]{20,}\b/g,
    extract: (m) => m[0],
  },

  // ── Source Control ────────────────────────────────────────
  {
    id: 'github',
    type: 'key',
    label: 'GITHUB_TOKEN',
    name: 'GitHub Token',
    regex: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g,
    extract: (m) => m[0],
  },
  {
    id: 'gitlab',
    type: 'key',
    label: 'GITLAB_TOKEN',
    name: 'GitLab Token',
    regex: /\bglpat-[A-Za-z0-9\-_]{20,}\b/g,
    extract: (m) => m[0],
  },

  // ── Slack ─────────────────────────────────────────────────
  {
    id: 'slack',
    type: 'key',
    label: 'SLACK_TOKEN',
    name: 'Slack Token',
    regex: /\bxox[baprs]-[A-Za-z0-9\-]{10,}\b/g,
    extract: (m) => m[0],
  },

  // ── Bearer tokens ─────────────────────────────────────────
  {
    id: 'bearer',
    type: 'key',
    label: 'BEARER_TOKEN',
    name: 'Bearer Token',
    regex: /\bBearer\s+([A-Za-z0-9\-_\.]{20,})/g,
    extract: (m) => m[1],
  },

  // ── DB connection strings ─────────────────────────────────
  // FIX: some languages split long strings across lines e.g. Python:
  //   "postgresql://user:pass!"   <-- string ends here
  //   "@host/db"                  <-- continues next line
  // We normalise the code first (see sanitizer.js) before applying this pattern.
  {
    id: 'conn_string',
    type: 'pass',
    label: 'DB_PASS',
    name: 'DB Connection String Password',
    regex: /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|mssql|oracle):\/\/[^:@\s"']+:([^@\s"']{4,})@/gi,
    extract: (m) => m[1],
  },

  // ── JWT / signing keys ────────────────────────────────────
  // FIX: match jwt_signing_key, jwt-signing-key, signing_key — allow quoted key names
  {
    id: 'jwt_key',
    type: 'key',
    label: 'JWT_KEY',
    name: 'JWT / Signing Key',
    regex: /["']?(?:jwt|signing)[_\-](?:signing[_\-])?key["']?\s*[=:]\s*["']([^"'\n]{8,})["']/gi,
    extract: (m) => m[1],
  },

  // ── Generic API key / token / secret assignments ──────────
  // FIX: allow quoted key names ("api_key": "...") and underscores in value
  {
    id: 'generic_key',
    type: 'key',
    label: 'API_KEY',
    name: 'API Key / Token',
    regex: /["']?(?:api[_\-]?(?:key|secret|token)|access[_\-]?(?:key|token)|auth[_\-]?(?:key|token)|app[_\-]?(?:key|secret))["']?\s*[=:]\s*["']([A-Za-z0-9\-_\.\/\+!@#$%]{10,})["']/gi,
    extract: (m) => m[1],
  },

  // ── Secret / private key env vars ─────────────────────────
  {
    id: 'secret_var',
    type: 'key',
    label: 'SECRET',
    name: 'Secret / Private Key (env var)',
    regex: /(?:^|[\s,{])(?:SECRET|PRIVATE[_\-]KEY|ENCRYPTION[_\-]KEY|APP[_\-]SECRET)\s*[=:]\s*["']([^"'\n]{8,})["']/gm,
    extract: (m) => m[1],
  },

  // ── Passwords ─────────────────────────────────────────────
  // FIX: allow quoted key names, special chars (!) in value
  {
    id: 'password_dict',
    type: 'pass',
    label: 'PASSWORD',
    name: 'Password (dict / config)',
    regex: /["']?(?:password|passwd|pwd|db[_\-]?pass(?:word)?|user[_\-]?pass(?:word)?)["']?\s*[=:]\s*["']([^"'\n]{4,})["']/gi,
    extract: (m) => m[1],
  },
  // Positional function call:  authenticate("admin", "SuperSecret123!")
  {
    id: 'password_call',
    type: 'pass',
    label: 'PASSWORD',
    name: 'Password (function call arg)',
    regex: /(?:authenticate|login|verify|checkPassword|check_password)\s*\(\s*["'][^"']*["']\s*,\s*["']([^"'\n]{4,})["']/gi,
    extract: (m) => m[1],
  },

  // ── IPv4 ─────────────────────────────────────────────
  // Group 1 = bare IP, group 2 = optional /prefix.
  // Registering only the IP means CIDR notation is preserved:
  //   192.168.1.0/24  →  {{IP_1}}/24  (not {{IP_1}})
  {
    id: 'ipv4',
    type: 'ip',
    label: 'IP',
    name: 'IPv4 Address',
    regex: /\b((?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?))(\/\d{1,2})?\b/g,
    extract: (m) => m[1],   // IP only — /prefix stays untouched
    skip: (val) => ['127.0.0.1', '0.0.0.0', '255.255.255.255'].includes(val),
  },

  // ── IPv6 ──────────────────────────────────────────────────
  {
    id: 'ipv6',
    type: 'ip',
    label: 'IPv6',
    name: 'IPv6 Address',
    regex: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    extract: (m) => m[0],
  },
];

export const TYPE_META = {
  ip:   { label: 'IP Address', color: 'blue'   },
  key:  { label: 'API Key',    color: 'red'    },
  pass: { label: 'Password',   color: 'yellow' },
};
