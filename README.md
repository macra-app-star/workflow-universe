# Workflow Universe

[![Deploy Status](https://img.shields.io/badge/vercel-deployed-brightgreen?logo=vercel)](https://deploy-sooty-psi.vercel.app)
[![Workflows](https://img.shields.io/badge/workflows-2%2C053-blue)](https://deploy-sooty-psi.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)

2,053 battle-tested n8n workflow templates. Search by what you need, find the perfect automation.

**[Live Demo](https://deploy-sooty-psi.vercel.app)**

---

## Features

- **Live workflow search** across 2,053 workflows with instant results
- **TF-IDF relevance scoring** with field-weighted search (name, description, integrations, categories, tags)
- **5 curated packs** — AI Agents, Marketing, Sales, Data, DevOps
- **Serverless API** on Vercel with CORS support and edge caching

## API

### Search workflows

```
GET /api/search?q=slack+notification&limit=10
```

**Response:**

```json
{
  "results": [
    {
      "score": 12.34,
      "name": "Slack Channel Notification on New Lead",
      "filename": "abc123_Slack_Notification.json",
      "complexity": 3.2,
      "node_count": 8,
      "categories": ["Communication & Messaging"],
      "integrations": ["slack", "webhook"],
      "description": "Sends a Slack message when a new lead arrives..."
    }
  ],
  "query": "slack notification"
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `q`       | —       | Search query (required) |
| `limit`   | `10`    | Max results (1–50) |

### Get workflow details

```
GET /api/workflow?filename=abc123_Slack_Notification.json
```

Returns the full workflow entry with metadata, descriptions, integrations, categories, and tags.

## Project Structure

```
deploy/
  api/
    search.js          Vercel serverless: TF-IDF search across 2,053 workflows
    workflow.js        Vercel serverless: get workflow details by filename
  data/
    workflow_index.json  2,053 workflow entries with metadata
  public/
    index.html         Storefront + live Workflow Finder
    404.html           Custom 404 page
  package.json
  vercel.json
```

## Local Development

```bash
npm install
vercel dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Frontend:** Vanilla HTML / CSS / JS
- **Backend:** Vercel Serverless Functions (Node.js 18+)
- **Search:** Custom TF-IDF engine with field-weighted scoring
- **Hosting:** Vercel

## License

MIT
