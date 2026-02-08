if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('ServiceWorker registered', reg);
    }).catch(err => {
      console.warn('ServiceWorker registration failed', err);
    });
  });
}
