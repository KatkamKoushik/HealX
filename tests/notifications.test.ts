import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getSmsService } from '../src/lib/notifications/sms-service';
import { getIvrService } from '../src/lib/notifications/ivr-service';

describe('Telephony & Notification Services', () => {
  const smsService = getSmsService();
  const ivrService = getIvrService();

  it('operates in simulated mode by default without external credentials', async () => {
    const result = await smsService.sendSms({
      recipientPhoneNumber: '+91-98765-43210',
      messageText: 'Hospital OPD timings alert.',
      isSimulated: true,
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.mode, 'simulated');
    assert.strictEqual(result.provider, 'mock');
    assert.ok(result.notice.includes('SIMULATED SMS'));
    assert.ok(result.notice.includes('No actual cellular SMS was dispatched'));
  });

  it('masks recipient phone numbers in logs and output', async () => {
    const result = await smsService.sendSms({
      recipientPhoneNumber: '+91-98765-43210',
      messageText: 'Test masked recipient',
      isSimulated: true,
    });

    assert.ok(result.recipientReference.includes('XXXX'));
    assert.notStrictEqual(result.recipientReference, '+91-98765-43210');
  });

  it('prevents fake claims of real delivery when credentials are missing', async () => {
    const origSid = process.env.TWILIO_ACCOUNT_SID;
    const origToken = process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;

    try {
      const result = await smsService.sendSms({
        recipientPhoneNumber: '+91-98765-43210',
        messageText: 'Real mode test without credentials',
        isSimulated: false, // User requested real delivery
      });

      // Must report failed, never false success
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.mode, 'failed');
      assert.strictEqual(result.provider, 'twilio');
      assert.ok(result.error?.includes('is not set') || result.notice.includes('not set'));
    } finally {
      if (origSid) process.env.TWILIO_ACCOUNT_SID = origSid;
      if (origToken) process.env.TWILIO_AUTH_TOKEN = origToken;
    }
  });

  it('advances IVR state machine upon keypad digit input', () => {
    const initialState = ivrService.getInitialState();
    assert.strictEqual(initialState.currentStep, 'LANGUAGE_SELECT');

    // Press 1 for English
    const step1 = ivrService.processInput(initialState, '1');
    assert.strictEqual(step1.state.language, 'en');
    assert.strictEqual(step1.state.currentStep, 'MAIN_MENU');
    assert.strictEqual(step1.availableOptions.some((o) => o.key === '1'), true);

    // Press 1 for Hospitals
    const step2 = ivrService.processInput(step1.state, '1');
    assert.strictEqual(step2.state.currentStep, 'HOSPITALS_MENU');
    assert.ok(step2.promptText.includes('Select a facility'));
  });

  it('supports Telugu IVR menu tree when digit 2 is pressed', () => {
    const initialState = ivrService.getInitialState();
    const step1 = ivrService.processInput(initialState, '2');

    assert.strictEqual(step1.state.language, 'te');
    assert.strictEqual(step1.state.currentStep, 'MAIN_MENU');
    assert.ok(step1.promptText.includes('ఆసుపత్రుల వివరాలు'));
  });
});
