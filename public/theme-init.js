// Apply the saved theme before first paint to avoid a flash.
try { var t = localStorage.getItem('learnify-theme'); if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) document.documentElement.classList.add('dark'); } catch (e) { /* storage unavailable */ }
