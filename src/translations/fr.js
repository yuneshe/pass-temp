export default {
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    delete: 'Supprimer',
    save: 'Enregistrer',
    edit: 'Modifier',
    add: 'Ajouter',
    ok: 'OK',
    search: 'Rechercher',
    back: 'Retour',
    next: 'Suivant',
    done: 'Terminé',
    retry: 'Réessayer',
    close: 'Fermer',
    confirm: 'Confirmer',
    reset: 'Réinitialiser',
    apply: 'Appliquer',
  },
  auth: {
    welcome: 'Bon retour !',
    loginToContinue: 'Connectez-vous pour continuer',
    email: 'Email',
    password: 'Mot de passe',
    emailPlaceholder: 'Entrez votre email',
    passwordPlaceholder: 'Entrez votre mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: 'Vous n\'avez pas de compte ?',
    signUp: 'S\'inscrire',
    signIn: 'Se connecter',
    signOut: 'Déconnexion',
    errors: {
      emptyFields: 'L\'email et le mot de passe sont requis',
      invalidEmail: 'Veuillez entrer un email valide',
      loginFailed: 'Échec de la connexion. Veuillez vérifier vos identifiants.',
      networkError: 'Erreur réseau. Veuillez vérifier votre connexion.',
    }
  },
  navigation: {
    home: 'Accueil',
    materials: 'Matériels',
    downloads: 'Téléchargements',
    chat: 'Discussions',
    profile: 'Profil',
    settings: 'Paramètres',
    search: 'Rechercher',
    notifications: 'Notifications',
    materialDetail: 'Détails du Matériel',
    changePassword: 'Changer le Mot de Passe',
    createChatSubject: 'Nouvelle Discussion',
    about: 'À Propos',
    help: 'Aide',
    contact: 'Contact'
  },
  settings: {
    title: 'Paramètres',
    subtitle: 'Personnalisez vos préférences',
    appearance: {
      title: 'Apparence',
      darkMode: {
        title: 'Mode Sombre',
        on: 'Thème sombre activé',
        off: 'Thème clair activé'
      },
      language: {
        title: 'Langue',
        en: 'Anglais',
        fr: 'Français'
      }
    },
    preferences: {
      title: 'Préférences'
    },
    app: {
      title: 'Application'
    },
    support: {
      title: 'Support',
      contact: 'Nous Contacter'
    },
    security: {
      title: 'Sécurité',
      password: {
        title: 'Changer le Mot de Passe',
        lastChanged: 'Dernière modification : {{date}}'
      },
      twoFactor: {
        title: 'Authentification à 2 Facteurs',
        subtitle: 'Ajoutez une couche de sécurité supplémentaire'
      },
      biometric: {
        title: 'Connexion Biométrique',
        subtitle: 'Utiliser l\'empreinte digitale ou la reconnaissance faciale'
      },
      autoLock: {
        title: 'Verrouillage Automatique',
        subtitle: 'Verrouiller l\'application en cas d\'inactivité',
        enabled: 'Activé',
        disabled: 'Désactivé'
      }
    },
    notifications: {
      title: 'Notifications',
      push: {
        title: 'Notifications Push',
        enabled: 'Recevoir des notifications sur les nouveaux matériels et mises à jour',
        disabled: 'Activez les notifications pour rester informé',
      },
      permission: {
        title: 'Activer les Notifications',
        message: 'Veuillez activer les notifications dans les paramètres de votre appareil pour recevoir des mises à jour sur les nouveaux matériels et les informations importantes.',
      },
      error: {
        title: 'Erreur de Notification',
        message: 'Échec de la mise à jour des paramètres de notification. Veuillez réessayer.',
      },
      test: {
        title: 'Notifications Activées',
        message: 'Vous recevrez désormais des notifications sur les nouveaux matériels et les mises à jour.',
      }
    },
    language: {
      title: 'Langue',
      options: {
        en: 'Anglais',
        fr: 'Français'
      }
    },
    about: {
      title: 'À Propos',
      version: 'Version {{version}}',
      build: 'Build {{build}}',
      privacy: 'Politique de Confidentialité',
      terms: 'Conditions d\'Utilisation',
      help: 'Centre d\'Aide',
      licenses: 'Licences',
      acknowledgements: 'Remerciements'
    },
    account: {
      title: 'Compte',
      delete: {
        title: 'Supprimer le Compte',
        message: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
        success: 'Compte supprimé avec succès',
        confirm: 'Oui, supprimer mon compte'
      }
    },
    storage: {
      title: 'Stockage',
      usage: 'Utilisation du Stockage',
      clear: {
        title: 'Vider le Cache',
        subtitle: 'Libérer de l\'espace en supprimant les données en cache',
        success: 'Cache vidé avec succès'
      }
    },
    sections: {
      help: {
        title: 'Aide & Support',
        helpCenter: 'Centre d\'Aide',
        helpCenterDescription: 'Apprenez à utiliser l\'application et obtenez des réponses aux questions courantes'
      }
    }
  },
  profile: {
    title: 'Profil',
    editProfile: 'Modifier le profil',
    myMaterials: 'Mes matériels',
    myDownloads: 'Mes téléchargements',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    changeAvatar: 'Changer l\'avatar',
    removeAvatar: 'Supprimer l\'avatar',
    saveChanges: 'Enregistrer les modifications',
    personalInfo: 'Informations personnelles',
    changePassword: 'Changer le mot de passe',
    biometricAuth: 'Authentification biométrique',
    autoLock: 'Verrouillage automatique',
    security: 'Sécurité',
    twoFactor: 'Authentification à deux facteurs',
    securityLog: 'Journal de sécurité',
    accountSettings: 'Paramètres du compte',
  },
  home: {
    welcome: 'Bon retour !',
    subtitle: 'Que souhaitez-vous apprendre aujourd\'hui ?',
    quickAccess: 'Accès Rapide',
    recentMaterials: 'Matériels Récents',
    seeAll: 'Voir Tout',
    features: {
      browseMaterials: 'Parcourir les Matériels',
      myDownloads: 'Mes Téléchargements',
      searchMaterials: 'Rechercher des Matériels',
      myProfile: 'Mon Profil'
    },
    loading: 'Chargement...',
    noMaterials: 'Aucun matériel récent'
  },
  materials: {
    title: 'Matériels d\'Apprentissage',
    subtitle: 'Parcourez et trouvez des supports d\'étude',
    findMaterials: 'Trouver des Matériels',
    all: 'Tout',
    find: 'Trouver',
    search: {
      placeholder: 'Rechercher des matériels...',
      noResults: 'Aucun matériel trouvé',
      error: 'Erreur lors de la recherche'
    },
    status: {
      free: 'GRATUIT',
      paid: 'Payant',
      downloading: 'Téléchargement...',
      downloaded: 'Téléchargé',
      error: 'Erreur'
    },
    errors: {
      loadFailed: 'Échec du chargement des matériels',
      selectSection: 'Veuillez d\'abord sélectionner une section',
      selectLevel: 'Veuillez d\'abord sélectionner un niveau',
      selectCategory: 'Veuillez d\'abord sélectionner une catégorie',
      selectSubject: 'Veuillez d\'abord sélectionner une matière',
      invalidSection: 'Section sélectionnée invalide',
      invalidLevel: 'Niveau sélectionné invalide',
      invalidCategory: 'Catégorie sélectionnée invalide',
      invalidSubject: 'Matière sélectionnée invalide',
      networkError: 'Erreur réseau. Veuillez vérifier votre connexion.'
    },
    empty: {
      materials: 'Aucun matériel trouvé',
      search: 'Aucun matériel ne correspond à votre recherche',
      hierarchy: 'Aucun élément trouvé dans cette section'
    },
    loading: {
      materials: 'Chargement des matériels...',
      hierarchy: 'Chargement...',
      more: 'Chargement de plus...'
    },
    filters: {
      title: 'Filtrer les Matériels',
      apply: 'Appliquer les Filtres',
      clear: 'Effacer les Filtres',
      section: 'Section',
      level: 'Niveau',
      category: 'Catégorie',
      subject: 'Matière'
    },
    hierarchy: {
      sectionTitle: 'Sélectionner une Section',
      sectionSubtitle: 'Choisissez votre section éducative',
      sectionAnglophone: 'Anglophone',
      sectionFrancophone: 'Francophone',
      
      levelTitle: 'Sélectionner un Niveau',
      levelSubtitle: 'Choisissez votre niveau scolaire',
      levelPrimary: 'Primaire',
      levelSecondary: 'Secondaire',
      levelAdvanced: 'Avancé',
      
      categoryTitle: 'Sélectionner une Catégorie',
      categorySubtitle: 'Choisissez une catégorie de matériel',
      categoryTextbooks: 'Manuels Scolaires',
      categoryPastQuestions: 'Questions d\'Examens',
      categoryNotes: 'Notes de Cours',
      categoryExercises: 'Exercices',
      
      subjectTitle: 'Sélectionner une Matière',
      subjectSubtitle: 'Choisissez votre matière',
      subjectMathematics: 'Mathématiques',
      subjectPhysics: 'Physique',
      subjectChemistry: 'Chimie',
      subjectBiology: 'Biologie',
      subjectEnglish: 'Anglais',
      subjectFrench: 'Français',
      subjectHistory: 'Histoire',
      subjectGeography: 'Géographie',
      
      materialsTitle: 'Matériels Disponibles',
      materialsSubtitle: 'Parcourir les matériels disponibles',
      materialsNoMaterials: 'Aucun matériel disponible',
      materialsLoading: 'Chargement des matériels...'
    },
    refresh: 'Tirez pour actualiser',
    viewDetails: 'Voir les Détails',
    download: 'Télécharger',
    price: {
      free: 'GRATUIT',
      from: 'À partir de'
    }
  },
  downloads: {
    title: 'Téléchargements',
    subtitle: 'Gérer vos documents téléchargés',
    noDownloads: 'Aucun téléchargement',
    inProgress: 'En cours',
    completed: 'Terminé',
    status: {
      downloading: 'Téléchargement',
      paused: 'En pause',
      completed: 'Terminé',
      failed: 'Échoué'
    },
    actions: {
      pause: 'Pause',
      resume: 'Reprendre',
      cancel: 'Annuler',
      retry: 'Réessayer',
      remove: 'Supprimer',
      open: 'Ouvrir'
    },
    storage: {
      title: 'Stockage',
      available: 'Disponible',
      used: 'Utilisé',
      free: 'Espace libre'
    },
    alerts: {
      deleteTitle: 'Supprimer le téléchargement',
      deleteMessage: 'Voulez-vous vraiment supprimer ce téléchargement ?',
      cancelTitle: 'Annuler le téléchargement',
      cancelMessage: 'Voulez-vous vraiment annuler ce téléchargement ?'
    }
  },
  chat: {
    title: 'Chat',
    typeMessage: 'Tapez un message...',
    sendError: 'Échec de l\'envoi du message',
    fetchError: 'Échec du chargement des messages',
    unknownUser: 'Utilisateur Inconnu',
    sendImage: 'Envoyer une image',
    imagePickerError: 'Échec de la sélection de l\'image',
    micPermissionDenied: 'L\'autorisation du microphone est requise pour les notes vocales',
    recordingError: 'Échec de l\'enregistrement de la note vocale',
    audioPlaybackError: 'Échec de la lecture de la note vocale',
    mediaUploadError: 'Échec du téléchargement du média',
    emptyChat: 'Pas encore de messages',
    loadingMessages: 'Chargement des messages...',
    retryMessage: 'Appuyez pour réessayer',
    deleteMessage: 'Supprimer le message',
    editMessage: 'Modifier le message',
    messageDeleted: 'Message supprimé',
    messageEdited: 'Message modifié',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce message ?',
  },
  errors: {
    loginFailed: 'Échec de la connexion. Veuillez vérifier vos identifiants.',
    networkError: 'Erreur réseau. Veuillez vérifier votre connexion.',
    unknownError: 'Une erreur inconnue s\'est produite. Veuillez réessayer.',
  },
  payment: {
    title: 'Paiement',
    amount: 'Montant',
    paymentMethod: 'Moyen de Paiement',
    cardNumber: 'Numéro de Carte',
    expiryDate: 'Date d\'Expiration',
    cvv: 'CVV',
    pay: 'Payer',
    processing: 'Traitement du Paiement...',
    success: 'Paiement Réussi',
    failed: 'Échec du Paiement',
  },
  search: {
    title: 'Recherche',
    placeholder: 'Rechercher des matériels, sujets...',
    noResults: 'Aucun résultat trouvé',
    categories: 'Catégories',
    subjects: 'Sujets',
    filters: 'Filtres',
    applyFilters: 'Appliquer les Filtres',
    clearFilters: 'Effacer les Filtres',
  },
  materialDetails: {
    header: {
      title: 'Détails du Matériel',
      subtitle: 'Voir les informations du matériel'
    },
    metadata: {
      category: 'Catégorie',
      subject: 'Matière',
      level: 'Niveau',
      status: 'Statut',
      free: 'Gratuit',
      paid: 'Acheté',
      unpaid: 'Non Acheté'
    },
    stats: {
      fileSize: 'Taille du fichier',
      unknown: 'Inconnue'
    },
    actions: {
      download: 'Télécharger',
      view: 'Voir Maintenant',
      viewNow: 'Voir Maintenant',
      purchase: 'Acheter Maintenant'
    },
    loading: {
      downloading: 'Téléchargement',
      processing: 'Traitement'
    },
    alerts: {
      success: 'Succès',
      error: 'Erreur',
      downloadSuccess: 'Téléchargement terminé avec succès',
      downloadError: 'Échec du téléchargement',
      fileNotFound: 'Fichier non trouvé',
      openError: 'Impossible d\'ouvrir le fichier',
      paymentSuccess: 'Paiement réussi',
      paymentFailed: 'Échec du paiement',
      paymentNotSuccessful: 'Le paiement n\'a pas réussi',
      processingError: 'Erreur lors du traitement du paiement',
      purchaseError: 'Erreur lors de l\'achat du matériel',
      share: 'Partager',
      shareComingSoon: 'Le partage sera bientôt disponible',
      materialNotFound: 'Matériel non trouvé'
    },
    payment: {
      chooseMethod: 'Choisir le Mode de Paiement',
      selectPayment: 'Sélectionnez votre mode de paiement préféré',
      mtnMomo: 'MTN Mobile Money',
      flutterwave: 'Paiement par Carte',
      cancel: 'Annuler'
    }
  },
  downloadsScreen: {
    header: {
      title: 'Téléchargements',
      subtitle: 'Voir vos matériels téléchargés'
    },
    empty: {
      title: 'Aucun Téléchargement',
      message: 'Vos matériels téléchargés apparaîtront ici',
      downloadNow: 'Télécharger des Matériels Maintenant'
    },
    list: {
      recentDownloads: 'Téléchargements Récents',
      allDownloads: 'Tous les Téléchargements',
      noDownloads: 'Aucun téléchargement pour le moment',
      noResults: 'Aucun téléchargement ne correspond à votre recherche ou filtre'
    },
    metadata: {
      downloaded: 'Téléchargé',
      fileSize: 'Taille',
      category: 'Catégorie',
      subject: 'Matière'
    },
    actions: {
      view: 'Voir',
      share: 'Partager',
      delete: 'Supprimer',
      open: 'Ouvrir',
      removeDownload: 'Supprimer le Téléchargement',
      cancel: 'Annuler'
    },
    filters: {
      title: 'Filtrer les Téléchargements',
      category: 'Catégorie',
      subject: 'Matière',
      date: 'Date',
      startDate: 'Date de Début',
      endDate: 'Date de Fin',
      apply: 'Appliquer',
      clear: 'Effacer',
      sortBy: 'Trier Par',
      sortOptions: {
        newest: 'Plus Récent',
        oldest: 'Plus Ancien',
        nameAZ: 'Nom (A-Z)',
        nameZA: 'Nom (Z-A)',
        size: 'Taille'
      }
    },
    alerts: {
      deleteTitle: 'Supprimer le Téléchargement',
      deleteMessage: 'Êtes-vous sûr de vouloir supprimer ce téléchargement ? Cette action ne peut pas être annulée.',
      deleteSuccess: 'Téléchargement supprimé avec succès',
      deleteError: 'Échec de la suppression du téléchargement',
      shareError: 'Échec du partage du fichier',
      openError: 'Impossible d\'ouvrir le fichier. Veuillez vous assurer d\'avoir une application compatible installée.',
      fileError: 'Impossible d\'ouvrir le matériel. Le fichier a peut-être été supprimé ou déplacé.',
      removeSuccess: 'Téléchargement supprimé avec succès',
      removeError: 'Impossible de supprimer le téléchargement',
      confirm: 'Confirmer',
      cancel: 'Annuler',
      error: 'Erreur',
      success: 'Succès'
    },
    loading: {
      loading: 'Chargement des téléchargements...',
      deleting: 'Suppression...',
      opening: 'Ouverture du fichier...'
    },
    search: {
      placeholder: 'Rechercher des matériels...',
      noResults: 'Aucun téléchargement trouvé correspondant à votre recherche',
      clear: 'Effacer la Recherche',
      searchPlaceholder: 'Rechercher des téléchargements'
    },
    dates: {
      notSelected: 'Non sélectionné'
    }
  },
  helpCenter: {
    header: {
      title: 'Centre d\'Aide',
      subtitle: 'Apprenez à utiliser l\'application'
    },
    sections: {
      gettingStarted: {
        title: 'Pour Commencer',
        items: {
          welcome: {
            title: 'Bienvenue sur PASS',
            content: 'PASS est votre bibliothèque numérique de matériels éducatifs. Accédez, téléchargez et gérez vos ressources d\'apprentissage en un seul endroit.'
          },
          navigation: {
            title: 'Navigation dans l\'Application',
            content: 'Utilisez la barre de navigation en bas pour basculer entre les écrans Accueil, Matériels, Téléchargements et Profil.'
          },
          language: {
            title: 'Changer de Langue',
            content: 'Vous pouvez basculer entre l\'anglais et le français dans l\'écran Paramètres sous votre Profil.'
          }
        }
      },
      materials: {
        title: 'Bibliothèque de Matériels',
        items: {
          browse: {
            title: 'Parcourir les Matériels',
            content: 'Parcourez notre vaste collection de matériels éducatifs. Filtrez par catégorie, matière et niveau pour trouver ce dont vous avez besoin.'
          },
          search: {
            title: 'Rechercher des Matériels',
            content: 'Utilisez la barre de recherche pour trouver des matériels spécifiques. Vous pouvez rechercher par titre, matière ou mots-clés.'
          },
          download: {
            title: 'Télécharger des Matériels',
            content: 'Cliquez sur le bouton de téléchargement pour sauvegarder les matériels pour un accès hors ligne. Les matériels gratuits peuvent être téléchargés immédiatement, tandis que le contenu premium nécessite un achat.'
          },
          pricing: {
            title: 'Prix des Matériels',
            content: 'Les matériels marqués comme "Gratuit" peuvent être téléchargés sans paiement. Les matériels premium affichent leur prix en XAF et nécessitent un achat avant le téléchargement.'
          }
        }
      },
      downloads: {
        title: 'Gestion des Téléchargements',
        items: {
          access: {
            title: 'Accéder aux Téléchargements',
            content: 'Retrouvez tous vos matériels téléchargés dans l\'écran Téléchargements. Visualisez, partagez ou supprimez-les selon vos besoins.'
          },
          offline: {
            title: 'Accès Hors Ligne',
            content: 'Les matériels téléchargés sont disponibles hors ligne. Aucune connexion Internet n\'est nécessaire pour consulter votre contenu sauvegardé.'
          },
          storage: {
            title: 'Gestion du Stockage',
            content: 'Surveillez votre utilisation du stockage dans l\'écran Téléchargements. Supprimez les matériels inutilisés pour libérer de l\'espace.'
          }
        }
      },
      payments: {
        title: 'Paiements et Achats',
        items: {
          methods: {
            title: 'Méthodes de Paiement',
            content: 'Nous acceptons les paiements via MTN Mobile Money et Flutterwave pour des transactions sécurisées.'
          },
          purchase: {
            title: 'Effectuer des Achats',
            content: 'Sélectionnez un matériel, choisissez votre méthode de paiement préférée et suivez les instructions pour finaliser votre achat.'
          },
          verification: {
            title: 'Vérification des Achats',
            content: 'Après un paiement réussi, votre matériel sera disponible pour un téléchargement immédiat.'
          }
        }
      },
      support: {
        title: 'Support',
        items: {
          contact: {
            title: 'Contacter le Support',
            content: 'Besoin d\'aide ? Contactez notre équipe de support via l\'application ou envoyez-nous un email à support@pass-education.com'
          },
          faq: {
            title: 'Questions Fréquentes',
            content: 'Consultez nos questions fréquemment posées pour des réponses rapides aux problèmes courants.'
          },
          feedback: {
            title: 'Envoyer un Retour',
            content: 'Aidez-nous à nous améliorer ! Envoyez vos commentaires et suggestions via l\'application.'
          }
        }
      }
    },
    search: {
      placeholder: 'Rechercher des articles d\'aide...',
      noResults: 'Aucun article d\'aide trouvé correspondant à votre recherche'
    },
    buttons: {
      readMore: 'Lire Plus',
      contactSupport: 'Contacter le Support',
      backToTop: 'Retour en Haut'
    }
  },
  hierarchy: {
    section: 'Section',
    level: 'Niveau',
    category: 'Catégorie',
    subject: 'Matière',
    materials: 'Matériels',
    
    // Section options
    anglophone: 'Anglophone',
    francophone: 'Francophone',
    
    // Level options
    primary: 'Primaire',
    secondary: 'Secondaire',
    advanced: 'Avancé',
    
    // Category options
    textbooks: 'Manuels Scolaires',
    pastQuestions: 'Questions d\'Examens',
    notes: 'Notes de Cours',
    exercises: 'Exercices',
    
    // Subject options
    mathematics: 'Mathématiques',
    physics: 'Physique',
    chemistry: 'Chimie',
    biology: 'Biologie',
    english: 'Anglais',
    french: 'Français',
    history: 'Histoire',
    geography: 'Géographie'
  },
};
