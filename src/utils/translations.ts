export type SectionKey =
  | "swap"
  | "overview"
  | "market"
  | "explorer"
  | "pumpFun"
  | "support";

export const SUPPORTED_LANGUAGES = ["es", "en", "fr", "pt", "de", "ja"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_METADATA: Record<SupportedLanguage, { short: string; name: string }> = {
  es: { short: "ES", name: "Español" },
  en: { short: "EN", name: "English" },
  fr: { short: "FR", name: "Français" },
  pt: { short: "PT", name: "Português" },
  de: { short: "DE", name: "Deutsch" },
  ja: { short: "JA", name: "日本語" },
};

type OverviewCardStat = {
  label: string;
  value: string;
};

type OverviewReminder = {
  label: string;
  status: string;
};

type SupportChannel = {
  label: string;
  detail: string;
  href: string;
};

type PumpFunTranslations = {
  title: string;
  subtitle: string;
  limitNotice: (count: number) => string;
  table: {
    columns: {
      rank: string;
      project: string;
      price: string;
      marketCap: string;
      progress: string;
      raised: string;
      launched: string;
      holders: string;
    };
    progressTarget: (current: string, target?: string | null) => string;
  };
  status: {
    loading: string;
    error: string;
    empty: string;
    fallback: string;
    remote: string;
    credentialsHint: string;
    updatedAt: (time: string) => string;
    retry: string;
  };
};

type MarketTranslations = {
  title: string;
  subtitle: string;
  columns: {
    rank: string;
    name: string;
    price: string;
    marketCap: string;
    volume24h: string;
    change24h: string;
    sparkline: string;
  };
  status: {
    loading: string;
    error: string;
    retry: string;
    updatedAt: (time: string) => string;
  };
  pagination: {
    ariaLabel: string;
    previous: string;
    next: string;
    pageLabel: (page: number) => string;
    showing: (from: number, to: number) => string;
    empty: string;
  };
  favorites: {
    add: (asset: string) => string;
    remove: (asset: string) => string;
    connectWallet: string;
    limitReached: string;
  };
};

type ExplorerTranslations = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  status: {
    initial: string;
    loading: string;
    invalid: string;
    notFound: string;
    error: string;
  };
  hints: string[];
  copyAction: {
    copy: string;
    copied: string;
  };
  boolean: {
    yes: string;
    no: string;
  };
  account: {
    sectionTitle: string;
    badges: {
      wallet: string;
      program: string;
      tokenMint: string;
      tokenAccount: string;
      generic: string;
    };
    accountTypes: {
      wallet: string;
      program: string;
      tokenMint: string;
      tokenAccount: string;
      unknown: string;
    };
    fields: {
      address: string;
      owner: string;
      lamports: string;
      solBalance: string;
      executable: string;
      rentEpoch: string;
      dataLength: string;
      accountType: string;
    };
    tokenMintFields: {
      supply: string;
      decimals: string;
      mintAuthority: string;
      freezeAuthority: string;
      isInitialized: string;
    };
    tokenAccountFields: {
      mint: string;
      owner: string;
      amount: string;
      decimals: string;
      delegate: string;
      state: string;
    };
  };
  transaction: {
    sectionTitle: string;
    badges: {
      transaction: string;
      success: string;
      failed: string;
    };
    fields: {
      signature: string;
      slot: string;
      blockTime: string;
      status: string;
      fee: string;
      computeUnits: string;
      instructionCount: string;
      logMessages: string;
      signers: string;
    };
    instructions: {
      title: string;
      program: string;
      accounts: string;
      dataLength: string;
    };
  };
};

type SwapFormTranslations = {
  subtitle: string;
  networkLabel: string;
  balance: {
    label: string;
    updating: string;
    connectWallet: string;
  };
  airdrop: {
    request: string;
    requesting: string;
    unavailable: string;
    connectWallet: string;
    success: string;
    genericError: string;
  };
  selectors: {
    fromLabel: string;
    toLabel: string;
    switch: string;
  };
  tokenListErrors: {
    fetchFailed: string;
    unexpected: string;
  };
  quoteErrors: {
    fetchFailed: string;
    unexpected: string;
    fallback: string;
  };
  errors: {
    connectWallet: string;
    invalidAmount: string;
    network: string;
    generic: string;
    sameTokens: string;
  };
  helperText: string;
  preview: {
    estimatedReceive: string;
    thresholdExactOut: (slippage: string) => string;
    thresholdExactIn: (slippage: string) => string;
    price: string;
    priceImpact: string;
    priceImpactMinimal: string;
    slippageTitle: string;
    slippageHelper: string;
    statusUpdating: string;
    statusLastUpdated: (time: string) => string;
    statusEnterAmount: string;
  };
  chart: {
    title: string;
    subtitle: (baseSymbol: string, quoteSymbol: string) => string;
  };
  swapButton: {
    default: string;
    loading: string;
  };
  swapResult: {
    successPrefix: string;
    successLinkIntro: string;
    successLinkText: string;
  };
};

type TokenSelectorTranslations = {
  defaultSymbol: string;
  chooseToken: string;
  selectToken: string;
  verifiedBadge: string;
  useAllTitle: string;
};

type TokenListModalTranslations = {
  title: string;
  close: string;
  searchPlaceholder: string;
  emptyState: string;
  searchingExternal: string;
  externalError: string;
  viewOnSolscan: (symbol: string) => string;
};

type ThemeToggleTranslations = {
  label: string;
  light: string;
  dark: string;
  switchToLight: string;
  switchToDark: string;
};

type AppTranslation = {
  languageToggleLabel: string;
  themeToggle: ThemeToggleTranslations;
  navigation: {
    ariaLabel: string;
    sections: Record<SectionKey, { label: string; description: string }>;
  };
  pumpFun: PumpFunTranslations;
  overview: {
    title: string;
    subtitle: string;
    cards: {
      network: {
        title: string;
        description: string;
        stats: OverviewCardStat[];
      };
      shortcuts: {
        title: string;
        description: string;
        actions: string[];
      };
      reminders: {
        title: string;
        description: string;
        reminders: OverviewReminder[];
      };
    };
  };
  support: {
    title: string;
    subtitle: string;
    guides: {
      title: string;
      items: string[];
    };
    channels: {
      title: string;
      options: SupportChannel[];
    };
    status: {
      title: string;
      description: string;
      badge: string;
    };
  };
  explorer: ExplorerTranslations;
  market: MarketTranslations;
  swapForm: SwapFormTranslations;
  tokenSelector: TokenSelectorTranslations;
  tokenListModal: TokenListModalTranslations;
};

const BASE_TRANSLATIONS = {
  es: {
    languageToggleLabel: "Cambiar idioma",
    themeToggle: {
      label: "Tema",
      light: "Claro",
      dark: "Oscuro",
      switchToLight: "Cambiar a modo claro",
      switchToDark: "Cambiar a modo oscuro",
    },
    navigation: {
      ariaLabel: "Navegación principal",
      sections: {
        swap: { label: "Intercambiar", description: "Opera tokens al instante" },
        overview: { label: "Panel", description: "Resumen de actividad" },
        market: { label: "Mercado", description: "Top 10 criptomonedas" },
        explorer: {
          label: "Explorador",
          description: "Consulta tokens y contratos",
        },
        pumpFun: { label: "Pump.fun", description: "Próximos a la bonding curve" },
        support: { label: "Soporte", description: "Guías y ayuda" },
      },
    },
    pumpFun: {
      title: "Radar Pump.fun",
      subtitle:
        "Sigue los 20 lanzamientos que están por alcanzar la bonding curve y evalúa su tracción en segundos.",
      limitNotice: (count) => `Top ${count} proyectos más cerca de la bonding curve`,
      table: {
        columns: {
          rank: "#",
          project: "Proyecto",
          price: "Precio",
          marketCap: "MC",
          progress: "Progreso",
          raised: "Recaudado",
          launched: "Lanzado",
          holders: "Holders",
        },
        progressTarget: (current, target) =>
          target ? `${current} de ${target}` : `${current} recaudado`,
      },
      status: {
        loading: "Cargando proyectos...",
        error: "No pudimos obtener los datos en vivo.",
        empty: "No encontramos proyectos a punto de entrar a la bonding curve.",
        fallback:
          "Mostrando la mejor estimación con datos de referencia (requiere credenciales públicas de Pump.fun para datos en vivo).",
        remote: "Datos en vivo desde Pump.fun",
        credentialsHint:
          "Configura las variables PUMPFUN_API_USERNAME y PUMPFUN_API_PASSWORD para activar la fuente oficial.",
        updatedAt: (time: string) => `Actualizado: ${time}`,
        retry: "Reintentar",
      },
    },
    overview: {
      title: "Panel general",
      subtitle:
        "Controla tus activos con estadísticas en tiempo real y recomendaciones para optimizar cada swap.",
      cards: {
        network: {
          title: "Estado de la red",
          description: "Seguimos la salud de Solana y te avisamos cuando conviene operar.",
          stats: [
            { label: "Latencia promedio", value: "< 0.5s" },
            { label: "Éxito de transacciones", value: "99.2%" },
            { label: "Congestión", value: "Baja" },
          ],
        },
        shortcuts: {
          title: "Atajos inteligentes",
          description: "Guarda tus combinaciones favoritas y lánzalas con un solo clic.",
          actions: [
            "Comprar SOL con USDC",
            "Vender SOL por USDT",
            "Enviar a billetera fría",
          ],
        },
        reminders: {
          title: "Recordatorios",
          description: "Configura alertas personalizadas para aprovechar el mejor momento.",
          reminders: [
            { label: "Solana > $150", status: "Activo" },
            { label: "USDC disponibilidad", status: "Sincronizado" },
            { label: "Actualizar bots", status: "Pendiente" },
          ],
        },
      },
    },
    support: {
      title: "Centro de soporte",
      subtitle: "Encuentra respuestas rápidas o contacta a nuestro equipo cuando lo necesites.",
      guides: {
        title: "Guías destacadas",
        items: [
          "Cómo conectar tu wallet de forma segura",
          "Configura alertas de precio en menos de 2 minutos",
          "Buenas prácticas para swaps de alto volumen",
        ],
      },
      channels: {
        title: "Canales de ayuda",
        options: [
          {
            label: "Twitter",
            detail: "Síguenos para anuncios al instante y actualizaciones del equipo.",
            href: "https://x.com/metaswap_dev",
          },
          {
            label: "Telegram",
            detail: "Únete a la comunidad para soporte directo y noticias exclusivas.",
            href: "https://t.me/metaswap",
          },
        ],
      },
      status: {
        title: "Estado del servicio",
        description:
          "Actualizamos constantemente la estabilidad de la plataforma para que puedas operar sin interrupciones.",
        badge: "Operativo",
      },
    },
    explorer: {
      title: "Explorador on-chain",
      subtitle:
        "Busca tokens, wallets o transacciones de Solana y obtén un resumen claro de su actividad.",
      searchPlaceholder: "Ingresa una dirección, mint o firma de transacción",
      searchButton: "Buscar",
      status: {
        initial: "Introduce un token, wallet o transacción para comenzar.",
        loading: "Consultando la red de Solana...",
        invalid: "El valor ingresado no parece ser una dirección ni una firma válida.",
        notFound: "No encontramos información en cadena para esta búsqueda.",
        error: "Tuvimos un problema consultando la red. Intenta nuevamente.",
      },
      hints: [
        "Acepta direcciones base58 de 32 a 88 caracteres.",
        "Identifica wallets del sistema, cuentas SPL y transacciones confirmadas.",
      ],
      copyAction: {
        copy: "Copiar",
        copied: "Copiado",
      },
      boolean: {
        yes: "Sí",
        no: "No",
      },
      account: {
        sectionTitle: "Detalles de la cuenta",
        badges: {
          wallet: "Cuenta nativa",
          program: "Programa",
          tokenMint: "Mint SPL",
          tokenAccount: "Cuenta SPL",
          generic: "Cuenta",
        },
        accountTypes: {
          wallet: "Cuenta nativa",
          program: "Programa",
          tokenMint: "Mint SPL",
          tokenAccount: "Cuenta SPL",
          unknown: "Cuenta",
        },
        fields: {
          address: "Dirección",
          owner: "Programa propietario",
          lamports: "Lamports",
          solBalance: "Balance (SOL)",
          executable: "Es ejecutable",
          rentEpoch: "Epoch de renta",
          dataLength: "Tamaño de datos (bytes)",
          accountType: "Tipo de cuenta",
        },
        tokenMintFields: {
          supply: "Supply total",
          decimals: "Decimales",
          mintAuthority: "Autoridad de minteo",
          freezeAuthority: "Autoridad de congelamiento",
          isInitialized: "Inicializado",
        },
        tokenAccountFields: {
          mint: "Mint",
          owner: "Titular",
          amount: "Cantidad",
          decimals: "Decimales",
          delegate: "Delegado",
          state: "Estado",
        },
      },
      transaction: {
        sectionTitle: "Detalles de la transacción",
        badges: {
          transaction: "Transacción",
          success: "Éxito",
          failed: "Fallida",
        },
        fields: {
          signature: "Firma",
          slot: "Slot",
          blockTime: "Hora de bloque",
          status: "Estado",
          fee: "Comisión (lamports)",
          computeUnits: "Compute units",
          instructionCount: "Instrucciones",
          logMessages: "Logs",
          signers: "Firmantes",
        },
        instructions: {
          title: "Instrucciones",
          program: "Programa",
          accounts: "Cuentas",
          dataLength: "Datos (bytes)",
        },
      },
    },
    market: {
      title: "Top 100 por capitalización",
      subtitle:
        "Consulta las principales criptomonedas por capitalización de mercado y sus métricas clave en tiempo real.",
      columns: {
        rank: "Posición",
        name: "Activo",
        price: "Precio",
        marketCap: "Capitalización",
        volume24h: "Volumen 24h",
        change24h: "Variación 24h",
        sparkline: "Tendencia 7d",
      },
      status: {
        loading: "Cargando mercado...",
        error: "No se pudo cargar la información del mercado. Intenta nuevamente.",
        retry: "Reintentar",
        updatedAt: (time: string) => `Última actualización: ${time}`,
      },
      pagination: {
        ariaLabel: "Paginación de mercado",
        previous: "Página anterior",
        next: "Página siguiente",
        pageLabel: (page: number) => `Página ${page}`,
        showing: (from: number, to: number) => `Mostrando ${from} - ${to}`,
        empty: "No hay resultados en esta página",
      },
      favorites: {
        add: (asset: string) => `Marcar ${asset} como favorito`,
        remove: (asset: string) => `Quitar ${asset} de favoritos`,
        connectWallet: "Conecta tu wallet para guardar favoritos",
        limitReached: "Solo puedes guardar 5 favoritos por wallet",
      },
    },
    swapForm: {
      subtitle: "Rápido. Seguro. Swaps sin complicaciones.",
      networkLabel: "Red",
      balance: {
        label: "Saldo disponible",
        updating: "Actualizando…",
        connectWallet: "Conecta tu wallet",
      },
      airdrop: {
        request: "Recibir 1 SOL",
        requesting: "Solicitando…",
        unavailable: "Los airdrops solo están disponibles en devnet y testnet.",
        connectWallet: "Conecta tu wallet para solicitar SOL de prueba.",
        success: "Airdrop completado. El saldo puede tardar unos segundos en actualizarse.",
        genericError: "No fue posible solicitar el airdrop en este momento.",
      },
      selectors: {
        fromLabel: "De",
        toLabel: "Para",
        switch: "Cambiar tokens",
      },
      tokenListErrors: {
        fetchFailed: "No pudimos cargar la lista de tokens. Inténtalo nuevamente.",
        unexpected: "Ocurrió un error inesperado al cargar los tokens.",
      },
      quoteErrors: {
        fetchFailed: "No pudimos obtener la cotización en este momento.",
        unexpected: "Ocurrió un error inesperado al calcular la cotización.",
        fallback:
          "No pudimos conectar con Jupiter. Mostramos una cotización estimada, pero no es posible firmar el swap. Revisa tu conexión o configura NEXT_PUBLIC_JUPITER_API_BASE_URL con un mirror disponible.",
      },
      errors: {
        connectWallet: "Conecta tu wallet Solflare para continuar.",
        invalidAmount: "Define un monto válido para cotizar el swap.",
        network:
          "No pudimos conectar con el servicio de swaps. Revisa tu conexión e inténtalo nuevamente.",
        generic: "No se pudo completar el swap. Inténtalo nuevamente.",
        sameTokens: "Selecciona tokens diferentes para obtener una cotización válida.",
      },
      helperText: "Ajusta la tolerancia de precio para tus swaps.",
      preview: {
        estimatedReceive: "Recibirás (estimado)",
        thresholdExactOut: (slippage) => `Máximo a enviar (${slippage}%)`,
        thresholdExactIn: (slippage) => `Mínimo tras slippage (${slippage}%)`,
        price: "Precio estimado",
        priceImpact: "Impacto en el precio",
        priceImpactMinimal: "< 0.01%",
        slippageTitle: "Slippage máximo",
        slippageHelper: "Ajusta la tolerancia de precio para tus swaps.",
        statusUpdating: "Actualizando cotización…",
        statusLastUpdated: (time) => `Última actualización: ${time} (se renueva automáticamente)`,
        statusEnterAmount: "Introduce un monto para obtener una cotización en tiempo real.",
      },
      chart: {
        title: "Precio en tiempo real",
        subtitle: (base, quote) =>
          `Cotización de ${base}/${quote} provista por TradingView.`,
      },
      swapButton: {
        default: "Confirmar swap",
        loading: "Firmando…",
      },
      swapResult: {
        successPrefix: "Swap enviado correctamente.",
        successLinkIntro: "Consulta el estado en el",
        successLinkText: "Solana Explorer",
      },
    },
    tokenSelector: {
      defaultSymbol: "Token",
      chooseToken: "Elegir token",
      selectToken: "Seleccionar",
      verifiedBadge: "Contrato verificado",
      useAllTitle: "Usar todo el saldo disponible",
    },
    tokenListModal: {
      title: "Selecciona un token",
      close: "Cerrar",
      searchPlaceholder: "Buscar por nombre, símbolo o dirección",
      emptyState: "No encontramos tokens que coincidan con tu búsqueda.",
      searchingExternal: "Buscando nuevos tokens en Pump.fun…",
      externalError: "No pudimos cargar resultados adicionales en este momento.",
      viewOnSolscan: (symbol) => `Ver ${symbol} en Solscan`,
    },
  },
  en: {
    languageToggleLabel: "Change language",
    themeToggle: {
      label: "Theme",
      light: "Light",
      dark: "Dark",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
    },
    navigation: {
      ariaLabel: "Main navigation",
      sections: {
        swap: { label: "Swap", description: "Trade tokens instantly" },
        overview: { label: "Overview", description: "Activity summary" },
        market: { label: "Market", description: "Top 10 cryptocurrencies" },
        explorer: {
          label: "Explorer",
          description: "Inspect tokens and contracts",
        },
        pumpFun: { label: "Pump.fun", description: "Near the bonding curve" },
        support: { label: "Support", description: "Guides and help" },
      },
    },
    pumpFun: {
      title: "Pump.fun Watchlist",
      subtitle:
        "Track the 20 launches closest to the bonding curve and gauge community traction in one glance.",
      limitNotice: (count) => `Top ${count} projects closest to the bonding curve`,
      table: {
        columns: {
          rank: "#",
          project: "Project",
          price: "Price",
          marketCap: "MC",
          progress: "Progress",
          raised: "Raised",
          launched: "Launched",
          holders: "Holders",
        },
        progressTarget: (current, target) =>
          target ? `${current} of ${target}` : `${current} raised`,
      },
      status: {
        loading: "Loading projects...",
        error: "Live data is currently unavailable.",
        empty: "No projects are about to enter the bonding curve right now.",
        fallback:
          "Showing our best estimate with reference data (set Pump.fun public credentials to enable live metrics).",
        remote: "Live data from Pump.fun",
        credentialsHint:
          "Set PUMPFUN_API_USERNAME and PUMPFUN_API_PASSWORD environment variables to enable the official feed.",
        updatedAt: (time: string) => `Updated: ${time}`,
        retry: "Retry",
      },
    },
    overview: {
      title: "Overview dashboard",
      subtitle:
        "Track your assets with real-time stats and recommendations to optimise every swap.",
      cards: {
        network: {
          title: "Network status",
          description: "We monitor Solana's health and let you know when it's a good time to trade.",
          stats: [
            { label: "Average latency", value: "< 0.5s" },
            { label: "Transaction success", value: "99.2%" },
            { label: "Congestion", value: "Low" },
          ],
        },
        shortcuts: {
          title: "Smart shortcuts",
          description: "Save your favourite pairs and launch them with a single click.",
          actions: [
            "Buy SOL with USDC",
            "Sell SOL for USDT",
            "Send to cold wallet",
          ],
        },
        reminders: {
          title: "Reminders",
          description: "Set personalised alerts to catch the right moment.",
          reminders: [
            { label: "Solana > $150", status: "Active" },
            { label: "USDC availability", status: "Synced" },
            { label: "Update bots", status: "Pending" },
          ],
        },
      },
    },
    support: {
      title: "Support centre",
      subtitle: "Find quick answers or reach our team whenever you need it.",
      guides: {
        title: "Featured guides",
        items: [
          "How to connect your wallet securely",
          "Set up price alerts in under 2 minutes",
          "Best practices for high-volume swaps",
        ],
      },
      channels: {
        title: "Help channels",
        options: [
          {
            label: "Twitter",
            detail: "Follow us for instant announcements and team updates.",
            href: "https://x.com/metaswap_dev",
          },
          {
            label: "Telegram",
            detail: "Join the community for direct support and exclusive news.",
            href: "https://t.me/metaswap",
          },
        ],
      },
      status: {
        title: "Service status",
        description:
          "We continuously monitor platform stability so you can trade without interruptions.",
        badge: "Operational",
      },
    },
    explorer: {
      title: "On-chain explorer",
      subtitle:
        "Search Solana tokens, wallets, or transactions and review the essentials at a glance.",
      searchPlaceholder: "Enter an address, mint, or transaction signature",
      searchButton: "Search",
      status: {
        initial: "Search for a token, wallet, or transaction to get started.",
        loading: "Querying the Solana network...",
        invalid: "The value you entered doesn't look like a valid address or signature.",
        notFound: "We couldn't find on-chain data for this search.",
        error: "Something went wrong while fetching on-chain data. Try again.",
      },
      hints: [
        "Accepts base58 addresses between 32 and 88 characters.",
        "Identifies system wallets, SPL accounts, and confirmed transactions.",
      ],
      copyAction: {
        copy: "Copy",
        copied: "Copied",
      },
      boolean: {
        yes: "Yes",
        no: "No",
      },
      account: {
        sectionTitle: "Account details",
        badges: {
          wallet: "Native account",
          program: "Program",
          tokenMint: "SPL mint",
          tokenAccount: "SPL account",
          generic: "Account",
        },
        accountTypes: {
          wallet: "Native account",
          program: "Program",
          tokenMint: "SPL mint",
          tokenAccount: "SPL account",
          unknown: "Account",
        },
        fields: {
          address: "Address",
          owner: "Owner program",
          lamports: "Lamports",
          solBalance: "Balance (SOL)",
          executable: "Executable",
          rentEpoch: "Rent epoch",
          dataLength: "Data size (bytes)",
          accountType: "Account type",
        },
        tokenMintFields: {
          supply: "Total supply",
          decimals: "Decimals",
          mintAuthority: "Mint authority",
          freezeAuthority: "Freeze authority",
          isInitialized: "Initialised",
        },
        tokenAccountFields: {
          mint: "Mint",
          owner: "Owner",
          amount: "Amount",
          decimals: "Decimals",
          delegate: "Delegate",
          state: "State",
        },
      },
      transaction: {
        sectionTitle: "Transaction details",
        badges: {
          transaction: "Transaction",
          success: "Success",
          failed: "Failed",
        },
        fields: {
          signature: "Signature",
          slot: "Slot",
          blockTime: "Block time",
          status: "Status",
          fee: "Fee (lamports)",
          computeUnits: "Compute units",
          instructionCount: "Instructions",
          logMessages: "Logs",
          signers: "Signers",
        },
        instructions: {
          title: "Instructions",
          program: "Program",
          accounts: "Accounts",
          dataLength: "Data (bytes)",
        },
      },
    },
    market: {
      title: "Top 100 by market cap",
      subtitle:
        "Track the leading cryptocurrencies by market capitalization along with key metrics updated in real time.",
      columns: {
        rank: "Rank",
        name: "Asset",
        price: "Price",
        marketCap: "Market cap",
        volume24h: "24h volume",
        change24h: "24h change",
        sparkline: "7d trend",
      },
      status: {
        loading: "Loading market data...",
        error: "We couldn't load market information. Please try again.",
        retry: "Try again",
        updatedAt: (time: string) => `Last updated: ${time}`,
      },
      pagination: {
        ariaLabel: "Market pagination",
        previous: "Previous page",
        next: "Next page",
        pageLabel: (page: number) => `Page ${page}`,
        showing: (from: number, to: number) => `Showing ${from} - ${to}`,
        empty: "No results on this page",
      },
      favorites: {
        add: (asset: string) => `Add ${asset} to favourites`,
        remove: (asset: string) => `Remove ${asset} from favourites`,
        connectWallet: "Connect your wallet to save favourites",
        limitReached: "You can only save 5 favourites per wallet",
      },
    },
    swapForm: {
      subtitle: "Fast. Secure. Swaps made simple.",
      networkLabel: "Network",
      balance: {
        label: "Available balance",
        updating: "Updating…",
        connectWallet: "Connect your wallet",
      },
      airdrop: {
        request: "Receive 1 SOL",
        requesting: "Requesting…",
        unavailable: "Airdrops are only available on devnet and testnet.",
        connectWallet: "Connect your wallet to request test SOL.",
        success: "Airdrop sent. The balance may take a few seconds to refresh.",
        genericError: "We couldn't request the airdrop right now.",
      },
      selectors: {
        fromLabel: "From",
        toLabel: "To",
        switch: "Switch tokens",
      },
      tokenListErrors: {
        fetchFailed: "We couldn't load the token list. Please try again.",
        unexpected: "An unexpected error occurred while loading tokens.",
      },
      quoteErrors: {
        fetchFailed: "We couldn't fetch a quote right now.",
        unexpected: "An unexpected error occurred while calculating the quote.",
        fallback:
          "We couldn't reach Jupiter. This is an estimated quote only and the swap cannot be signed. Check your connection or set NEXT_PUBLIC_JUPITER_API_BASE_URL to an accessible mirror.",
      },
      errors: {
        connectWallet: "Connect your Solflare wallet to continue.",
        invalidAmount: "Enter a valid amount to request a quote.",
        network:
          "We couldn't reach the swap service. Check your connection and try again.",
        generic: "We couldn't complete the swap. Please try again.",
        sameTokens: "Select different tokens to request a valid quote.",
      },
      helperText: "Adjust your price tolerance for swaps.",
      preview: {
        estimatedReceive: "You'll receive (estimated)",
        thresholdExactOut: (slippage) => `Maximum to send (${slippage}%)`,
        thresholdExactIn: (slippage) => `Minimum after slippage (${slippage}%)`,
        price: "Estimated price",
        priceImpact: "Price impact",
        priceImpactMinimal: "< 0.01%",
        slippageTitle: "Max slippage",
        slippageHelper: "Adjust your price tolerance for swaps.",
        statusUpdating: "Updating quote…",
        statusLastUpdated: (time) => `Last updated: ${time} (auto-refreshing)`,
        statusEnterAmount: "Enter an amount to get a live quote.",
      },
      chart: {
        title: "Live market price",
        subtitle: (base, quote) =>
          `Live ${base}/${quote} rate powered by TradingView.`,
      },
      swapButton: {
        default: "Confirm swap",
        loading: "Signing…",
      },
      swapResult: {
        successPrefix: "Swap sent successfully.",
        successLinkIntro: "Check the status on",
        successLinkText: "Solana Explorer",
      },
    },
    tokenSelector: {
      defaultSymbol: "Token",
      chooseToken: "Choose a token",
      selectToken: "Select",
      verifiedBadge: "Verified contract",
      useAllTitle: "Use entire available balance",
    },
    tokenListModal: {
      title: "Select a token",
      close: "Close",
      searchPlaceholder: "Search by name, symbol, or address",
      emptyState: "We couldn't find tokens matching your search.",
      searchingExternal: "Searching for new tokens on Pump.fun…",
      externalError: "We couldn't load additional results right now.",
      viewOnSolscan: (symbol) => `View ${symbol} on Solscan`,
    },
  },
} as const satisfies Record<"es" | "en", AppTranslation>;

const ES_TRANSLATION = BASE_TRANSLATIONS.es;
const EN_TRANSLATION = BASE_TRANSLATIONS.en;

const FR_TRANSLATION: AppTranslation = {
  ...EN_TRANSLATION,
  languageToggleLabel: "Changer de langue",
  themeToggle: {
    ...EN_TRANSLATION.themeToggle,
    label: "Thème",
    light: "Clair",
    dark: "Sombre",
    switchToLight: "Passer en mode clair",
    switchToDark: "Passer en mode sombre",
  },
  navigation: {
    ...EN_TRANSLATION.navigation,
    ariaLabel: "Navigation principale",
    sections: {
      ...EN_TRANSLATION.navigation.sections,
      swap: { label: "Échanger", description: "Échangez des tokens instantanément" },
      overview: { label: "Aperçu", description: "Résumé de l'activité" },
      market: { label: "Marché", description: "Top 10 des cryptomonnaies" },
      explorer: {
        label: "Explorateur",
        description: "Consultez tokens et contrats",
      },
      pumpFun: { label: "Pump.fun", description: "Proches de la bonding curve" },
      support: { label: "Assistance", description: "Guides et aide" },
    },
  },
};

const PT_TRANSLATION: AppTranslation = {
  ...EN_TRANSLATION,
  languageToggleLabel: "Mudar idioma",
  themeToggle: {
    ...EN_TRANSLATION.themeToggle,
    label: "Tema",
    light: "Claro",
    dark: "Escuro",
    switchToLight: "Ativar modo claro",
    switchToDark: "Ativar modo escuro",
  },
  navigation: {
    ...EN_TRANSLATION.navigation,
    ariaLabel: "Navegação principal",
    sections: {
      ...EN_TRANSLATION.navigation.sections,
      swap: { label: "Trocar", description: "Negocie tokens instantaneamente" },
      overview: { label: "Visão geral", description: "Resumo de atividades" },
      market: { label: "Mercado", description: "Top 10 criptomoedas" },
      explorer: {
        label: "Explorador",
        description: "Acompanhe tokens e contratos",
      },
      pumpFun: { label: "Pump.fun", description: "Perto da bonding curve" },
      support: { label: "Suporte", description: "Guias e ajuda" },
    },
  },
};

const DE_TRANSLATION: AppTranslation = {
  ...EN_TRANSLATION,
  languageToggleLabel: "Sprache ändern",
  themeToggle: {
    ...EN_TRANSLATION.themeToggle,
    label: "Thema",
    light: "Hell",
    dark: "Dunkel",
    switchToLight: "Zum hellen Modus wechseln",
    switchToDark: "Zum dunklen Modus wechseln",
  },
  navigation: {
    ...EN_TRANSLATION.navigation,
    ariaLabel: "Hauptnavigation",
    sections: {
      ...EN_TRANSLATION.navigation.sections,
      swap: { label: "Tauschen", description: "Tokens sofort handeln" },
      overview: { label: "Übersicht", description: "Aktivitätszusammenfassung" },
      market: { label: "Markt", description: "Top 10 Kryptowährungen" },
      explorer: {
        label: "Explorer",
        description: "Tokens und Verträge prüfen",
      },
      pumpFun: { label: "Pump.fun", description: "Nahe der Bonding-Kurve" },
      support: { label: "Support", description: "Anleitungen und Hilfe" },
    },
  },
};

const JA_TRANSLATION: AppTranslation = {
  ...EN_TRANSLATION,
  languageToggleLabel: "言語を変更",
  themeToggle: {
    ...EN_TRANSLATION.themeToggle,
    label: "テーマ",
    light: "ライト",
    dark: "ダーク",
    switchToLight: "ライトモードに切り替え",
    switchToDark: "ダークモードに切り替え",
  },
  navigation: {
    ...EN_TRANSLATION.navigation,
    ariaLabel: "メインナビゲーション",
    sections: {
      ...EN_TRANSLATION.navigation.sections,
      swap: { label: "スワップ", description: "トークンをすぐに交換" },
      overview: { label: "概要", description: "アクティビティのサマリー" },
      market: { label: "マーケット", description: "トップ10暗号資産" },
      explorer: {
        label: "エクスプローラー",
        description: "トークンとコントラクトを確認",
      },
      pumpFun: { label: "Pump.fun", description: "ボンディングカーブ直前" },
      support: { label: "サポート", description: "ガイドとヘルプ" },
    },
  },
};

export const TRANSLATIONS: Record<SupportedLanguage, AppTranslation> = {
  es: ES_TRANSLATION,
  en: EN_TRANSLATION,
  fr: FR_TRANSLATION,
  pt: PT_TRANSLATION,
  de: DE_TRANSLATION,
  ja: JA_TRANSLATION,
};

export type { AppTranslation, SwapFormTranslations };
