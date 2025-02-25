# Studiefy

Studiefy é uma aplicação web moderna desenvolvida para otimizar a experiência de estudo e aprendizado. Construída com tecnologias de ponta, a plataforma oferece uma interface intuitiva e recursos avançados para estudantes e educadores.

## 🚀 Tecnologias

- **Frontend:**
  - Next.js 15
  - React 18
  - TypeScript
  - Tailwind CSS
  - Radix UI (componentes acessíveis)
  - Zustand (gerenciamento de estado)
  - React Query (gerenciamento de dados)

- **Backend:**
  - Supabase (Banco de dados e Autenticação)
  - Next.js API Routes

## 🌟 Funcionalidades

- Sistema de autenticação seguro
- Interface moderna e responsiva
- Temas claro/escuro
- Componentes UI reutilizáveis e acessíveis
- Integração com Supabase para persistência de dados
- Sistema de rotas dinâmico

## 🛠️ Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase

## 🚀 Como executar

1. Clone o repositório
```bash
git clone [url-do-repositorio]
```

2. Instale as dependências
```bash
cd studiefy
npm install
```

3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-do-supabase
```

4. Execute o projeto
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📦 Estrutura do Projeto

```
src/
  ├── app/           # Rotas e páginas da aplicação
  ├── components/    # Componentes reutilizáveis
  ├── hooks/         # Custom hooks
  ├── lib/           # Configurações e utilitários
  ├── store/         # Gerenciamento de estado global
  └── utils/         # Funções utilitárias
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Por favor, leia o guia de contribuição para saber como contribuir com o projeto.

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
