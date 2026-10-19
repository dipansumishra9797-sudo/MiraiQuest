import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import webPush from 'web-push';
import { AppNotification } from '../src/types';

export interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  role?: string;
  campus?: string;
  year?: string;
  section?: string;
}

const connectedClients: Set<ConnectedClient> = new Set();
const pushSubscriptions: Map<string, any[]> = new Map();

// Configure or generate VAPID keys for Web Push Notifications
let vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  vapidKeys = webPush.generateVAPIDKeys();
  console.log('[Push Service] Generated ephemeral VAPID keys for Web Push Notifications:');
  console.log(`Public Key: ${vapidKeys.publicKey}`);
}

try {
  webPush.setVapidDetails(
    'mailto:notifications@miraiquest.msot.edu',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (e) {
  console.warn('[Push Service] VAPID initialization note:', e);
}

export function getVapidPublicKey(): string {
  return vapidKeys.publicKey;
}

export function savePushSubscription(userId: string, subscription: any) {
  if (!pushSubscriptions.has(userId)) {
    pushSubscriptions.set(userId, []);
  }
  const userSubs = pushSubscriptions.get(userId)!;
  // Prevent duplicate subscriptions
  const exists = userSubs.some((s) => s.endpoint === subscription.endpoint);
  if (!exists) {
    userSubs.push(subscription);
  }
  console.log(`[Push Service] Saved push subscription for user: ${userId}. Total: ${userSubs.length}`);
}

/**
 * Initialize WebSocket Server attached to main HTTP server
 */
export function initWebSocketServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws/notifications' });

  wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const userId = url.searchParams.get('userId') || undefined;
    const role = url.searchParams.get('role') || undefined;
    const campus = url.searchParams.get('campus') || undefined;
    const year = url.searchParams.get('year') || undefined;
    const section = url.searchParams.get('section') || undefined;

    const client: ConnectedClient = { ws, userId, role, campus, year, section };

    // Enforce student-only notification gateway
    if (role && role !== 'student') {
      console.log(`[WebSocket] Rejected non-student client (${role}): notifications are student-only.`);
      ws.close(1008, 'Notifications are enabled for student accounts only.');
      return;
    }

    connectedClients.add(client);

    console.log(`[WebSocket] Client connected: user=${userId}, role=${role}, campus=${campus}, section=${section}. Total clients: ${connectedClients.size}`);

    ws.send(
      JSON.stringify({
        type: 'connected',
        message: 'Real-time MiraiQuest notification gateway connected.',
        timestamp: new Date().toISOString(),
      })
    );

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch {}
    });

    ws.on('close', () => {
      connectedClients.delete(client);
      console.log(`[WebSocket] Client disconnected. Total active: ${connectedClients.size}`);
    });

    ws.on('error', (err) => {
      console.warn('[WebSocket] Client socket error:', err);
      connectedClients.delete(client);
    });
  });

  return wss;
}

/**
 * Broadcast notification strictly targeting recipients by Campus, Year, Section, and Role.
 */
export async function dispatchNotification(notification: AppNotification) {
  const payload = JSON.stringify({
    type: 'notification',
    data: notification,
  });

  let deliveredCount = 0;

  for (const client of connectedClients) {
    if (client.ws.readyState !== WebSocket.OPEN) continue;

    // Filter by User ID if direct notification
    if (notification.userId && client.userId && client.userId !== notification.userId) {
      continue;
    }

    // Filter by Role
    if (
      notification.targetRole &&
      notification.targetRole !== 'all' &&
      client.role &&
      client.role !== notification.targetRole
    ) {
      continue;
    }

    // Filter by Campus
    if (
      notification.targetCampus &&
      notification.targetCampus !== 'all' &&
      client.campus &&
      client.campus !== notification.targetCampus
    ) {
      continue;
    }

    // Filter by Year
    if (
      notification.targetYear &&
      notification.targetYear !== 'all' &&
      client.year &&
      client.year !== notification.targetYear
    ) {
      continue;
    }

    // Filter by Section
    if (
      notification.targetSection &&
      notification.targetSection !== 'all' &&
      client.section &&
      client.section !== notification.targetSection
    ) {
      continue;
    }

    try {
      client.ws.send(payload);
      deliveredCount++;
    } catch (e) {
      console.warn('[WebSocket] Send failed for client:', e);
    }
  }

  console.log(`[WebSocket] Dispatched notification "${notification.title}" to ${deliveredCount} live client(s).`);

  // Web Push delivery if student is subscribed
  if (notification.userId && pushSubscriptions.has(notification.userId)) {
    const subs = pushSubscriptions.get(notification.userId) || [];
    const pushPayload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: '/icon-192.png',
      data: { link: notification.link || '/' },
    });

    for (const sub of subs) {
      try {
        await webPush.sendNotification(sub, pushPayload);
      } catch (err: any) {
        console.warn(`[Push Service] Web push failed (code ${err.statusCode}) for user ${notification.userId}`);
      }
    }
  }
}
