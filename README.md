# Wedone Web Apps

**Suite personnelle d’applications web — version 2.0.0**

Wedone rassemble quatre outils dans un portail unique, sans compte et sans service cloud obligatoire. Les données sont conservées localement dans le navigateur. Le portail permet également d’exporter ou de restaurer une sauvegarde commune au format JSON.

## Applications

| Application | Version | Rôle |
|---|---:|---|
| Wedone To Do List | 3.0.0 | Tâches, dossiers, priorités, sous-tâches et échéances |
| Wedone Notepad | 1.0.0 | Notes personnelles et mise en forme |
| Wedone QR Code | 2.0.0 | Génération et historique de QR codes |
| Wedone Calendar | 1.0.0 | Événements, vues calendrier, répétitions et rappels locaux |

## Lancer le projet

- **En local :** ouvrir `index.html` dans un navigateur moderne. Certaines fonctions de navigateur peuvent nécessiter un serveur local HTTP.
- **GitHub Pages :** publier le contenu de la branche principale à la racine du dépôt. Le workflow `.github/workflows/jekyll-gh-pages.yml` assure le déploiement Pages.

## Données et confidentialité

- Pas de création de compte requise.
- Les données applicatives sont stockées dans le navigateur et ne sont pas synchronisées entre appareils automatiquement.
- Utiliser **Exporter toute la suite** pour créer un fichier de sauvegarde portable. Conserver ce fichier en lieu sûr.
- Restaurer une sauvegarde remplace les données locales prises en charge sur cet appareil ; exporter les données actuelles avant de restaurer.
- Les notifications et rappels du navigateur dépendent des permissions, du navigateur et de son fonctionnement en arrière-plan ; ils ne sont pas garantis lorsque le navigateur est fermé.

## Identité visuelle

Les logos des quatre applications sont conservés. Le logo principal du portail est volontairement absent de cette archive afin que son auteur puisse ajouter la version finale validée. Le portail est déjà configuré pour charger le fichier **`wedone-mark.svg`** à la racine du dépôt : il sera utilisé comme icône de navigateur (favicon) et comme symbole dans l’en-tête, à côté du nom. Le fichier image lui-même est volontairement omis de cette archive ; ajoute ton SVG final à la racine avec exactement ce nom. Aucun autre code ne devrait être nécessaire.

## Contrôles de qualité

Les tests déterministes disponibles peuvent être exécutés avec Node.js :

```bash
node tests/logic-tests.js
```

Ils couvrent notamment la validation des données importées, les dates et récurrences du calendrier, ainsi que la validation de la sauvegarde commune. Ils ne remplacent pas un test manuel complet dans les navigateurs ciblés.

## Historique des versions

### 2.0.0 — Publication GitHub

- Consolidation du portail et des quatre applications.
- Ajout du calendrier à la suite.
- Sauvegarde et restauration communes au format JSON avec validation des données.
- Synchronisation du thème partagé entre les applications.
- Correction de l’affichage sombre de la fenêtre Paramètres sur la page d’accueil.
- Nettoyage des documents de développement et regroupement de la documentation dans ce fichier.
- Référence au logo principal configurée dans le favicon et l’en-tête via `wedone-mark.svg` ; le fichier du logo est à ajouter manuellement. Les logos des applications restent inchangés.

## Licence

Consulter `LICENSE` et les fichiers de licence inclus avec les composants concernés.
