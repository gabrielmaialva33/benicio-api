# Benicio Advogados API Documentation

Bem-vindo à documentação oficial da **API Benicio Advogados** - um sistema completo de gestão jurídica construído com AdonisJS v6 e potencializado por Inteligência Artificial.

## 🚀 Sobre a API

A API Benicio Advogados oferece uma plataforma robusta para gerenciamento de escritórios de advocacia, incluindo:

- **Gestão de Processos (Folders)**: CRUD completo de processos jurídicos com numeração CNJ
- **Gestão de Clientes**: Cadastro de pessoas físicas e jurídicas
- **Controle de Documentos**: Upload e organização de documentos processuais
- **RBAC Avançado**: Sistema completo de roles e permissões
- **AI Agents**: 6 agentes de IA especializados em direito brasileiro

## 🤖 Sistema de IA Revolucionário

### Agentes Especializados

O sistema conta com **6 agentes de IA** especializados que utilizam modelos NVIDIA NIM:

1. **Pesquisador Jurídico** - Busca jurisprudência e legislação
2. **Analisador de Documentos** - Analisa contratos e petições
3. **Estrategista de Caso** - Define estratégias processuais
4. **Gerenciador de Prazos** - Calcula prazos processuais
5. **Redator Jurídico** - Redige peças processuais
6. **Comunicador com Cliente** - Simplifica comunicação

### Workflows Multi-Agent

Três workflows orquestrados para tarefas complexas:

- **Análise Completa de Caso** - 4 agentes colaborando
- **Revisão de Contrato** - Análise profunda de cláusulas
- **Estratégia Processual** - Teses, prazos e recomendações

### Tecnologias Anti-Alucinação

- **RAG (Retrieval Augmented Generation)** com pgvector
- **Citations Tracking** - Toda resposta inclui fontes
- **Web Search Integration** - Informações sempre atualizadas
- **Embedding Search** - Busca semântica em base de conhecimento

## 📚 Recursos da API

### Autenticação

A API usa **JWT (JSON Web Tokens)** com múltiplos guards:

- **JWT** (padrão) - access_token (15min) + refresh_token (3 dias)
- **API Tokens** - Para integrações externas
- **Session** - Para aplicações web
- **Basic Auth** - Para casos específicos

Endpoint de autenticação: `POST /api/v1/sessions/sign-in`

```json
{
  "uid": "usuario@benicio.com.br",
  "password": "senha123"
}
```

### Rate Limiting

- **Autenticação**: 5 requisições/minuto
- **Endpoints gerais**: Configurável por rota

### Paginação

Todos os endpoints de listagem suportam paginação:

```
GET /api/v1/folders?page=1&per_page=20
```

Resposta inclui metadados: `total`, `current_page`, `last_page`, etc.

## 🔐 Segurança

- **Autenticação JWT** com refresh tokens
- **RBAC** com permissões granulares
- **Ownership Validation** - Middleware de verificação de propriedade
- **Rate Limiting** em endpoints sensíveis
- **Validação de Dados** com VineJS
- **Soft Deletes** para auditoria

## 📖 Documentação Interativa

### OpenAPI Specification

A [especificação completa da API](./openapi.yaml) está disponível em formato OpenAPI 3.1.0.

Você pode:

- ✅ Explorar todos os endpoints
- ✅ Testar requisições diretamente
- ✅ Ver exemplos de request/response
- ✅ Entender schemas e validações

### Arquivo HTTP para Testes

Para desenvolvedores que preferem testar via REST Client (VS Code), temos um arquivo `api.http` completo com:

- 📝 Todas as rotas documentadas
- 🔑 Variáveis pré-configuradas
- 📋 Exemplos práticos de uso
- 🤖 Exemplos de AI (chat, streaming, workflows)

Baixe: [api.http](./api.http)

## 🛠️ Tecnologias Utilizadas

### Backend

- **AdonisJS v6** - Framework Node.js/TypeScript
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e gerenciamento de estado
- **Bull Queue** - Processamento assíncrono
- **Lucid ORM** - Mapeamento objeto-relacional

### AI Stack

- **NVIDIA NIM API** - Modelos LLM de última geração
- **pgvector** - Extensão PostgreSQL para embeddings
- **Vercel AI SDK** - Integração com NVIDIA
- **OpenAI SDK** - Cliente compatível

### Modelos de IA

- `meta/llama-3.1-70b-instruct` - Uso geral e chat
- `qwen/qwen3-coder-480b-a35b-instruct` - Precisão em prazos
- `deepseek-ai/deepseek-r1` - Raciocínio avançado
- `mistralai/mistral-7b-instruct-v0.3` - Respostas rápidas
- `microsoft/phi-4-multimodal-instruct` - Análise de documentos
- `nvidia/nv-embedqa-e5-v5` - Geração de embeddings

## 🚦 Status da API

Verificar saúde: `GET /api/v1/health`

```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T10:00:00.000Z"
}
```

## 📞 Suporte

**Benicio Advogados Associados**

- 📧 Email: contato@benicio.com.br
- 🌐 Website: https://benicio.com.br
- 📍 Localização: São Paulo, Brasil

## 🔄 Versionamento

Versão atual: **v1.0.0**

A API segue versionamento semântico e mantém compatibilidade retroativa dentro da mesma major version.

## 📝 Licença

**Proprietary** - © 2024 Benicio Advogados Associados. Todos os direitos reservados.

---

**Pronto para começar?** Explore a [documentação completa da API](./openapi.yaml) ou teste direto no Redocly!
