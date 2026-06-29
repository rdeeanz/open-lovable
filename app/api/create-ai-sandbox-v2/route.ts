import { NextRequest, NextResponse } from 'next/server';
import { SandboxFactory } from '@/lib/sandbox/factory';
import type { SandboxState } from '@/types/sandbox';
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';

declare global {
  var activeSandboxProvider: any;
  var sandboxData: any;
  var existingFiles: Set<string>;
  var sandboxState: SandboxState;
}

async function reuseExistingSandbox() {
  const provider = sandboxManager.getActiveProvider() || global.activeSandboxProvider;
  if (!provider?.isAlive?.()) {
    return null;
  }

  const healthy = await provider.isDevServerHealthy?.().catch(() => false);
  if (!healthy) {
    return null;
  }

  const info = provider.getSandboxInfo?.();
  if (!info?.sandboxId || !info?.url) {
    return null;
  }

  console.log('[create-ai-sandbox-v2] Reusing existing sandbox:', info.sandboxId);

  return NextResponse.json({
    success: true,
    sandboxId: info.sandboxId,
    url: info.url,
    provider: info.provider,
    reused: true,
    message: 'Reusing existing sandbox',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const forceNew = body?.forceNew === true;

    if (!forceNew) {
      const reused = await reuseExistingSandbox();
      if (reused) {
        return reused;
      }
    }

    console.log('[create-ai-sandbox-v2] Creating sandbox...');

    console.log('[create-ai-sandbox-v2] Cleaning up existing sandboxes...');
    await sandboxManager.terminateAll();

    if (global.activeSandboxProvider) {
      try {
        await global.activeSandboxProvider.terminate();
      } catch (e) {
        console.error('Failed to terminate legacy global sandbox:', e);
      }
      global.activeSandboxProvider = null;
    }

    if (global.existingFiles) {
      global.existingFiles.clear();
    } else {
      global.existingFiles = new Set<string>();
    }

    const provider = SandboxFactory.create();
    const sandboxInfo = await provider.createSandbox();

    console.log('[create-ai-sandbox-v2] Setting up Vite React app...');
    await provider.setupViteApp();

    sandboxManager.registerSandbox(sandboxInfo.sandboxId, provider);

    global.activeSandboxProvider = provider;
    global.sandboxData = {
      sandboxId: sandboxInfo.sandboxId,
      url: sandboxInfo.url,
    };

    global.sandboxState = {
      fileCache: {
        files: {},
        lastSync: Date.now(),
        sandboxId: sandboxInfo.sandboxId,
      },
      sandbox: provider,
      sandboxData: {
        sandboxId: sandboxInfo.sandboxId,
        url: sandboxInfo.url,
      },
    };

    console.log('[create-ai-sandbox-v2] Sandbox ready at:', sandboxInfo.url);

    return NextResponse.json({
      success: true,
      sandboxId: sandboxInfo.sandboxId,
      url: sandboxInfo.url,
      provider: sandboxInfo.provider,
      message: 'Sandbox created and Vite React app initialized',
    });
  } catch (error) {
    console.error('[create-ai-sandbox-v2] Error:', error);

    await sandboxManager.terminateAll();
    if (global.activeSandboxProvider) {
      try {
        await global.activeSandboxProvider.terminate();
      } catch (e) {
        console.error('Failed to terminate sandbox on error:', e);
      }
      global.activeSandboxProvider = null;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create sandbox',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
