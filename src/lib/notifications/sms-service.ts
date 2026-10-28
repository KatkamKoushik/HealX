/**
 * Notification Service: SMS & Twilio Abstraction
 * Supports Mock Mode (default) and Real Twilio Mode.
 * Strictly avoids falsely reporting simulated messages as real deliveries.
 */

import APP_CONFIG from '@/config/app-config';
import { getDataStore } from '@/lib/repository/data-store';
import { NotificationLog } from '@/types/database';

export interface SendSmsRequest {
  recipientPhoneNumber: string;
  messageText: string;
  isSimulated?: boolean;
}

export interface SendSmsResult {
  success: boolean;
  mode: 'simulated' | 'delivered' | 'failed';
  provider: 'mock' | 'twilio';
  messageId: string;
  messagePreview: string;
  recipientReference: string;
  notice: string;
  error?: string;
}

export class SmsNotificationService {
  private static instance: SmsNotificationService;

  public static getInstance(): SmsNotificationService {
    if (!SmsNotificationService.instance) {
      SmsNotificationService.instance = new SmsNotificationService();
    }
    return SmsNotificationService.instance;
  }

  // Mask recipient number for privacy (e.g. +91 98765 43210 -> +91-98XXX-XX210)
  private maskPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.length < 8) return '****';
    return `${cleaned.substring(0, 5)}XXXX${cleaned.substring(cleaned.length - 3)}`;
  }

  public async sendSms(req: SendSmsRequest): Promise<SendSmsResult> {
    const store = getDataStore();
    const recipientRef = this.maskPhoneNumber(req.recipientPhoneNumber);
    const messagePreview =
      req.messageText.length > 80 ? `${req.messageText.substring(0, 77)}...` : req.messageText;

    const isExplicitReal = req.isSimulated === false || (process.env.SMS_MODE === 'real' && req.isSimulated !== true);
    const forceMock = !isExplicitReal;

    // 1. MOCK MODE (Default demo behavior)
    if (forceMock) {
      const log = await store.logNotification({
        notification_type: 'sms',
        recipient_reference: recipientRef,
        message_preview: messagePreview,
        provider: 'mock',
        mode: 'simulated',
        status: 'sent',
        error_code: null,
      });

      return {
        success: true,
        mode: 'simulated',
        provider: 'mock',
        messageId: log.id,
        messagePreview,
        recipientReference: recipientRef,
        notice:
          'SIMULATED SMS: Message was processed in Mock Mode. No actual cellular SMS was dispatched.',
      };
    }

    // 2. REAL TWILIO MODE
    const rawSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const apiKeySid = process.env.TWILIO_API_KEY_SID?.trim() || (rawSid?.startsWith('SK') ? rawSid : undefined);
    const accountSid =
      (rawSid?.startsWith('AC') ? rawSid : undefined) ||
      process.env.TWILIO_OWNER_ACCOUNT_SID?.trim() ||
      undefined;
    const authToken = (process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_API_KEY_SECRET)?.trim();
    const fromPhone = process.env.TWILIO_PHONE_NUMBER?.trim();

    if (!accountSid || !authToken || !fromPhone) {
      const log = await store.logNotification({
        notification_type: 'sms',
        recipient_reference: recipientRef,
        message_preview: messagePreview,
        provider: 'twilio',
        mode: 'failed',
        status: 'failed',
        error_code: 'MISSING_TWILIO_CREDENTIALS',
      });

      return {
        success: false,
        mode: 'failed',
        provider: 'twilio',
        messageId: log.id,
        messagePreview,
        recipientReference: recipientRef,
        notice: 'Real Twilio transmission failed due to missing server credentials.',
        error: 'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER is not set.',
      };
    }

    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('To', req.recipientPhoneNumber);
      params.append('From', fromPhone);
      params.append('Body', req.messageText);

      const authUser = apiKeySid || accountSid;
      const authHeader = 'Basic ' + Buffer.from(`${authUser}:${authToken}`).toString('base64');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || `Twilio HTTP ${response.status}`);
      }

      const log = await store.logNotification({
        notification_type: 'sms',
        recipient_reference: recipientRef,
        message_preview: messagePreview,
        provider: 'twilio',
        mode: 'delivered',
        status: 'sent',
        error_code: null,
      });

      return {
        success: true,
        mode: 'delivered',
        provider: 'twilio',
        messageId: data.sid || log.id,
        messagePreview,
        recipientReference: recipientRef,
        notice: 'Real SMS successfully dispatched via Twilio cellular gateway.',
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Twilio dispatch failed.';
      const log = await store.logNotification({
        notification_type: 'sms',
        recipient_reference: recipientRef,
        message_preview: messagePreview,
        provider: 'twilio',
        mode: 'failed',
        status: 'failed',
        error_code: errMsg.substring(0, 50),
      });

      return {
        success: false,
        mode: 'failed',
        provider: 'twilio',
        messageId: log.id,
        messagePreview,
        recipientReference: recipientRef,
        notice: 'Twilio network dispatch failed. Error recorded in system audit logs.',
        error: errMsg,
      };
    }
  }
}

export function getSmsService(): SmsNotificationService {
  return SmsNotificationService.getInstance();
}
