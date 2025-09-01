"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "pt" | "es" | "en";

interface LanguageContextData {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
  supportedLanguages: Language[];
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextData>(
  {} as LanguageContextData
);

// Traduções do frontend
const translations: Record<string, Record<Language, string>> = {
  // Títulos e cabeçalhos
  "app.title": {
    pt: "Document Insight",
    es: "Document Insight",
    en: "Document Insight",
  },
  "app.subtitle": {
    pt: "Processamento Inteligente de Documentos",
    es: "Procesamiento Inteligente de Documentos",
    en: "Intelligent Document Processing",
  },

  // Navegação
  "nav.analysis": {
    pt: "Análise",
    es: "Análisis",
    en: "Analysis",
  },
  "nav.history": {
    pt: "Histórico",
    es: "Historial",
    en: "History",
  },
  "nav.dashboard": {
    pt: "Dashboard",
    es: "Panel de Control",
    en: "Dashboard",
  },

  "nav.apiKeys": {
    pt: "Chaves API",
    es: "Claves API",
    en: "API Keys",
  },

  "nav.stats": {
    pt: "Estatísticas",
    es: "Estadísticas",
    en: "Statistics",
  },

  // Formulários
  "form.name": {
    pt: "Nome completo",
    es: "Nombre completo",
    en: "Full name",
  },
  "form.email": {
    pt: "Email",
    es: "Correo electrónico",
    en: "Email",
  },
  "form.password": {
    pt: "Senha",
    es: "Contraseña",
    en: "Password",
  },
  "form.confirmPassword": {
    pt: "Confirmar senha",
    es: "Confirmar contraseña",
    en: "Confirm password",
  },
  "form.submit": {
    pt: "Enviar",
    es: "Enviar",
    en: "Submit",
  },
  "form.cancel": {
    pt: "Cancelar",
    es: "Cancelar",
    en: "Cancel",
  },

  // Autenticação
  "auth.login": {
    pt: "Entrar",
    es: "Iniciar Sesión",
    en: "Login",
  },
  "auth.register": {
    pt: "Cadastre-se",
    es: "Registrarse",
    en: "Register",
  },
  "auth.loggingIn": {
    pt: "Entrando...",
    es: "Iniciando sesión...",
    en: "Logging in...",
  },
  "auth.loginSubtitle": {
    pt: "Faça login na sua conta",
    es: "Inicia sesión en tu cuenta",
    en: "Sign in to your account",
  },
  "auth.noAccount": {
    pt: "Não tem conta?",
    es: "¿No tienes cuenta?",
    en: "Don't have an account?",
  },
  "auth.loginError": {
    pt: "Erro ao fazer login",
    es: "Error al iniciar sesión",
    en: "Error logging in",
  },

  // Validações
  "validation.required": {
    pt: "Campo obrigatório",
    es: "Campo obligatorio",
    en: "Required field",
  },
  "validation.email": {
    pt: "Email inválido",
    es: "Email inválido",
    en: "Invalid email",
  },
  "validation.password.minLength": {
    pt: "Senha deve ter pelo menos 6 caracteres",
    es: "La contraseña debe tener al menos 6 caracteres",
    en: "Password must have at least 6 characters",
  },
  "validation.password.lowercase": {
    pt: "Senha deve conter pelo menos uma letra minúscula",
    es: "La contraseña debe contener al menos una letra minúscula",
    en: "Password must contain at least one lowercase letter",
  },
  "validation.password.uppercase": {
    pt: "Senha deve conter pelo menos uma letra maiúscula",
    es: "La contraseña debe contener al menos una letra mayúscula",
    en: "Password must contain at least one uppercase letter",
  },
  "validation.password.number": {
    pt: "Senha deve conter pelo menos um número",
    es: "La contraseña debe contener al menos un número",
    en: "Password must contain at least one number",
  },

  // Métricas
  "metrics.characters": {
    pt: "Caracteres",
    es: "Caracteres",
    en: "Characters",
  },
  "metrics.words": {
    pt: "Palavras",
    es: "Palabras",
    en: "Words",
  },
  "metrics.sentences": {
    pt: "Frases",
    es: "Oraciones",
    en: "Sentences",
  },
  "metrics.paragraphs": {
    pt: "Parágrafos",
    es: "Párrafos",
    en: "Paragraphs",
  },

  // Dificuldade de leitura
  "readability.veryEasy": {
    pt: "Muito fácil",
    es: "Muy fácil",
    en: "Very easy",
  },
  "readability.easy": {
    pt: "Fácil",
    es: "Fácil",
    en: "Easy",
  },
  "readability.fairlyEasy": {
    pt: "Bastante fácil",
    es: "Bastante fácil",
    en: "Fairly easy",
  },
  "readability.standard": {
    pt: "Padrão",
    es: "Estándar",
    en: "Standard",
  },
  "readability.fairlyDifficult": {
    pt: "Bastante difícil",
    es: "Bastante difícil",
    en: "Fairly difficult",
  },
  "readability.difficult": {
    pt: "Difícil",
    es: "Difícil",
    en: "Difficult",
  },
  "readability.veryDifficult": {
    pt: "Muito difícil",
    es: "Muy difícil",
    en: "Very difficult",
  },

  // Estados
  "status.pending": {
    pt: "Pendente",
    es: "Pendiente",
    en: "Pending",
  },
  "status.processing": {
    pt: "Processando",
    es: "Procesando",
    en: "Processing",
  },
  "status.completed": {
    pt: "Concluído",
    es: "Completado",
    en: "Completed",
  },
  "status.failed": {
    pt: "Falhou",
    es: "Falló",
    en: "Failed",
  },

  // Mensagens
  "messages.success": {
    pt: "Sucesso!",
    es: "¡Éxito!",
    en: "Success!",
  },
  "messages.error": {
    pt: "Erro!",
    es: "¡Error!",
    en: "Error!",
  },
  "messages.warning": {
    pt: "Aviso!",
    es: "¡Advertencia!",
    en: "Warning!",
  },
  "messages.info": {
    pt: "Informação",
    es: "Información",
    en: "Information",
  },

  // Botões
  "button.retry": {
    pt: "Tentar novamente",
    es: "Intentar de nuevo",
    en: "Retry",
  },
  "button.copy": {
    pt: "Copiar",
    es: "Copiar",
    en: "Copy",
  },
  "button.download": {
    pt: "Baixar",
    es: "Descargar",
    en: "Download",
  },
  "button.close": {
    pt: "Fechar",
    es: "Cerrar",
    en: "Close",
  },
  "button.back": {
    pt: "Voltar",
    es: "Volver",
    en: "Back",
  },

  // Seleção de idioma
  "language.pt": {
    pt: "Português",
    es: "Portugués",
    en: "Portuguese",
  },
  "language.es": {
    pt: "Espanhol",
    es: "Español",
    en: "Spanish",
  },
  "language.en": {
    pt: "Inglês",
    es: "Inglés",
    en: "English",
  },
  "language.select": {
    pt: "Selecionar idioma",
    es: "Seleccionar idioma",
    en: "Select language",
  },

  // Página de registro
  "register.title": {
    pt: "Crie sua conta",
    es: "Crea tu cuenta",
    en: "Create your account",
  },
  "register.namePlaceholder": {
    pt: "Seu nome completo",
    es: "Tu nombre completo",
    en: "Your full name",
  },
  "register.emailPlaceholder": {
    pt: "seu@email.com",
    es: "tu@email.com",
    en: "your@email.com",
  },
  "register.passwordPlaceholder": {
    pt: "Digite sua senha",
    es: "Escribe tu contraseña",
    en: "Type your password",
  },
  "register.submit": {
    pt: "Criar conta",
    es: "Crear cuenta",
    en: "Create account",
  },
  "register.submitting": {
    pt: "Criando conta...",
    es: "Creando cuenta...",
    en: "Creating account...",
  },
  "register.loginLink": {
    pt: "Já tem conta? Faça login",
    es: "¿Ya tienes cuenta? Inicia sesión",
    en: "Already have an account? Sign in",
  },

  // Validação de senha
  "password.requirements": {
    pt: "Requisitos da senha:",
    es: "Requisitos de la contraseña:",
    en: "Password requirements:",
  },
  "password.minLength": {
    pt: "Pelo menos 6 caracteres",
    es: "Al menos 6 caracteres",
    en: "At least 6 characters",
  },
  "password.lowercase": {
    pt: "Pelo menos uma letra minúscula",
    es: "Al menos una letra minúscula",
    en: "At least one lowercase letter",
  },
  "password.uppercase": {
    pt: "Pelo menos uma letra maiúscula",
    es: "Al menos una letra mayúscula",
    en: "At least one uppercase letter",
  },
  "password.number": {
    pt: "Pelo menos um número",
    es: "Al menos un número",
    en: "At least one number",
  },
  "password.example": {
    pt: "Exemplo de senha válida:",
    es: "Ejemplo de contraseña válida:",
    en: "Valid password example:",
  },

  // Mensagens específicas para análise
  "analysis.queuePosition": {
    pt: "Posição na fila",
    es: "Posición en la cola",
    en: "Queue position",
  },
  "analysis.processingTime": {
    pt: "Tempo de processamento",
    es: "Tiempo de procesamiento",
    en: "Processing time",
  },
  "analysis.uniqueWords": {
    pt: "Palavras únicas",
    es: "Palabras únicas",
    en: "Unique words",
  },
  "analysis.lexicalDiversity": {
    pt: "Diversidade lexical",
    es: "Diversidad léxica",
    en: "Lexical diversity",
  },

  // Dashboard
  "dashboard.title": {
    pt: "Dashboard",
    es: "Panel de Control",
    en: "Dashboard",
  },
  "dashboard.welcome": {
    pt: "Bem-vindo ao Document Insight",
    es: "Bienvenido a Document Insight",
    en: "Welcome to Document Insight",
  },

  // Histórico
  "history.title": {
    pt: "Histórico de Documentos",
    es: "Historial de Documentos",
    en: "Document History",
  },
  "history.subtitle": {
    pt: "Visualize todos os documentos processados e seus status",
    es: "Visualice todos los documentos procesados y sus estados",
    en: "View all processed documents and their status",
  },
  "history.noDocuments": {
    pt: "Nenhum documento encontrado",
    es: "Ningún documento encontrado",
    en: "No documents found",
  },
  "history.noDocumentsSubtitle": {
    pt: "Comece a processar documentos para ver o histórico aqui",
    es: "Comience a procesar documentos para ver el historial aquí",
    en: "Start processing documents to see history here",
  },
  "history.table.document": {
    pt: "Documento",
    es: "Documento",
    en: "Document",
  },
  "history.table.status": {
    pt: "Status",
    es: "Estado",
    en: "Status",
  },
  "history.table.size": {
    pt: "Tamanho",
    es: "Tamaño",
    en: "Size",
  },
  "history.table.created": {
    pt: "Criado em",
    es: "Creado en",
    en: "Created at",
  },
  "history.table.completed": {
    pt: "Concluído em",
    es: "Completado en",
    en: "Completed at",
  },
  "history.table.actions": {
    pt: "Ações",
    es: "Acciones",
    en: "Actions",
  },

  // Estatísticas
  "stats.title": {
    pt: "Estatísticas",
    es: "Estadísticas",
    en: "Statistics",
  },
  "stats.subtitle": {
    pt: "Acompanhe o desempenho e uso da plataforma Document Insight",
    es: "Monitore el rendimiento y uso de la plataforma Document Insight",
    en: "Track the performance and usage of the Document Insight platform",
  },
  "stats.period": {
    pt: "Período",
    es: "Período",
    en: "Period",
  },
  "stats.last7Days": {
    pt: "Últimos 7 dias",
    es: "Últimos 7 días",
    en: "Last 7 days",
  },
  "stats.last30Days": {
    pt: "Últimos 30 dias",
    es: "Últimos 30 días",
    en: "Last 30 days",
  },
  "stats.last90Days": {
    pt: "Últimos 90 dias",
    es: "Últimos 90 días",
    en: "Last 90 days",
  },
  "stats.lastYear": {
    pt: "Último ano",
    es: "Último año",
    en: "Last year",
  },
  "stats.totalDocuments": {
    pt: "Total de Documentos",
    es: "Total de Documentos",
    en: "Total Documents",
  },
  "stats.completedDocuments": {
    pt: "Documentos Concluídos",
    es: "Documentos Completados",
    en: "Completed Documents",
  },
  "stats.failedDocuments": {
    pt: "Documentos Falharam",
    es: "Documentos Fallaron",
    en: "Failed Documents",
  },
  "stats.pendingDocuments": {
    pt: "Documentos Pendentes",
    es: "Documentos Pendientes",
    en: "Pending Documents",
  },
  "stats.performanceMetrics": {
    pt: "Métricas de Performance",
    es: "Métricas de Rendimiento",
    en: "Performance Metrics",
  },
  "stats.successRate": {
    pt: "Taxa de Sucesso",
    es: "Tasa de Éxito",
    en: "Success Rate",
  },
  "stats.averageProcessingTime": {
    pt: "Tempo Médio de Processamento",
    es: "Tiempo Promedio de Procesamiento",
    en: "Average Processing Time",
  },
  "stats.documentsPerDay": {
    pt: "Documentos por Dia",
    es: "Documentos por Día",
    en: "Documents per Day",
  },
  "stats.inProcessing": {
    pt: "Em Processamento",
    es: "En Procesamiento",
    en: "In Processing",
  },
  "stats.queueStatus": {
    pt: "Status da Fila de Processamento",
    es: "Estado de la Cola de Procesamiento",
    en: "Processing Queue Status",
  },
  "stats.inQueue": {
    pt: "Na Fila",
    es: "En Cola",
    en: "In Queue",
  },
  "stats.totalInQueue": {
    pt: "Total de Análises na Fila",
    es: "Total de Análisis en Cola",
    en: "Total Analyses in Queue",
  },
  "stats.updatedAt": {
    pt: "Atualizado em",
    es: "Actualizado en",
    en: "Updated at",
  },
  "stats.performanceInsights": {
    pt: "Insights de Performance",
    es: "Insights de Rendimiento",
    en: "Performance Insights",
  },
  "stats.recommendations": {
    pt: "Recomendações",
    es: "Recomendaciones",
    en: "Recommendations",
  },
  "stats.recommendation1": {
    pt: "Mantenha suas análises organizadas para melhor acompanhamento",
    es: "Mantenga sus análisis organizados para mejor seguimiento",
    en: "Keep your analyses organized for better tracking",
  },
  "stats.recommendation2": {
    pt: "Monitore a taxa de sucesso para identificar padrões",
    es: "Monitoree la tasa de éxito para identificar patrones",
    en: "Monitor success rate to identify patterns",
  },
  "stats.recommendation3": {
    pt: "Use filtros para encontrar análises específicas rapidamente",
    es: "Use filtros para encontrar análisis específicos rápidamente",
    en: "Use filters to find specific analyses quickly",
  },
  "stats.usageTips": {
    pt: "Dicas de Uso",
    es: "Consejos de Uso",
    en: "Usage Tips",
  },
  "stats.tip1": {
    pt: "Textos menores processam mais rapidamente",
    es: "Los textos más pequeños se procesan más rápidamente",
    en: "Smaller texts process faster",
  },
  "stats.tip2": {
    pt: "Evite enviar múltiplas análises simultaneamente",
    es: "Evite enviar múltiples análisis simultáneamente",
    en: "Avoid sending multiple analyses simultaneously",
  },
  "stats.tip3": {
    pt: "Revise os resultados antes de baixar",
    es: "Revise los resultados antes de descargar",
    en: "Review results before downloading",
  },
  "stats.loadError": {
    pt: "Erro ao carregar estatísticas",
    es: "Error al cargar estadísticas",
    en: "Error loading statistics",
  },

  // Chaves API
  "apiKeys.createdAt": {
    pt: "Criada em",
    es: "Creada en",
    en: "Created at",
  },
  "apiKeys.title": {
    pt: "Chaves API",
    es: "Claves API",
    en: "API Keys",
  },
  "apiKeys.create": {
    pt: "Criar Nova Chave",
    es: "Crear Nueva Clave",
    en: "Create New Key",
  },
  "apiKeys.name": {
    pt: "Nome da Chave",
    es: "Nombre de la Clave",
    en: "Key Name",
  },
  "apiKeys.key": {
    pt: "Chave",
    es: "Clave",
    en: "Key",
  },
  "apiKeys.created": {
    pt: "Criada em",
    es: "Creada en",
    en: "Created at",
  },
  "apiKeys.lastUsed": {
    pt: "Último uso",
    es: "Último uso",
    en: "Last used",
  },
  "apiKeys.actions": {
    pt: "Ações",
    es: "Acciones",
    en: "Actions",
  },
  "apiKeys.revoke": {
    pt: "Revogar",
    es: "Revocar",
    en: "Revoke",
  },
  "apiKeys.copy": {
    pt: "Copiar",
    es: "Copiar",
    en: "Copy",
  },
  "apiKeys.noKeys": {
    pt: "Nenhuma chave API encontrada",
    es: "Ninguna clave API encontrada",
    en: "No API keys found",
  },
  "apiKeys.manage": {
    pt: "Gerenciar API Keys",
    es: "Gestionar Claves API",
    en: "Manage API Keys",
  },
  "apiKeys.subtitle": {
    pt: "Crie e gerencie suas chaves de API para acessar o Document Insight",
    es: "Cree y gestione sus claves API para acceder a Document Insight",
    en: "Create and manage your API keys to access Document Insight",
  },
  "apiKeys.importantInfo": {
    pt: "Informações Importantes",
    es: "Información Importante",
    en: "Important Information",
  },
  "apiKeys.headerInfo": {
    pt: "Use o header",
    es: "Use el encabezado",
    en: "Use the header",
  },
  "apiKeys.authenticationInfo": {
    pt: "para autenticar suas requisições",
    es: "para autenticar sus solicitudes",
    en: "to authenticate your requests",
  },
  "apiKeys.securityTip": {
    pt: "Mantenha suas API Keys seguras e não as compartilhe",
    es: "Mantenga sus claves API seguras y no las comparta",
    en: "Keep your API keys secure and don't share them",
  },
  "apiKeys.revokeTip": {
    pt: "Você pode revogar uma API Key a qualquer momento",
    es: "Puede revocar una clave API en cualquier momento",
    en: "You can revoke an API key at any time",
  },
  "apiKeys.irreversibleTip": {
    pt: "API Keys revogadas não podem ser reativadas",
    es: "Las claves API revocadas no se pueden reactivar",
    en: "Revoked API keys cannot be reactivated",
  },
  "apiKeys.createFirstKey": {
    pt: "Crie sua primeira API Key para começar a usar a API",
    es: "Cree su primera clave API para comenzar a usar la API",
    en: "Create your first API key to start using the API",
  },
  "apiKeys.active": {
    pt: "Ativa",
    es: "Activa",
    en: "Active",
  },
  "apiKeys.revoked": {
    pt: "Revogada",
    es: "Revocada",
    en: "Revoked",
  },
  "apiKeys.createNew": {
    pt: "Criar Nova API Key",
    es: "Crear Nueva Clave API",
    en: "Create New API Key",
  },
  "apiKeys.namePlaceholder": {
    pt: "Ex: Produção, Desenvolvimento, etc.",
    es: "Ej: Producción, Desarrollo, etc.",
    en: "Ex: Production, Development, etc.",
  },
  "apiKeys.creating": {
    pt: "Criando...",
    es: "Creando...",
    en: "Creating...",
  },
  "apiKeys.loadError": {
    pt: "Erro ao carregar API Keys",
    es: "Error al cargar claves API",
    en: "Error loading API keys",
  },
  "apiKeys.nameRequired": {
    pt: "Nome da API Key é obrigatório",
    es: "El nombre de la clave API es obligatorio",
    en: "API key name is required",
  },
  "apiKeys.createSuccess": {
    pt: "API Key criada com sucesso!",
    es: "¡Clave API creada con éxito!",
    en: "API key created successfully!",
  },
  "apiKeys.createError": {
    pt: "Erro ao criar API Key",
    es: "Error al crear clave API",
    en: "Error creating API key",
  },
  "apiKeys.confirmRevoke": {
    pt: 'Tem certeza que deseja revogar a API Key "{name}"?',
    es: '¿Está seguro de que desea revocar la clave API "{name}"?',
    en: 'Are you sure you want to revoke the API key "{name}"?',
  },
  "apiKeys.revokeSuccess": {
    pt: "API Key revogada com sucesso!",
    es: "¡Clave API revocada con éxito!",
    en: "API key revoked successfully!",
  },
  "apiKeys.revokeError": {
    pt: "Erro ao revogar API Key",
    es: "Error al revocar clave API",
    en: "Error revoking API key",
  },
  "apiKeys.copySuccess": {
    pt: "API Key copiada!",
    es: "¡Clave API copiada!",
    en: "API key copied!",
  },
  "apiKeys.copyError": {
    pt: "Erro ao copiar API Key",
    es: "Error al copiar clave API",
    en: "Error copying API key",
  },

  // Processamento de documentos
  "document.processor.title": {
    pt: "Processador de Documentos",
    es: "Procesador de Documentos",
    en: "Document Processor",
  },
  "document.processor.subtitle": {
    pt: "Envie documentos para processamento em fila e obtenha metadados e análises",
    es: "Envíe documentos para procesamiento en cola y obtenga metadatos y análisis",
    en: "Send documents for queue processing and get metadata and analysis",
  },
  "document.select.title": {
    pt: "Selecionar Documento",
    es: "Seleccionar Documento",
    en: "Select Document",
  },
  "document.process.button": {
    pt: "Processar Documento",
    es: "Procesar Documento",
    en: "Process Document",
  },
  "document.process.sending": {
    pt: "Enviando...",
    es: "Enviando...",
    en: "Sending...",
  },
  "document.queue.title": {
    pt: "Documento na Fila",
    es: "Documento en Cola",
    en: "Document in Queue",
  },
  "document.queue.file": {
    pt: "Arquivo:",
    es: "Archivo:",
    en: "File:",
  },
  "document.queue.size": {
    pt: "Tamanho:",
    es: "Tamaño:",
    en: "Size:",
  },
  "document.queue.estimatedTime": {
    pt: "Tempo Estimado:",
    es: "Tiempo Estimado:",
    en: "Estimated Time:",
  },
  "document.info.title": {
    pt: "Informações do Arquivo",
    es: "Información del Archivo",
    en: "File Information",
  },
  "document.info.type": {
    pt: "Tipo:",
    es: "Tipo:",
    en: "Type:",
  },
  "document.info.size": {
    pt: "Tamanho:",
    es: "Tamaño:",
    en: "Size:",
  },
  "document.info.mimeType": {
    pt: "MIME Type:",
    es: "Tipo MIME:",
    en: "MIME Type:",
  },
  "document.info.processingTime": {
    pt: "Tempo de Processamento:",
    es: "Tiempo de Procesamiento:",
    en: "Processing Time:",
  },
  "document.results.title": {
    pt: "Resultados",
    es: "Resultados",
    en: "Results",
  },
  "document.results.dimensions": {
    pt: "Dimensões:",
    es: "Dimensiones:",
    en: "Dimensions:",
  },
  "document.results.pages": {
    pt: "Páginas:",
    es: "Páginas:",
    en: "Pages:",
  },
  "document.results.extractedContent": {
    pt: "Conteúdo Extraído:",
    es: "Contenido Extraído:",
    en: "Extracted Content:",
  },
  "document.results.copyContent": {
    pt: "Copiar conteúdo",
    es: "Copiar contenido",
    en: "Copy content",
  },
  "document.error.title": {
    pt: "Erro no Processamento:",
    es: "Error en el Procesamiento:",
    en: "Processing Error:",
  },
  "document.status.prefix": {
    pt: "Status:",
    es: "Estado:",
    en: "Status:",
  },
  "document.status.pending": {
    pt: "Aguardando",
    es: "Esperando",
    en: "Pending",
  },
  "document.status.processing": {
    pt: "Processando",
    es: "Procesando",
    en: "Processing",
  },
  "document.status.completed": {
    pt: "Concluído",
    es: "Completado",
    en: "Completed",
  },
  "document.status.failed": {
    pt: "Falhou",
    es: "Falló",
    en: "Failed",
  },
  "document.status.unknown": {
    pt: "Desconhecido",
    es: "Desconocido",
    en: "Unknown",
  },

  // Mensagens de sucesso
  "document.success.processed": {
    pt: "Documento processado com sucesso!",
    es: "¡Documento procesado con éxito!",
    en: "Document processed successfully!",
  },
  "document.success.queued": {
    pt: "Documento enviado para processamento em fila!",
    es: "¡Documento enviado para procesamiento en cola!",
    en: "Document sent for queue processing!",
  },
  "document.success.retry": {
    pt: "Documento enviado para reprocessamento!",
    es: "¡Documento enviado para reprocesamiento!",
    en: "Document sent for reprocessing!",
  },
  "document.success.download": {
    pt: "Download iniciado!",
    es: "¡Descarga iniciada!",
    en: "Download started!",
  },
  "document.success.copied": {
    pt: "Copiado para a área de transferência!",
    es: "¡Copiado al portapapeles!",
    en: "Copied to clipboard!",
  },

  // Upload de arquivos
  "upload.title": {
    pt: "Enviar Documento",
    es: "Enviar Documento",
    en: "Upload Document",
  },
  "upload.subtitle": {
    pt: "Selecione um arquivo para processamento",
    es: "Seleccione un archivo para procesamiento",
    en: "Select a file for processing",
  },
  "upload.dragDrop": {
    pt: "Clique ou arraste um arquivo",
    es: "Haga clic o arrastre un archivo",
    en: "Click or drag a file",
  },
  "upload.dragOver": {
    pt: "Solte o arquivo aqui",
    es: "Suelte el archivo aquí",
    en: "Drop the file here",
  },
  "upload.acceptedFormats": {
    pt: "Formatos aceitos: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX",
    es: "Formatos aceptados: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX",
    en: "Accepted formats: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX",
  },
  "upload.maxSize": {
    pt: "Máximo: {size}MB",
    es: "Máximo: {size}MB",
    en: "Maximum: {size}MB",
  },
  "upload.fileSelected": {
    pt: "Arquivo selecionado com sucesso",
    es: "Archivo seleccionado con éxito",
    en: "File selected successfully",
  },
  "upload.fileTypeError": {
    pt: "Tipo de arquivo não suportado. Formatos aceitos: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX",
    es: "Tipo de archivo no soportado. Formatos aceptados: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX",
    en: "File type not supported. Accepted formats: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX",
  },
  "upload.fileSizeError": {
    pt: "Arquivo muito grande. Máximo permitido: {size}MB",
    es: "Archivo demasiado grande. Máximo permitido: {size}MB",
    en: "File too large. Maximum allowed: {size}MB",
  },
  "upload.instructions": {
    pt: "Instruções de Upload",
    es: "Instrucciones de Carga",
    en: "Upload Instructions",
  },
  "upload.instructions.text": {
    pt: "Para processar um documento, siga estes passos:",
    es: "Para procesar un documento, siga estos pasos:",
    en: "To process a document, follow these steps:",
  },
  "upload.step1": {
    pt: "1. Selecione um arquivo dos formatos aceitos",
    es: "1. Seleccione un archivo de los formatos aceptados",
    en: "1. Select a file from accepted formats",
  },
  "upload.step2": {
    pt: "2. Verifique se o arquivo não excede 5MB",
    es: "2. Verifique que el archivo no exceda 5MB",
    en: "2. Verify the file doesn't exceed 5MB",
  },
  "upload.step3": {
    pt: "3. Clique em 'Processar Documento' para iniciar",
    es: "3. Haga clic en 'Procesar Documento' para comenzar",
    en: "3. Click 'Process Document' to start",
  },
  "upload.supportedTypes": {
    pt: "Tipos de Arquivo Suportados",
    es: "Tipos de Archivo Soportados",
    en: "Supported File Types",
  },
  "upload.images": {
    pt: "Imagens: JPG, PNG, GIF, WEBP",
    es: "Imágenes: JPG, PNG, GIF, WEBP",
    en: "Images: JPG, PNG, GIF, WEBP",
  },
  "upload.documents": {
    pt: "Documentos: PDF, TXT, DOC, DOCX",
    es: "Documentos: PDF, TXT, DOC, DOCX",
    en: "Documents: PDF, TXT, DOC, DOCX",
  },

  // Mensagens globais
  "global.loading": {
    pt: "Carregando...",
    es: "Cargando...",
    en: "Loading...",
  },
  "global.error": {
    pt: "Erro",
    es: "Error",
    en: "Error",
  },
  "global.success": {
    pt: "Sucesso",
    es: "Éxito",
    en: "Success",
  },
  "global.warning": {
    pt: "Aviso",
    es: "Advertencia",
    en: "Warning",
  },
  "global.info": {
    pt: "Informação",
    es: "Información",
    en: "Information",
  },
  "global.confirm": {
    pt: "Confirmar",
    es: "Confirmar",
    en: "Confirm",
  },
  "global.cancel": {
    pt: "Cancelar",
    es: "Cancelar",
    en: "Cancel",
  },
  "global.save": {
    pt: "Salvar",
    es: "Guardar",
    en: "Save",
  },
  "global.edit": {
    pt: "Editar",
    es: "Editar",
    en: "Edit",
  },
  "global.delete": {
    pt: "Excluir",
    es: "Eliminar",
    en: "Delete",
  },
  "global.search": {
    pt: "Pesquisar",
    es: "Buscar",
    en: "Search",
  },
  "global.filter": {
    pt: "Filtrar",
    es: "Filtrar",
    en: "Filter",
  },
  "global.clear": {
    pt: "Limpar",
    es: "Limpiar",
    en: "Clear",
  },
  "global.refresh": {
    pt: "Atualizar",
    es: "Actualizar",
    en: "Refresh",
  },
  "global.back": {
    pt: "Voltar",
    es: "Volver",
    en: "Back",
  },
  "global.next": {
    pt: "Próximo",
    es: "Siguiente",
    en: "Next",
  },
  "global.previous": {
    pt: "Anterior",
    es: "Anterior",
    en: "Previous",
  },
  "global.page": {
    pt: "Página",
    es: "Página",
    en: "Page",
  },
  "global.of": {
    pt: "de",
    es: "de",
    en: "of",
  },
  "global.items": {
    pt: "itens",
    es: "elementos",
    en: "items",
  },
  "global.perPage": {
    pt: "por página",
    es: "por página",
    en: "per page",
  },
  "global.showing": {
    pt: "Mostrando",
    es: "Mostrando",
    en: "Showing",
  },
  "global.to": {
    pt: "até",
    es: "hasta",
    en: "to",
  },
  "global.from": {
    pt: "de",
    es: "de",
    en: "from",
  },
  "global.total": {
    pt: "Total",
    es: "Total",
    en: "Total",
  },
  "global.noData": {
    pt: "Nenhum dado encontrado",
    es: "Ningún dato encontrado",
    en: "No data found",
  },
  "global.noResults": {
    pt: "Nenhum resultado encontrado",
    es: "Ningún resultado encontrado",
    en: "No results found",
  },
  "global.tryAgain": {
    pt: "Tente novamente",
    es: "Inténtalo de nuevo",
    en: "Try again",
  },
  "global.retry": {
    pt: "Tentar novamente",
    es: "Intentar de nuevo",
    en: "Retry",
  },
  "global.close": {
    pt: "Fechar",
    es: "Cerrar",
    en: "Close",
  },
  "global.open": {
    pt: "Abrir",
    es: "Abrir",
    en: "Open",
  },
  "global.expand": {
    pt: "Expandir",
    es: "Expandir",
    en: "Expand",
  },
  "global.collapse": {
    pt: "Recolher",
    es: "Contraer",
    en: "Collapse",
  },
  "global.more": {
    pt: "Mais",
    es: "Más",
    en: "More",
  },
  "global.less": {
    pt: "Menos",
    es: "Menos",
    en: "Less",
  },
  "global.all": {
    pt: "Todos",
    es: "Todos",
    en: "All",
  },
  "global.none": {
    pt: "Nenhum",
    es: "Ninguno",
    en: "None",
  },
  "global.selectAll": {
    pt: "Selecionar Todos",
    es: "Seleccionar Todos",
    en: "Select All",
  },
  "global.deselectAll": {
    pt: "Desselecionar Todos",
    es: "Deseleccionar Todos",
    en: "Deselect All",
  },
  "global.selected": {
    pt: "Selecionado",
    es: "Seleccionado",
    en: "Selected",
  },
  "global.itemsSelected": {
    pt: "itens selecionados",
    es: "elementos seleccionados",
    en: "items selected",
  },
  "global.itemSelected": {
    pt: "item selecionado",
    es: "elemento seleccionado",
    en: "item selected",
  },
  "global.logout": {
    pt: "Sair",
    es: "Salir",
    en: "Logout",
  },
  "global.and": {
    pt: "e",
    es: "y",
    en: "and",
  },
  "global.show": {
    pt: "Mostrar",
    es: "Mostrar",
    en: "Show",
  },
  "global.hide": {
    pt: "Ocultar",
    es: "Ocultar",
    en: "Hide",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("pt");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carrega o idioma salvo no localStorage
    try {
      const savedLanguage = localStorage.getItem("language") as Language;
      console.log("Idioma salvo encontrado:", savedLanguage);
      if (savedLanguage && ["pt", "es", "en"].includes(savedLanguage)) {
        setLanguageState(savedLanguage);
        console.log("Idioma definido como:", savedLanguage);
      } else {
        console.log("Usando idioma padrão: pt");
      }
    } catch (error) {
      console.error("Erro ao carregar idioma do localStorage:", error);
    } finally {
      setIsLoading(false);
      console.log("LanguageProvider carregado, isLoading:", false);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);

    // Atualiza o header Accept-Language para o backend
    if (typeof window !== "undefined") {
      document.documentElement.lang = newLanguage;
    }
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    let translation = translations[key]?.[language] || key;

    // Debug: verificar se a tradução está sendo encontrada
    if (!translations[key]) {
      console.warn(`Tradução não encontrada para a chave: ${key}`);
    }

    // Se houver variáveis para interpolação, substitui os placeholders
    if (variables) {
      Object.entries(variables).forEach(([placeholder, value]) => {
        translation = translation.replace(`{${placeholder}}`, value);
      });
    }

    return translation;
  };

  const supportedLanguages: Language[] = ["pt", "es", "en"];

  console.log("LanguageProvider renderizando com:", { language, isLoading });

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de um LanguageProvider");
  }
  return context;
};
