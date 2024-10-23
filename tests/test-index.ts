// test-index.js
const { chromium } = require('playwright');

(async () => {
  // Startet einen neuen Browser
  const browser = await chromium.launch({
    headless: false, // Setze auf true, um den Browser im Hintergrund zu starten
  });

  // Öffnet eine neue Seite
  const page = await browser.newPage();

  // Navigiert zur index.html (lokaler Pfad oder eine URL)
  await page.goto('http://127.0.0.1:5500/index.html');

  // Überprüft, ob der Seitentitel korrekt ist
  const title = await page.title();
  console.log(`Seitentitel: ${title}`);
  
  // Überprüfen, ob das Header-Element vorhanden ist
  const headerExists = await page.$('header') !== null;
  console.log('Header vorhanden:', headerExists);

  // Überprüft, ob ein spezifischer Text vorhanden ist
  const hasSpecificText = await page.$('text=Mittwoch') !== null;
  console.log('Spezifischer Text "Mittwoch" vorhanden:', hasSpecificText);

  // Screenshot erstellen (optional)
  await page.screenshot({ path: 'screenshot.png' });

  // Schließt den Browser
  await browser.close();
})();
