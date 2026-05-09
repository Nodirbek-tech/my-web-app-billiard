# Telegram Bot Setup

## 1. Create a bot via BotFather

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Enter a display name (e.g. `Billiard Club`)
4. Enter a username ending in `bot` (e.g. `mybilliardclub_bot`)
5. Copy the **token** BotFather gives you (format: `123456789:ABCdef...`)

## 2. Configure the token

Open `server/.env` and set:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
```

If the variable is missing or empty, the bot is silently disabled — the server still starts normally.

## 3. Set bot commands (optional but recommended)

In BotFather, send `/setcommands`, choose your bot, then paste:

```
start - Ro'yxatdan o'tish / Boshlash
menu - Asosiy menyu
profile - Profilim
balance - Bonus balansim
history - O'yin tarixim
reserve - Stol band qilish
promotions - Aksiyalar
help - Yordam
```

## 4. Share contact permission

The bot asks users to share their phone number using Telegram's **Contact** button.  
This requires the user to press the button from a **mobile** Telegram client.

## 5. Bot features

| Feature | Description |
|---|---|
| `/start` | Registration flow — asks for phone number, links or creates a `Customer` |
| Profilim | Shows name, card number, QR code value |
| Bonus balansim | Current bonus balance |
| O'yin tarixim | Last 10 completed sessions |
| Stol band qilish | Multi-step reservation: date → time → people count → optional note |
| Aksiyalar | Lists all active promotions |
| Manzil va aloqa | Address and phone from Settings |
| Operator bilan bog'lanish | Direct link to admin (set via BotFather `/setdescription`) |

## 6. Admin web pages

### Bronlar (`/reservations`)
- Lists reservations from the bot
- Filter by: All / Pending / Confirmed / Cancelled
- Confirm or cancel individual reservations
- Delete reservations

### Aksiyalar (`/promotions`) — Admin only
- Create promotions with a title and message
- Toggle active/inactive
- Click **Yuborish** to broadcast to all registered Telegram customers

## 7. Payment notification

When a session is paid via `stopAndPay`, if the customer has a linked Telegram account the bot automatically sends a receipt summary:

```
✅ To'lov qabul qilindi!

🎱 Stol: Table 1
⏱ O'yin vaqti: 90 daqiqa
💰 Jami: 75,000 so'm
🎁 Bonus: +750 so'm
💳 Bonus balans: 3,250 so'm
```

## 8. Running the server

```bash
cd server
npm run start:dev
```

The bot starts automatically if `TELEGRAM_BOT_TOKEN` is set. You will see:

```
Telegram bot started
```

in the console output.

## 9. Customer linking

- If a customer with the same phone already exists in the database → the bot links the Telegram account to that customer.
- If no customer exists → the bot creates a new `Customer` record with a generated `cardNumber` and `qrCodeValue`.
- `qrCodeValue` format: `BC-{telegramId}` (can be printed on a physical card).

## 10. Troubleshooting

| Problem | Fix |
|---|---|
| Bot doesn't start | Check `TELEGRAM_BOT_TOKEN` in `.env` |
| "Conflict: terminated by other getUpdates request" | Only one bot instance can poll at a time — stop any other running instances |
| Phone number not recognized | Ensure customer was created with the same number (with country code `+998...`) |
| Broadcast sends 0 messages | No customers have linked Telegram accounts yet |
