# Ninja Air Fryer Kochtabelle

Eine interaktive Webanwendung zur Verwaltung von Kochrezepten für den Ninja Air Fryer.

## Features

- Direkte Bearbeitung der Tabellenzellen
- Kategorisierte Rezepte
- Suchfunktion
- Import/Export von Rezepten
- Netzwerkzugriff über lokales WLAN

## Installation & Start

1. Stelle sicher, dass Python 3.x installiert ist
2. Starte den Server:
   ```bash
   python server.py
   ```
3. Der Server zeigt die URLs an, unter denen die Anwendung erreichbar ist:
   - Lokal: http://localhost:8000
   - Netzwerk: http://[DEINE-IP]:8000

## Verwendung

- Direkte Bearbeitung: Klicke einfach in eine Tabellenzelle und bearbeite den Inhalt
- Neue Rezepte: Klicke auf "Neue Zutat hinzufügen"
- Suche: Nutze das Suchfeld um Rezepte zu filtern
- Import/Export: Nutze die entsprechenden Buttons um Daten zu sichern oder zu laden

## NFC Tag Einrichtung

1. Erstelle einen NFC Tag mit der URL: http://[DEINE-IP]:8000
2. Platziere den NFC Tag am Air Fryer
3. Scanne den Tag mit einem Smartphone um die Kochtabelle zu öffnen

## Technische Details

- Die Daten werden in `data/data.json` gespeichert
- Der Server unterstützt automatisches Speichern und CORS
- Alle Änderungen werden sofort gespeichert
