# DentaCare Telegram Bot & Backend Xizmati

Ushbu backend xizmati 2 ta asosiy vazifani bajaradi:
1. **Telegram Bot:** Foydalanuvchi `/start` bosganda WebApp (Mini App) ochish tugmasini chiqaradi va buyruqlarga javob beradi.
2. **Xabarnomalar API:** Bemor navbat olganda yoki shifokor navbatni tasdiqlaganda/bekor qilganda darhol Telegram orqali xabar yuboradi.

## Ishga Tushirish:
```bash
npm install
npm start
```

## Telegram Bot sozlash:
1. Telegramda [@BotFather](https://t.me/BotFather) ga kiring va `/newbot` buyrug'i orqali yangi bot oching.
2. Olingan `API Token`ni `bot-backend/.env` faylidagi `BOT_TOKEN=` qatoriga qo'ying.
3. BotFather'da `/newapp` yoki `/setmenubutton` orqali WebApp manzili sifatida `user-webapp` domenini belgilang.
