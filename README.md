README

# LoveLink - Datingapp

## Beskrivelse

LoveLink er en enkel datingapp laget med Vanilla JS, HTML, CSS, og Jest for testing. Appen lar brukere registrere seg, logge inn, og matche med tilfeldige brukere fra RandomUser API.

## Installasjon

1. Klon prosjektet:
   git clone https://github.com/brolun/JS-API-eksamen
   cd lovelink

2. Installer avhengigheter:
   npm install

## Kjøring

1. Lim inn nytt CrudCrud API-endepunkt/nøkkel i auth.js.
2. Start prosjektet ved å åpne `index.html` i en nettleser.
3. For å kjøre tester:
   npm test

## API-er

-   **CrudCrud:** Brukes til å lagre brukerdata og favoritter.
-   **RandomUser API:** Brukes til å hente tilfeldige brukere.

## Tilleggsfunksjonalitet

-   **Gjensidig match:** Brukere vil bli varslet om en favoritt også har matchet med dem eller ikke.
-   **Chattefunksjon:** Brukere kan sende meldinger til gjensidige matcher.

## Teknologier

-   Vanilla JS, HTML, CSS
-   Jest for testing
