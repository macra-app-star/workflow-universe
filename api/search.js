const path = require('path');
const fs = require('fs');

// ── Inlined search engine ────────────────────────────────────────────────────

let workflows = [];
let idf = {};
let tfidfDocs = [];

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

const WEIGHTS = {
  name: 5,
  descriptions: 3,
  integrations: 2,
  categories: 1,
  tags: 1,
};

function buildIndex() {
  const indexPath = path.join(__dirname, '..', 'data', 'workflow_index.json');
  const raw = fs.readFileSync(indexPath, 'utf-8');
  workflows = JSON.parse(raw);

  const docCount = workflows.length;
  const df = {};

  tfidfDocs = workflows.map((wf) => {
    const fields = {
      name: tokenize(wf.name),
      descriptions: (wf.descriptions || []).flatMap(d => tokenize(d)),
      integrations: (wf.integrations || []).flatMap(ig => tokenize(ig)),
      categories: (wf.categories || []).flatMap(c => tokenize(c)),
      tags: (wf.tags || []).flatMap(t => tokenize(t)),
    };

    const tf = {};
    for (const [field, tokens] of Object.entries(fields)) {
      for (const token of tokens) {
        if (!tf[token]) tf[token] = { name: 0, descriptions: 0, integrations: 0, categories: 0, tags: 0 };
        tf[token][field]++;
      }
    }

    for (const token of Object.keys(tf)) {
      df[token] = (df[token] || 0) + 1;
    }

    return tf;
  });

  for (const [term, count] of Object.entries(df)) {
    idf[term] = Math.log(docCount / (1 + count));
  }
}

function search(query, limit = 10) {
  if (workflows.length === 0) buildIndex();

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const scores = [];

  for (let i = 0; i < workflows.length; i++) {
    const docTf = tfidfDocs[i];
    let score = 0;

    for (const qt of queryTokens) {
      if (!docTf[qt]) continue;
      const termIdf = idf[qt] || 0;

      for (const [field, weight] of Object.entries(WEIGHTS)) {
        const tf = docTf[qt][field] || 0;
        if (tf > 0) {
          score += weight * (1 + Math.log(tf)) * termIdf;
        }
      }
    }

    const matchedTerms = queryTokens.filter(qt => docTf[qt]).length;
    if (matchedTerms > 1) {
      score *= 1 + 0.3 * (matchedTerms / queryTokens.length);
    }

    if (score > 0) {
      scores.push({ index: i, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);

  return scores.slice(0, limit).map(({ index, score }) => {
    const wf = workflows[index];
    const descSnippet = (wf.descriptions && wf.descriptions.length > 0)
      ? wf.descriptions[0].substring(0, 150)
      : '(no description)';

    return {
      score: Math.round(score * 100) / 100,
      name: wf.name,
      filename: wf.filename,
      complexity: wf.complexity,
      node_count: wf.node_count,
      categories: wf.categories || [],
      integrations: wf.integrations || [],
      ai_models: wf.ai_models || [],
      triggers: wf.triggers || [],
      tags: wf.tags || [],
      description: descSnippet,
      descriptions: wf.descriptions || [],
    };
  });
}

// ── Serverless handler ───────────────────────────────────────────────────────

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const query = (req.query.q || '').trim();
  if (!query) return res.json({ results: [], query: '' });

  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const results = search(query, limit);
  res.json({ results, query });
};
