const path = require('path');
const fs = require('fs');

let workflows = null;

function loadWorkflows() {
  if (workflows) return;
  const indexPath = path.join(__dirname, '..', 'data', 'workflow_index.json');
  const raw = fs.readFileSync(indexPath, 'utf-8');
  workflows = JSON.parse(raw);
}

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  const filename = (req.query.filename || '').trim();
  if (!filename) {
    return res.status(400).json({ error: 'Missing ?filename= parameter' });
  }

  loadWorkflows();

  const wf = workflows.find(w => w.filename === filename);
  if (!wf) {
    return res.status(404).json({ error: 'Workflow not found' });
  }

  res.json(wf);
};
