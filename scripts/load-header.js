// js/load-header.js
fetch('/header.txt')
  .then(r => r.text())
  .then(txt => {
      let header = document.getElementById('site-header');
      header.innerHTML = txt;
  });
