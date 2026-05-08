'use client';

import React, { useState } from 'react';
import {
  Globe,
  Server,
  Cloud,
  Database,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Terminal,
  FileText,
  Shield,
  Zap,
  HardDrive,
  Rocket,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Platform Comparison ────────────────────────────────────────────

function PlatformComparison() {
  const platforms = [
    {
      name: 'Vercel',
      icon: <Globe className="h-6 w-6" />,
      color: 'from-black to-gray-800',
      badge: 'Recommended',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      features: [
        { label: 'Free Tier', value: 'Forever Free (Hobby)' },
        { label: 'Bandwidth', value: '100 GB/month' },
        { label: 'Build Minutes', value: '6,000 min/month' },
        { label: 'Serverless Functions', value: 'Unlimited (10s timeout)' },
        { label: 'SSL/HTTPS', value: 'Automatic' },
        { label: 'Custom Domain', value: 'Free' },
        { label: 'Edge Network', value: 'Global CDN' },
        { label: 'Downtime', value: '~99.99%' },
      ],
      pros: ['Best for Next.js (official)', 'Global CDN for fast loading', 'Automatic deployments from Git', 'Preview deployments for every PR', 'No cold starts'],
      cons: ['Requires cloud database (Turso)', 'Serverless (stateless)', 'Function size limits', '10s execution timeout'],
      dbRequirement: 'Turso (Cloud SQLite) — Free 9GB',
      difficulty: 'Medium',
    },
    {
      name: 'Render',
      icon: <Server className="h-6 w-6" />,
      color: 'from-blue-600 to-cyan-500',
      badge: 'Easiest',
      badgeColor: 'bg-blue-100 text-blue-800',
      features: [
        { label: 'Free Tier', value: 'Free Web Service' },
        { label: 'RAM', value: '512 MB' },
        { label: 'CPU', value: '0.1 vCPU' },
        { label: 'Disk', value: '100 MB persistent' },
        { label: 'SSL/HTTPS', value: 'Automatic' },
        { label: 'Custom Domain', value: 'Free' },
        { label: 'Docker Support', value: 'Yes' },
        { label: 'Downtime', value: 'Sleeps after 15 min' },
      ],
      pros: ['Keep SQLite as-is (no DB changes)', 'Easiest deployment (auto-detects)', 'Persistent disk storage', 'Docker support', 'Background workers available'],
      cons: ['Service sleeps after 15 min inactivity', 'Cold start ~30-50 seconds', 'Only 100 MB disk free', 'No global CDN'],
      dbRequirement: 'Built-in SQLite (no changes needed)',
      difficulty: 'Easy',
    },
    {
      name: 'Netlify',
      icon: <Cloud className="h-6 w-6" />,
      color: 'from-teal-500 to-emerald-500',
      badge: 'Alternative',
      badgeColor: 'bg-teal-100 text-teal-800',
      features: [
        { label: 'Free Tier', value: 'Starter (Free)' },
        { label: 'Bandwidth', value: '100 GB/month' },
        { label: 'Build Minutes', value: '300 min/month' },
        { label: 'Serverless Functions', value: '125K invocations/mo' },
        { label: 'SSL/HTTPS', value: 'Automatic' },
        { label: 'Custom Domain', value: 'Free' },
        { label: 'Edge Network', value: 'Global CDN' },
        { label: 'Downtime', value: '~99.99%' },
      ],
      pros: ['Great for Next.js', 'Global CDN', 'Form handling built-in', 'Split testing', 'Identity service'],
      cons: ['Requires cloud database (Turso)', '300 build minutes only', 'Function invocation limits', 'Less optimized for Next.js than Vercel'],
      dbRequirement: 'Turso (Cloud SQLite) — Free 9GB',
      difficulty: 'Medium',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {platforms.map((p) => (
        <Card key={p.name} className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color}`} />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${p.color} text-white`}>
                  {p.icon}
                </div>
                <CardTitle className="text-lg">{p.name}</CardTitle>
              </div>
              <Badge className={p.badgeColor}>{p.badge}</Badge>
            </div>
            <CardDescription>
              Difficulty: <strong>{p.difficulty}</strong> &bull; DB: <strong>{p.dbRequirement}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-1.5 text-sm">
              {p.features.map((f) => (
                <div key={f.label} className="flex justify-between">
                  <span className="text-muted-foreground">{f.label}</span>
                  <span className="font-medium text-right">{f.value}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-emerald-700">✅ Pros</p>
              {p.pros.map((pro) => (
                <p key={pro} className="text-xs text-muted-foreground">• {pro}</p>
              ))}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-amber-700">⚠️ Cons</p>
              {p.cons.map((con) => (
                <p key={con} className="text-xs text-muted-foreground">• {con}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Code Block with Copy ───────────────────────────────────────────

function CodeBlock({ code, title, language = 'bash' }: { code: string; title: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-gray-950 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-300">{title}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-500 border-gray-700">
            {language}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copy}
          className="h-6 px-2 text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Collapsible Step ───────────────────────────────────────────────

function Step({ number, title, children, isWarning = false }: { number: number; title: string; children: React.ReactNode; isWarning?: boolean }) {
  const [open, setOpen] = useState(true);

  return (
    <div className={`rounded-lg border ${isWarning ? 'border-amber-300 bg-amber-50/50' : 'border-gray-200'} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${isWarning ? 'bg-amber-500 text-white' : 'bg-[#C62729] text-white'}`}>
            {number}
          </span>
          <span className="font-semibold text-sm">{title}</span>
          {isWarning && <AlertTriangle className="h-4 w-4 text-amber-500" />}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 pt-1 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Vercel Deployment Guide ────────────────────────────────────────

function VercelGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <Info className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
        <div className="text-sm text-emerald-800">
          <strong>Vercel is the official Next.js platform</strong> — best performance, zero config, global CDN. You need Turso for the database (cloud SQLite, free 9GB).
        </div>
      </div>

      <Step number={1} title="Create a GitHub Repository">
        <p className="text-sm text-muted-foreground">Push your project to GitHub:</p>
        <CodeBlock
          title="Terminal"
          code={`# Initialize git (if not already)
git init
git add .
git commit -m "Library Management System - Initial Release"

# Create a GitHub repo at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/library-management.git
git branch -M main
git push -u origin main`}
        />
      </Step>

      <Step number={2} title="Create a Turso Database (Free Cloud SQLite)">
        <p className="text-sm text-muted-foreground">Install Turso CLI and create a database:</p>
        <CodeBlock
          title="Terminal"
          code={`# Install Turso CLI (requires macOS, Linux, or WSL)
curl -sSfL https://get.tur.so/install.sh | bash

# Login to Turso
turso auth login

# Create a database (free tier: 9GB storage, 500 databases)
turso db create library-db

# Get your database URL (save this!)
turso db show library-db --url
# Output: libsql://library-db-your-org.turso.io

# Create an auth token (save this!)
turso db tokens create library-db
# Output: eyJhbGciOi... (long token string)`}
        />
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">Keep both the URL and token safe — you&apos;ll need them for Vercel environment variables.</p>
        </div>
      </Step>

      <Step number={3} title="Deploy to Vercel">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium mb-1">Option A: Via Website (Easier)</p>
            <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
              <li>Go to <a href="https://vercel.com/signup" target="_blank" rel="noopener" className="text-[#C62729] hover:underline inline-flex items-center gap-1">vercel.com/signup <ExternalLink className="h-3 w-3" /></a> and sign up with GitHub</li>
              <li>Click &quot;Add New&quot; → &quot;Project&quot;</li>
              <li>Select your <strong>library-management</strong> repository</li>
              <li>Vercel auto-detects Next.js — keep default settings</li>
              <li>Under &quot;Environment Variables&quot;, add:</li>
            </ol>
          </div>
          <div className="bg-white border rounded-lg p-3 space-y-2 text-sm font-mono">
            <div className="flex gap-2"><span className="text-emerald-600 font-bold">DATABASE_URL</span><span>= libsql://library-db-your-org.turso.io</span></div>
            <div className="flex gap-2"><span className="text-emerald-600 font-bold">TURSO_AUTH_TOKEN</span><span>= your-turso-auth-token</span></div>
          </div>
          <p className="text-sm text-muted-foreground ml-4">6. Click &quot;Deploy&quot; — done in ~2 minutes!</p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium mb-1">Option B: Via CLI</p>
          <CodeBlock
            title="Terminal"
            code={`# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Add environment variables
vercel env add DATABASE_URL
# Paste: libsql://library-db-your-org.turso.io

vercel env add TURSO_AUTH_TOKEN
# Paste: your-turso-auth-token

# Redeploy with new env vars
vercel --prod`}
          />
        </div>
      </Step>

      <Step number={4} title="Setup Database (Run Once)">
        <p className="text-sm text-muted-foreground">After deployment, initialize the database schema:</p>
        <CodeBlock
          title="Terminal"
          code={`# Option A: Run seed via Vercel CLI (recommended)
# This creates tables + default admin user + sample data
vercel env add DATABASE_URL
vercel env add TURSO_AUTH_TOKEN

# SSH into the server and run prisma
npx prisma db push
npx prisma db seed

# Option B: Use Turso CLI directly
turso db shell library-db
# Then paste SQL commands to create tables (see schema)`}
        />
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Default Admin Login:</strong> Username: <code className="bg-amber-100 px-1 rounded">admin</code> | Password: <code className="bg-amber-100 px-1 rounded">admin123</code> — Change this immediately after first login!
          </p>
        </div>
      </Step>

      <Step number={5} title="Custom Domain (Optional)" isWarning>
        <p className="text-sm text-muted-foreground">
          In your Vercel dashboard → Settings → Domains → Add your custom domain. Vercel provides free SSL automatically.
        </p>
      </Step>

      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-sm text-emerald-800">Deployment Complete!</span>
        </div>
        <p className="text-sm text-emerald-700">
          Your library is live at <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono text-xs">https://your-app.vercel.app</code>
        </p>
        <p className="text-xs text-emerald-600 mt-1">Every push to <code>main</code> branch auto-deploys. Use Vercel dashboard to manage environment variables.</p>
      </div>
    </div>
  );
}

// ─── Render Deployment Guide ────────────────────────────────────────

function RenderGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Render is the easiest option</strong> — keeps your existing SQLite database, auto-detects Next.js, and requires minimal configuration. Service sleeps after 15 min inactivity.
        </div>
      </div>

      <Step number={1} title="Create a GitHub Repository">
        <CodeBlock
          title="Terminal"
          code={`git init
git add .
git commit -m "Library Management System"

# Create repo at https://github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/library-management.git
git branch -M main
git push -u origin main`}
        />
      </Step>

      <Step number={2} title="Deploy to Render">
        <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
          <li>Go to <a href="https://render.com/signup" target="_blank" rel="noopener" className="text-[#C62729] hover:underline inline-flex items-center gap-1">render.com/signup <ExternalLink className="h-3 w-3" /></a> and sign up with GitHub</li>
          <li>Click <strong>&quot;New&quot;</strong> → <strong>&quot;Web Service&quot;</strong></li>
          <li>Connect your <strong>library-management</strong> repository</li>
          <li>Render auto-detects Next.js — keep defaults</li>
          <li>Under <strong>Build Command</strong>, enter:
            <code className="block mt-1 bg-gray-950 text-gray-300 p-2 rounded text-xs">
              npx prisma generate && npx prisma db push && npm run build
            </code>
          </li>
          <li>Under <strong>Start Command</strong>, enter:
            <code className="block mt-1 bg-gray-950 text-gray-300 p-2 rounded text-xs">
              npm start
            </code>
          </li>
          <li>Choose <strong>Free</strong> plan</li>
          <li>Click <strong>&quot;Advanced&quot;</strong> → Add environment variable:
            <code className="block mt-1 bg-gray-950 text-gray-300 p-2 rounded text-xs">
              DATABASE_URL = file:./db/custom.db
            </code>
          </li>
          <li>Click <strong>&quot;Create Web Service&quot;</strong></li>
        </ol>
      </Step>

      <Step number={3} title="Seed the Database">
        <p className="text-sm text-muted-foreground">After first deployment, go to Render Dashboard → your service → &quot;Shell&quot; and run:</p>
        <CodeBlock
          title="Render Shell"
          code={`npx prisma db seed
# You should see: "Seed completed successfully!"
# Admin: admin | Password: admin123`}
        />
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> On Render free tier, the database resets if the service is rebuilt. Use Render&apos;s &quot;Disk&quot; feature (100MB free) to persist the SQLite file. Go to your service → Settings → Add Disk → Path: <code>/opt/render/project/src/db</code>
          </p>
        </div>
      </Step>

      <Step number={4} title="Custom Domain (Optional)">
        <p className="text-sm text-muted-foreground">
          Render Dashboard → your service → Settings → Custom Domain. Render provides free SSL. Or use the default: <code className="bg-gray-100 px-1 rounded text-xs">https://library-management.onrender.com</code>
        </p>
      </Step>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-sm text-blue-800">Deployment Complete!</span>
        </div>
        <p className="text-sm text-blue-700">
          Your library is live at <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">https://your-service.onrender.com</code>
        </p>
        <p className="text-xs text-blue-600 mt-1">First visit after sleep may take ~30 seconds (cold start). Auto-deploys on every push to main branch.</p>
      </div>
    </div>
  );
}

// ─── Netlify Deployment Guide ───────────────────────────────────────

function NetlifyGuide() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
        <Info className="h-5 w-5 text-teal-600 mt-0.5 shrink-0" />
        <div className="text-sm text-teal-800">
          <strong>Netlify is a great alternative</strong> with global CDN and built-in form handling. Requires Turso for database (same as Vercel).
        </div>
      </div>

      <Step number={1} title="Create a GitHub Repository">
        <CodeBlock
          title="Terminal"
          code={`git init
git add .
git commit -m "Library Management System"

# Create repo at https://github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/library-management.git
git branch -M main
git push -u origin main`}
        />
      </Step>

      <Step number={2} title="Create a Turso Database (Same as Vercel)">
        <CodeBlock
          title="Terminal"
          code={`# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
turso db create library-db
turso db show library-db --url    # Save the URL
turso db tokens create library-db  # Save the token`}
        />
      </Step>

      <Step number={3} title="Deploy to Netlify">
        <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
          <li>Go to <a href="https://app.netlify.com/signup" target="_blank" rel="noopener" className="text-[#C62729] hover:underline inline-flex items-center gap-1">app.netlify.com/signup <ExternalLink className="h-3 w-3" /></a> and sign up with GitHub</li>
          <li>Click <strong>&quot;Add new site&quot;</strong> → <strong>&quot;Import an existing project&quot;</strong></li>
          <li>Connect your GitHub repository</li>
          <li>Build settings:
            <ul className="ml-4 mt-1 space-y-1 list-disc">
              <li><strong>Build command:</strong> <code className="bg-gray-950 text-gray-300 px-1.5 py-0.5 rounded text-xs">npx prisma generate && npx prisma db push && npx next build</code></li>
              <li><strong>Publish directory:</strong> <code className="bg-gray-950 text-gray-300 px-1.5 py-0.5 rounded text-xs">.next</code></li>
            </ul>
          </li>
          <li>Click <strong>&quot;Site settings&quot;</strong> → <strong>&quot;Environment variables&quot;</strong> → Add:</li>
        </ol>
        <div className="bg-white border rounded-lg p-3 space-y-2 text-sm font-mono mt-2">
          <div className="flex gap-2"><span className="text-emerald-600 font-bold">DATABASE_URL</span><span>= libsql://library-db-your-org.turso.io</span></div>
          <div className="flex gap-2"><span className="text-emerald-600 font-bold">TURSO_AUTH_TOKEN</span><span>= your-turso-auth-token</span></div>
        </div>
        <p className="text-sm text-muted-foreground ml-4 mt-2">5. Click <strong>&quot;Deploy site&quot;</strong></p>
      </Step>

      <Step number={4} title="Seed the Database">
        <p className="text-sm text-muted-foreground">Use Netlify CLI to run the seed:</p>
        <CodeBlock
          title="Terminal"
          code={`# Install Netlify CLI
npm i -g netlify-cli
netlify login

# Connect to your site
netlify link

# Open a shell in your deployed environment
# Run the seed via a one-time function or locally with remote DB:
DATABASE_URL="libsql://library-db-your-org.turso.io" \\
TURSO_AUTH_TOKEN="your-token" \\
npx prisma db push
DATABASE_URL="libsql://library-db-your-org.turso.io" \\
TURSO_AUTH_TOKEN="your-token" \\
npx prisma db seed`}
        />
      </Step>

      <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
          <span className="font-semibold text-sm text-teal-800">Deployment Complete!</span>
        </div>
        <p className="text-sm text-teal-700">
          Your library is live at <code className="bg-teal-100 px-1.5 py-0.5 rounded font-mono text-xs">https://your-app.netlify.app</code>
        </p>
      </div>
    </div>
  );
}

// ─── Pre-Deployment Checklist ───────────────────────────────────────

function PreDeploymentChecklist() {
  const checks = [
    { label: 'Push code to GitHub', desc: 'Create a public or private repository' },
    { label: 'Fix environment variables', desc: 'Set DATABASE_URL, TURSO_AUTH_TOKEN (if using Vercel/Netlify)' },
    { label: 'Test build locally', desc: 'Run "npm run build" to ensure no errors' },
    { label: 'Seed database after deploy', desc: 'Run "npx prisma db push" + "npx prisma db seed" on deployed server' },
    { label: 'Change default admin password', desc: 'Default: admin / admin123 — change immediately!' },
    { label: 'Set up custom domain (optional)', desc: 'Point your domain DNS to the platform' },
    { label: 'Test all features after deploy', desc: 'Login, add books, test catalog search, member registration' },
    { label: 'Enable auto-deploy (Git integration)', desc: 'Connect platform to GitHub repo for auto-deploys' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Rocket className="h-5 w-5 text-[#C62729]" />
          Pre-Deployment Checklist
        </CardTitle>
        <CardDescription>Complete these steps before going live</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checks.map((check, i) => (
            <label key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300 text-[#C62729] accent-[#C62729]" />
              <div>
                <p className="text-sm font-medium">{check.label}</p>
                <p className="text-xs text-muted-foreground">{check.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Quick Commands Reference ───────────────────────────────────────

function QuickCommands() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Terminal className="h-5 w-5 text-[#C62729]" />
          Quick Commands Reference
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CodeBlock
          title="Prisma: Generate client"
          code="npx prisma generate"
        />
        <CodeBlock
          title="Prisma: Push schema to database"
          code="npx prisma db push"
        />
        <CodeBlock
          title="Prisma: Seed database with defaults"
          code="npx prisma db seed"
        />
        <CodeBlock
          title="Build for production"
          code="npm run build"
        />
        <CodeBlock
          title="Start production server"
          code="npm start"
        />
        <CodeBlock
          title="Turso: Create database"
          code={`turso db create library-db\nturso db show library-db --url\nturso db tokens create library-db`}
        />
        <CodeBlock
          title="Generate a random secret"
          code="openssl rand -base64 32"
        />
      </CardContent>
    </Card>
  );
}

// ─── File Structure Reference ───────────────────────────────────────

function FileStructure() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-[#C62729]" />
          Project Files for Deployment
        </CardTitle>
        <CardDescription>Key files you need to know about</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {[
            { file: '.env.example', desc: 'Template for environment variables — copy to .env and fill in values' },
            { file: 'vercel.json', desc: 'Vercel deployment configuration (auto-build with Prisma)' },
            { file: 'render.yaml', desc: 'Render deployment configuration (auto-detected)' },
            { file: 'netlify.toml', desc: 'Netlify deployment configuration' },
            { file: 'prisma/schema.prisma', desc: 'Database schema — 13 tables for the library system' },
            { file: 'prisma/seed.ts', desc: 'Default data: admin user, categories, authors, settings' },
            { file: 'next.config.ts', desc: 'Next.js config — standalone output for deployment' },
            { file: 'package.json', desc: 'Dependencies and build scripts' },
          ].map((item) => (
            <div key={item.file} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono font-bold whitespace-nowrap">{item.file}</code>
              <span className="text-muted-foreground">{item.desc}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────

export default function DeployGuidePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-[#C62729] to-[#9B1F21] text-white">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#161922]">Deploy Your Library</h1>
            <p className="text-sm text-muted-foreground">
              Free lifetime deployment to production — choose your platform
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Zap className="h-5 w-5" />, label: 'Free Forever', desc: 'No credit card needed', color: 'text-emerald-600 bg-emerald-50' },
          { icon: <HardDrive className="h-5 w-5" />, label: 'Database', desc: 'SQLite or Cloud', color: 'text-blue-600 bg-blue-50' },
          { icon: <Shield className="h-5 w-5" />, label: 'HTTPS/SSL', desc: 'Automatic & free', color: 'text-purple-600 bg-purple-50' },
          { icon: <Globe className="h-5 w-5" />, label: 'Custom Domain', desc: 'Free on all platforms', color: 'text-orange-600 bg-orange-50' },
        ].map((stat) => (
          <Card key={stat.label} className="border-dashed">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-sm font-semibold">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Comparison */}
      <div>
        <h2 className="text-lg font-bold text-[#161922] mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-[#C62729]" />
          Platform Comparison
        </h2>
        <PlatformComparison />
      </div>

      {/* Step-by-Step Guides */}
      <div>
        <h2 className="text-lg font-bold text-[#161922] mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#C62729]" />
          Step-by-Step Deployment Guides
        </h2>
        <Tabs defaultValue="vercel" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="vercel" className="cursor-pointer">
              <Globe className="h-4 w-4 mr-2" />
              Vercel (Recommended)
            </TabsTrigger>
            <TabsTrigger value="render" className="cursor-pointer">
              <Server className="h-4 w-4 mr-2" />
              Render (Easiest)
            </TabsTrigger>
            <TabsTrigger value="netlify" className="cursor-pointer">
              <Cloud className="h-4 w-4 mr-2" />
              Netlify (Alternative)
            </TabsTrigger>
          </TabsList>
          <TabsContent value="vercel"><VercelGuide /></TabsContent>
          <TabsContent value="render"><RenderGuide /></TabsContent>
          <TabsContent value="netlify"><NetlifyGuide /></TabsContent>
        </Tabs>
      </div>

      {/* Bottom Reference Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <PreDeploymentChecklist />
        <QuickCommands />
        <FileStructure />
      </div>
    </div>
  );
}
