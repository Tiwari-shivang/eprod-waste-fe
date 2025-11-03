import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { JobStatusArray, JobStatus } from '../types/api.types';

interface WebSocketHookOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  autoConnect?: boolean;
}

interface WebSocketHookReturn {
  jobs: JobStatusArray;
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  getJobById: (jobId: string) => JobStatus | undefined;
}

/**
 * WebSocket hook using STOMP protocol over SockJS
 * Connects to WebSocket server and subscribes to /topic/in-progress for real-time job updates
 */
export const useJobWebSocket = (
  options: WebSocketHookOptions = {}
): WebSocketHookReturn => {
  const {
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    autoConnect = true,
  } = options;

  const [jobs, setJobs] = useState<JobStatusArray>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (stompClientRef.current?.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    try {
      console.log('[WebSocket] Connecting to STOMP server at http://localhost:8080/ws');

      // Create STOMP client with SockJS
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws') as any,

        reconnectDelay: reconnectInterval,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame) => {
          console.log('[WebSocket] ✅ Connected to STOMP server', frame);
          setIsConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;

          // Subscribe to in-progress jobs topic
          subscriptionRef.current = client.subscribe('/topic/in-progress', (message) => {
            try {
              const jobsData = JSON.parse(message.body);
              console.log('[WebSocket] ✅ Received update:', jobsData.length, 'jobs');
              console.log('[WebSocket] Sample job progress:', jobsData[0]?.progress);

              // Update jobs state - this triggers React re-render
              setJobs(jobsData);
            } catch (err) {
              console.error('[WebSocket] Error parsing message:', err);
            }
          });

          console.log('[WebSocket] ✅ Subscribed to /topic/in-progress');
        },

        onStompError: (frame) => {
          console.error('[WebSocket] ❌ STOMP error:', frame.headers['message']);
          console.error('[WebSocket] Error details:', frame.body);
          setError(new Error(frame.headers['message'] || 'STOMP error'));
          setIsConnected(false);
        },

        onWebSocketClose: (event) => {
          console.log('[WebSocket] Connection closed:', event.code, event.reason);
          setIsConnected(false);

          // Attempt to reconnect
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(
              `[WebSocket] Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`
            );
          } else {
            setError(new Error('Max reconnection attempts reached'));
          }
        },

        onWebSocketError: (event) => {
          console.error('[WebSocket] ❌ WebSocket error:', event);
          setError(new Error('WebSocket connection error'));
        },

        debug: (str) => {
          // Optional: disable debug logs in production
          if (import.meta.env.DEV) {
            console.log('[STOMP Debug]', str);
          }
        },
      });

      stompClientRef.current = client;
      client.activate();

    } catch (err) {
      console.error('[WebSocket] Failed to create STOMP client:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (stompClientRef.current) {
      console.log('[WebSocket] Disconnecting...');
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }

    setIsConnected(false);
    setJobs([]);
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
  }, [maxReconnectAttempts]);

  const getJobById = useCallback(
    (jobId: string): JobStatus | undefined => {
      return jobs.find((job) => job.jobId === jobId);
    },
    [jobs]
  );

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    jobs,
    isConnected,
    error,
    connect,
    disconnect,
    getJobById,
  };
};
