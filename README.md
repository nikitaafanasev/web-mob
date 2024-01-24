# Einleitung
Dieses Repository enthält das Grundgerüst für einen API-Server und einen Web-Client im Rahmen der Veranstaltung "Web & Mobile Engineering" im Masterstudiengang WI. Das Beispiel ist funktional bewusst klein gehalten. Vielmehr wird auf die Einbindung der relevanten Technologien fokussiert (mit Ausnahme von Capacitor und Ionic).

Dieses Grundgerüst darf als Grundlage für Erbringung der Prüfungsleistung verwendet werden.


# Installation und Start
## Server
```sh
$ cd api-server
$ npm i
$ npm start
```

## Client
```sh
$ cd client
$ npm i
$ npm start
```

# Konfiguration

## DB

### Auswahl des DBMS

Für die Nutzung einer MongoDB-Datenbank ist die Datei `config.json` anzupassen, wobei der Wert `mongodb` anzugeben ist. Jeder andere Wert wird als InMemoryDB interpretiert.

### Initiale Daten laden

Wenn in der `config.json` der Eintrag `seed` auf `true` gesetzt wird, dann wird mit dem Start des Servers die Datei `db/seeds.json` eingelesen und damit initiale Daten in die DB importiert.

### Anpassung des Hosts

Wenn Sie eine virtuelle Maschine der DVZ nutzen, dann ist in der Datei `config.json` unter `host` der Wert anzupassen (`stud-vm-xxxx` statt `localhost`).
