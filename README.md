# 🔒 CodeMask

> **Sanitize your code before sharing with AI — mask IPs, API keys, and passwords with reversible placeholders.**

CodeMask is a privacy-first developer tool that strips sensitive data from your code before you paste it into any AI chat (Claude, ChatGPT, Gemini, etc.), then restores real values from the AI's response. Everything runs **100% in the browser** — no server, no backend, your secrets never leave your machine.

---

## Features

- Two-way flow — Sanitize before AI, Restore after AI response
- Auto-detects IPs, API keys, passwords, DB connection strings
- Reversible — same session registry maps placeholders back to real values
- Secrets registry — visual table of all detected secrets (sensitive values blurred)
- Manual Add — register secrets the scanner missed
- One-click copy on output panel
- Keyboard shortcut — Ctrl+Enter to run
- Zero backend — pure client-side React, nothing sent anywhere

---

## Detected Patterns

| Category | Examples |
|---|---|
| IPv4 / CIDR | `10.10.10.10`, `192.168.1.0/24` |
| IPv6 | Full and compressed formats |
| AWS Keys | `AKIA...`, `aws_secret_key = "..."` |
| OpenAI Key | `sk-...`, `sk-proj-...` |
| Anthropic Key | `sk-ant-...` |
| GitHub Token | `ghp_...`, `gho_...` |
| GitLab Token | `glpat-...` |
| Slack Token | `xoxb-...`, `xoxp-...` |
| Bearer Token | `Authorization: Bearer ...` |
| Generic API Key | `api_key = "..."`, `token: "..."` |
| Password | `password = "..."`, `passwd: "..."` |
| DB Connection String | `postgres://user:pass@host` |

---

## Getting Started

```bash
git clone https://github.com/your-username/codemask.git
cd codemask
npm install
npm run dev
```

Open http://localhost:5173

### Build for production

```bash
npm run build
# Output in ./dist
```

Deploy the `dist/` folder to Vercel, Netlify, GitHub Pages, or anywhere static hosting works.

---

## Project Structure

```
codemask/
src/
  engine/
    patterns.js       # All detection regex patterns
    sanitizer.js      # Core sanitize/restore logic
  hooks/
    useRegistry.js    # Session state management
    useToast.js       # Notifications
    useCopy.js        # Clipboard hook
  components/
    CodePanel.jsx     # Input/Output panels
    RegistryTable.jsx # Detected secrets table
    ManualAdd.jsx     # Manual secret registration
    StatsBar.jsx      # Header stats
    Toast.jsx         # Notifications
  styles/
    global.css        # Design tokens
    components.css    # All component styles
  App.jsx             # Root component
  main.jsx            # Entry point
```

---

## Adding Custom Patterns

Open `src/engine/patterns.js` and add to the PATTERNS array:

```js
{
  id: 'stripe_key',
  type: 'key',
  label: 'STRIPE_KEY',
  name: 'Stripe Secret Key',
  regex: /sk_live_[A-Za-z0-9]{24,}/g,
  extract: (m) => m[0],
}
```

---

## Contributing

PRs welcome! Ideas for contribution:
- More provider patterns (Stripe, Twilio, SendGrid, Datadog...)
- VS Code extension
- Browser extension (right-click sanitize)
- Export/import registry as JSON

---

## License

MIT
