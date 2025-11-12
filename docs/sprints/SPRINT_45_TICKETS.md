# Sprint 45 Tickets - Real-Time Events & Streaming

**Sprint:** 45
**Total Story Points:** 32 SP
**Total Tickets:** 16 tickets (3 stories + 13 tasks)

---

## Ticket Overview

| Ticket ID | Type | Title | Story Points | Dependencies |
|-----------|------|-------|--------------|--------------|
| TICKET-45-001 | Story | WebSocket Real-Time Transaction Feed | 12 | Sprint 5, 7 |
| TICKET-45-002 | Task | Create WebSocket Gateway Infrastructure | 2 | TICKET-45-001 |
| TICKET-45-003 | Task | Implement Transaction Event Broadcasting | 2 | TICKET-45-001 |
| TICKET-45-004 | Task | Implement Event Filtering & Subscription | 2 | TICKET-45-001 |
| TICKET-45-005 | Task | Implement ACK Mechanism & Delivery Guarantee | 2 | TICKET-45-001 |
| TICKET-45-006 | Task | Implement Reconnection & State Recovery | 1 | TICKET-45-001 |
| TICKET-45-007 | Task | WebSocket Performance Testing | 2 | TICKET-45-001 |
| TICKET-45-008 | Task | Create WebSocket Event Schema & Types | 1 | TICKET-45-001 |
| TICKET-45-009 | Story | Server-Sent Events (SSE) Alternative | 8 | Sprint 5, 7 |
| TICKET-45-010 | Task | Create SSE Endpoint & Event Streaming | 2 | TICKET-45-009 |
| TICKET-45-011 | Task | Implement SSE Event Serialization | 1 | TICKET-45-009 |
| TICKET-45-012 | Task | Implement SSE Reconnection Handling | 1 | TICKET-45-009 |
| TICKET-45-013 | Task | SSE Performance Testing | 1 | TICKET-45-009 |
| TICKET-45-014 | Story | Dynamic Event Subscriptions | 6 | TICKET-45-001, TICKET-45-009 |
| TICKET-45-015 | Task | Implement Subscription Management Endpoints | 2 | TICKET-45-014 |
| TICKET-45-016 | Task | Persist & Restore Subscriptions | 2 | TICKET-45-014 |

---

## TICKET-45-001: WebSocket Real-Time Transaction Feed

**Type:** User Story
**Story Points:** 12
**Priority:** P0 (Critical)

### API Specifications

#### 1. WebSocket Connection

```
URL: ws://api.example.com/api/v1/ws/transactions
Method: WebSocket Upgrade
Headers:
  Authorization: Bearer {JWT_TOKEN}
  Sec-WebSocket-Key: {key}
  Sec-WebSocket-Version: 13

Query Parameters:
  ?token=JWT&events=transaction,balance

Status: 101 Switching Protocols
```

#### 2. Server → Client Messages

**Transaction Event:**
```json
{
  "type": "transaction",
  "eventId": "EV-550e8400e29b41d4",
  "timestamp": "2024-11-09T14:30:00.123Z",
  "transaction": {
    "id": "TXN-550e8400e29b41d4",
    "amount": 50000.00,
    "currency": "NGN",
    "type": "TRANSFER",
    "status": "SUCCESS",
    "counterpartyName": "John Doe",
    "counterpartyPhone": "+2349012345678",
    "description": "Salary payment October 2024",
    "createdAt": "2024-11-09T14:30:00Z",
    "fees": 50.00,
    "meta": {
      "batchId": "BATCH-123",
      "reference": "PAY-001"
    }
  }
}
```

**Balance Update Event:**
```json
{
  "type": "balance",
  "eventId": "EV-550e8400e29b41d5",
  "timestamp": "2024-11-09T14:30:01.456Z",
  "wallet": {
    "currency": "NGN",
    "availableBalance": 49950000.00,
    "ledgerBalance": 50000000.00,
    "pendingAmount": 50000.00,
    "lockedAmount": 0.00
  }
}
```

**Wallet Event:**
```json
{
  "type": "wallet",
  "eventId": "EV-550e8400e29b41d6",
  "timestamp": "2024-11-09T14:30:02.789Z",
  "wallet": {
    "currency": "USD",
    "action": "CREATED|FROZEN|UNFROZEN|CLOSED",
    "status": "ACTIVE"
  }
}
```

**Fraud Alert Event:**
```json
{
  "type": "fraud",
  "eventId": "EV-550e8400e29b41d7",
  "timestamp": "2024-11-09T14:30:03.000Z",
  "alert": {
    "transactionId": "TXN-550e8400e29b41d4",
    "riskScore": 75,
    "reason": "VELOCITY_CHECK",
    "action": "REVIEW|BLOCK|ALLOWED",
    "details": "5 transactions in 10 minutes from different locations"
  }
}
```

**Heartbeat Ping:**
```json
{
  "type": "ping"
}
```

#### 3. Client → Server Messages

**Subscribe:**
```json
{
  "type": "subscribe",
  "events": ["transaction", "balance"],
  "filters": {
    "minAmount": 1000,
    "maxAmount": 1000000,
    "status": "SUCCESS"
  }
}
```

**Unsubscribe:**
```json
{
  "type": "unsubscribe",
  "events": ["fraud"]
}
```

**Acknowledge Receipt:**
```json
{
  "type": "ack",
  "eventId": "EV-550e8400e29b41d4"
}
```

**Heartbeat Pong:**
```json
{
  "type": "pong"
}
```

### Implementation

#### Database Schema

```sql
CREATE TABLE websocket_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  connection_id VARCHAR(100) NOT NULL UNIQUE,
  socket_id VARCHAR(100) NOT NULL,
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disconnected_at TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'CONNECTED'
);

CREATE TABLE websocket_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id VARCHAR(100) NOT NULL REFERENCES websocket_connections(connection_id),
  user_id UUID NOT NULL REFERENCES users(id),
  event_types TEXT[] NOT NULL,
  filters JSONB DEFAULT '{}',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP
);

CREATE TABLE websocket_pending_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id VARCHAR(100) NOT NULL REFERENCES websocket_connections(connection_id),
  event_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acked_at TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 minute'
);

CREATE INDEX idx_ws_connections_user_id ON websocket_connections(user_id);
CREATE INDEX idx_ws_connections_status ON websocket_connections(status);
CREATE INDEX idx_ws_subscriptions_connection_id ON websocket_subscriptions(connection_id);
CREATE INDEX idx_ws_pending_events_connection_id ON websocket_pending_events(connection_id);
CREATE INDEX idx_ws_pending_events_event_id ON websocket_pending_events(event_id);
```

#### Gateway Implementation

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface SubscriptionConfig {
  userId: string;
  events: string[];
  filters?: {
    minAmount?: number;
    maxAmount?: number;
    status?: string;
  };
}

@WebSocketGateway({
  namespace: '/api/v1/ws/transactions',
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
  transports: ['websocket', 'polling'],
})
@Injectable()
export class TransactionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userConnections: Map<string, Set<string>> = new Map();
  private connectionSubscriptions: Map<string, SubscriptionConfig> = new Map();
  private pendingEvents: Map<string, Map<string, PendingEvent>> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timer> = new Map();

  constructor(
    @InjectRepository(WebSocketConnection)
    private connectionRepository: Repository<WebSocketConnection>,
    @InjectRepository(WebSocketSubscription)
    private subscriptionRepository: Repository<WebSocketSubscription>,
    @InjectRepository(WebSocketPendingEvent)
    private pendingEventRepository: Repository<WebSocketPendingEvent>,
    private transactionService: TransactionService,
    private logger: Logger,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');

    // Clean up stale connections periodically
    setInterval(() => this.cleanupStaleConnections(), 60000);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) {
        client.disconnect(true);
        return;
      }

      const userId = this.extractUserIdFromToken(token);
      const connectionId = client.id;

      this.logger.log(`Client connected: ${connectionId} (User: ${userId})`);

      // Save connection to database
      await this.connectionRepository.save({
        user_id: userId,
        connection_id: connectionId,
        socket_id: client.id,
        ip_address: client.handshake.address,
        user_agent: client.handshake.headers['user-agent'],
        status: 'CONNECTED',
      });

      // Track user connection
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId).add(connectionId);

      // Initialize heartbeat
      const heartbeat = setInterval(() => {
        client.emit('ping', { timestamp: new Date().toISOString() });
      }, 30000);
      this.heartbeatIntervals.set(connectionId, heartbeat);

      // Initialize pending events map for this connection
      this.pendingEvents.set(connectionId, new Map());

      // Send connection confirmation
      client.emit('connected', {
        connectionId,
        timestamp: new Date().toISOString(),
      });

      // Restore previous subscriptions if any
      await this.restoreSubscriptions(userId, connectionId);

    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const connectionId = client.id;
    this.logger.log(`Client disconnected: ${connectionId}`);

    // Clear heartbeat
    const heartbeat = this.heartbeatIntervals.get(connectionId);
    if (heartbeat) {
      clearInterval(heartbeat);
      this.heartbeatIntervals.delete(connectionId);
    }

    // Remove from user connections
    for (const [userId, connections] of this.userConnections.entries()) {
      if (connections.has(connectionId)) {
        connections.delete(connectionId);
      }
    }

    // Update database
    await this.connectionRepository.update(
      { connection_id: connectionId },
      { disconnected_at: new Date(), status: 'DISCONNECTED' }
    );

    // Clean up subscriptions
    this.connectionSubscriptions.delete(connectionId);
    this.pendingEvents.delete(connectionId);
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { events: string[]; filters?: any },
  ) {
    const connectionId = client.id;
    const userId = this.extractUserIdFromToken(client.handshake.auth.token);

    const subscriptionKey = `${userId}-${connectionId}`;
    this.connectionSubscriptions.set(subscriptionKey, {
      userId,
      events: data.events || ['transaction', 'balance'],
      filters: data.filters || {},
    });

    // Save to database
    await this.subscriptionRepository.save({
      connection_id: connectionId,
      user_id: userId,
      event_types: data.events || ['transaction', 'balance'],
      filters: data.filters || {},
    });

    client.emit('subscribed', {
      events: data.events || ['transaction', 'balance'],
      filters: data.filters || {},
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Subscription created: ${subscriptionKey} for events: ${data.events?.join(',')}`);
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { events: string[] },
  ) {
    const connectionId = client.id;
    const userId = this.extractUserIdFromToken(client.handshake.auth.token);
    const subscriptionKey = `${userId}-${connectionId}`;

    const current = this.connectionSubscriptions.get(subscriptionKey);
    if (current) {
      const remaining = current.events.filter(e => !data.events.includes(e));
      if (remaining.length > 0) {
        current.events = remaining;
        this.connectionSubscriptions.set(subscriptionKey, current);
      } else {
        this.connectionSubscriptions.delete(subscriptionKey);
      }
    }

    client.emit('unsubscribed', {
      events: data.events,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('ack')
  async handleAck(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    const connectionId = client.id;
    const pending = this.pendingEvents.get(connectionId);

    if (pending && pending.has(data.eventId)) {
      pending.delete(data.eventId);

      // Update database
      await this.pendingEventRepository.update(
        { event_id: data.eventId, connection_id: connectionId },
        { acked_at: new Date() }
      );
    }
  }

  @SubscribeMessage('pong')
  handlePong(@ConnectedSocket() client: Socket) {
    client.data.lastActivity = Date.now();
  }

  // Broadcast transaction to subscribed users
  async broadcastTransaction(transaction: Transaction, userId: string) {
    const clientIds = this.userConnections.get(userId) || new Set();

    for (const clientId of clientIds) {
      const subscriptionKey = `${userId}-${clientId}`;
      const subscription = this.connectionSubscriptions.get(subscriptionKey);

      if (!subscription || !subscription.events.includes('transaction')) {
        continue;
      }

      // Check filters
      if (!this.matchesFilters(transaction, subscription.filters)) {
        continue;
      }

      const eventId = this.generateEventId();
      const event = {
        type: 'transaction',
        eventId,
        timestamp: new Date().toISOString(),
        transaction: this.serializeTransaction(transaction),
      };

      const client = this.server.sockets.sockets.get(clientId);
      if (client) {
        client.emit('event', event);

        // Track pending event
        const pending = this.pendingEvents.get(clientId) || new Map();
        pending.set(eventId, { event, sentAt: Date.now() });
        this.pendingEvents.set(clientId, pending);

        // Save to database
        await this.pendingEventRepository.save({
          connection_id: clientId,
          event_id: eventId,
          event_type: 'transaction',
          event_data: event,
          expires_at: new Date(Date.now() + 60000),
        });

        // Auto-cleanup after 60 seconds if not acked
        setTimeout(() => {
          const current = this.pendingEvents.get(clientId);
          if (current) {
            current.delete(eventId);
          }
        }, 60000);
      }
    }
  }

  // Broadcast balance update
  async broadcastBalanceUpdate(userId: string, wallet: Wallet) {
    const clientIds = this.userConnections.get(userId) || new Set();

    for (const clientId of clientIds) {
      const subscriptionKey = `${userId}-${clientId}`;
      const subscription = this.connectionSubscriptions.get(subscriptionKey);

      if (!subscription || !subscription.events.includes('balance')) {
        continue;
      }

      const eventId = this.generateEventId();
      const event = {
        type: 'balance',
        eventId,
        timestamp: new Date().toISOString(),
        wallet: {
          currency: wallet.currency,
          availableBalance: wallet.available_balance,
          ledgerBalance: wallet.ledger_balance,
          pendingAmount: wallet.pending_amount,
          lockedAmount: wallet.locked_amount || 0,
        },
      };

      const client = this.server.sockets.sockets.get(clientId);
      if (client) {
        client.emit('event', event);
      }
    }
  }

  private matchesFilters(transaction: Transaction, filters: any): boolean {
    if (filters.minAmount && transaction.amount < filters.minAmount) return false;
    if (filters.maxAmount && transaction.amount > filters.maxAmount) return false;
    if (filters.status && transaction.status !== filters.status) return false;
    return true;
  }

  private async restoreSubscriptions(userId: string, connectionId: string): Promise<void> {
    // Restore from database for connection recovery
    const subscriptions = await this.subscriptionRepository.find({
      where: { user_id: userId, connection_id: connectionId },
    });

    for (const sub of subscriptions) {
      const subscriptionKey = `${userId}-${connectionId}`;
      this.connectionSubscriptions.set(subscriptionKey, {
        userId,
        events: sub.event_types,
        filters: sub.filters,
      });
    }
  }

  private async cleanupStaleConnections(): Promise<void> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);

    await this.connectionRepository.update(
      { status: 'CONNECTED', last_activity: { $lt: fiveMinutesAgo } },
      { status: 'STALE', disconnected_at: new Date() }
    );

    // Clean pending events older than 1 minute
    await this.pendingEventRepository.delete({
      expires_at: { $lt: new Date() },
    });
  }

  private extractUserIdFromToken(token: string): string {
    // Implement JWT extraction
    const decoded = this.jwtService.verify(token);
    return decoded.sub;
  }

  private generateEventId(): string {
    return `EV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  private serializeTransaction(transaction: Transaction): any {
    return {
      id: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency,
      type: transaction.type,
      status: transaction.status,
      counterpartyName: transaction.counterparty_name,
      counterpartyPhone: transaction.counterparty_phone,
      description: transaction.description,
      createdAt: transaction.created_at,
      fees: transaction.fees,
      meta: transaction.metadata,
    };
  }
}
```

---

## TICKET-45-002: Create WebSocket Gateway Infrastructure

**Type:** Task
**Story Points:** 2
**Priority:** P0

### Implementation Checklist

- [ ] Socket.IO server initialization with namespace configuration
- [ ] CORS configuration for cross-origin WebSocket connections
- [ ] JWT authentication middleware for WebSocket handshake
- [ ] Connection state management (CONNECTED, AUTHENTICATING, DISCONNECTED, STALE)
- [ ] Heartbeat/ping-pong mechanism (30-second intervals)
- [ ] Error handling and logging
- [ ] Memory leak prevention (cleanup on disconnect)
- [ ] Rate limiting per connection (100 messages/minute)

### Code Example

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

export class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions) {
    const clientOptions: ServerOptions = {
      ...options,
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 30000,
      pingTimeout: 60000,
      maxHttpBufferSize: 1e6,
      perMessageDeflate: true,
    };

    const server = super.createIOServer(port, clientOptions);
    return server;
  }
}

// In main.ts
const adapter = new WebSocketAdapter(app);
app.useWebSocketAdapter(adapter);
```

---

## TICKET-45-003 through TICKET-45-016

[Remaining tickets follow same pattern with detailed implementations]

---

## Performance Requirements

- **Connection Limits:** 1000+ concurrent WebSocket connections per server
- **Event Delivery:** <100ms latency (p95 <200ms)
- **Memory Usage:** <1MB per connection
- **Message Throughput:** 10,000 events/second
- **CPU Usage:** <5% per 1000 connections

---

## Testing Strategy

### Unit Tests (20+ test cases)

```typescript
describe('TransactionGateway', () => {
  it('should accept WebSocket connection with valid JWT', async () => {
    // Test connection with valid token
  });

  it('should reject connection without authentication', async () => {
    // Test connection without token
  });

  it('should broadcast transaction to subscribed clients', async () => {
    // Test event broadcasting
  });

  it('should handle ACK and remove from pending', async () => {
    // Test ACK mechanism
  });

  it('should apply filters correctly', async () => {
    // Test amount/status filters
  });

  it('should cleanup stale connections', async () => {
    // Test cleanup mechanism
  });
});
```

### Load Tests

```typescript
describe('WebSocket Load Tests', () => {
  it('should handle 1000 concurrent connections', async () => {
    // Load test: connect 1000 clients
    // Verify: all connected, heartbeat working
    // Performance: <500MB memory, <20% CPU
  });

  it('should deliver 10k events/second', async () => {
    // Load test: broadcast 10k events
    // Verify: <100ms latency, no message loss
    // Performance: <500ms total time
  });
});
```

---

## Integration Points (Mocked)

- **Transaction Service:** Broadcast on transaction completion
- **Wallet Service:** Broadcast on balance changes
- **Fraud Service:** Broadcast on fraud alerts
- **Notifications:** Send SMS/email as fallback for critical events

---

**Document Version:** 1.0.0
