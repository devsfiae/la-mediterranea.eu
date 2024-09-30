// js/main.js

import { AppController, DarkModeController } from './controller.js';

const appController = new AppController();
appController.init();

const darkModeController = new DarkModeController();
darkModeController.init();