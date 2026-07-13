import { loadContext } from './context-loader';

export type AiFinding = {
  category: string;
  severity: 'low' | 'medium' | 'high';
  summary: string;
};

// Cacher den samlede kontekst, så filerne ikke læses ved hvert kald.
// Sæt CONTEXT_CACHE=off for altid at genindlæse (nyttigt under udvikling).
let cachedContext: string | null = null;

async function getContext(): Promise<string> {
  if (cachedContext !== null && process.env.CONTEXT_CACHE !== 'off') {
    return cachedContext;
  }
  try {
    const { combined } = await loadContext();
    cachedContext = combined;
  } catch {
    cachedContext = '';
  }
  return cachedContext;
}


export type AiAnalysisResult = {
  findings: AiFinding[];
  confidence: number;
  requiresFollowUp: boolean;
  provider: 'heuristic' | 'ollama';
};

function heuristicAnalysis(text: string): AiAnalysisResult {
  const lower = text.toLowerCase();
  const findings: AiFinding[] = [];

  if (lower.includes('manglende begrundelse') || lower.includes('afvist')) {
    findings.push({
      category: 'manglende_begrundelse',
      severity: 'high',
      summary: 'Materialet indikerer mulig utilstrækkelig begrundelse eller afvisning uden fuld forklaring.',
    });
  }

  if (lower.includes('dokumentation') || lower.includes('læge') || lower.includes('laege')) {
    findings.push({
      category: 'utilstrækkelig_inddragelse_af_bevis',
      severity: 'medium',
      summary: 'Der er tegn på, at dokumentation eller lægeoplysninger ikke er behandlet tydeligt.',
    });
  }

  if (findings.length === 0) {
    findings.push({
      category: 'ingen_tydelige_indikatorer',
      severity: 'low',
      summary: 'Ingen tydelige fejlindikatorer fundet med den nuværende analyse.',
    });
  }

  return {
    findings,
    confidence: findings.some((f) => f.severity === 'high') ? 0.74 : 0.58,
    requiresFollowUp: findings.some((f) => f.severity !== 'low'),
    provider: 'heuristic',
  };
}

type OllamaResponse = {
  response?: string;
};

async function tryOllama(text: string): Promise<AiAnalysisResult> {
  const baseUrl = process.env.LOCAL_AI_BASE_URL ?? 'http://127.0.0.1:11434';
  const model = process.env.LOCAL_AI_MODEL ?? 'llama3.1:8b';
  const parsedBase = new URL(baseUrl);
  const isLocalHost =
    parsedBase.hostname === '127.0.0.1' ||
    parsedBase.hostname === 'localhost' ||
    parsedBase.hostname === '::1';

  if (!isLocalHost) {
    throw new Error('LOCAL_AI_BASE_URL skal pege på localhost/127.0.0.1 for lokal-only drift.');
  }

  const context = await getContext();

  const prompt = [
    'Du analyserer danske arbejdsskade-afgørelser.',
    ...(context
      ? [
          'Brug følgende faste kontekst (love, domme og praksis) som grundlag:',
          '"""',
          context.slice(0, 24000),
          '"""',
        ]
      : []),
    'Returner KUN gyldig JSON med formen:',
    '{"findings":[{"category":"...","severity":"low|medium|high","summary":"..."}],"confidence":0.0,"requiresFollowUp":true}',
    'Tekst til analyse:',
    text.slice(0, 12000),
  ].join('\n');


  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Lokal AI svarede med status ${response.status}`);
  }

  const data = (await response.json()) as OllamaResponse;
  if (!data.response) {
    throw new Error('Lokal AI returnerede ikke et svarfelt.');
  }

  const parsed = JSON.parse(data.response) as Partial<AiAnalysisResult>;
  const findings = Array.isArray(parsed.findings) ? parsed.findings : [];

  if (findings.length === 0) {
    throw new Error('Lokal AI returnerede ingen findings.');
  }

  return {
    findings: findings.map((f) => ({
      category: f.category ?? 'ukendt_kategori',
      severity: f.severity === 'high' || f.severity === 'medium' || f.severity === 'low' ? f.severity : 'low',
      summary: f.summary ?? 'Ingen opsummering.',
    })),
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.6,
    requiresFollowUp: typeof parsed.requiresFollowUp === 'boolean' ? parsed.requiresFollowUp : true,
    provider: 'ollama',
  };
}

export async function runAnalysis(text: string): Promise<AiAnalysisResult> {
  const provider = (process.env.AI_PROVIDER ?? 'heuristic').toLowerCase();

  if (provider === 'ollama' || provider === 'local') {
    try {
      return await tryOllama(text);
    } catch {
      return heuristicAnalysis(text);
    }
  }

  return heuristicAnalysis(text);
}
