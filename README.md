# Wedone Web Apps

**Suite personnelle d’applications web — version 2.0.0**

Wedone rassemble quatre applications dans un portail unique, sans compte et sans service cloud obligatoire. Les données sont conservées localement dans le navigateur. La suite propose des outils complémentaires pour organiser les tâches, prendre des notes, générer des QR codes et gérer un calendrier personnel.

Le portail centralise les préférences communes, notamment le thème d’affichage, ainsi que l’exportation et la restauration des données de l’ensemble des applications au format JSON.

## Sommaire

- [Applications](#applications)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Installation et lancement](#installation-et-lancement)
- [Données et confidentialité](#données-et-confidentialité)
- [Identité visuelle](#identité-visuelle)
- [Historique des versions](#historique-des-versions)
- [Licence](#licence)

## Applications

| Application | Version | Fonction principale |
|---|---:|---|
| Wedone To Do List | 3.0.0 | Tâches, dossiers, priorités, sous-tâches et échéances |
| Wedone Notepad | 1.0.0 | Notes, mise en forme et intégration des tâches et QR codes |
| Wedone QR Code | 2.0.0 | Génération, historique et réutilisation des QR codes |
| Wedone Calendar | 1.0.0 | Événements, calendrier, récurrences et rappels locaux |

## Fonctionnalités principales

### Portail Wedone

- Page d’accueil regroupant les quatre applications.
- Thème clair, sombre ou automatique.
- Préférences partagées entre les applications.
- Synchronisation du thème entre les onglets lorsque le navigateur le permet.
- Sauvegarde globale des données prises en charge par les quatre applications et des préférences communes.
- Restauration globale avec validation des données et confirmation avant remplacement.
- Meilleure gestion des erreurs de sauvegarde et de restauration.
- Interface et présentation générale améliorées.

### Wedone To Do List

- Création et organisation des tâches dans des dossiers.
- Sous-tâches imbriquées sur plusieurs niveaux.
- Déplacement et réorganisation des tâches et sous-tâches.
- Priorités normales, importantes et urgentes.
- Dates d’échéance et heures.
- Vues **Aujourd’hui** et **À venir**.
- Recherche, tri et filtres.
- Descriptions et étiquettes.
- Suivi de la progression des tâches et des dossiers.
- Importation et exportation JSON améliorées.
- Menus et actions adaptés aux sous-tâches.
- Meilleure validation des données importées et gestion des données invalides ou trop volumineuses.
- Gestion améliorée des erreurs d’enregistrement.

### Wedone Notepad

- Création, modification et suppression de notes.
- Éditeur de texte enrichi avec mise en forme.
- Recherche et navigation entre les notes.
- Enregistrement local des notes.
- Checklists indépendantes.
- Insertion de listes de tâches liées à Wedone To Do, avec synchronisation des tâches.
- Insertion de QR codes sous forme d’images PNG.
- Menu **Insérer** regroupant les checklists, les listes To Do liées et les QR codes.
- Distinction visuelle entre les checklists indépendantes et les listes synchronisées.
- Accès à la tâche ou à la liste To Do source.
- Conservation des blocs insérés lors de la réouverture d’une note.
- Préservation de la mise en forme et nettoyage des contenus HTML collés.
- Améliorations de la sélection, du collage, de la mise en forme et de la sauvegarde.
- Gestion améliorée des erreurs d’enregistrement.

### Wedone QR Code

- Génération de QR codes à partir d’un contenu.
- Copie du contenu associé à un QR code.
- Historique des QR codes générés.
- Réutilisation des éléments de l’historique.
- Cartes d’historique proposant les actions **Ouvrir**, **Télécharger** et **Copier**.
- Insertion des QR codes dans Wedone Notepad.
- Gestion des échecs de copie et de téléchargement.
- Présentation améliorée du formulaire et de l’aperçu.

### Wedone Calendar

- Vues calendrier par jour, semaine, mois et agenda.
- Semaine commençant le lundi.
- Navigation entre les dates et retour à la date du jour.
- Création rapide d’événements et formulaire détaillé.
- Modification, suppression et duplication d’événements.
- Événements sur plusieurs jours et événements sur toute la journée.
- Descriptions, lieux, catégories et couleurs.
- Récurrences quotidiennes, hebdomadaires, mensuelles et annuelles.
- Rappels et notifications du navigateur.
- Recherche et filtres.
- Affichage des tâches To Do datées dans le calendrier.
- Distinction visuelle entre événements et tâches.
- Gestion des événements qui se chevauchent et des événements multi-jours.
- Prise en compte des événements récurrents commencés avant la période affichée.
- Accès à la tâche To Do source depuis le calendrier.
- Confirmation avant la suppression d’une série récurrente.
- Rappel par défaut à 09 h pour les événements sur toute la journée.
- Importation et exportation des événements.
- Sauvegarde globale via le portail.

## Installation et lancement

### En local

1. Récupérer le contenu du dépôt.
2. Ouvrir `index.html` dans un navigateur moderne.
3. Si certaines fonctionnalités ne fonctionnent pas correctement en ouverture directe, lancer le site à l’aide d’un serveur HTTP local.

### Sur GitHub Pages

Publier le contenu du dépôt à la racine du site GitHub Pages. Le workflow `.github/workflows/jekyll-gh-pages.yml` publie les fichiers statiques utiles sans compilation Jekyll, afin d’éviter qu’un ancien thème ou des fichiers de build ne modifient le portail.

Pour le correctif de publication **2.0.1**, les références du portail utilisent un identifiant de version `v=2.0.1` afin de limiter les problèmes liés au cache du navigateur.

Lors d’une mise à jour :

1. Remplacer les fichiers du dépôt par leur contenu actualisé, et non par le ZIP lui-même.
2. Vérifier que `index.html`, `style.css`, `shared.js` et `script.js` se trouvent à la racine du dépôt publié.
3. Vérifier la présence du fichier `.nojekyll`.
4. Contrôler le résultat une fois le déploiement terminé, en actualisant le navigateur si nécessaire.

Le workflow de publication assemble explicitement les fichiers du site. Les anciens fichiers PNG ou CSS inutilisés présents dans le dépôt ne sont donc pas nécessairement inclus dans le site publié.

## Données et confidentialité

- Aucune création de compte n’est requise.
- Les données applicatives sont conservées localement dans le navigateur.
- Les données ne sont pas automatiquement synchronisées entre plusieurs appareils.
- La disponibilité des données dépend notamment du navigateur et de la conservation de ses données locales.
- Utiliser **Exporter toute la suite** pour créer une sauvegarde portable au format JSON.
- Conserver les sauvegardes dans un emplacement sûr.
- Avant une restauration, exporter les données actuelles afin de pouvoir les récupérer si nécessaire.
- La restauration remplace les données locales prises en charge sur l’appareil concerné.
- Les données importées sont soumises à des validations afin de limiter les risques liés aux fichiers invalides ou mal formés.

### Notifications et rappels

Les notifications dépendent des permissions accordées, des capacités du navigateur et de son fonctionnement en arrière-plan. Elles ne sont pas garanties lorsque le navigateur est fermé ou que le système empêche leur exécution.

Les rappels locaux ne doivent donc pas être considérés comme un système d’alerte garanti.

## Identité visuelle

Les logos des quatre applications sont conservés.

Le logo principal du portail est volontairement absent de cette archive afin que son auteur puisse ajouter la version finale validée. Le portail est configuré pour charger `wedone-mark.svg` à la racine du dépôt, à la fois comme favicon et comme symbole dans l’en-tête, à côté du nom Wedone.

Pour utiliser le logo final, ajouter le fichier SVG à la racine du dépôt sous le nom exact :

`wedone-mark.svg`

Aucune autre modification du code ne devrait être nécessaire si le fichier respecte ce nom et le format attendu.

## Nettoyage du portail

- Le portail charge uniquement les règles de `style.css` qui lui sont destinées.
- Les anciens styles du tableau de bord ont été retirés.
- Le bouton expérimental « Vue tableau de bord » a été supprimé.
- Le workflow de publication sélectionne explicitement les fichiers à publier.
- Les anciens fichiers inutilisés ne sont pas automatiquement intégrés au site publié.


## Historique des versions

### Wedone Web Apps — 2.0.0

**Portail, préférences et sauvegarde globale**

- Regroupement des quatre applications dans une nouvelle page d’accueil.
- Ajout du thème clair, sombre et automatique.
- Amélioration des préférences communes.
- Synchronisation du thème entre les onglets lorsque cette fonctionnalité est disponible.
- Sauvegarde globale intégrant les données prises en charge par les quatre applications et les préférences communes.
- Restauration globale avec validation et confirmation avant remplacement.
- Meilleure gestion des erreurs de sauvegarde et de restauration.
- Améliorations générales de l’interface.
- Correction de l’affichage sombre de la fenêtre Paramètres sur la page d’accueil.
- Nettoyage du portail et regroupement de la documentation dans ce fichier.
- Configuration du favicon et du symbole d’en-tête via `wedone-mark.svg` ; le fichier final du logo doit être ajouté manuellement.

### Wedone To Do List — 3.0.0

**Organisation avancée des tâches**

- Ajout des sous-tâches imbriquées sur plusieurs niveaux.
- Déplacement et réorganisation des tâches et des sous-tâches.
- Ajout des priorités normales, importantes et urgentes.
- Ajout des dates d’échéance et des heures.
- Ajout des vues Aujourd’hui et À venir.
- Ajout de la recherche, du tri et des filtres.
- Ajout des descriptions et des étiquettes.
- Amélioration du calcul de progression des tâches et des dossiers.
- Amélioration de l’importation et de l’exportation JSON.
- Amélioration des menus et des actions sur les sous-tâches.
- Renforcement de la validation des données et de la gestion des imports invalides ou trop volumineux.
- Amélioration de la gestion des erreurs d’enregistrement.

### Wedone QR Code — 2.0.0

**Historique et réutilisation des QR codes**

- Ajout de la copie du contenu associé à un QR code.
- Ajout de l’historique des QR codes générés.
- Possibilité de réutiliser les éléments de l’historique.
- Ajout des actions Ouvrir, Télécharger et Copier sur les cartes d’historique.
- Intégration des QR codes dans Wedone Notepad.
- Amélioration de la présentation du formulaire et de l’aperçu.
- Meilleure gestion des échecs de copie et de téléchargement.

### Wedone Notepad — 1.0.0

**Nouvelle application de prise de notes**

- Création, modification et suppression de notes.
- Ajout d’un éditeur de texte enrichi.
- Ajout de la recherche et de la navigation entre les notes.
- Enregistrement local.
- Ajout de checklists indépendantes.
- Insertion de listes To Do liées avec synchronisation des tâches.
- Insertion de QR codes au format PNG.
- Regroupement des fonctions d’insertion dans un menu dédié.
- Distinction visuelle entre les checklists indépendantes et les listes To Do synchronisées.
- Accès aux tâches et listes sources.
- Conservation des blocs insérés après réouverture des notes.
- Amélioration de la préservation de la mise en forme et du nettoyage du HTML collé.
- Amélioration de la sélection, du collage, de la mise en forme et de la sauvegarde.

### Wedone Calendar — 1.0.0

**Nouvelle application de calendrier**

- Ajout des vues jour, semaine, mois et agenda.
- Ajout de la navigation par date et du retour à aujourd’hui.
- Ajout de la création rapide, de la modification, de la suppression et de la duplication des événements.
- Prise en charge des événements sur plusieurs jours et sur toute la journée.
- Ajout des descriptions, lieux, catégories et couleurs.
- Ajout des récurrences quotidiennes, hebdomadaires, mensuelles et annuelles.
- Ajout des rappels et des notifications du navigateur.
- Ajout de la recherche et des filtres.
- Affichage des tâches To Do datées dans le calendrier.
- Distinction visuelle entre les événements et les tâches.
- Amélioration du traitement des événements qui se chevauchent et des événements récurrents.
- Ajout de l’accès à la tâche To Do source depuis le calendrier.
- Confirmation avant la suppression d’une série récurrente.
- Rappel par défaut à 09 h pour les événements sur toute la journée.
- Ajout de l’importation et de l’exportation des événements.
- Amélioration des explications concernant les limites des notifications.

### Wedone Web Apps — 2.0.1

**Correctif de publication GitHub Pages**

- Ajout de l’identifiant de version `v=2.0.1` aux références du portail afin de limiter les problèmes de cache.
- Clarification des consignes de publication des fichiers à la racine du dépôt.
- Utilisation de `.nojekyll` pour indiquer que le site est statique.
- Publication via un workflow sélectionnant explicitement les fichiers utiles.

### Fiabilité et validation des données

**Améliorations transversales**

- Renforcement de la validation des données importées.
- Rejet des couleurs malveillantes dans les imports Calendar.
- Validation des titres trop longs et des dates invalides.
- Amélioration de la gestion des données invalides ou trop volumineuses.
- Correction des récurrences mensuelles ancrées en fin de mois.
- Correction du traitement des événements multi-jours chevauchant la période affichée.
- Tests des validateurs de sauvegarde des quatre applications et des préférences communes.
- Amélioration de la gestion des erreurs et des protections contre la perte de données.
- Nettoyage des anciens styles et éléments inutilisés.

## Licence

Consulter `LICENSE` ainsi que les fichiers de licence inclus avec les composants concernés.
