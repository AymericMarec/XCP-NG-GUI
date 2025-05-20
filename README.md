# XCP-ng GUI

Une interface graphique moderne pour gérer votre infrastructure XCP-ng. Cette application web permet de gérer facilement vos machines virtuelles, surveiller les ressources et administrer votre serveur XCP-ng.

## Fonctionnalités

- 📊 **Tableau de bord** : Vue d'ensemble de toutes vos machines virtuelles
- 🖥️ **Gestion des VMs** :
  - Création de nouvelles machines virtuelles
  - Démarrage/arrêt des VMs
  - Suppression de VMs
  - Visualisation détaillée des ressources (CPU, RAM, stockage)
- 💾 **Gestion du stockage** :
  - Vue d'ensemble de l'utilisation du stockage
  - Graphiques de répartition
  - Surveillance en temps réel
- ⚙️ **Configuration** :
  - Interface de configuration simple pour connecter votre serveur XCP-ng
  - Gestion des paramètres de connexion

## Prérequis

- Un serveur XCP-ng 8.3 ou supérieur
- Node.js 18 ou supérieur
- npm 9 ou supérieur
- Git

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/votre-username/xcp-gui.git
cd xcp-gui
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez l'application en mode développement :
```bash
npm run dev
```

L'application sera accessible à l'adresse `http://localhost:3000`

## Configuration

1. Accédez à l'application via votre navigateur
2. Rendez-vous dans la section "Configuration"
3. Entrez les informations de connexion de votre serveur XCP-ng :
   - Adresse IP du serveur
   - Nom d'utilisateur
   - Mot de passe

## Utilisation

### Création d'une VM
1. Cliquez sur "Créer une VM" dans le menu
2. Remplissez les informations requises :
   - Nom de la VM
   - Système d'exploitation (templates disponibles)
   - Description (optionnel)
3. Cliquez sur "Créer la VM"

### Gestion du stockage
1. Accédez à la section "Stockage"
2. Visualisez l'utilisation du stockage via les graphiques
3. Surveillez l'espace disponible et utilisé

### Surveillance des VMs
1. Sur le tableau de bord, vous pouvez voir l'état de toutes vos VMs
2. Cliquez sur une VM pour voir ses détails
3. Gérez l'état de la VM (démarrage/arrêt)
4. Surveillez les ressources en temps réel

## Technologies utilisées

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Recharts pour les graphiques
- SSH2 pour la communication avec XCP-ng

## Automatisation

Le projet inclut plusieurs scripts pour automatiser des tâches courantes :

### Scripts Disponibles
- `create_vm.sh` : Création automatisée de machines virtuelles avec arguments
- `destroy_vm.sh` : Suppression de machines virtuelles
- `get_storage.sh` : Récupération des informations de stockage


## Composants Principaux
- **Serveur XCP-ng** : Hyperviseur principal
- **Interface Web** : Application Next.js
