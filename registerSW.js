if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/fishfarm/sw.js', { scope: '/fishfarm/' })})}