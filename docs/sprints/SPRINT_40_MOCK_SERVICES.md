# Sprint 40 Mock Services - POS System

## Overview

This document provides comprehensive mock implementations for all POS system components with realistic latency patterns, failure rates, and state machines matching real hardware devices and processing delays.

---

## 1. POS Terminal Mock Service

Simulates hardware POS terminal with connection management, heartbeat monitoring, and payment method routing.

```typescript
import { Injectable } from '@nestjs/common';

interface TerminalConfig {
  serialNumber: string;
  connectionType: 'BLUETOOTH' | 'USB' | 'WIFI' | '4G';
  supportedPaymentMethods: string[];
}

interface PaymentRequest {
  amount: number;
  paymentMethod: string;
  cardData?: any;
  metadata?: any;
}

@Injectable()
export class POSTerminalMock {
  private terminals = new Map<string, any>();
  private readonly BLUETOOTH_LATENCY_MIN = 500;
  private readonly BLUETOOTH_LATENCY_MAX = 2000;
  private readonly USB_LATENCY_MIN = 100;
  private readonly USB_LATENCY_MAX = 500;
  private readonly WIFI_LATENCY_MIN = 200;
  private readonly WIFI_LATENCY_MAX = 1500;
  private readonly NETWORK_LATENCY_MIN = 800;
  private readonly NETWORK_LATENCY_MAX = 3000;
  private readonly TERMINAL_ERROR_RATE = 0.02; // 2% error rate
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds

  // Success rates by connection type
  private readonly SUCCESS_RATES = {
    BLUETOOTH: 0.96,
    USB: 0.99,
    WIFI: 0.97,
    '4G': 0.95,
  };

  async initializeTerminal(config: TerminalConfig): Promise<{
    terminalId: string;
    status: string;
    nextHeartbeatInterval: number;
    capabilities: any;
  }> {
    const terminalId = `term_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.terminals.set(terminalId, {
      ...config,
      status: 'ACTIVE',
      lastHeartbeat: Date.now(),
      connectionStrength: this.getInitialConnectionStrength(config.connectionType),
      operationCount: 0,
      errorCount: 0,
    });

    return {
      terminalId,
      status: 'ACTIVE',
      nextHeartbeatInterval: this.HEARTBEAT_INTERVAL,
      capabilities: {
        nfcSupported: config.supportedPaymentMethods.includes('NFC'),
        chipReaderSupported: config.supportedPaymentMethods.includes('CARD'),
        thermalPrinterSupported: true,
        offlineModeSupported: true,
      },
    };
  }

  async processPayment(
    terminalId: string,
    request: PaymentRequest,
  ): Promise<{
    success: boolean;
    transactionId: string;
    status: string;
    latency_ms: number;
    errorCode?: string;
    errorMessage?: string;
  }> {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) {
      return {
        success: false,
        transactionId: '',
        status: 'FAILED',
        latency_ms: 0,
        errorCode: 'TERMINAL_NOT_FOUND',
        errorMessage: 'Terminal is not initialized',
      };
    }

    const startTime = Date.now();
    const latency = this.getLatencyForConnection(terminal.connectionType);

    // Simulate device latency
    await this.delay(latency);

    // Update terminal metrics
    terminal.operationCount += 1;

    // Determine success based on connection type and rate limiting
    const shouldSucceed =
      Math.random() < this.SUCCESS_RATES[terminal.connectionType] &&
      !this.shouldThrottleConnection(terminal);

    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    if (!shouldSucceed) {
      terminal.errorCount += 1;
      const errorScenario = this.getRandomErrorScenario();
      return {
        success: false,
        transactionId,
        status: 'FAILED',
        latency_ms: Date.now() - startTime,
        errorCode: errorScenario.code,
        errorMessage: errorScenario.message,
      };
    }

    // Update connection strength based on successful operation
    this.updateConnectionStrength(terminal, true);

    return {
      success: true,
      transactionId,
      status: 'SUCCESS',
      latency_ms: Date.now() - startTime,
    };
  }

  async maintainHeartbeat(terminalId: string): Promise<{
    heartbeatId: string;
    status: string;
    connectionStrength: number;
    signalQuality: string;
    nextHeartbeatTime: number;
  }> {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) {
      throw new Error('Terminal not found');
    }

    const heartbeatLatency = terminal.connectionType === 'BLUETOOTH' ? 150 : 50;
    await this.delay(heartbeatLatency);

    // Update connection metrics
    const connectionDrift = (Math.random() - 0.5) * 10; // Random drift
    const newStrength = Math.max(
      0,
      Math.min(100, terminal.connectionStrength + connectionDrift),
    );
    terminal.connectionStrength = newStrength;
    terminal.lastHeartbeat = Date.now();

    const signalQuality = this.getSignalQuality(newStrength);

    return {
      heartbeatId: `hb_${Date.now()}`,
      status: 'OK',
      connectionStrength: newStrength,
      signalQuality,
      nextHeartbeatTime: this.HEARTBEAT_INTERVAL,
    };
  }

  async switchNetwork(
    terminalId: string,
    fromConnection: string,
    toConnection: string,
  ): Promise<{
    switchId: string;
    success: boolean;
    switchTimeMs: number;
    newConnection: string;
  }> {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) {
      throw new Error('Terminal not found');
    }

    const startTime = Date.now();

    // Simulate network switch latency (should be <500ms)
    const switchLatency = Math.random() * 400 + 50; // 50-450ms
    await this.delay(switchLatency);

    // Validate new connection can connect (95% success rate)
    const canConnect = Math.random() < 0.95;

    if (!canConnect) {
      return {
        switchId: `sw_${Date.now()}`,
        success: false,
        switchTimeMs: Date.now() - startTime,
        newConnection: fromConnection, // Fallback to original
      };
    }

    terminal.connectionType = toConnection;
    terminal.connectionStrength = 95; // Reset connection strength on new connection

    return {
      switchId: `sw_${Date.now()}`,
      success: true,
      switchTimeMs: Date.now() - startTime,
      newConnection: toConnection,
    };
  }

  // Helper methods
  private getLatencyForConnection(connectionType: string): number {
    const ranges = {
      BLUETOOTH: {
        min: this.BLUETOOTH_LATENCY_MIN,
        max: this.BLUETOOTH_LATENCY_MAX,
      },
      USB: { min: this.USB_LATENCY_MIN, max: this.USB_LATENCY_MAX },
      WIFI: { min: this.WIFI_LATENCY_MIN, max: this.WIFI_LATENCY_MAX },
      '4G': { min: this.NETWORK_LATENCY_MIN, max: this.NETWORK_LATENCY_MAX },
    };

    const range = ranges[connectionType] || ranges.WIFI;
    return Math.random() * (range.max - range.min) + range.min;
  }

  private getInitialConnectionStrength(connectionType: string): number {
    const baseStrengths = {
      BLUETOOTH: 75,
      USB: 95,
      WIFI: 85,
      '4G': 80,
    };
    return baseStrengths[connectionType] || 80;
  }

  private shouldThrottleConnection(terminal: any): boolean {
    // Throttle if error rate exceeds 10%
    const errorRate = terminal.errorCount / terminal.operationCount;
    return errorRate > 0.1;
  }

  private updateConnectionStrength(terminal: any, success: boolean): void {
    if (success) {
      terminal.connectionStrength = Math.min(
        100,
        terminal.connectionStrength + 2,
      );
    } else {
      terminal.connectionStrength = Math.max(
        0,
        terminal.connectionStrength - 5,
      );
    }
  }

  private getSignalQuality(strength: number): string {
    if (strength >= 80) return 'EXCELLENT';
    if (strength >= 60) return 'GOOD';
    if (strength >= 40) return 'FAIR';
    return 'POOR';
  }

  private getRandomErrorScenario(): { code: string; message: string } {
    const scenarios = [
      {
        code: 'DEVICE_TIMEOUT',
        message: 'Device response timeout after 30 seconds',
      },
      {
        code: 'CARD_READ_ERROR',
        message: 'Unable to read card data, please try again',
      },
      {
        code: 'NETWORK_ERROR',
        message: 'Network connection lost during transaction',
      },
      {
        code: 'NFC_COLLISION',
        message: 'Multiple NFC cards detected, please try one card',
      },
      {
        code: 'PAYMENT_PROCESSOR_TIMEOUT',
        message: 'Payment processor did not respond in time',
      },
      {
        code: 'INVALID_CARD',
        message: 'Card is not supported by this terminal',
      },
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 2. NFC Card Reader Mock

Simulates contactless payment processing with realistic NFC reader behavior.

```typescript
@Injectable()
export class NFCCardReaderMock {
  private readonly NFC_DETECTION_RANGE = 4; // cm
  private readonly NFC_READ_LATENCY_MIN = 300;
  private readonly NFC_READ_LATENCY_MAX = 800;
  private readonly NFC_SUCCESS_RATE = 0.97; // 97% successful reads
  private readonly CARD_COLLISION_RATE = 0.01; // 1% collision when multiple cards present
  private readonly BATTERY_DRAIN_PER_OP = 0.5; // % per operation

  private activeCards: Map<string, any> = new Map();
  private deviceBatteryLevel = 95;

  async detectNearbyCards(): Promise<{
    cardsDetected: number;
    cards: Array<{
      nfcId: string;
      cardType: string;
      distance: number;
    }>;
    batteryLevel: number;
  }> {
    // Simulate NFC scan for nearby cards
    const cardsInRange = Math.floor(Math.random() * 3); // 0-2 cards

    const cards = [];
    for (let i = 0; i < cardsInRange; i++) {
      cards.push({
        nfcId: `nfc_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`,
        cardType: Math.random() > 0.5 ? 'CREDIT' : 'DEBIT',
        distance: Math.random() * this.NFC_DETECTION_RANGE,
      });
    }

    this.deviceBatteryLevel = Math.max(0, this.deviceBatteryLevel - 0.1);

    return {
      cardsDetected: cards.length,
      cards,
      batteryLevel: this.deviceBatteryLevel,
    };
  }

  async readCardData(nfcId: string): Promise<{
    success: boolean;
    cardData?: {
      cardToken: string;
      last4Digits: string;
      cardType: string;
      cardholderName: string;
      expiryMonth: string;
      expiryYear: string;
    };
    latency_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();

    // Check for collision (multiple cards)
    if (Math.random() < this.CARD_COLLISION_RATE) {
      await this.delay(150);
      return {
        success: false,
        latency_ms: Date.now() - startTime,
        error: 'MULTIPLE_CARDS_DETECTED',
      };
    }

    const readLatency = this.getRandomLatency(
      this.NFC_READ_LATENCY_MIN,
      this.NFC_READ_LATENCY_MAX,
    );

    await this.delay(readLatency);

    const shouldSucceed = Math.random() < this.NFC_SUCCESS_RATE;

    if (!shouldSucceed) {
      return {
        success: false,
        latency_ms: Date.now() - startTime,
        error: 'CARD_READ_FAILED',
      };
    }

    this.deviceBatteryLevel = Math.max(
      0,
      this.deviceBatteryLevel - this.BATTERY_DRAIN_PER_OP,
    );

    const cardToken = `tok_nfc_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      cardData: {
        cardToken,
        last4Digits: `${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0')}`,
        cardType: Math.random() > 0.5 ? 'CREDIT' : 'DEBIT',
        cardholderName: 'NFC CARD HOLDER',
        expiryMonth: String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'),
        expiryYear: String(new Date().getFullYear() + Math.floor(Math.random() * 5)),
      },
      latency_ms: Date.now() - startTime,
    };
  }

  async processNFCTransaction(
    amount: number,
    cardData: any,
  ): Promise<{
    transactionId: string;
    status: string;
    amount: number;
    processingTime_ms: number;
    receipt: string;
  }> {
    const startTime = Date.now();

    // Simulate transaction processing (2-5 seconds for NFC)
    const processingTime = this.getRandomLatency(2000, 5000);
    await this.delay(processingTime);

    const transactionId = `nfc_txn_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    const receipt = this.generateNFCReceipt(transactionId, amount, cardData);

    return {
      transactionId,
      status: 'APPROVED',
      amount,
      processingTime_ms: Date.now() - startTime,
      receipt,
    };
  }

  private generateNFCReceipt(
    transactionId: string,
    amount: number,
    cardData: any,
  ): string {
    return `
NFC TRANSACTION RECEIPT
=======================
Transaction ID: ${transactionId}
Amount: ₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
Card: ${cardData.cardType} ****${cardData.last4Digits}
Time: ${new Date().toISOString()}
Status: APPROVED
=======================
    `.trim();
  }

  private getRandomLatency(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 3. QR Code Payment Mock

Simulates QR code generation, scanning, and payment processing with dual modes (merchant-initiated and customer-initiated).

```typescript
@Injectable()
export class QRCodePaymentMock {
  private readonly QR_GENERATION_LATENCY = 100; // ms
  private readonly QR_SCAN_LATENCY_MIN = 200;
  private readonly QR_SCAN_LATENCY_MAX = 800;
  private readonly QR_SCAN_SUCCESS_RATE = 0.98; // 98%
  private readonly QR_VALIDATION_LATENCY = 300;

  // QR Payment states
  private qrSessions: Map<string, any> = new Map();
  private readonly QR_SESSION_TIMEOUT = 300000; // 5 minutes

  async generateDynamicQRCode(
    merchantId: string,
    amount: number,
    currency: string = 'NGN',
  ): Promise<{
    qrCodeId: string;
    qrContent: string;
    qrImageUrl: string;
    expiresAt: Date;
    generationLatency_ms: number;
  }> {
    const startTime = Date.now();
    await this.delay(this.QR_GENERATION_LATENCY);

    const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Generate standard QR content format (EMV CPM)
    const qrContent = this.generateEMVQRContent({
      merchantId,
      amount,
      currency,
      qrCodeId,
    });

    const expiresAt = new Date(Date.now() + this.QR_SESSION_TIMEOUT);

    // Store session
    this.qrSessions.set(qrCodeId, {
      merchantId,
      amount,
      currency,
      status: 'ACTIVE',
      createdAt: Date.now(),
      expiresAt,
    });

    // Cleanup expired sessions
    this.cleanupExpiredSessions();

    return {
      qrCodeId,
      qrContent,
      qrImageUrl: `https://api.qr.example.com/image/${qrCodeId}`,
      expiresAt,
      generationLatency_ms: Date.now() - startTime,
    };
  }

  async scanAndValidateQRCode(qrContent: string): Promise<{
    scanId: string;
    qrCodeId: string;
    merchantId: string;
    amount: number;
    currency: string;
    validationStatus: string;
    scanLatency_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();

    // Simulate scan latency (optical scanning time)
    const scanLatency = this.getRandomLatency(
      this.QR_SCAN_LATENCY_MIN,
      this.QR_SCAN_LATENCY_MAX,
    );
    await this.delay(scanLatency);

    // Check scan success rate
    if (Math.random() > this.QR_SCAN_SUCCESS_RATE) {
      return {
        scanId: `scan_${Date.now()}`,
        qrCodeId: '',
        merchantId: '',
        amount: 0,
        currency: '',
        validationStatus: 'FAILED',
        scanLatency_ms: Date.now() - startTime,
        error: 'QR_CODE_UNREADABLE',
      };
    }

    // Parse QR content
    const parsed = this.parseEMVQRContent(qrContent);
    if (!parsed) {
      return {
        scanId: `scan_${Date.now()}`,
        qrCodeId: '',
        merchantId: '',
        amount: 0,
        currency: '',
        validationStatus: 'FAILED',
        scanLatency_ms: Date.now() - startTime,
        error: 'INVALID_QR_FORMAT',
      };
    }

    // Validate QR session
    const session = this.qrSessions.get(parsed.qrCodeId);
    if (!session) {
      return {
        scanId: `scan_${Date.now()}`,
        qrCodeId: parsed.qrCodeId,
        merchantId: '',
        amount: 0,
        currency: '',
        validationStatus: 'FAILED',
        scanLatency_ms: Date.now() - startTime,
        error: 'QR_CODE_EXPIRED',
      };
    }

    // Simulate validation latency
    await this.delay(this.QR_VALIDATION_LATENCY);

    return {
      scanId: `scan_${Date.now()}`,
      qrCodeId: parsed.qrCodeId,
      merchantId: session.merchantId,
      amount: session.amount,
      currency: session.currency,
      validationStatus: 'VALID',
      scanLatency_ms: Date.now() - startTime,
    };
  }

  async processQRPayment(
    qrCodeId: string,
    payerWalletId: string,
  ): Promise<{
    transactionId: string;
    status: string;
    amount: number;
    processingTime_ms: number;
    receiptUrl: string;
  }> {
    const startTime = Date.now();

    const session = this.qrSessions.get(qrCodeId);
    if (!session) {
      throw new Error('QR Code session not found');
    }

    // Simulate QR payment processing (3-8 seconds for USSD backend)
    const processingTime = this.getRandomLatency(3000, 8000);
    await this.delay(processingTime);

    const transactionId = `qr_txn_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Mark session as completed
    session.status = 'COMPLETED';
    session.transactionId = transactionId;

    return {
      transactionId,
      status: 'COMPLETED',
      amount: session.amount,
      processingTime_ms: Date.now() - startTime,
      receiptUrl: `https://receipts.example.com/${transactionId}`,
    };
  }

  private generateEMVQRContent(params: {
    merchantId: string;
    amount: number;
    currency: string;
    qrCodeId: string;
  }): string {
    // EMV-QR Format (Nigerian Standard)
    const payload = {
      payloadFormatIndicator: '01',
      pointOfInitiationMethod: '12', // Dynamic QR
      merchantAccountInformation: {
        globalUniqueIdentifier: 'NG.FINTECH.APP',
        merchantId: params.merchantId,
        acquirerId: 'NG_BANK_001',
      },
      transactionAmount: params.amount.toString().padStart(13, '0'),
      transactionCurrency: 'NGN',
      merchantCategoryCode: '5411',
      merchantName: 'Sample Merchant',
      merchantCity: 'Lagos',
      postalCode: '100001',
      countryCode: 'NG',
      crc: 'XXXX',
      reference: params.qrCodeId,
    };

    return JSON.stringify(payload);
  }

  private parseEMVQRContent(qrContent: string): any {
    try {
      const parsed = JSON.parse(qrContent);
      return {
        qrCodeId: parsed.reference,
        merchantId: parsed.merchantAccountInformation?.merchantId,
        amount: parseInt(parsed.transactionAmount),
        currency: parsed.transactionCurrency,
      };
    } catch {
      return null;
    }
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [qrCodeId, session] of this.qrSessions.entries()) {
      if (session.expiresAt < now) {
        this.qrSessions.delete(qrCodeId);
      }
    }
  }

  private getRandomLatency(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 4. Receipt Printer Mock

Simulates thermal receipt printer with realistic document generation and delivery.

```typescript
@Injectable()
export class ReceiptPrinterMock {
  private readonly PRINT_LATENCY_MIN = 2000;
  private readonly PRINT_LATENCY_MAX = 5000;
  private readonly PRINT_SUCCESS_RATE = 0.98; // 2% paper jam/error rate
  private readonly SMS_DELIVERY_LATENCY_MIN = 2000;
  private readonly SMS_DELIVERY_LATENCY_MAX = 8000;
  private readonly EMAIL_DELIVERY_LATENCY_MIN = 3000;
  private readonly EMAIL_DELIVERY_LATENCY_MAX = 15000;

  async printReceipt(
    transactionData: {
      transactionId: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      merchantName: string;
      merchantAddress: string;
      cardLast4?: string;
      customerName?: string;
    },
  ): Promise<{
    printId: string;
    status: string;
    printTime_ms: number;
    error?: string;
  }> {
    const startTime = Date.now();

    // Simulate print latency
    const printLatency = this.getRandomLatency(
      this.PRINT_LATENCY_MIN,
      this.PRINT_LATENCY_MAX,
    );
    await this.delay(printLatency);

    // Check for paper jam or other hardware errors
    if (Math.random() > this.PRINT_SUCCESS_RATE) {
      return {
        printId: `print_${Date.now()}`,
        status: 'FAILED',
        printTime_ms: Date.now() - startTime,
        error: 'PAPER_JAM',
      };
    }

    const receiptContent = this.formatReceiptContent(transactionData);

    return {
      printId: `print_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'SUCCESS',
      printTime_ms: Date.now() - startTime,
    };
  }

  async sendSMSReceipt(
    customerPhone: string,
    transactionData: any,
  ): Promise<{
    smsId: string;
    status: string;
    deliveryTime_ms: number;
    shortCode?: string;
  }> {
    const startTime = Date.now();

    // Simulate SMS delivery latency (network dependent)
    const deliveryLatency = this.getRandomLatency(
      this.SMS_DELIVERY_LATENCY_MIN,
      this.SMS_DELIVERY_LATENCY_MAX,
    );
    await this.delay(deliveryLatency);

    const shortCode = `TXN${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      smsId: `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'DELIVERED',
      deliveryTime_ms: Date.now() - startTime,
      shortCode,
    };
  }

  async sendEmailReceipt(
    customerEmail: string,
    transactionData: any,
  ): Promise<{
    emailId: string;
    status: string;
    deliveryTime_ms: number;
  }> {
    const startTime = Date.now();

    // Simulate email delivery latency
    const deliveryLatency = this.getRandomLatency(
      this.EMAIL_DELIVERY_LATENCY_MIN,
      this.EMAIL_DELIVERY_LATENCY_MAX,
    );
    await this.delay(deliveryLatency);

    return {
      emailId: `email_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'SENT',
      deliveryTime_ms: Date.now() - startTime,
    };
  }

  private formatReceiptContent(transactionData: any): string {
    const lines = [
      '╔════════════════════════════════════╗',
      `║  ${transactionData.merchantName.padEnd(32)}  ║`,
      `║  ${transactionData.merchantAddress.substring(0, 32).padEnd(32)}  ║`,
      '╠════════════════════════════════════╣',
      `║ Date/Time: ${new Date().toLocaleString('en-NG').padEnd(21)}║`,
      `║ Ref: ${transactionData.transactionId.substring(0, 27).padEnd(28)}║`,
      '╠════════════════════════════════════╣',
      `║ Amount: ₦${transactionData.amount
        .toFixed(2)
        .padStart(26)}  ║`,
      `║ Method: ${transactionData.paymentMethod.padEnd(26)}  ║`,
      transactionData.cardLast4
        ? `║ Card: ****${transactionData.cardLast4.padEnd(22)}  ║`
        : '',
      transactionData.customerName
        ? `║ Name: ${transactionData.customerName.padEnd(27)}  ║`
        : '',
      '╠════════════════════════════════════╣',
      '║ Thank you for your purchase!       ║',
      '║ www.example.com                    ║',
      '╚════════════════════════════════════╝',
    ];

    return lines.filter((line) => line.length > 0).join('\n');
  }

  private getRandomLatency(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 5. Offline Queue Manager Mock

Manages transaction queueing and synchronization when network is unavailable.

```typescript
@Injectable()
export class OfflineQueueManagerMock {
  private readonly MAX_QUEUE_SIZE = 1000;
  private readonly SYNC_BATCH_SIZE = 50;
  private readonly SYNC_RETRY_DELAYS = [2000, 4000, 8000, 16000, 32000]; // exponential backoff
  private readonly OFFLINE_STORAGE_LATENCY_MIN = 50;
  private readonly OFFLINE_STORAGE_LATENCY_MAX = 200;

  private queueStore: Map<string, any[]> = new Map(); // terminal -> queue
  private syncInProgress: Map<string, boolean> = new Map();

  async queueTransaction(
    terminalId: string,
    transactionData: any,
  ): Promise<{
    queueId: string;
    queuePosition: number;
    queueSize: number;
    estimatedSyncTime: number;
  }> {
    const startTime = Date.now();

    // Simulate storage latency
    await this.delay(
      this.getRandomLatency(
        this.OFFLINE_STORAGE_LATENCY_MIN,
        this.OFFLINE_STORAGE_LATENCY_MAX,
      ),
    );

    const terminal = this.queueStore.get(terminalId) || [];
    if (terminal.length >= this.MAX_QUEUE_SIZE) {
      throw new Error('Queue capacity exceeded');
    }

    const queueId = `queue_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const queueItem = {
      queueId,
      ...transactionData,
      queuedAt: Date.now(),
      syncAttempts: 0,
    };

    terminal.push(queueItem);
    this.queueStore.set(terminalId, terminal);

    // Estimate sync time based on queue size and batch size
    const estimatedBatches = Math.ceil(terminal.length / this.SYNC_BATCH_SIZE);
    const estimatedSyncTime = estimatedBatches * 5000; // 5 seconds per batch

    return {
      queueId,
      queuePosition: terminal.length,
      queueSize: terminal.length,
      estimatedSyncTime,
    };
  }

  async batchSync(
    terminalId: string,
    queueIds?: string[],
  ): Promise<{
    syncId: string;
    status: string;
    totalQueued: number;
    successCount: number;
    failedCount: number;
    results: Array<{
      queueId: string;
      status: string;
      transactionId?: string;
      error?: string;
    }>;
    syncedAt: Date;
    totalSyncTime_ms: number;
  }> {
    const startTime = Date.now();

    if (this.syncInProgress.get(terminalId)) {
      throw new Error('Sync already in progress for this terminal');
    }

    this.syncInProgress.set(terminalId, true);

    try {
      const queue = this.queueStore.get(terminalId) || [];
      const itemsToSync = queueIds
        ? queue.filter((item) => queueIds.includes(item.queueId))
        : queue;

      const results = [];
      let successCount = 0;
      let failedCount = 0;

      // Process in batches
      for (let i = 0; i < itemsToSync.length; i += this.SYNC_BATCH_SIZE) {
        const batch = itemsToSync.slice(i, i + this.SYNC_BATCH_SIZE);

        // Simulate batch sync latency (network roundtrip)
        await this.delay(Math.random() * 2000 + 3000); // 3-5 seconds per batch

        for (const item of batch) {
          // Simulate transaction result
          const syncSuccess = Math.random() > 0.05; // 95% success rate

          if (syncSuccess) {
            results.push({
              queueId: item.queueId,
              status: 'SYNCED',
              transactionId: `txn_synced_${Date.now()}`,
            });
            successCount++;

            // Remove from queue
            const idx = queue.findIndex((q) => q.queueId === item.queueId);
            if (idx > -1) {
              queue.splice(idx, 1);
            }
          } else {
            item.syncAttempts++;
            results.push({
              queueId: item.queueId,
              status: 'FAILED',
              error: 'NETWORK_ERROR',
            });
            failedCount++;
          }
        }
      }

      this.queueStore.set(terminalId, queue);

      return {
        syncId: `sync_${Date.now()}`,
        status: successCount > 0 ? 'PARTIAL_SUCCESS' : 'FAILED',
        totalQueued: itemsToSync.length,
        successCount,
        failedCount,
        results,
        syncedAt: new Date(),
        totalSyncTime_ms: Date.now() - startTime,
      };
    } finally {
      this.syncInProgress.set(terminalId, false);
    }
  }

  async getQueueStatus(terminalId: string): Promise<{
    queueSize: number;
    oldestTransaction: {
      queuedAt: Date;
      ageMinutes: number;
    } | null;
    syncInProgress: boolean;
  }> {
    const queue = this.queueStore.get(terminalId) || [];

    if (queue.length === 0) {
      return {
        queueSize: 0,
        oldestTransaction: null,
        syncInProgress: this.syncInProgress.get(terminalId) || false,
      };
    }

    const oldest = queue[0];
    const ageMs = Date.now() - oldest.queuedAt;
    const ageMinutes = Math.floor(ageMs / 60000);

    return {
      queueSize: queue.length,
      oldestTransaction: {
        queuedAt: new Date(oldest.queuedAt),
        ageMinutes,
      },
      syncInProgress: this.syncInProgress.get(terminalId) || false,
    };
  }

  private getRandomLatency(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 6. Cashier Authentication Mock

Simulates PIN and biometric authentication for cashier login.

```typescript
@Injectable()
export class CashierAuthenticationMock {
  private readonly PIN_VERIFICATION_LATENCY = 300;
  private readonly BIOMETRIC_LATENCY_MIN = 500;
  private readonly BIOMETRIC_LATENCY_MAX = 2000;
  private readonly BIOMETRIC_SUCCESS_RATE = 0.96; // 96% first try success
  private readonly BIOMETRIC_RETRY_COUNT = 3;

  // Mock cashier data
  private cashiers = new Map<string, any>([
    [
      'emp_001',
      {
        name: 'Sarah Johnson',
        pin: '1234',
        biometricTemplate: 'fp_template_001',
        role: 'CASHIER',
        terminal: 'term_001',
      },
    ],
    [
      'emp_002',
      {
        name: 'Chioma Okafor',
        pin: '5678',
        biometricTemplate: 'fp_template_002',
        role: 'CASHIER',
        terminal: 'term_002',
      },
    ],
  ]);

  async verifyPIN(pin: string): Promise<{
    pinId: string;
    verified: boolean;
    verificationTime_ms: number;
    attempt?: number;
  }> {
    const startTime = Date.now();

    // Simulate PIN verification latency
    await this.delay(this.PIN_VERIFICATION_LATENCY);

    // Mock password comparison
    const verified = pin === '1234' || pin === '5678'; // Hardcoded for demo

    return {
      pinId: `pin_${Date.now()}`,
      verified,
      verificationTime_ms: Date.now() - startTime,
    };
  }

  async captureBiometric(type: 'FINGERPRINT' | 'FACE'): Promise<{
    captureId: string;
    status: string;
    captureTime_ms: number;
    quality: number;
  }> {
    const startTime = Date.now();

    // Simulate biometric capture latency
    const captureLatency = this.getRandomLatency(
      this.BIOMETRIC_LATENCY_MIN,
      this.BIOMETRIC_LATENCY_MAX,
    );
    await this.delay(captureLatency);

    // Generate quality score (0-100)
    const quality = Math.floor(Math.random() * 30) + 70; // 70-100

    return {
      captureId: `bio_${Date.now()}`,
      status: 'CAPTURED',
      captureTime_ms: Date.now() - startTime,
      quality,
    };
  }

  async matchBiometric(
    capturedTemplate: string,
    enrolledTemplate: string,
    type: 'FINGERPRINT' | 'FACE',
  ): Promise<{
    matchId: string;
    matched: boolean;
    confidence: number;
    matchTime_ms: number;
    retryRemaining?: number;
  }> {
    const startTime = Date.now();

    // Simulate biometric matching latency
    await this.delay(Math.random() * 500 + 200);

    // Mock biometric match (96% success rate on first attempt)
    const matched = Math.random() < this.BIOMETRIC_SUCCESS_RATE;

    // Mock confidence score
    const confidence = Math.random() * 20 + 75; // 75-95

    return {
      matchId: `match_${Date.now()}`,
      matched,
      confidence,
      matchTime_ms: Date.now() - startTime,
      retryRemaining: this.BIOMETRIC_RETRY_COUNT - 1,
    };
  }

  async multiFactorAuthentication(
    terminalId: string,
    pin: string,
    biometricTemplateId: string,
  ): Promise<{
    authId: string;
    success: boolean;
    cashierId: string;
    cashierName: string;
    authenticationTime_ms: number;
    sessionToken: string;
    error?: string;
  }> {
    const startTime = Date.now();

    // Step 1: Verify PIN
    const pinResult = await this.verifyPIN(pin);
    if (!pinResult.verified) {
      return {
        authId: `auth_${Date.now()}`,
        success: false,
        cashierId: '',
        cashierName: '',
        authenticationTime_ms: Date.now() - startTime,
        sessionToken: '',
        error: 'INVALID_PIN',
      };
    }

    // Step 2: Capture biometric
    const captureResult = await this.captureBiometric('FINGERPRINT');
    if (captureResult.quality < 70) {
      return {
        authId: `auth_${Date.now()}`,
        success: false,
        cashierId: '',
        cashierName: '',
        authenticationTime_ms: Date.now() - startTime,
        sessionToken: '',
        error: 'POOR_BIOMETRIC_QUALITY',
      };
    }

    // Step 3: Match biometric (allow retries)
    let matched = false;
    for (let i = 0; i < this.BIOMETRIC_RETRY_COUNT; i++) {
      const matchResult = await this.matchBiometric(
        captureResult.captureId,
        biometricTemplateId,
        'FINGERPRINT',
      );

      if (matchResult.matched) {
        matched = true;
        break;
      }

      if (i < this.BIOMETRIC_RETRY_COUNT - 1) {
        // Retry capture
        const retryCapture = await this.captureBiometric('FINGERPRINT');
        if (retryCapture.quality < 70) {
          break;
        }
      }
    }

    if (!matched) {
      return {
        authId: `auth_${Date.now()}`,
        success: false,
        cashierId: '',
        cashierName: '',
        authenticationTime_ms: Date.now() - startTime,
        sessionToken: '',
        error: 'BIOMETRIC_MISMATCH',
      };
    }

    // Authentication successful
    const cashier = Array.from(this.cashiers.values()).find(
      (c) => c.terminal === terminalId,
    );

    return {
      authId: `auth_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      success: true,
      cashierId: cashier?.id || 'emp_001',
      cashierName: cashier?.name || 'Unknown Cashier',
      authenticationTime_ms: Date.now() - startTime,
      sessionToken: `session_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  private getRandomLatency(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## 7. Till Reconciliation Mock

Simulates daily till reconciliation with discrepancy detection.

```typescript
@Injectable()
export class TillReconciliationMock {
  private readonly RECONCILIATION_PROCESS_LATENCY = 2000; // 2-5 seconds
  private readonly DISCREPANCY_VARIANCE_NORMAL = 500; // ₦500 normal variance
  private readonly DISCREPANCY_RATE = 0.08; // 8% of reconciliations have discrepancies

  async calculateExpectedAmount(
    sessionId: string,
    transactions: any[],
  ): Promise<{
    totalTransactions: number;
    totalAmount: number;
    byPaymentMethod: Record<string, number>;
    fees: number;
    calculationTime_ms: number;
  }> {
    const startTime = Date.now();

    const byPaymentMethod = {
      CARD: 0,
      NFC: 0,
      QR: 0,
      USSD: 0,
    };

    let totalAmount = 0;
    let totalFees = 0;

    for (const txn of transactions) {
      totalAmount += txn.amount;
      totalFees += txn.feeAmount || 0;
      byPaymentMethod[txn.paymentMethod] =
        (byPaymentMethod[txn.paymentMethod] || 0) + txn.amount;
    }

    return {
      totalTransactions: transactions.length,
      totalAmount,
      byPaymentMethod,
      fees: totalFees,
      calculationTime_ms: Date.now() - startTime,
    };
  }

  async reconcileTill(
    sessionId: string,
    expectedAmount: number,
    countedAmount: number,
  ): Promise<{
    reconciliationId: string;
    expectedAmount: number;
    countedAmount: number;
    discrepancy: number;
    status: 'BALANCED' | 'MINOR_DISCREPANCY' | 'MAJOR_DISCREPANCY';
    requiresReview: boolean;
    escalationRequired: boolean;
    reconciliationTime_ms: number;
    notes?: string;
  }> {
    const startTime = Date.now();

    // Simulate reconciliation processing
    await this.delay(this.RECONCILIATION_PROCESS_LATENCY);

    const discrepancy = countedAmount - expectedAmount;
    const absoluteDiscrepancy = Math.abs(discrepancy);

    // Determine status based on discrepancy
    let status: 'BALANCED' | 'MINOR_DISCREPANCY' | 'MAJOR_DISCREPANCY';
    let requiresReview = false;
    let escalationRequired = false;
    let notes: string | undefined;

    if (absoluteDiscrepancy === 0) {
      status = 'BALANCED';
    } else if (absoluteDiscrepancy <= this.DISCREPANCY_VARIANCE_NORMAL) {
      status = 'MINOR_DISCREPANCY';
      requiresReview = true;
      notes = `Minor variance of ₦${absoluteDiscrepancy.toFixed(2)}`;
    } else {
      status = 'MAJOR_DISCREPANCY';
      requiresReview = true;
      escalationRequired = absoluteDiscrepancy > 5000; // Escalate if >₦5000
      notes = `Major variance of ₦${absoluteDiscrepancy.toFixed(2)} - Reason: ${this.getRandomDiscrepancyReason()}`;
    }

    return {
      reconciliationId: `rec_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      expectedAmount,
      countedAmount,
      discrepancy,
      status,
      requiresReview,
      escalationRequired,
      reconciliationTime_ms: Date.now() - startTime,
      notes,
    };
  }

  async generateTillReport(
    sessionId: string,
    reconciliation: any,
  ): Promise<{
    reportId: string;
    reportContent: string;
    signature?: string;
    approvalRequired: boolean;
  }> {
    const reportId = `report_${Date.now()}`;

    const reportContent = `
TILL RECONCILIATION REPORT
========================================
Report ID: ${reportId}
Session ID: ${sessionId}
Date/Time: ${new Date().toLocaleString('en-NG')}

RECONCILIATION SUMMARY
---------- ----------
Expected Amount: ₦${reconciliation.expectedAmount.toFixed(2)}
Counted Amount: ₦${reconciliation.countedAmount.toFixed(2)}
Discrepancy: ₦${reconciliation.discrepancy.toFixed(2)}

Status: ${reconciliation.status}
Requires Review: ${reconciliation.requiresReview ? 'YES' : 'NO'}
Escalation Required: ${reconciliation.escalationRequired ? 'YES' : 'NO'}

${reconciliation.notes ? `Notes:\n${reconciliation.notes}\n` : ''}

Processed in: ${reconciliation.reconciliationTime_ms}ms
========================================
    `.trim();

    return {
      reportId,
      reportContent,
      approvalRequired: reconciliation.requiresReview,
    };
  }

  private getRandomDiscrepancyReason(): string {
    const reasons = [
      'Possible miscounting during transaction',
      'Rounding differences in manual entry',
      'Cash returned to customer not recorded',
      'Refund processed post-reconciliation',
      'Terminal sync delay detected',
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## Mock Services Integration Test

```typescript
describe('POS Mock Services - Integration Tests', () => {
  let terminalMock: POSTerminalMock;
  let nfcReaderMock: NFCCardReaderMock;
  let qrPaymentMock: QRCodePaymentMock;
  let offlineQueueMock: OfflineQueueManagerMock;

  beforeEach(() => {
    terminalMock = new POSTerminalMock();
    nfcReaderMock = new NFCCardReaderMock();
    qrPaymentMock = new QRCodePaymentMock();
    offlineQueueMock = new OfflineQueueManagerMock();
  });

  it('should process NFC payment end-to-end', async () => {
    const terminal = await terminalMock.initializeTerminal({
      serialNumber: 'TERM-2024-00001',
      connectionType: 'BLUETOOTH',
      supportedPaymentMethods: ['NFC', 'CARD'],
    });

    const nearbyCards = await nfcReaderMock.detectNearbyCards();
    expect(nearbyCards.cardsDetected).toBeGreaterThanOrEqual(0);

    if (nearbyCards.cards.length > 0) {
      const cardData = await nfcReaderMock.readCardData(
        nearbyCards.cards[0].nfcId,
      );
      expect(cardData.success).toBe(true);

      const result = await terminalMock.processPayment(terminal.terminalId, {
        amount: 25000,
        paymentMethod: 'NFC',
        cardData: cardData.cardData,
      });

      expect(result.latency_ms).toBeGreaterThan(0);
    }
  });

  it('should queue transaction when offline', async () => {
    const terminal = await terminalMock.initializeTerminal({
      serialNumber: 'TERM-2024-00002',
      connectionType: 'WIFI',
      supportedPaymentMethods: ['QR'],
    });

    const queueResult = await offlineQueueMock.queueTransaction(
      terminal.terminalId,
      { amount: 15000, paymentMethod: 'QR' },
    );

    expect(queueResult.queuePosition).toBeGreaterThan(0);
    expect(queueResult.estimatedSyncTime).toBeGreaterThan(0);
  });

  it('should sync queued transactions on network restoration', async () => {
    const terminal = await terminalMock.initializeTerminal({
      serialNumber: 'TERM-2024-00003',
      connectionType: '4G',
      supportedPaymentMethods: ['CARD', 'NFC'],
    });

    // Queue multiple transactions
    const queue1 = await offlineQueueMock.queueTransaction(terminal.terminalId, {
      amount: 10000,
    });
    const queue2 = await offlineQueueMock.queueTransaction(terminal.terminalId, {
      amount: 20000,
    });

    // Simulate sync
    const syncResult = await offlineQueueMock.batchSync(terminal.terminalId);

    expect(syncResult.totalQueued).toBe(2);
    expect(syncResult.results).toHaveLength(2);
  });
});
```

---

**Document Version:** 1.0.0
