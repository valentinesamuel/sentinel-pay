# Sprint 45 Backlog - Real-Time Events & Streaming

**Sprint:** Sprint 45
**Duration:** 2 weeks (Week 90-91)
**Sprint Goal:** Enable real-time transaction feeds, live notifications, and event streaming for dashboards and integrations
**Story Points Committed:** 32
**Team Capacity:** 32 SP

---

## Sprint Planning Summary

**Sprint Goal:**
By the end of Sprint 45, we will have:
1. WebSocket endpoint for live transaction feed
2. Server-Sent Events (SSE) alternative for real-time updates
3. Event subscription management system
4. Real-time balance updates across devices
5. Live wallet status notifications
6. Event delivery with at-least-once guarantee
7. Backward compatibility with polling APIs

**Definition of Done:**
- [ ] All user stories completed
- [ ] WebSocket server tested with 1000+ concurrent connections
- [ ] SSE tested for reliability and message ordering
- [ ] Performance tests: <100ms latency for event delivery
- [ ] Mock services with realistic connection patterns
- [ ] API documentation with client library examples
- [ ] Code reviewed and merged

---

## Sprint Backlog Items

---

# EPIC-22: Real-Time Events & Streaming

## FEATURE-45.1: WebSocket Real-Time Transaction Feed

### 📘 User Story: US-45.1.1 - Live Transaction Stream via WebSocket (12 SP)

**Story Points:** 12
**Priority:** P0 (Critical)
**Status:** 🔄 Not Started

---

#### User Story

```
As a user/merchant
I want to receive real-time transaction updates via WebSocket
So that dashboards can display live transaction feeds without polling and users get instant notifications
```

---

#### Business Value

**Value Statement:**
Real-time transaction updates enable live dashboards, instant notifications, and better user experience. Instead of polling every 5-10 seconds, dashboards receive updates instantly when transactions occur.

**Impact:**
- **User Experience:** Instant updates without page refresh
- **Server Load:** Reduce polling from 10k requests/minute to <100 WebSocket connections
- **Dashboard Responsiveness:** <100ms latency for event delivery

**Success Criteria:**
- Support 1000+ concurrent WebSocket connections
- Event delivery latency: <100ms
- 99.9% message delivery guarantee
- Reconnection handling with state recovery

---

#### Acceptance Criteria

**Functional - Connection Management:**
- [ ] **AC1:** Accept WebSocket connection at `ws://api.example.com/api/v1/ws/transactions`
- [ ] **AC2:** Require JWT token for WebSocket authentication
- [ ] **AC3:** Support connection with query parameters: `?token=JWT&events=transaction,balance`
- [ ] **AC4:** Send heartbeat ping every 30 seconds to detect dead connections
- [ ] **AC5:** Implement exponential backoff reconnection (1s, 2s, 4s, 8s, 16s, 32s)
- [ ] **AC6:** Support graceful connection close with code 1000
- [ ] **AC7:** Auto-reconnect on network failures with state recovery
- [ ] **AC8:** Track connection lifecycle: connected, authenticated, subscribed, disconnected

**Functional - Event Streaming:**
- [ ] **AC9:** Stream real-time transaction events: PENDING, SUCCESS, FAILED, REVERSED
- [ ] **AC10:** Include transaction details: ID, amount, currency, counterparty, timestamp, status
- [ ] **AC11:** Stream balance updates: available, ledger, pending amounts
- [ ] **AC12:** Stream wallet events: created, frozen, unfrozen
- [ ] **AC13:** Support selective subscription: `?events=transaction,balance` (only subscribed events)
- [ ] **AC14:** Assign unique event ID for deduplication on client
- [ ] **AC15:** Include event timestamp in ISO 8601 format

**Functional - Event Ordering & Delivery:**
- [ ] **AC16:** Guarantee message ordering: events delivered in chronological order
- [ ] **AC17:** Implement at-least-once delivery: client must ACK events
- [ ] **AC18:** Queue unACKed events up to 1 minute
- [ ] **AC19:** Support `ack` message: `{ "type": "ack", "eventId": "EV-123" }`
- [ ] **AC20:** Timeout client if no ACK within 30 seconds (disconnect/reconnect)
- [ ] **AC21:** Track unACKed events for re-delivery on reconnection

**Functional - Filtering & Subscription:**
- [ ] **AC22:** Support event type filtering: transaction, balance, wallet, fraud
- [ ] **AC23:** Support amount filtering: `?minAmount=1000&maxAmount=100000`
- [ ] **AC24:** Support status filtering: pending, success, failed
- [ ] **AC25:** Allow dynamic subscription changes via `subscribe`/`unsubscribe` messages
- [ ] **AC26:** Limit concurrent subscriptions to prevent abuse

**Non-Functional:**
- [ ] **AC27:** Support 1000+ concurrent WebSocket connections per server
- [ ] **AC28:** Event delivery latency: <100ms (p95 <200ms)
- [ ] **AC29:** Memory usage: <1MB per connection
- [ ] **AC30:** CPU usage: <5% per 1000 connections
- [ ] **AC31:** Message size: <1KB per event
- [ ] **AC32:** Connection timeout: 5 minutes idle

---

#### Technical Specifications

**WebSocket Message Format:**

```typescript
// Client: Subscribe to events
{
  "type": "subscribe",
  "events": ["transaction", "balance"],
  "filters": {
    "minAmount": 1000,
    "maxAmount": 100000,
    "status": "success"
  }
}

// Server: Transaction Event
{
  "type": "transaction",
  "eventId": "EV-550e8400e29b41d4",
  "timestamp": "2024-11-09T14:30:00Z",
  "transaction": {
    "id": "TXN-550e8400e29b41d4",
    "amount": 50000,
    "currency": "NGN",
    "type": "TRANSFER",
    "status": "SUCCESS",
    "counterparty": "john@example.com",
    "description": "Salary payment",
    "createdAt": "2024-11-09T14:30:00Z"
  }
}

// Server: Balance Update Event
{
  "type": "balance",
  "eventId": "EV-550e8400e29b41d5",
  "timestamp": "2024-11-09T14:30:01Z",
  "wallet": {
    "currency": "NGN",
    "availableBalance": 49950000,
    "ledgerBalance": 50000000,
    "pendingAmount": 50000
  }
}

// Client: Acknowledge receipt
{
  "type": "ack",
  "eventId": "EV-550e8400e29b41d4"
}

// Server: Heartbeat ping
{
  "type": "ping"
}

// Client: Heartbeat pong
{
  "type": "pong"
}
```

**WebSocket Server Implementation:**

```typescript
@WebSocketGateway({
  namespace: '/api/v1/ws/transactions',
  cors: { origin: process.env.ALLOWED_ORIGINS },
})
export class TransactionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userConnections: Map<string, Set<string>> = new Map();
  private connectionSubscriptions: Map<string, SubscriptionConfig> = new Map();
  private unackedEvents: Map<string, PendingEvent[]> = new Map();

  constructor(
    private transactionService: TransactionService,
    private walletService: WalletService,
  ) {}

  @SubscribeMessage('subscribe')
  async handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SubscriptionMessage,
  ) {
    const userId = this.extractUserIdFromToken(client.handshake.auth.token);
    const subscriptionId = `${userId}-${client.id}`;

    this.connectionSubscriptions.set(subscriptionId, {
      userId,
      events: data.events || ['transaction', 'balance'],
      filters: data.filters || {},
    });

    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId).add(client.id);

    client.emit('subscribed', {
      events: data.events,
      filters: data.filters,
    });
  }

  @SubscribeMessage('ack')
  handleAck(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { eventId: string },
  ) {
    const unacked = this.unackedEvents.get(client.id) || [];
    const eventIndex = unacked.findIndex(e => e.eventId === data.eventId);

    if (eventIndex !== -1) {
      unacked.splice(eventIndex, 1);
      this.unackedEvents.set(client.id, unacked);
    }
  }

  @SubscribeMessage('pong')
  handlePong(@ConnectedSocket() client: Socket) {
    // Reset idle timeout
    client.data.lastActivity = Date.now();
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.data.lastActivity = Date.now();

    // Start heartbeat
    client.data.heartbeat = setInterval(() => {
      client.emit('ping');
    }, 30000);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    clearInterval(client.data.heartbeat);

    // Clean up
    this.connectionSubscriptions.delete(client.id);
    this.unackedEvents.delete(client.id);
  }

  // Internal method to broadcast transaction
  async broadcastTransaction(transaction: Transaction, userId: string) {
    const clientIds = this.userConnections.get(userId) || new Set();

    for (const clientId of clientIds) {
      const subscription = this.connectionSubscriptions.get(
        `${userId}-${clientId}`,
      );
      if (!subscription || !subscription.events.includes('transaction')) continue;

      // Check filters
      if (!this.matchesFilters(transaction, subscription.filters)) continue;

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

        // Track unacked events
        const unacked = this.unackedEvents.get(clientId) || [];
        unacked.push({ eventId, event, timestamp: Date.now() });
        this.unackedEvents.set(clientId, unacked);

        // Remove after 60 seconds if not acked
        setTimeout(() => {
          const current = this.unackedEvents.get(clientId) || [];
          const filtered = current.filter(e => e.eventId !== eventId);
          this.unackedEvents.set(clientId, filtered);
        }, 60000);
      }
    }
  }

  private matchesFilters(transaction: Transaction, filters: any): boolean {
    if (filters.minAmount && transaction.amount < filters.minAmount) return false;
    if (filters.maxAmount && transaction.amount > filters.maxAmount) return false;
    if (filters.status && transaction.status !== filters.status) return false;
    return true;
  }

  private generateEventId(): string {
    return `EV-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}
```

---

## FEATURE-45.2: Server-Sent Events (SSE) Alternative

### 📘 User Story: US-45.2.1 - Real-Time Events via SSE (8 SP)

**Story Points:** 8
**Priority:** P1 (High)
**Status:** 🔄 Not Started

---

#### User Story

```
As a developer
I want Server-Sent Events as an alternative to WebSocket
So that I can implement real-time updates in environments where WebSocket is not available (proxies, old browsers)
```

---

#### Acceptance Criteria

**Functional:**
- [ ] **AC1:** Accept `GET /api/v1/events/stream` with JWT token and event filters
- [ ] **AC2:** Return `Content-Type: text/event-stream` with chunked transfer encoding
- [ ] **AC3:** Send `:heartbeat` comments every 30 seconds to keep connection alive
- [ ] **AC4:** Send events in SSE format: `event: transaction\ndata: {json}\n\n`
- [ ] **AC5:** Include event ID: `id: EV-123\n`
- [ ] **AC6:** Support event retry with `retry: 5000` (5 second backoff)
- [ ] **AC7:** Clean connection close after 5 minutes idle
- [ ] **AC8:** Client reconnection with `Last-Event-ID` header for resumption

**Non-Functional:**
- [ ] **AC9:** Support 500+ concurrent SSE connections per server
- [ ] **AC10:** Event delivery latency: <100ms
- [ ] **AC11:** Memory usage: <2MB per connection (higher than WebSocket due to polling)
- [ ] **AC12:** Connection timeout: 5 minutes idle

---

#### Technical Specifications

**SSE Endpoint:**

```
GET /api/v1/events/stream?token=JWT&events=transaction,balance

Response:
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive

Body:
  retry: 5000
  event: transaction
  id: EV-550e8400e29b41d4
  data: {"id":"TXN-123","amount":50000,"status":"SUCCESS"}

  event: balance
  id: EV-550e8400e29b41d5
  data: {"currency":"NGN","availableBalance":49950000}

  :heartbeat

  event: transaction
  id: EV-550e8400e29b41d6
  data: {"id":"TXN-124","amount":25000,"status":"SUCCESS"}
```

---

## FEATURE-45.3: Event Subscription Management

### 📘 User Story: US-45.3.1 - Dynamic Event Subscriptions (6 SP)

**Story Points:** 6
**Priority:** P1 (High)
**Status:** 🔄 Not Started

---

#### User Story

```
As a developer
I want to manage event subscriptions dynamically
So that applications can subscribe/unsubscribe from events at runtime without reconnecting
```

---

#### Acceptance Criteria

- [ ] **AC1:** Support `PATCH /api/v1/events/subscriptions` to update subscriptions
- [ ] **AC2:** Support adding new event types without reconnection
- [ ] **AC3:** Support removing event subscriptions
- [ ] **AC4:** Store subscription preferences per user
- [ ] **AC5:** Persist subscriptions across sessions
- [ ] **AC6:** Return current subscription status

---

## Sprint Risk Register

| Risk ID | Description | Probability | Impact | Mitigation |
|---------|-------------|-------------|--------|-----------|
| RISK-45-001 | Memory leak in WebSocket connection tracking | Medium | High | Implement connection pooling with cleanup, monitor memory usage |
| RISK-45-002 | Event ordering issues during high traffic | Low | High | Use monotonic timestamp sequencing, database-backed event queue |
| RISK-45-003 | Client disconnection during event delivery | Medium | Medium | Implement at-least-once delivery with ACK mechanism |
| RISK-45-004 | SSE connection hogging server resources | Medium | Medium | Implement connection limits per user, idle timeout |

---

## Sprint Dependencies

- **Sprint 5** (Transactions): Core transaction events
- **Sprint 8** (Admin & Operations): Admin dashboard real-time updates
- **Socket.IO**: WebSocket library (already integrated)

---

## Sprint Notes & Decisions

1. **WebSocket vs SSE:** Support both; WebSocket primary (lower latency), SSE fallback (better compatibility)
2. **Event Delivery:** At-least-once guarantee via ACK mechanism; trade-off between reliability and complexity
3. **Filtering:** Client-side filtering (client subscribes to specific events); server-side filtering for performance
4. **Backward Compatibility:** Polling APIs remain functional; real-time is additive feature
5. **Scaling:** Plan for horizontal scaling with Redis Pub/Sub for multi-server deployments (future sprint)

---

**Document Version:** 1.0.0
