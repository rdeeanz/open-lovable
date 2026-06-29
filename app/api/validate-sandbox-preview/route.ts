import { NextRequest, NextResponse } from 'next/server';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';
import {
  validateBuild,
  classifyError,
  extractMissingPackages,
  type ErrorType,
} from '@/lib/build-validator';

declare global {
  // eslint-disable-next-line no-var
  var activeSandboxProvider: any;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const provider = sandboxManager.getActiveProvider() || global.activeSandboxProvider;

    let sandboxUrl: string | undefined = body.sandboxUrl;
    let sandboxId: string | undefined = body.sandboxId;

    if (provider?.getSandboxInfo) {
      const info = provider.getSandboxInfo();
      sandboxUrl = sandboxUrl || info?.url;
      sandboxId = sandboxId || info?.sandboxId;
    }

    if (!sandboxUrl) {
      return NextResponse.json({
        success: false,
        errors: ['Sandbox URL tidak tersedia'],
        errorType: 'sandbox-timeout' as ErrorType,
        missingPackages: [],
        isRendering: false,
      });
    }

    const healthy = await provider?.isDevServerHealthy?.().catch(() => false);
    const validation = await validateBuild(sandboxUrl, sandboxId || 'unknown');

    const errors = [...validation.errors];
    const missingPackages = new Set<string>();

    for (const pkg of extractMissingPackages({ message: errors.join('\n') })) {
      missingPackages.add(pkg);
    }

    if (provider && typeof provider.runCommand === 'function') {
      try {
        const logResult = await provider.runCommand(
          'grep -i "Failed to resolve import" /tmp/vite.log 2>/dev/null | tail -8 || true'
        );
        const logText = logResult.stdout || '';
        for (const pkg of extractMissingPackages({ message: logText })) {
          missingPackages.add(pkg);
        }
        if (logText.trim()) {
          errors.push(...logText.split('\n').filter(Boolean).slice(-3));
        }
      } catch {
        // ignore log read failures
      }
    }

    if (global.viteErrors?.length) {
      for (const err of global.viteErrors.slice(-5)) {
        if (err.message) errors.push(err.message);
        if (err.import) missingPackages.add(err.import);
        if (err.package) missingPackages.add(err.package);
      }
    }

    const uniqueErrors = [...new Set(errors.filter(Boolean))];
    const packages = [...missingPackages].map((pkg) =>
      pkg.startsWith('@') ? pkg.split('/').slice(0, 2).join('/') : pkg.split('/')[0]
    );
    const uniquePackages = [...new Set(packages)];

    const combinedMessage = uniqueErrors.join('\n');
    const errorType: ErrorType = validation.success
      ? uniquePackages.length > 0
        ? 'missing-package'
        : 'unknown'
      : classifyError({ message: combinedMessage });

    const success =
      validation.success &&
      validation.isRendering &&
      uniquePackages.length === 0;

    return NextResponse.json({
      success,
      errors: uniqueErrors,
      errorType,
      missingPackages: uniquePackages,
      isRendering: validation.isRendering,
      healthy: !!healthy,
      sandboxUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        errorType: 'unknown' as ErrorType,
        missingPackages: [],
        isRendering: false,
      },
      { status: 500 }
    );
  }
}
