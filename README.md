# 🔒 CodeMask

> **Sanitize your code before sharing with AI — mask IPs, API keys, and passwords with reversible placeholders.**

CodeMask is a privacy-first developer tool that strips sensitive data from your code before you paste it into any AI chat (Claude, ChatGPT, Gemini, etc.), then restores real values from the AI's response. Everything runs **100% in the browser** — no server, no backend, your secrets never leave your machine.

[![CI/CD Pipeline](https://github.com/shubham-singhS2/CodeMask/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/shubham-singhS2/CodeMask/actions/workflows/ci-cd.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/shubhamsinghs2/codemask)](https://hub.docker.com/r/shubhamsinghs2/codemask)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What Problem Does This Solve?

When you share code with AI assistants for help with debugging, code review, or analysis — your code often contains sensitive values like internal IPs, API keys, database passwords, and tokens. Removing these manually before every paste is tedious and error-prone.

CodeMask solves this with a two-way flow:
1. **Sanitize** — paste your raw code, get safe placeholders (`{{IP_1}}`, `{{API_KEY_1}}`) to share with AI
2. **Restore** — paste the AI's response back, get your real values restored automatically

Everything happens in your browser. Nothing is ever sent to any server.

---

## Features

- **Two-way flow** — Sanitize before AI, Restore after AI response
- **Auto-detection** — IPs, API keys, passwords, DB connection strings, PEM keys and more
- **Reversible** — same session registry maps every placeholder back to its real value
- **Persistent registry** — saved to localStorage, survives page refresh
- **Export / Import** — backup your registry as JSON, share with teammates
- **Secrets registry table** — visual overview of all detected secrets, sensitive values blurred by default
- **Manual Add** — register secrets the scanner missed
- **One-click copy** — no manual selection needed
- **Dark / Light theme** — toggle in the header, preference saved
- **Keyboard shortcut** — `Ctrl+Enter` to run
- **Zero backend** — pure client-side React, nothing sent anywhere
- **HTTP-safe** — works over plain `http://IP:port` as well as HTTPS

---

## Detected Patterns

| Category | Examples |
|---|---|
| IPv4 / CIDR | `10.10.10.10`, `192.168.1.0/24` |
| IPv6 | Full and compressed formats |
| AWS Access Key | `AKIA...` |
| AWS Secret Key | `AWS_SECRET_ACCESS_KEY = "..."` |
| OpenAI Key | `sk-...`, `sk-proj-...`, `sk_test_...` |
| Anthropic Key | `sk-ant-...` |
| GitHub Token | `ghp_...`, `gho_...` |
| GitLab Token | `glpat-...` |
| Slack Token | `xoxb-...`, `xoxp-...` |
| Bearer Token | `Authorization: Bearer ...` |
| Generic API Key | `api_key = "..."`, `token: "..."`, `api_secret: "..."` |
| JWT / Signing Key | `jwt_signing_key = "..."` |
| Password | `password = "..."`, `passwd: "..."` |
| DB Connection String | `postgres://user:pass@host`, `mysql://...` |
| PEM Private Key | `-----BEGIN PRIVATE KEY-----` blocks |
| Password in function call | `authenticate("user", "password")` |

---

## Getting Started

### Run locally

```bash
git clone https://github.com/shubham-singhS2/CodeMask.git
cd CodeMask
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for production

```bash
npm run build
# Output in ./dist — deploy anywhere static hosting works
```

### Run with Docker

```bash
docker pull shubhamsinghs2/codemask:latest
docker run -d -p 8080:80 shubhamsinghs2/codemask:latest
# Open http://localhost:8080
```

---

## Project Structure

```
CodeMask/
├── src/
│   ├── engine/
│   │   ├── patterns.js        # All detection regex patterns (add new ones here)
│   │   └── sanitizer.js       # Core sanitize/restore logic
│   ├── hooks/
│   │   ├── useRegistry.js     # Session registry state + localStorage persistence
│   │   ├── useToast.js        # Toast notification state
│   │   └── useCopy.js         # Clipboard copy hook
│   ├── components/
│   │   ├── CodePanel.jsx      # Input/Output code textarea panels
│   │   ├── RegistryTable.jsx  # Detected secrets table with blur/reveal
│   │   ├── ManualAdd.jsx      # Manual secret registration
│   │   ├── StatsBar.jsx       # Header stats + export/import/reset
│   │   └── Toast.jsx          # Notification toasts
│   ├── styles/
│   │   ├── global.css         # Design tokens + dark/light theme vars
│   │   └── components.css     # All component styles
│   ├── App.jsx                # Root component + orchestration
│   └── main.jsx               # Entry point
├── Dockerfile                 # Multi-stage: Node build → Nginx serve
├── nginx.conf                 # SPA routing config
└── .github/
    └── workflows/
        └── ci-cd.yml          # GitHub Actions pipeline
```

---

## CI/CD Pipeline

This project uses a full GitOps pipeline:

```
git push → GitHub Actions → Docker build → Trivy scan
→ Push to Docker Hub → Update codemask-gitops repo
→ ArgoCD detects change → Deploy to K3s cluster
```

**Pipeline stages:**
1. `npm install` + `npm run build` — verify code compiles
2. Docker image build — tagged with short commit SHA
3. Trivy vulnerability scan — results visible in GitHub Security tab
4. Push to Docker Hub — both `:latest` and `:<sha>` tags
5. Update `codemask-gitops` repo with new image tag
6. ArgoCD auto-syncs to K3s cluster

See [codemask-gitops](https://github.com/shubham-singhS2/codemask-gitops) for the Kubernetes manifests.

---

## Adding Custom Patterns

Open `src/engine/patterns.js` and add an entry to the `PATTERNS` array:

```js
{
  id: 'stripe_key',
  type: 'key',              // 'ip' | 'key' | 'pass'
  label: 'STRIPE_KEY',      // used in placeholder: {{STRIPE_KEY_1}}
  name: 'Stripe Secret Key', // shown in the registry table
  regex: /sk_live_[A-Za-z0-9]{24,}/g,
  extract: (m) => m[0],    // return the secret from the match
}
```

Rebuild and the new pattern is active immediately.

---

## Contributing

PRs welcome. Ideas:
- More provider patterns (Stripe, Twilio, SendGrid, Datadog, Vault tokens...)
- VS Code extension
- Browser extension (right-click → sanitize selection)
- CLI tool (`cat config.yaml | codemask`)

---

## License

MIT — free to use, modify, and distribute.

---

Built by [Shubham Singh](https://shubham-singh.in) · DevSecOps Engineer
