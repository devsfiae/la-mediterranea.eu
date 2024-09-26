// js/main.js

import { AppController } from './controller.js';
import { initDarkMode } from './darkmode.js';

document.addEventListener('DOMContentLoaded', async () => {
    const appController = new AppController();
    await appController.init();

    // Dark Mode initialisieren
    initDarkMode();
});
