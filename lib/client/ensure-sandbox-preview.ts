export type PreviewRecoveryStatus = 'idle' | 'checking' | 'fixing' | 'ready' | 'failed';

export interface EnsureSandboxPreviewOptions {
  getSandboxUrl: () => string | undefined;
  refreshIframe: (url: string) => void;
  syncSandboxUrl?: () => Promise<string | undefined>;
  onStatus: (status: PreviewRecoveryStatus, message: string) => void;
  onLog?: (message: string) => void;
  maxAttempts?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attemptRecovery(
  validation: {
    missingPackages?: string[];
    errorType?: string;
    errors?: string[];
  },
  onLog?: (message: string) => void
): Promise<boolean> {
  let didSomething = false;
  const packages = validation.missingPackages || [];

  if (packages.length > 0) {
    onLog?.(`Memasang paket yang hilang: ${packages.join(', ')}`);
    try {
      const res = await fetch('/api/install-packages-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages }),
      });
      const data = await res.json();
      didSomething = didSomething || !!data.success;
    } catch (error) {
      onLog?.(
        `Gagal memasang paket: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }

  onLog?.('Merestart Vite dev server...');
  try {
    const res = await fetch('/api/restart-vite', { method: 'POST' });
    const data = await res.json();
    didSomething = didSomething || !!data.success;
  } catch (error) {
    onLog?.(
      `Gagal restart Vite: ${error instanceof Error ? error.message : 'unknown error'}`
    );
  }

  return didSomething;
}

export async function ensureSandboxPreviewReady(
  options: EnsureSandboxPreviewOptions
): Promise<{ success: boolean; errors?: string[]; sandboxUrl?: string }> {
  const maxAttempts = options.maxAttempts ?? 6;
  let lastErrors: string[] = [];
  let lastUrl: string | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    options.onStatus(
      'checking',
      `Memeriksa preview sandbox (${attempt}/${maxAttempts})...`
    );

    let sandboxUrl = options.getSandboxUrl();
    if (options.syncSandboxUrl) {
      sandboxUrl = (await options.syncSandboxUrl()) || sandboxUrl;
    }

    if (!sandboxUrl) {
      await sleep(2000);
      continue;
    }

    lastUrl = sandboxUrl;
    options.refreshIframe(sandboxUrl);
    await sleep(2500 + attempt * 700);

    try {
      const validateRes = await fetch('/api/validate-sandbox-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxUrl }),
      });
      const validation = await validateRes.json();

      if (validation.success) {
        options.refreshIframe(sandboxUrl);
        options.onStatus('ready', 'Preview sandbox siap ditampilkan');
        return { success: true, sandboxUrl };
      }

      lastErrors = validation.errors || [];
      options.onLog?.(
        `Preview belum siap: ${lastErrors.slice(0, 2).join(' | ') || validation.errorType || 'unknown'}`
      );

      options.onStatus(
        'fixing',
        `Memperbaiki preview sandbox (${attempt}/${maxAttempts})...`
      );

      await attemptRecovery(validation, options.onLog);
      await sleep(3500 + attempt * 500);
    } catch (error) {
      lastErrors = [error instanceof Error ? error.message : 'Validation request failed'];
      options.onLog?.(lastErrors[0]);
      await sleep(2000);
    }
  }

  options.onStatus(
    'failed',
    'Preview sandbox belum tampil sempurna. Coba refresh atau minta perbaikan di chat.'
  );
  return { success: false, errors: lastErrors, sandboxUrl: lastUrl };
}
