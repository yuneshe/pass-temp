export default {
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    ok: 'OK',
    search: 'Rechercher',
    back: 'Retour',
    view: 'Voir',
    confirm: 'Confirmer',
    reset: 'Réinitialiser',
    apply: 'Appliquer',
    retry: 'Réessayer',
    close: 'Fermer',
    selectLanguage: 'Sélectionner la Langue'
  },
  navigation: {
    home: 'Accueil',
    materials: 'Matériels',
    downloads: 'Téléchargements',
    chat: 'Discussion',
    profile: 'Profil',
    settings: 'Paramètres',
    notifications: 'Notifications',
    createChatSubject: 'Nouvelle Discussion',
    materialDetail: 'Détails du Matériel',
    changePassword: 'Changer le Mot de Passe'
  },
  materials: {
    title: 'Matériels',
    findMaterials: 'Rechercher des Matériels',
    all: 'Tout',
    find: 'Rechercher',
    search: {
      placeholder: 'Rechercher des matériels...',
      noResults: 'Aucun matériel trouvé',
      error: 'Erreur lors de la recherche'
    },
    filters: {
      section: 'Section',
      level: 'Niveau',
      category: 'Catégorie',
      subject: 'Matière'
    },
    hierarchy: {
      section: 'Section',
      level: 'Niveau',
      category: 'Catégorie',
      subject: 'Matière',
      materials: 'Matériels',
      selectSection: 'Sélectionner une Section',
      selectLevel: 'Sélectionner un Niveau',
      selectCategory: 'Sélectionner une Catégorie',
      selectSubject: 'Sélectionner une Matière',
      back: 'Retour à {{level}}'
    },
    status: {
      free: 'Gratuit',
      paid: 'Payant',
      downloaded: 'Téléchargé',
      downloading: 'Téléchargement...'
    },
    sort: {
      title: 'Trier par',
      newest: 'Plus Récent',
      oldest: 'Plus Ancien',
      nameAZ: 'Nom A-Z',
      nameZA: 'Nom Z-A',
      priceHighLow: 'Prix Décroissant',
      priceLowHigh: 'Prix Croissant'
    },
    errors: {
      loadFailed: 'Échec du chargement des matériels',
      downloadFailed: 'Échec du téléchargement',
      tryAgain: 'Veuillez réessayer'
    },
    empty: {
      title: 'Aucun Matériel Trouvé',
      description: 'Il n\'y a pas encore de matériels disponibles dans cette section',
      action: 'Actualiser'
    },
    details: {
      size: 'Taille',
      created: 'Créé le',
      modified: 'Modifié le',
      price: 'Prix',
      download: 'Télécharger',
      preview: 'Aperçu'
    },
    loading: 'Chargement des matériels...',
    noResults: 'Aucun matériel trouvé',
    refresh: 'Tirer pour actualiser'
  },
  downloadsScreen: {
    title: 'Téléchargements',
    search: {
      placeholder: 'Rechercher dans les téléchargements...'
    },
    filters: {
      startDate: 'Date de Début',
      endDate: 'Date de Fin',
      clear: 'Effacer les Filtres',
      apply: 'Appliquer les Filtres'
    },
    dates: {
      notSelected: 'Non Sélectionné'
    },
    empty: {
      title: 'Aucun Téléchargement',
      description: 'Vous n\'avez pas encore téléchargé de matériels'
    },
    sort: {
      title: 'Trier par',
      newest: 'Plus Récent',
      oldest: 'Plus Ancien',
      nameAZ: 'Nom A-Z',
      nameZA: 'Nom Z-A',
      sizeHighLow: 'Taille Décroissante',
      sizeLowHigh: 'Taille Croissante'
    }
  },
  settings: {
    title: 'Paramètres',
    app: {
      title: 'Paramètres de l\'Application'
    },
    preferences: {
      title: 'Préférences'
    },
    notifications: {
      title: 'Notifications',
      push: {
        title: 'Notifications Push',
        enabled: 'Activer les Notifications Push',
        disabled: 'Les Notifications Push sont Désactivées'
      },
      emailNotifications: 'Notifications par Email',
      sound: 'Son',
      vibrate: 'Vibration',
      newMaterial: 'Notifications de Nouveaux Matériels',
      newChat: 'Notifications de Nouvelles Discussions'
    },
    sections: {
      help: {
        helpCenter: 'Centre d\'Aide',
        helpCenterDescription: 'Obtenir de l\'aide et du support pour l\'utilisation de l\'application'
      }
    },
    language: {
      title: 'Langue',
      selectLanguage: 'Sélectionner la Langue',
      current: 'Langue Actuelle',
      options: {
        en: 'Anglais',
        fr: 'Français'
      }
    },
    theme: {
      title: 'Thème',
      light: 'Clair',
      dark: 'Sombre',
      system: 'Système par Défaut',
      auto: 'Auto (suit le système)'
    },
    account: {
      title: 'Compte',
      profile: 'Profil',
      email: 'Email',
      password: 'Mot de passe',
      changePassword: 'Changer le Mot de Passe',
      signOut: 'Déconnexion',
      deleteAccount: 'Supprimer le Compte',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    },
    data: {
      title: 'Données et Stockage',
      clearCache: 'Vider le Cache',
      downloadedContent: 'Contenu Téléchargé',
      storageUsed: 'Stockage Utilisé',
      autoDownload: 'Téléchargement Auto en Wi-Fi'
    }
  },
  helpCenter: {
    header: {
      title: 'Centre d\'Aide',
      subtitle: 'Comment pouvons-nous vous aider aujourd\'hui ?'
    },
    search: {
      placeholder: 'Rechercher des articles d\'aide...'
    },
    sections: {
      gettingStarted: {
        title: 'Pour Commencer',
        items: [
          {
            title: 'Bienvenue sur PASS',
            content: 'Découvrez l\'application PASS et comment elle peut vous aider à accéder aux matériels éducatifs.'
          },
          {
            title: 'Créer Votre Compte',
            content: 'Guide étape par étape pour créer et configurer votre compte PASS.'
          },
          {
            title: 'Navigation dans l\'Application',
            content: 'Apprenez à naviguer dans les différentes sections de l\'application.'
          },
          {
            title: 'Comprendre les Types de Matériels',
            content: 'Aperçu des différents types de matériels disponibles dans PASS.'
          }
        ]
      },
      materials: {
        title: 'Matériels',
        items: [
          {
            title: 'Parcourir les Matériels',
            content: 'Apprenez à parcourir et trouver des matériels par matière, niveau ou catégorie.'
          },
          {
            title: 'Télécharger des Matériels',
            content: 'Instructions pour télécharger des matériels pour un accès hors ligne.'
          },
          {
            title: 'Gérer les Téléchargements',
            content: 'Comment gérer vos matériels téléchargés et l\'espace de stockage.'
          }
        ]
      },
      downloads: {
        title: 'Téléchargements',
        items: [
          {
            title: 'Paramètres de Téléchargement',
            content: 'Configurez vos préférences de téléchargement et options de stockage.'
          },
          {
            title: 'Accès Hors Ligne',
            content: 'Apprenez à accéder à vos matériels téléchargés sans internet.'
          },
          {
            title: 'Gestion du Stockage',
            content: 'Conseils pour gérer l\'espace de stockage et effacer les données en cache.'
          }
        ]
      },
      payments: {
        title: 'Paiements',
        items: [
          {
            title: 'Moyens de Paiement',
            content: 'Découvrez les moyens de paiement pris en charge et comment les ajouter.'
          },
          {
            title: 'Effectuer des Achats',
            content: 'Guide étape par étape pour acheter des matériels premium.'
          },
          {
            title: 'Historique de Facturation',
            content: 'Comment consulter et gérer votre historique d\'achats.'
          }
        ]
      }
    }
  },
  auth: {
    login: 'Connexion',
    register: 'Inscription',
    signOut: 'Déconnexion'
  },
  chat: {
    title: 'Chat',
    noSubjects: 'Aucun sujet disponible',
    noChats: 'Aucun chat disponible',
    newChat: 'Nouveau Chat',
    createChat: 'Créer un Chat',
    chatTitle: 'Titre du Chat',
    typeMessage: 'Écrivez un message...',
    send: 'Envoyer',
    joinChat: 'Rejoindre le Chat',
    leaveChat: 'Quitter le Chat',
    noSubjects: 'Aucune discussion pour le moment. Soyez le premier à en créer une !',
    noMessages: 'Aucun message pour le moment. Commencez la conversation !',
    subjectTitle: 'Titre',
    subjectTitlePlaceholder: 'Entrez le titre de la discussion...',
    subjectDescription: 'Description',
    subjectDescriptionPlaceholder: 'De quoi souhaitez-vous discuter ?',
    createSubject: 'Créer une Discussion',
    typingPlaceholder: 'Tapez votre message...'
  },
  home: {
    welcome: 'Bienvenue',
    subtitle: 'Que souhaitez-vous faire aujourd\'hui ?',
    quickAccess: 'Accès Rapide',
    seeAll: 'Voir Tout',
    features: {
      browseMaterials: 'Parcourir les Matériels',
      myDownloads: 'Mes Téléchargements',
      searchMaterials: 'Rechercher des Matériels',
      myProfile: 'Mon Profil'
    },
    recentMaterials: 'Matériels Récents',
    popularMaterials: 'Matériels Populaires',
    viewAll: 'Voir Tout',
    categories: 'Catégories',
    downloadedMaterials: 'Matériels Téléchargés',
    notifications: {
      title: 'Notifications',
      empty: 'Aucune nouvelle notification',
      viewAll: 'Voir Tout'
    },
    quickActions: {
      title: 'Actions Rapides',
      download: 'Télécharger',
      share: 'Partager',
      favorite: 'Favoris'
    },
    stats: {
      downloads: 'Téléchargements',
      materials: 'Matériels',
      subjects: 'Matières'
    }
  }
};
