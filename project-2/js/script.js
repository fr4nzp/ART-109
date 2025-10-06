document.addEventListener('DOMContentLoaded', () => {

    const lure = document.getElementById('lure');
    const unleashButton = document.getElementById('unleash-button');
    const chaosEngine = document.getElementById('chaos-engine');
    const templates = document.querySelectorAll('.fragment.template');
    
    const fakeBackButton = document.getElementById('fake-back-button');
    const recoveryWindow = document.getElementById('recovery-window');
    const cancelRecoveryButton = document.getElementById('cancel-recovery');
    const recoveryTitleBar = recoveryWindow.querySelector('.title-bar');

    let chaosInterval;

    const startChaos = () => {
        lure.style.opacity = '0';
        setTimeout(() => lure.style.display = 'none', 500);

        chaosInterval = setInterval(createFragment, 200);

        setTimeout(() => {
            fakeBackButton.classList.remove('hidden');
            recoveryWindow.classList.remove('hidden');
        }, 5000);
    };

    const createFragment = () => {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const fragment = template.cloneNode(true);
        fragment.classList.remove('template');
        const x = Math.random() * (window.innerWidth - fragment.offsetWidth);
        const y = Math.random() * (window.innerHeight - fragment.offsetHeight);
        fragment.style.left = `${x}px`;
        fragment.style.top = `${y}px`;
        fragment.style.fontSize = `${Math.random() * 2 + 0.5}rem`;
        fragment.style.zIndex = Math.floor(Math.random() * 100).toString();
        chaosEngine.appendChild(fragment);

        if (Math.random() < 0.05) {
            document.body.classList.add('panic');
            setTimeout(() => document.body.classList.remove('panic'), 200);
        }

        if (chaosEngine.children.length > 100) {
            chaosEngine.removeChild(chaosEngine.children[0]);
        }
    };
    
    const intensifyChaos = () => {
        for (let i = 0; i < 20; i++) {
            createFragment();
        }
    };

    fakeBackButton.addEventListener('click', () => {
        fakeBackButton.innerText = "CANNOT GO BACK";
        intensifyChaos();
    });

    cancelRecoveryButton.addEventListener('click', () => {
        recoveryTitleBar.innerText = "RECOVERY FAILED";
        recoveryWindow.classList.add('glitching');
        intensifyChaos();
        setTimeout(() => recoveryWindow.style.display = 'none', 500);
    });

    let isDragging = false;
    let offsetX, offsetY;

    recoveryTitleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - recoveryWindow.getBoundingClientRect().left;
        offsetY = e.clientY - recoveryWindow.getBoundingClientRect().top;
        recoveryTitleBar.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        recoveryWindow.style.left = `${x}px`;
        recoveryWindow.style.top = `${y}px`;
        recoveryWindow.style.transform = ''; 
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        recoveryTitleBar.style.cursor = 'grab';
    });

    unleashButton.addEventListener('click', startChaos);
});