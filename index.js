import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Data Store
let workflows = [
  {
    id: 'wf-1',
    name: 'Qualification & Scoring IA Instantané',
    category: 'Ingestion & Scoring',
    description: 'Analyse le profil, calcule un score de conversion sur 100 et segmente le lead.',
    enabled: true,
    trigger: 'Nouveau Lead Ingesté',
    steps: [
      'Normalisation et vérification syntaxique de l\'adresse email',
      'Calcul du Lead Score algorithmique basé sur le rôle et la société',
      'Attribution du niveau de qualification (A, B, C)'
    ],
    executionCount: 18
  },
  {
    id: 'wf-2',
    name: 'Enrichissement Société & Données B2B',
    category: 'Enrichissement',
    description: 'Extrait les métadonnées de l\'entreprise (effectif, secteur, technologies).',
    enabled: true,
    trigger: 'Lead Qualifié >= 50',
    steps: [
      'Recherche du domaine entreprise et détection du secteur',
      'Estimation de la taille d\'équipe et du CA potentiel',
      'Mise à jour des champs enrichis dans la fiche contact'
    ],
    executionCount: 14
  },
  {
    id: 'wf-3',
    name: 'Notification Multicanal & Alerte Commerciale',
    category: 'Alerte & Routing',
    description: 'Alerte l\'équipe commerciale dès qu\'un lead à forte valeur est détecté.',
    enabled: true,
    trigger: 'Score Lead >= 80',
    steps: [
      'Génération d\'un résumé exécutif du profil',
      'Envoi d\'une notification instantanée au responsable de compte',
      'Création de la tâche de suivi prioritaire sous 2h'
    ],
    executionCount: 12
  },
  {
    id: 'wf-4',
    name: 'Synchronisation CRM & Séquence d\'Accueil',
    category: 'Sync & Nurturing',
    description: 'Enregistre le contact dans le CRM et déclenche l\'email de bienvenue contextuel.',
    enabled: true,
    trigger: 'Enrichissement Terminé',
    steps: [
      'Création/Mise à jour de la fiche prospect dans le CRM cible',
      'Déclenchement du template d\'email personnalisé',
      'Journalisation de l\'historique d\'automatisation'
    ],
    executionCount: 16
  }
];

let leads = [
  {
    id: 'lead-1',
    fullName: 'Alexandre Mercier',
    email: 'a.mercier@novasolutions.com',
    company: 'Nova Solutions',
    role: 'Chief Technology Officer',
    source: 'Landing Page Form',
    score: 94,
    workflowStatus: 'completed',
    message: 'Recherche une solution automatisée pour connecter nos formulaires à notre stack interne.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'lead-2',
    fullName: 'Hélène Vasseur',
    email: 'h.vasseur@greenpulse.eco',
    company: 'GreenPulse Analytics',
    role: 'Head of Operations',
    source: 'LinkedIn Inbound',
    score: 86,
    workflowStatus: 'completed',
    message: 'Souhaite automatiser la qualification de 500+ leads entrants mensuels.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'lead-3',
    fullName: 'Maxime Roy',
    email: 'maxime@startflow.co',
    company: 'StartFlow Digital',
    role: 'Product Lead',
    source: 'Webinar Inscription',
    score: 68,
    workflowStatus: 'completed',
    message: 'Intéressé par le module de génération de workflow visuel.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

let logs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    level: 'SUCCESS',
    module: 'NEXUS-ENGINE',
    message: 'Workflow "Qualification & Scoring IA" exécuté pour Alexandre Mercier (Score: 94/100)'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    level: 'INFO',
    module: 'CRM-SYNC',
    message: 'Contact synchronisé vers CRM avec identifiant contact #NX-9428'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    level: 'SUCCESS',
    module: 'ENRICHMENT',
    message: 'Enrichissement domaine GreenPulse Analytics: secteur Cleantech, 45 collaborateurs'
  },
  {
    id: 'log-4',
    timestamp: new Date().toISOString(),
    level: 'INFO',
    module: 'CORE-SYSTEM',
    message: 'NEXUS Engine démarré et écoute sur le port 3000.'
  }
];

// Helper: Calculate Lead Score
function calculateScore(lead) {
  let score = 50;
  const role = (lead.role || '').toLowerCase();
  if (role.includes('chief') || role.includes('cto') || role.includes('ceo') || role.includes('vp') || role.includes('directeur') || role.includes('head')) {
    score += 30;
  } else if (role.includes('lead') || role.includes('manager') || role.includes('responsable')) {
    score += 20;
  } else if (role.length > 0) {
    score += 10;
  }

  if (lead.email && !lead.email.endsWith('@gmail.com') && !lead.email.endsWith('@yahoo.fr') && !lead.email.endsWith('@hotmail.com')) {
    score += 15;
  }

  if (lead.message && lead.message.length > 20) {
    score += 5;
  }

  return Math.min(100, Math.max(15, score));
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'NEXUS--ENGINE',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    workflowsActive: workflows.filter(w => w.enabled).length,
    totalLeads: leads.length
  });
});

app.get('/api/stats', (req, res) => {
  const totalExecs = workflows.reduce((acc, w) => acc + (w.executionCount || 0), 0);
  const avgScore = leads.length > 0 
    ? Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length) 
    : 0;

  res.json({
    totalLeads: leads.length,
    activeWorkflows: workflows.filter(w => w.enabled).length,
    totalExecutions: totalExecs,
    averageScore: avgScore
  });
});

app.get('/api/workflows', (req, res) => {
  res.json(workflows);
});

app.post('/api/workflows/:id/toggle', (req, res) => {
  const { id } = req.params;
  const wf = workflows.find(w => w.id === id);
  if (!wf) return res.status(404).json({ error: 'Workflow non trouvé' });
  wf.enabled = !wf.enabled;
  logs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    level: 'INFO',
    module: 'WORKFLOW-MANAGER',
    message: `Workflow "${wf.name}" ${wf.enabled ? 'activé' : 'désactivé'}`
  });
  res.json(wf);
});

app.get('/api/leads', (req, res) => {
  res.json(leads);
});

app.post('/api/leads', (req, res) => {
  const { fullName, email, company, role, source, message } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ error: 'Le nom et l\'email sont requis' });
  }

  const score = calculateScore({ fullName, email, company, role, message });
  const newLead = {
    id: 'lead-' + Date.now(),
    fullName,
    email,
    company: company || 'Indépendant',
    role: role || '',
    source: source || 'Direct API',
    score,
    workflowStatus: 'completed',
    message: message || '',
    createdAt: new Date().toISOString()
  };

  leads.unshift(newLead);

  // Trigger active workflows
  workflows.forEach(wf => {
    if (wf.enabled) {
      wf.executionCount = (wf.executionCount || 0) + 1;
    }
  });

  logs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    level: 'SUCCESS',
    module: 'LEAD-CAPTURE',
    message: `Nouveau lead capturé: ${fullName} (${company}) - Score calculé: ${score}/100`
  });

  res.status(201).json(newLead);
});

app.post('/api/leads/:id/retrigger', (req, res) => {
  const { id } = req.params;
  const lead = leads.find(l => l.id === id);
  if (!lead) return res.status(404).json({ error: 'Lead introuvable' });

  workflows.forEach(wf => {
    if (wf.enabled) {
      wf.executionCount = (wf.executionCount || 0) + 1;
    }
  });

  logs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    level: 'INFO',
    module: 'RETRIGGER',
    message: `Workflows relancés manuellement pour le lead ${lead.fullName}`
  });

  res.json({ success: true, lead });
});

app.get('/api/logs', (req, res) => {
  res.json(logs.slice(0, 50));
});

app.delete('/api/logs', (req, res) => {
  logs = [];
  res.json({ success: true });
});

app.post('/api/webhook/:workflowId', (req, res) => {
  const { workflowId } = req.params;
  const data = req.body || {};
  
  logs.unshift({
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    level: 'INFO',
    module: 'WEBHOOK-INBOUND',
    message: `Événement Webhook reçu pour le workflow [${workflowId}]`
  });

  res.json({
    status: 'received',
    workflowId,
    timestamp: new Date().toISOString()
  });
});

// Fallback for SPA routing
app.get('*all', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[NEXUS-ENGINE] Server running on http://0.0.0.0:${PORT}`);
});
