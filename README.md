# Archiv 45 – Die verschlossenen Akten

**Interaktiver Escape Room für den Geschichtsunterricht · Klasse 8 · LehrplanPLUS Bayern**

> Bei Bauarbeiten im Keller eines Berliner Regierungsgebäudes wurde ein versiegeltes Aktenkabinett aus dem Jahr 1945 entdeckt. Sieben Mappen. Sieben gesicherte Geheimnisse. Euer Auftrag: die Geschichte des Kriegsendes rekonstruieren.

---

## 📚 Inhalt

| Mappe | Thema | Freischalt-Code |
|-------|-------|-----------------|
| 1 | **Die Wende** – Stalingrad 1942/43 | `WOLGA` |
| 2 | **Das verbrecherische System** – Holocaust & Wannsee | `NIEMALS` |
| 3 | **Nicht alle haben mitgemacht** – Widerstand | `FREIHEIT` |
| 4 | **Der Westen greift an** – D-Day & globaler Krieg | `OVERLORD` |
| 5 | **Verzweiflung** – Volkssturm & Bombenkrieg | `1944` |
| 6 | **Die letzten Tage** – Berlin 1945 | `30APRIL` |
| 7 | **Stunde Null** – Kapitulation & Neubeginn | *(kein Code – Abschluss)* |

---

## 🚀 GitHub Pages einrichten (5 Minuten)

### Schritt 1: Repository erstellen

1. Gehe zu [github.com](https://github.com) und melde dich an
2. Klicke auf **„New repository"** (grüner Button)
3. Name: z. B. `archiv45` (oder beliebig)
4. Sichtbarkeit: **Public** (für GitHub Pages kostenlos nötig)
5. Klicke auf **„Create repository"**

### Schritt 2: Dateien hochladen

**Option A – Browser (einfach):**
1. Im neuen Repository auf **„uploading an existing file"** klicken
2. Den gesamten Inhalt des `archiv45/`-Ordners hochladen
   *(alle Dateien und Unterordner: `index.html`, `styles/`, `scripts/`, `mappen/`)*
3. Commit-Nachricht eingeben, z. B. `Archiv 45 initial upload`
4. **„Commit changes"** klicken

**Option B – Terminal (schneller bei vielen Dateien):**
```bash
cd pfad/zum/archiv45-ordner
git init
git add .
git commit -m "Archiv 45 – initial commit"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/archiv45.git
git push -u origin main
```

### Schritt 3: GitHub Pages aktivieren

1. Im Repository auf **Settings** (Zahnrad-Tab) klicken
2. Im linken Menü: **Pages**
3. Unter „Branch": `main` auswählen, Ordner `/ (root)` lassen
4. **„Save"** klicken
5. Nach ca. 1–2 Minuten erscheint die URL:
   `https://DEIN-USERNAME.github.io/archiv45/`

✅ Die Website ist jetzt online – ohne Server, ohne Kosten.

---

## 🗂️ Dateistruktur

```
archiv45/
├── index.html              ← Startseite mit Mappen-Übersicht
├── styles/
│   └── main.css            ← Alle Styles (Archiv-Theme, Aufgaben, Layout)
├── scripts/
│   └── app.js              ← Interaktionslogik, Fortschritts-Speicherung
└── mappen/
    ├── mappe-01.html       ← Die Wende (Stalingrad)
    ├── mappe-02.html       ← Das verbrecherische System (Holocaust)
    ├── mappe-03.html       ← Nicht alle haben mitgemacht (Widerstand)
    ├── mappe-04.html       ← Der Westen greift an (D-Day)
    ├── mappe-05.html       ← Verzweiflung (Volkssturm & Bombenkrieg)
    ├── mappe-06.html       ← Die letzten Tage (Berlin 1945)
    └── mappe-07.html       ← Stunde Null (Kapitulation & Neubeginn)
```

---

## 🎮 Spielablauf

1. **Startseite** öffnen → Mappe 1 ist sofort zugänglich
2. **Aufgaben** sequenziell lösen (jede Aufgabe schaltet die nächste frei)
3. Nach allen 5 Aufgaben: **Code eingeben** → nächste Mappe öffnet sich
4. **Fortschritt** wird automatisch im Browser gespeichert (localStorage)
5. Nach Mappe 7: Abschluss-Zertifikat erscheint

### Reset
Auf der Startseite den **↺ Reset**-Button klicken, um den Fortschritt zu löschen
(praktisch für neue Schülergruppen am selben Gerät).

---

## 🧩 Aufgabentypen

Die sieben Mappen enthalten verschiedene interaktive Aufgabenformate:

| Format | Beispiel |
|--------|---------|
| Multiple Choice | Eine richtige Antwort aus vier Optionen |
| Multiple Select | Mehrere richtige Antworten ankreuzen |
| Richtig/Falsch-Tabelle | Historische Aussagen einordnen |
| Zuordnung (Matching) | Begriffe zu Definitionen/Kategorien zuordnen |
| Zeitstrahl (Sorting) | Ereignisse in chronologische Reihenfolge bringen |

---

## 🖥️ Technische Hinweise

- **Kein Server nötig** – rein statische Website (HTML + CSS + JavaScript)
- **Kein Framework** – funktioniert ohne Build-Tools, Node.js oder npm
- **Fortschritt**: wird im `localStorage` des Browsers gespeichert (kein Login)
- **Getestet in**: Chrome, Firefox, Safari (aktuelle Versionen)
- **Responsive**: funktioniert auf iPad/Tablet und Desktop; für Smartphones bedingt geeignet
- **Barrierefreiheit**: ARIA-Labels, semantisches HTML, Keyboard-Navigation

### Lokales Testen (ohne GitHub)
Da die Website nur statische Dateien enthält, reicht es, `index.html` direkt
im Browser zu öffnen – **oder** einen lokalen Server zu starten:

```bash
# Python 3 (meistens vorinstalliert)
cd archiv45/
python3 -m http.server 8000
# → http://localhost:8000
```

---

## 📖 Didaktischer Hintergrund

**Zielgruppe:** Klasse 8, Mittelschule Bayern
**Lehrplan:** LehrplanPLUS Bayern – Geschichte – Lernbereich 3: Der Zweite Weltkrieg
**Kompetenzen:**
- *Sachkompetenz*: Historisches Wissen zu Stalingrad, Holocaust, Widerstand, D-Day, Kriegsende
- *Methodenkompetenz*: Quellenanalyse, Propaganda erkennen, Karten lesen
- *Urteilskompetenz*: Historische Zusammenhänge bewerten, ethische Fragen reflektieren

**Pädagogischer Ansatz:**
- Schüler:innen schlüpfen in die Rolle von *Archiv-Ermittler:innen* (nicht Kriegsteilnehmer:innen)
- Selbstreguliertes Lernen: Feedback direkt nach jeder Aufgabe
- Alle Informationen sind im Material enthalten – kein Vorwissen nötig
- Holocaust und NS-Verbrechen werden sachlich und respektvoll thematisiert

---

## ⚠️ Hinweise für Lehrkräfte

- **Mappe 2 (Holocaust)** enthält einen inhaltlichen Hinweis zu Beginn
- Die Codes der Mappen sind **nicht im HTML-Quelltext sichtbar** – aber für technisch versierte Schüler:innen über die JavaScript-Konsole auffindbar. Der Fokus liegt auf dem Lernprozess, nicht auf Sicherheit.
- Empfehlung: Website auf Schul-iPads oder Schulrechnern öffnen, **nicht** als Hausaufgabe – so bleibt die Unterrichtssteuerung erhalten

---

## 📄 Lizenz & Quellen

Dieses Projekt ist für den schulischen Einsatz entwickelt.
Alle historischen Inhalte basieren auf allgemein zugänglichem Unterrichtsmaterial
(LehrplanPLUS Bayern, Schulbuchinhalte Klasse 8).

Erstellt mit Unterstützung von Claude (Anthropic) · März 2026
