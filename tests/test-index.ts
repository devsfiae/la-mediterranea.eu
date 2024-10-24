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

  // Überprüft, ob ein spezifischer Text (Team-Member 1) vorhanden ist
  const hasTeamMember1 = await page.$('text=Hiba') !== null;
  console.log('Spezifischer Text "Hiba" vorhanden:', hasSpecificText);

  // Überprüft, ob ein spezifischer Text (Team-Member 2) vorhanden ist
  const hasTeamMember2 = await page.$('text=Irina') !== null;
  console.log('Spezifischer Text "Irina" vorhanden:', hasSpecificText);

  // Überprüft, ob ein Link zum Impressum vorhanden ist
  const hasImpressum = await page.$('text=Impressum') !== null;
  console.log('Spezifischer Text "Impressum" vorhanden:', hasSpecificText);
  
  // Überprüfung, ob der Link zum Impressum korrekt funktioniert
  await page.click('text=Impressum');
  await page.waitForNavigation();
  console.log('Aktuelle URL:', page.url());

  // Weitere Tests hinzufügen zu Team-Member 3 und 4 hinzufügen ...

  // Screenshot erstellen (optional)
  await page.screenshot({ path: 'screenshot.png' });

  // Schließt den Browser
  await browser.close();
})();
