export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    console.log('Henkan content script loaded:', location.href);
  },
});
