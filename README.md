# Bar Assistant

## Instalacja

1. Pobranie programu
```
curl -fsSL https://ollama.com/install.sh | sh
```

2. Uruchomienie modelu lokalnie
```
ollama start
ollama run gemma:2b
```

3. Uruchomienie aplikacji
```
node run start
```

```
Frontend:
├─ .gitignore
├─ ClientApp
│  ├─ angular.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ src
│  │  ├─ app
│  │  │  ├─ app.component.html
│  │  │  ├─ app.component.scss
│  │  │  ├─ app.component.spec.ts
│  │  │  ├─ app.component.ts
│  │  │  ├─ app.config.ts
│  │  │  ├─ app.routes.ts
│  │  │  ├─ components
│  │  │  │  ├─ chat
│  │  │  │  │  ├─ chat.component.html
│  │  │  │  │  ├─ chat.component.scss
│  │  │  │  │  ├─ chat.component.ts
│  │  │  │  │  └─ chat.service.ts
│  │  │  │  ├─ drink-card
│  │  │  │  │  ├─ drink-card.component.html
│  │  │  │  │  ├─ drink-card.component.scss
│  │  │  │  │  ├─ drink-card.component.spec.ts
│  │  │  │  │  └─ drink-card.component.ts
│  │  │  │  └─ login
│  │  │  │     ├─ login.component.html
│  │  │  │     ├─ login.component.scss
│  │  │  │     ├─ login.component.spec.ts
│  │  │  │     └─ login.component.ts
│  │  │  ├─ guards
│  │  │  │  ├─ auth.guard.spec.ts
│  │  │  │  └─ auth.guard.ts
│  │  │  ├─ models
│  │  │  │  ├─ drink.model.ts
│  │  │  │  ├─ message.model.ts
│  │  │  │  └─ user.model.ts
│  │  │  ├─ services
│  │  │  │  ├─ login.service.spec.ts
│  │  │  │  └─ login.service.ts
│  │  │  └─ styles
│  │  │     └─ _scrollbar.theme.scss
│  │  ├─ environments
│  │  │  ├─ environment.development.ts
│  │  │  └─ environment.ts
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ main.ts
│  │  └─ styles.scss

Backend:
├─ app.js
├─ bin
│  └─ www
├─ db
│  ├─ bar_assistant.db
│  ├─ data
│  │  ├─ drink_ingredients.json
│  │  ├─ drinks.json
│  │  ├─ images.json
│  │  └─ ingredients.json
│  ├─ db.js
│  └─ models
│     └─ user.js
├─ package-lock.json
├─ package.json
├─ public
│  ├─ images
│  ├─ javascripts
│  │  └─ responseModifier.js
│  └─ stylesheets
│     └─ style.css
├─ routes
│  ├─ index.js
│  └─ users.js
└─ views
   ├─ error.pug
   ├─ index.pug
   └─ layout.pug
```