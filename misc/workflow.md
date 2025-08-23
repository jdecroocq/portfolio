# Workflow Portfolio (GitHub + Vercel)

## 1. Branches

-   `main` : version stable, déployée sur
    <https://jdecroocq.vercel.app>\
-   `dev` : version de développement/test, déployée sur
    <https://jdecroocq-dev.vercel.app>

------------------------------------------------------------------------

## 2. Développement

-   Le code est modifié directement sur la branche `dev`.\
-   Le lieu de développement est libre (Codespaces, éditeur local,
    éditeur en ligne, etc.).\
-   Une fois les changements effectués, ils sont sauvegardés dans `dev`
    puis automatiquement déployés sur l'environnement `dev`.\
-   Les tests se font exclusivement sur l'URL `dev`.

------------------------------------------------------------------------

## 3. Passage en production

-   Une **Pull Request** est créée de `dev` vers `main`.\
-   La PR peut être ouverte dès le début du cycle et reste mise à jour
    avec les changements de `dev` jusqu'à la fusion.\
-   Après revue et validation, la PR est fusionnée dans `main`.\
-   Le déploiement de `main` est ensuite automatique sur l'URL de
    production.

------------------------------------------------------------------------

## 4. Versionnage

-   Numérotation : `MAJEUR.MINEUR.PATCH`
    -   **MAJEUR** : changements d'architecture ou de technique de
        construction du site.\
    -   **MINEUR** : ensemble cohérent de nouvelles fonctionnalités ou
        évolutions formant un objectif global.\
    -   **PATCH** : corrections de bugs ou ajustements mineurs.
-   Organisation :
    -   Les versions sont préparées dans **Microsoft To Do**, chaque
        version correspond à un ensemble de tâches regroupées par
        objectif.\
    -   Au fur et à mesure, les tâches validées sont supprimées de To Do
        et ajoutées à la **release draft** sur GitHub.\
    -   Quand la liste To Do est vide, la version est considérée comme
        prête.\
    -   La branche `dev` est fusionnée dans `main`, la draft release est
        publiée, et si besoin, des patchs correctifs sont créés.\
    -   Les mises à jour regroupant plusieurs corrections de bugs ou
        améliorations mineures indépendantes peuvent être publiées sous
        la forme `vX.Y.Z-R`.

------------------------------------------------------------------------
