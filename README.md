# FIECFY — projeto final

Projeto acadêmico de streaming musical inspirado no Spotify, com API Laravel e interface React.

## API em produção

- Repositório: [stella46098-creator/FIECFY-projeto](https://github.com/stella46098-creator/FIECFY-projeto)
- URL base da API: `https://fiecfy-projeto-production.up.railway.app/api`
- Teste: `GET /artistas` retorna HTTP 200.

O banco de produção ainda não foi preenchido com o catálogo de demonstração; as listagens retornam arrays vazios até a execução do seeder.

## Estrutura

- `backend/`: API RESTful em PHP 8.2+ / Laravel 11 / MySQL.
- `frontend/`: React + JavaScript + Vite + Tailwind CSS.
- `docs/thunder-client/`: collection de requisições para importar e testar a API.

## Requisitos

- PHP 8.2 ou superior e Composer.
- MySQL ou MariaDB.
- Node.js 20 ou superior e npm.

## 1. Configurar o Back-end

Abra um terminal na pasta `backend`:

```bash
composer install
copy .env.example .env
php artisan key:generate
```

No `.env`, configure o banco local. O exemplo está preparado para a porta `3310`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3310
DB_DATABASE=fiecfy
DB_USERNAME=root
DB_PASSWORD=
```

Crie o banco `fiecfy` no MySQL caso ele ainda não exista. Depois rode as migrations e os dados iniciais:

```bash
php artisan migrate:fresh --seed
php artisan storage:link
php artisan serve
```

A API ficará em `http://127.0.0.1:8000/api`.

**Atenção:** `migrate:fresh` apaga todas as tabelas do banco configurado antes de recriá-las. Faça backup antes de executar se houver dados que deseja preservar.

### Usuário de demonstração

- E-mail: `teste@fiecfy.com`
- Senha: `12345678`

O Seeder cadastra uma seleção de seis faixas de Billie Eilish, The Weeknd, Dua Lipa, Coldplay, BK e Taylor Swift na playlist `Favoritas` do usuário de demonstração. As faixas completas de `Ocean Eyes`, `Levitating`, `Planos`, `Blinding Lights`, `Viva La Vida` e `Anti-Hero` ficam em `backend/storage/app/public/songs/`; as capas correspondentes ficam em `backend/storage/app/public/covers/`. Mantenha os arquivos nesses caminhos para reproduzir as faixas e exibir as artes. A criação e edição de álbuns personalizados foi desativada; os álbuns existentes continuam associados às músicas do catálogo. As demais músicas usam prévias de até 30 segundos quando disponíveis. Na tela de músicas, crie playlists, use o coração para favoritar e o botão `+` para adicionar faixas à playlist selecionada. O player oferece reprodução/pausa, faixa anterior/próxima, aleatório, repetição, busca na faixa e volume. O link das prévias abre a faixa completa no serviço de música.

### E-mail de boas-vindas

Crie uma caixa de testes no Mailtrap e preencha no `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=SEU_USUARIO_MAILTRAP
MAIL_PASSWORD=SUA_SENHA_MAILTRAP
MAIL_SCHEME=tls
MAIL_FROM_ADDRESS="contato@fiecfy.com"
MAIL_FROM_NAME="${APP_NAME}"
```

Se as credenciais estiverem vazias, o envio não será entregue ao Mailtrap. O cadastro continua funcionando; falhas no e-mail são registradas no log.

## 2. Configurar o Front-end

Abra outro terminal na pasta `frontend`:

```bash
npm install
copy .env.example .env
```

O `.env` do front-end deve apontar para a API:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

Inicie o Vite:

```bash
npm run dev
```

Abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`).

Para gerar os arquivos de produção:

```bash
npm run build
```

## 3. Rotas principais da API

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/register` | Público | Cadastro e token |
| POST | `/api/login` | Público | Login e token |
| GET | `/api/me` | Token | Usuário autenticado |
| POST | `/api/logout` | Token | Revogar token atual |
| GET | `/api/artistas` | Público | Listar artistas, busca e paginação |
| POST/GET/PUT/DELETE | `/api/artistas` | Token nas alterações | CRUD de artistas |
| GET | `/api/albums` | Público | Listar álbuns |
| GET | `/api/albums/{album}` | Público | Consultar álbum e faixas |
| GET | `/api/musicas` | Público | Listar músicas, busca e paginação |
| POST/GET/PUT/DELETE | `/api/musicas` | Token nas alterações | CRUD de músicas |
| GET/POST | `/api/playlists` | Token | Listar e criar playlists |
| GET/PUT/DELETE | `/api/playlists/{id}` | Token | Consultar, editar e excluir playlist |
| POST | `/api/playlists/{id}/musicas` | Token | Adicionar música |
| DELETE | `/api/playlists/{id}/musicas/{song}` | Token | Remover música |

As rotas de listagem usam paginação de 15 registros. Para pesquisar, use `?search=Billie`.

### Uploads

- Áudio da música: envie o campo `audio` como MP3, WAV ou M4A em `multipart/form-data` (até 20 MB).
- Os arquivos são guardados no disco `public`. Rode `php artisan storage:link` para disponibilizar os arquivos.

## 4. Collection de testes

Importe `docs/thunder-client/FIECFY-API-Collection.json` no Thunder Client ou Postman. A variável `baseUrl` já aponta para a API em produção; para testes locais, altere-a para `http://127.0.0.1:8000/api`. Para rotas protegidas, use `Cadastro` para criar uma conta ou faça login e copie o token retornado para a variável `token`.

## 5. Publicação

A API está hospedada na Railway e pode ser testada em `https://fiecfy-projeto-production.up.railway.app/api`. Para carregar os dados de demonstração em uma base de produção vazia, configure primeiro as variáveis necessárias na plataforma e execute `php artisan migrate --force` e `php artisan db:seed --force` na pasta `backend`. Não use `migrate:fresh` em produção, pois ele apaga as tabelas existentes.

Mantenha `APP_KEY`, credenciais de banco e demais segredos apenas nas variáveis privadas da plataforma. Não envie `.env`, `vendor/`, `node_modules/` ou `dist/` ao GitHub. O front-end ainda pode ser publicado separadamente na Vercel ou Netlify com `VITE_API_URL` apontando para a URL base acima.
