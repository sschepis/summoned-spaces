/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WebSocket Helper Utilities
 * Reusable patterns for WebSocket message handling
 */

import type { WebSocketService } from '../websocket';
import type { ServerMessage } from '../../../server/protocol';

/**
 * Send a message and wait for a specific response type
 */
export function sendMessageWithResponse<T = any>(
  webSocketService: WebSocketService,
  message: any,
  expectedResponseKind: string,
  timeoutMs: number = 30000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      webSocketService.removeMessageListener(handleResponse);
      reject(new Error(`WebSocket request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    const handleResponse = (response: ServerMessage) => {
      if (response.kind === expectedResponseKind) {
        clearTimeout(timeout);
        webSocketService.removeMessageListener(handleResponse);
        resolve(response.payload as T);
      } else if (response.kind === 'error') {
        clearTimeout(timeout);
        webSocketService.removeMessageListener(handleResponse);
        reject(new Error(response.payload.message));
      }
    };

    webSocketService.addMessageListener(handleResponse);
    webSocketService.sendMessage(message);
  });
}

/**
 * Create a message handler with automatic cleanup
 */
export function createMessageHandler<T = any>(
  webSocketService: WebSocketService,
  expectedKind: string,
  onSuccess: (payload: T) => void,
  onError?: (error: Error) => void
): (message: ServerMessage) => void {
  const handler = (message: ServerMessage) => {
    if (message.kind === expectedKind) {
      webSocketService.removeMessageListener(handler);
      onSuccess(message.payload as T);
    } else if (message.kind === 'error') {
      webSocketService.removeMessageListener(handler);
      if (onError) {
        onError(new Error(message.payload.message));
      }
    }
  };

  return handler;
}

/**
 * Add timeout to any promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ]);
}

/**
 * Wait for WebSocket to be ready with timeout
 */
export async function waitForConnection(
  webSocketService: WebSocketService,
  timeoutMs: number = 10000
): Promise<void> {
  if (webSocketService.isReady()) {
    return Promise.resolve();
  }

  return withTimeout(
    webSocketService.waitForConnection(),
    timeoutMs,
    'WebSocket connection timeout'
  );
}

/**
 * Send message with automatic connection wait
 */
export async function sendMessageSafe(
  webSocketService: WebSocketService,
  message: any,
  ensureConnection: boolean = true
): Promise<void> {
  if (ensureConnection) {
    await waitForConnection(webSocketService);
  }

  if (!webSocketService.isReady()) {
    throw new Error('WebSocket not ready, cannot send message');
  }

  webSocketService.sendMessage(message);
}

/**
 * Request-response pattern with type safety
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface RequestResponseOptions<TRequest, TResponse> {
  webSocketService: WebSocketService;
  requestKind: string;
  responseKind: string;
  payload: TRequest;
  timeout?: number;
}

export async function requestResponse<TRequest = any, TResponse = any>(
  options: RequestResponseOptions<TRequest, TResponse>
): Promise<TResponse> {
  const {
    webSocketService,
    requestKind,
    responseKind,
    payload,
    timeout = 30000
  } = options;

  await waitForConnection(webSocketService);

  return sendMessageWithResponse<TResponse>(
    webSocketService,
    { kind: requestKind, payload },
    responseKind,
    timeout
  );
}

/**
 * Batch message sender with rate limiting
 */
export async function sendBatchMessages(
  webSocketService: WebSocketService,
  messages: any[],
  delayMs: number = 100
): Promise<void> {
  await waitForConnection(webSocketService);

  for (let i = 0; i < messages.length; i++) {
    webSocketService.sendMessage(messages[i]);
    
    // Add delay between messages except for the last one
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Create a disposable message listener
 */
export class DisposableListener {
  private listener: ((message: ServerMessage) => void) | null = null;

  constructor(
    private webSocketService: WebSocketService,
    listener: (message: ServerMessage) => void
  ) {
    this.listener = listener;
    webSocketService.addMessageListener(listener);
  }

  dispose(): void {
    if (this.listener) {
      this.webSocketService.removeMessageListener(this.listener);
      this.listener = null;
    }
  }
}

/**
 * Execute function with automatic listener cleanup
 */
export async function withListener<T>(
  webSocketService: WebSocketService,
  listener: (message: ServerMessage) => void,
  action: () => Promise<T>
): Promise<T> {
  const disposable = new DisposableListener(webSocketService, listener);
  
  try {
    return await action();
  } finally {
    disposable.dispose();
  }
}