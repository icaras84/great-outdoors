// js/load-header.js
fetch('/header.txt')
  .then(r => r.text())
  .then(html => {
    document.getElementById('site-header').innerHTML = html;
  });
