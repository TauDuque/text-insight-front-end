# 📄 Text Insight - Frontend

Frontend da aplicação **Text Insight**, um sistema de processamento de documentos com interface moderna e responsiva.

## 🚀 Funcionalidades

### **Processamento de Documentos**

- Upload de arquivos (JPG, PNG, PDF, TXT, DOC, DOCX)
- Extração de texto e metadados
- Processamento otimizado em memória
- Interface drag & drop intuitiva

### **Análise de Texto**

- Análise linguística completa
- Detecção de sentimento
- Análise de legibilidade
- Extração de palavras-chave e entidades

### **Interface Moderna**

- Design responsivo
- Sistema de autenticação
- Estatísticas em tempo real
- Histórico de processamentos

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Axios** - Cliente HTTP

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Backend rodando na porta 3001

### Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📁 Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Página principal
│   ├── login/            # Autenticação
│   └── register/         # Registro
├── components/           # Componentes React
│   ├── TextAnalyzer.tsx  # Analisador de texto
│   ├── Layout.tsx        # Layout principal
│   └── QueueStats.tsx    # Estatísticas
├── contexts/             # Contextos React
│   ├── AuthContext.tsx   # Autenticação
│   └── LanguageContext.tsx # Internacionalização
├── hooks/                # Hooks customizados
├── services/             # Serviços de API
└── types/                # Tipos TypeScript
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:

- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops

## 🎨 Design System

- **Cores**: Paleta consistente com Tailwind CSS
- **Tipografia**: Hierarquia clara e legível
- **Componentes**: Reutilizáveis e modulares
- **Ícones**: Lucide React para consistência

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Deploy automático via GitHub
git push origin main
```

### Outras Plataformas

```bash
# Build estático
npm run build
npm run export
```

## 📚 Documentação

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
