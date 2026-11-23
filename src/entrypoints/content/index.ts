import { startUnitScanner } from '@/lib/units/scan';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main(ctx) {
    startUnitScanner(ctx);
  },
});
