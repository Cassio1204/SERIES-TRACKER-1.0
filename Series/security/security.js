// Bloquear clique direito
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Bloquear teclas de atalho
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
    }
    if (e.key === 'F12') {
        e.preventDefault();
    }
});