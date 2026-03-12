# TP Bloc-Notes Electron

Petit projet de TP : realisation d'un bloc-notes desktop avec Electron.

L'application permet de creer, ouvrir, modifier et sauvegarder des fichiers texte `.txt`, avec une interface simple type Notepad/TextEdit.

Date : 12 mars 2026

## Lancer le projet

Prerequis :
- Node.js installe
- npm

Installation :

```bash
npm install
```

Demarrage :

```bash
npm start
```

Le projet se lance depuis le dossier racine :

```bash
cd /Users/mahdi/Downloads/tp-noter
npm start
```

## Build

Le build est genere avec electron-builder.
Installation (une seule fois) : `npm install`.
Build macOS : `npm run build:mac` (equivalent a `npx electron-builder --mac`).
Build multi-plateforme (si necessaire) : `npm run build`.
Les fichiers de sortie sont crees dans le dossier `dist/`.

## Barème du TP - Couverture complete

| Code | Fonctionnalite demandee | Statut |
|------|-------------------------|--------|
| F1 | Zone de texte editable (fond sombre + police monospace) | Fait |
| F2 | Bouton Ouvrir avec dialog.showOpenDialog() + affichage contenu | Fait |
| F3 | Bouton Sauvegarder avec dialog.showSaveDialog() pour nouveau fichier | Fait |
| F4 | Menu natif Fichier : Nouveau, Ouvrir, Sauvegarder, Quitter + raccourcis | Fait |
| F5 | Titre dynamique : Bloc-Notes - nomFichier.txt | Fait |
| F6 | Compteur de caracteres en temps reel | Fait |
| F7 | Notification native apres sauvegarde reussie | Fait |
| F8 | Securite Electron : contextIsolation true, nodeIntegration false, preload + contextBridge | Fait |
| BONUS | Confirmation avant fermeture si modifs non sauvegardees | Fait |
| BONUS | Bascule theme clair/sombre + memorisation electron-store | Fait |

## Fonctionnalites detaillees

- Zone de texte editable (theme sombre + police monospace)
- Ouverture de fichier via une boite de dialogue native
- Sauvegarde de fichier avec choix d'emplacement si nouveau document
- Menu natif **Fichier** : Nouveau, Ouvrir, Sauvegarder, Quitter
- Raccourcis clavier :
  - `Ctrl/Cmd + N`
  - `Ctrl/Cmd + O`
  - `Ctrl/Cmd + S`
- Titre de fenetre dynamique (nom du fichier courant)
- Compteur de caracteres en temps reel
- Notification native apres sauvegarde reussie
- Securite Electron respectee :
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - communication via `preload` + `contextBridge`
- Gestion de l'etat du document (propre/modifie) pour eviter la perte de donnees
- Sauvegarde avant fermeture via dialogue de confirmation
- Memorisation du theme utilisateur entre deux lancements

## Bonus

- Confirmation avant fermeture si des modifications ne sont pas sauvegardees
- Bascule theme clair/sombre avec memorisation (electron-store)

## Architecture technique

- Processus principal Electron : creation de fenetre, menu natif, dialogs systeme, notifications
- Preload securise : expose une API minimale au renderer via contextBridge
- Renderer : logique UI (editeur, boutons, compteur, theme, actions menu)
- IPC en mode invoke/handle pour les operations sensibles (ouvrir/sauvegarder/theme)

Canaux IPC principaux :
- file:open
- file:save
- window:setTitle
- editor:setDirty
- theme:get
- theme:toggle

## Structure du projet

```text
tp-noter/
  src/
    main.js       # Processus principal (fenetre, menu, IPC, dialogs)
    preload.js    # API securisee exposee au renderer
    renderer.js   # Logique interface (editeur, boutons, compteur, theme)
    index.html    # Interface
    styles.css    # Styles
  package.json
  README.md
```

## Remarque

Projet realise dans le cadre d'un TP d'apprentissage Electron.
