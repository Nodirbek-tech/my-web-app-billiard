import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import { PrismaService } from '../prisma/prisma.service';

interface UserSession {
  step: string;
  data?: Record<string, any>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const UZ_DAYS   = ['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];

function fmtDate(d: Date): string {
  return `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()} (${UZ_DAYS[d.getDay()]})`;
}
function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function fmtMoney(n: number): string {
  return `${Math.round(n).toLocaleString('ru-RU')} so'm`;
}
function fmtDuration(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h} soat${m > 0 ? ' ' + m + ' daqiqa' : ''}` : `${m} daqiqa`;
}

function parseInputDate(input: string): Date | null {
  const s = input.trim().toLowerCase();
  const now = new Date();
  if (s === 'bugun') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (s === 'ertaga') {
    const t = new Date(now); t.setDate(t.getDate() + 1);
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }
  const m = s.match(/^(\d{1,2})[.\-\/](\d{1,2})(?:[.\-\/](\d{2,4}))?$/);
  if (m) {
    const day = parseInt(m[1]), month = parseInt(m[2]) - 1;
    const yr = m[3] ? (parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3])) : now.getFullYear();
    const d = new Date(yr, month, day);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function parseInputTime(input: string): { h: number; m: number } | null {
  const s = input.trim().replace('.', ':');
  const match = s.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    const h = parseInt(match[1]), m = parseInt(match[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return { h, m };
  }
  return null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private bot: Telegraf | null = null;
  private sessions = new Map<number, UserSession>();

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      this.logger.log('TELEGRAM_BOT_TOKEN not set — bot disabled');
      return;
    }
    try {
      this.bot = new Telegraf(token);
      this.setupHandlers();
      this.bot.launch().catch((err: Error) => this.logger.error('Bot launch failed', err.message));
      this.logger.log('Telegram bot started');
      process.once('SIGINT',  () => this.bot?.stop('SIGINT'));
      process.once('SIGTERM', () => this.bot?.stop('SIGTERM'));
    } catch (err: any) {
      this.logger.error('Failed to initialize bot', err.message);
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  async notifyPayment(customerId: number, data: {
    tableName: string; totalMinutes: number; totalCost: number;
    bonusEarned: number; bonusBalance: number;
  }): Promise<void> {
    if (!this.bot) return;
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer?.telegramId) return;
    const text =
      `✅ *To'lov qabul qilindi!*\n\n` +
      `🎱 Stol: ${data.tableName}\n` +
      `⏱ Vaqt: ${fmtDuration(data.totalMinutes)}\n` +
      `💰 Jami: *${fmtMoney(data.totalCost)}*\n` +
      (data.bonusEarned > 0 ? `⭐ Bonus: +${fmtMoney(data.bonusEarned)}\n` : '') +
      `💳 Balans: ${fmtMoney(data.bonusBalance)}`;
    await this.bot.telegram
      .sendMessage(customer.telegramId, text, { parse_mode: 'Markdown' })
      .catch((e: Error) => this.logger.warn(`Payment notify failed for ${customerId}: ${e.message}`));
  }

  async sendPromotionBroadcast(promotionId: number, title: string, msg: string): Promise<number> {
    if (!this.bot) return 0;
    const [customers, settings] = await Promise.all([
      this.prisma.customer.findMany({
        where: { telegramId: { not: null } },
        select: { id: true, telegramId: true },
      }),
      this.prisma.businessSettings.findUnique({ where: { id: 1 } }),
    ]);
    let sent = 0;
    const addrLine = settings?.address ? `\n📍 Manzil: ${settings.address}` : '';
    const phoneLine = settings?.contactPhone ? `\n☎️ Telefon: ${settings.contactPhone}` : '';
    const text = `🎁 *${title}*\n\n${msg}${addrLine}${phoneLine}`;
    for (const c of customers) {
      if (!c.telegramId) continue;
      const already = await this.prisma.promotionSendLog.findUnique({
        where: { promotionId_customerId: { promotionId, customerId: c.id } },
      });
      if (already) continue;
      try {
        await this.bot.telegram.sendMessage(c.telegramId, text, { parse_mode: 'Markdown' });
        await this.prisma.promotionSendLog.create({ data: { promotionId, customerId: c.id } });
        sent++;
      } catch (e: any) {
        this.logger.warn(`Broadcast failed for customer ${c.id}: ${e.message}`);
      }
    }
    return sent;
  }

  async notifyReservationStatus(
    telegramId: string,
    data: { date: Date; peopleCount: number },
    status: 'CONFIRMED' | 'CANCELLED',
  ): Promise<void> {
    if (!this.bot) return;
    const text = status === 'CONFIRMED'
      ? `✅ *Bron tasdiqlandi!*\n\n` +
        `📅 Sana: ${fmtDate(data.date)}\n` +
        `🕐 Vaqt: ${fmtTime(data.date)}\n` +
        `👥 Odam soni: ${data.peopleCount}\n\n` +
        `Sizni kutamiz! 🎱`
      : `❌ *Bron bekor qilindi.*\n\n` +
        `📅 Sana: ${fmtDate(data.date)}\n` +
        `🕐 Vaqt: ${fmtTime(data.date)}\n\n` +
        `Batafsil ma'lumot uchun operator bilan bog'laning.`;
    await this.bot.telegram
      .sendMessage(telegramId, text, { parse_mode: 'Markdown' })
      .catch((e: Error) => this.logger.warn(`Reservation notify failed for ${telegramId}: ${e.message}`));
  }

  // ─── Session helpers ─────────────────────────────────────────────────────────

  private getSession(uid: number): UserSession { return this.sessions.get(uid) ?? { step: 'idle' }; }
  private setSession(uid: number, s: UserSession) { this.sessions.set(uid, s); }
  private clearSession(uid: number) { this.sessions.set(uid, { step: 'idle' }); }

  // ─── Keyboards ───────────────────────────────────────────────────────────────

  private mainMenu() {
    return Markup.keyboard([
      ["👤 Profilim", "💳 Bonus balansim"],
      ["🎱 O'yin tarixim", "📅 Stol band qilish"],
      ["🎁 Aksiyalar", "📍 Manzil va aloqa"],
      ["☎️ Operator bilan bog'lanish"],
    ]).resize();
  }

  private phoneKb() {
    return Markup.keyboard([[Markup.button.contactRequest('📱 Telefon raqamimni ulashish')]])
      .resize().oneTime();
  }

  private cancelKb() {
    return Markup.keyboard([['❌ Bekor qilish']]).resize().oneTime();
  }

  // ─── Auth guard ──────────────────────────────────────────────────────────────

  private async findCustomerByTgId(telegramId: string) {
    return this.prisma.customer.findFirst({ where: { telegramId } });
  }

  private async requireCustomer(ctx: any, telegramId: string) {
    const customer = await this.findCustomerByTgId(telegramId);
    if (!customer) {
      await ctx.reply(
        "⚠️ Siz hali ro'yxatdan o'tmagansiz.\n\n/start buyrug'ini yuboring va telefon raqamingizni ulashing.",
        Markup.removeKeyboard(),
      );
    }
    return customer;
  }

  // ─── Handler setup ───────────────────────────────────────────────────────────

  private setupHandlers() {
    if (!this.bot) return;
    const bot = this.bot;

    bot.start(async (ctx) => {
      const uid = ctx.from.id;
      const customer = await this.findCustomerByTgId(String(uid));
      if (customer) {
        this.clearSession(uid);
        await ctx.reply(
          `🎱 Xush kelibsiz, *${customer.name}*!\n\nBilliard Club'ga qaytganingizdan xursandmiz.`,
          { parse_mode: 'Markdown', ...this.mainMenu() },
        );
      } else {
        this.setSession(uid, { step: 'awaiting_phone' });
        await ctx.reply(
          "🎱 *Billiard Club*'ga xush kelibsiz!\n\n" +
          "Bonus dasturimizdan foydalanish uchun telefon raqamingizni ulashing.",
          { parse_mode: 'Markdown', ...this.phoneKb() },
        );
      }
    });

    bot.help(async (ctx) => {
      await ctx.reply(
        "*Buyruqlar:*\n\n" +
        "/start — Boshlanish\n" +
        "/menu — Asosiy menyu\n" +
        "/profile — Profilim\n" +
        "/balance — Bonus balans\n" +
        "/history — O'yin tarixi\n" +
        "/reserve — Stol band qilish\n" +
        "/promotions — Aksiyalar",
        { parse_mode: 'Markdown' },
      );
    });

    bot.command('menu', async (ctx) => {
      const c = await this.requireCustomer(ctx, String(ctx.from.id));
      if (!c) return;
      this.clearSession(ctx.from.id);
      await ctx.reply('Asosiy menyu:', this.mainMenu());
    });

    // Phone contact sharing → registration/linking
    bot.on(message('contact'), async (ctx) => {
      const uid = ctx.from.id;
      const session = this.getSession(uid);
      if (session.step !== 'awaiting_phone') return;
      const rawPhone = ctx.message.contact.phone_number;
      const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
      try {
        let customer = await this.prisma.customer.findFirst({
          where: { OR: [{ phone }, { phone: rawPhone }] },
        });
        if (customer) {
          customer = await this.prisma.customer.update({
            where: { id: customer.id },
            data: { telegramId: String(uid), telegramUsername: ctx.from.username ?? null },
          });
          await ctx.reply(
            `✅ *Hisobingiz ulandi!*\n\n` +
            `👤 ${customer.name}\n` +
            `💳 Karta: \`${customer.cardNumber}\`\n` +
            `⭐ Bonus: ${fmtMoney(customer.bonusBalance)}`,
            { parse_mode: 'Markdown', ...this.mainMenu() },
          );
        } else {
          const name = [ctx.from.first_name ?? '', ctx.from.last_name ?? ''].join(' ').trim() || 'Telegram foydalanuvchi';
          const newCustomer = await this.prisma.$transaction(async (tx) => {
            const c = await tx.customer.create({
              data: { name, phone, cardNumber: 'TEMP', bonusBalance: 0,
                telegramId: String(uid), telegramUsername: ctx.from.username ?? null },
            });
            return tx.customer.update({
              where: { id: c.id },
              data: {
                cardNumber: `LC-${c.id.toString().padStart(8, '0')}`,
                qrCodeValue: `BC-${c.id.toString().padStart(8, '0')}`,
              },
            });
          });
          await ctx.reply(
            `🎉 *Ro'yxatdan o'tdingiz!*\n\n` +
            `👤 ${newCustomer.name}\n` +
            `📱 ${phone}\n` +
            `💳 Karta: \`${newCustomer.cardNumber}\`\n` +
            `⭐ Bonus: 0 so'm\n\n` +
            `O'yin so'ngida bonus to'plang!`,
            { parse_mode: 'Markdown', ...this.mainMenu() },
          );
        }
        this.clearSession(uid);
      } catch (err: any) {
        this.logger.error('Registration error', err.message);
        await ctx.reply("❌ Xatolik yuz berdi. Qayta urinib ko'ring.");
      }
    });

    // 👤 Profile
    bot.hears("👤 Profilim", async (ctx) => {
      const c = await this.requireCustomer(ctx, String(ctx.from.id));
      if (!c) return;
      const [count, agg] = await Promise.all([
        this.prisma.customerVisit.count({ where: { customerId: c.id } }),
        this.prisma.customerVisit.aggregate({ where: { customerId: c.id }, _sum: { totalCost: true } }),
      ]);
      await ctx.reply(
        `👤 *Profilim*\n\n` +
        `Ism: *${c.name}*\n` +
        `📱 Tel: ${c.phone}\n` +
        `💳 Karta: \`${c.cardNumber}\`\n` +
        `⭐ Bonus: *${fmtMoney(c.bonusBalance)}*\n` +
        `🎱 Tashriflar: ${count}\n` +
        `💰 Sarflangan: ${fmtMoney(agg._sum.totalCost ?? 0)}`,
        { parse_mode: 'Markdown', ...this.mainMenu() },
      );
    });

    bot.command('profile', async (ctx) => {
      const c = await this.requireCustomer(ctx, String(ctx.from.id));
      if (!c) return;
      const count = await this.prisma.customerVisit.count({ where: { customerId: c.id } });
      await ctx.reply(
        `👤 *${c.name}*\n💳 \`${c.cardNumber}\`\n⭐ Bonus: ${fmtMoney(c.bonusBalance)}\n🎱 Tashriflar: ${count}`,
        { parse_mode: 'Markdown' },
      );
    });

    // 💳 Bonus balance
    bot.hears("💳 Bonus balansim", async (ctx) => {
      const c = await this.requireCustomer(ctx, String(ctx.from.id));
      if (!c) return;
      const [count, agg] = await Promise.all([
        this.prisma.customerVisit.count({ where: { customerId: c.id } }),
        this.prisma.customerVisit.aggregate({
          where: { customerId: c.id },
          _sum: { totalCost: true, bonusEarned: true, bonusRedeemed: true },
        }),
      ]);
      await ctx.reply(
        `💳 *Bonus balansim*\n\n` +
        `👤 ${c.name}\n` +
        `💳 \`${c.cardNumber}\`\n\n` +
        `⭐ *Joriy balans: ${fmtMoney(c.bonusBalance)}*\n\n` +
        `📊 Statistika:\n` +
        `• Tashriflar: ${count}\n` +
        `• Sarflangan: ${fmtMoney(agg._sum.totalCost ?? 0)}\n` +
        `• To'plangan: ${fmtMoney(agg._sum.bonusEarned ?? 0)}\n` +
        `• Ishlatilgan: ${fmtMoney(agg._sum.bonusRedeemed ?? 0)}`,
        { parse_mode: 'Markdown', ...this.mainMenu() },
      );
    });

    bot.command('balance', async (ctx) => {
      const c = await this.requireCustomer(ctx, String(ctx.from.id));
      if (!c) return;
      await ctx.reply(`⭐ Bonus balans: *${fmtMoney(c.bonusBalance)}*`, { parse_mode: 'Markdown' });
    });

    // 🎱 Visit history
    bot.hears("🎱 O'yin tarixim", async (ctx) => { await this.handleHistory(ctx); });
    bot.command('history', async (ctx) => { await this.handleHistory(ctx); });

    // 📅 Reservation start
    const startReservation = async (ctx: any) => {
      const c = await this.requireCustomer(ctx, String(ctx.from.id));
      if (!c) return;
      this.setSession(ctx.from.id, { step: 'res_date', data: { customerId: c.id, name: c.name, phone: c.phone } });
      await ctx.reply(
        "📅 *Stol band qilish*\n\nQaysi sana uchun?\n\n_Misol: bugun, ertaga, 25.05.2025_",
        { parse_mode: 'Markdown', ...this.cancelKb() },
      );
    };
    bot.hears("📅 Stol band qilish", startReservation);
    bot.command('reserve', startReservation);

    // 🎁 Promotions
    bot.hears("🎁 Aksiyalar", async (ctx) => { await this.handlePromotions(ctx); });
    bot.command('promotions', async (ctx) => { await this.handlePromotions(ctx); });

    // 📍 Location
    bot.hears("📍 Manzil va aloqa", async (ctx) => {
      const s = await this.prisma.businessSettings.findUnique({ where: { id: 1 } });
      await ctx.reply(
        `📍 *Manzil va aloqa*\n\n🏠 ${s?.address ?? "Ko'rsatilmagan"}\n📞 ${s?.contactPhone ?? "Ko'rsatilmagan"}\n\n_Ish vaqti: 10:00 — 02:00_`,
        { parse_mode: 'Markdown', ...this.mainMenu() },
      );
    });

    // ☎️ Operator
    bot.hears("☎️ Operator bilan bog'lanish", async (ctx) => {
      const s = await this.prisma.businessSettings.findUnique({ where: { id: 1 } });
      await ctx.reply(
        `☎️ *Operator bilan bog'lanish*\n\n📞 ${s?.contactPhone ?? "Ko'rsatilmagan"}\n\n_Ish vaqti: 10:00 — 02:00_`,
        { parse_mode: 'Markdown', ...this.mainMenu() },
      );
    });

    // ❌ Cancel
    bot.hears('❌ Bekor qilish', async (ctx) => {
      this.clearSession(ctx.from.id);
      await ctx.reply('❌ Bekor qilindi.', this.mainMenu());
    });

    // Text handler for multi-step flows
    bot.on(message('text'), async (ctx) => {
      const uid = ctx.from.id;
      const session = this.getSession(uid);
      const text = ctx.message.text;

      if (session.step === 'awaiting_phone') {
        await ctx.reply("Iltimos, quyidagi tugma orqali telefon raqamingizni ulashing.", this.phoneKb());
        return;
      }

      if (session.step === 'res_date') {
        const date = parseInputDate(text);
        if (!date) {
          await ctx.reply("❌ Noto'g'ri sana.\n_Misol: bugun, ertaga, 25.05.2025_", { parse_mode: 'Markdown' });
          return;
        }
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
          await ctx.reply("❌ O'tgan sana kiritdingiz. Iltimos kelajakdagi sanani kiriting.");
          return;
        }
        this.setSession(uid, { step: 'res_time', data: { ...session.data, date } });
        await ctx.reply(
          `✅ Sana: *${fmtDate(date)}*\n\nSoat nechalarda? _(Misol: 14:00, 18:30)_`,
          { parse_mode: 'Markdown', ...this.cancelKb() },
        );
        return;
      }

      if (session.step === 'res_time') {
        const t = parseInputTime(text);
        if (!t) {
          await ctx.reply("❌ Noto'g'ri vaqt.\n_Misol: 14:00, 18:30_", { parse_mode: 'Markdown' });
          return;
        }
        const dt = new Date(session.data!.date as Date);
        dt.setHours(t.h, t.m, 0, 0);
        this.setSession(uid, { step: 'res_people', data: { ...session.data, date: dt } });
        await ctx.reply(
          `✅ Vaqt: *${fmtTime(dt)}*\n\nNecha kishi bo'lasiz? _(1-50)_`,
          { parse_mode: 'Markdown', ...this.cancelKb() },
        );
        return;
      }

      if (session.step === 'res_people') {
        const n = parseInt(text);
        if (isNaN(n) || n < 1 || n > 50) {
          await ctx.reply("❌ Iltimos, 1 dan 50 gacha raqam kiriting.");
          return;
        }
        this.setSession(uid, { step: 'res_note', data: { ...session.data, peopleCount: n } });
        await ctx.reply(
          `✅ Kishilar: *${n}*\n\nIzoh qoldirasizmi?\n_(Ixtiyoriy — "yo'q" deb yozing)_`,
          { parse_mode: 'Markdown', ...this.cancelKb() },
        );
        return;
      }

      if (session.step === 'res_note') {
        const note = ['yoq', "yo'q", 'nope', '-', 'no'].includes(text.trim().toLowerCase()) ? null : text.trim();
        const d = session.data!;
        try {
          await this.prisma.reservation.create({
            data: {
              name: String(d.name),
              phone: String(d.phone),
              date: d.date as Date,
              peopleCount: Number(d.peopleCount),
              note: note ?? null,
              customerId: Number(d.customerId),
            },
          });
          this.clearSession(uid);
          await ctx.reply(
            `✅ *Bron qabul qilindi!*\n\n` +
            `📅 ${fmtDate(d.date as Date)}\n` +
            `🕐 ${fmtTime(d.date as Date)}\n` +
            `👥 ${d.peopleCount} kishi\n` +
            (note ? `📝 ${note}\n` : '') +
            `\nBiz siz bilan bog'lanamiz. Rahmat! 🎱`,
            { parse_mode: 'Markdown', ...this.mainMenu() },
          );
        } catch (err: any) {
          this.logger.error('Reservation error', err.message);
          await ctx.reply("❌ Xatolik. Qayta urinib ko'ring.");
          this.clearSession(uid);
        }
        return;
      }

      // Fallback for unregistered users
      const customer = await this.findCustomerByTgId(String(uid));
      if (!customer) {
        await ctx.reply("Ro'yxatdan o'tish uchun /start yuboring.", Markup.removeKeyboard());
      }
    });
  }

  // ─── Shared handlers ─────────────────────────────────────────────────────────

  private async handleHistory(ctx: any) {
    const c = await this.requireCustomer(ctx, String(ctx.from.id));
    if (!c) return;
    const visits = await this.prisma.customerVisit.findMany({
      where: { customerId: c.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { session: { include: { table: true } } },
    });
    if (!visits.length) {
      await ctx.reply("📭 Hali o'yin tarixingiz yo'q.", this.mainMenu());
      return;
    }
    let msg = `🎱 *So'nggi ${visits.length} ta o'yin:*\n\n`;
    visits.forEach((v, i) => {
      const d = new Date(v.createdAt);
      msg += `${i + 1}. ${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
      if (v.session?.table) msg += ` — ${v.session.table.name}`;
      msg += `\n   💰 ${fmtMoney(v.totalCost)}`;
      if (v.bonusEarned > 0) msg += ` ⭐+${fmtMoney(v.bonusEarned)}`;
      if (v.bonusRedeemed > 0) msg += ` 🔻${fmtMoney(v.bonusRedeemed)}`;
      msg += '\n\n';
    });
    await ctx.reply(msg, { parse_mode: 'Markdown', ...this.mainMenu() });
  }

  private async handlePromotions(ctx: any) {
    const promos = await this.prisma.promotion.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
    if (!promos.length) {
      await ctx.reply("📭 Hozircha faol aksiyalar yo'q.", this.mainMenu());
      return;
    }
    let msg = "🎁 *Faol aksiyalar:*\n\n";
    promos.forEach((p, i) => { msg += `${i + 1}. *${p.title}*\n${p.message}\n\n`; });
    await ctx.reply(msg, { parse_mode: 'Markdown', ...this.mainMenu() });
  }
}
