/**
 * Fills an empty database with realistic test data: 1000 contacts and notes.
 * Refuses to run if there are contacts already, so real data is never touched.
 *
 * Usage: pnpm db:seed
 */
import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getDatabaseUrl, loadEnvFile } from "../src/db/config";
import { contacts, notes, type NewNote } from "../src/db/schema";

const CONTACT_COUNT = 1000;
const BATCH_SIZE = 500;

// Deterministic random numbers: the same data on every run.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20261007);
const chance = (probability: number) => random() < probability;
const int = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)];

type Sex = "m" | "f";

const MALE_NAMES = [
  "Александр", "Алексей", "Андрей", "Антон", "Артём", "Борис", "Вадим", "Валентин",
  "Василий", "Виктор", "Виталий", "Владимир", "Владислав", "Вячеслав", "Георгий", "Глеб",
  "Григорий", "Даниил", "Денис", "Дмитрий", "Евгений", "Егор", "Иван", "Игорь", "Илья",
  "Кирилл", "Константин", "Лев", "Леонид", "Максим", "Марк", "Матвей", "Михаил", "Никита",
  "Николай", "Олег", "Павел", "Пётр", "Роман", "Руслан", "Семён", "Сергей", "Станислав",
  "Степан", "Тимофей", "Тимур", "Фёдор", "Филипп", "Юрий", "Ярослав",
];

const FEMALE_NAMES = [
  "Александра", "Алёна", "Алина", "Алиса", "Анастасия", "Анна", "Арина", "Валентина",
  "Валерия", "Варвара", "Вера", "Вероника", "Виктория", "Галина", "Дарья", "Диана",
  "Ева", "Евгения", "Екатерина", "Елена", "Елизавета", "Жанна", "Злата", "Инна", "Ирина",
  "Кира", "Ксения", "Лариса", "Лилия", "Любовь", "Людмила", "Маргарита", "Марина",
  "Мария", "Милана", "Надежда", "Наталья", "Нина", "Оксана", "Олеся", "Ольга", "Полина",
  "Светлана", "София", "Стефания", "Таисия", "Татьяна", "Ульяна", "Юлия", "Яна",
];

const SURNAMES = [
  "Смирнов", "Иванов", "Кузнецов", "Соколов", "Попов", "Лебедев", "Козлов", "Новиков",
  "Морозов", "Петров", "Волков", "Соловьёв", "Васильев", "Зайцев", "Павлов", "Семёнов",
  "Голубев", "Виноградов", "Богданов", "Воробьёв", "Фёдоров", "Михайлов", "Беляев",
  "Тарасов", "Белов", "Комаров", "Орлов", "Киселёв", "Макаров", "Андреев", "Ковалёв",
  "Ильин", "Гусев", "Титов", "Кузьмин", "Кудрявцев", "Баранов", "Куликов", "Алексеев",
  "Степанов", "Яковлев", "Сорокин", "Сергеев", "Романов", "Захаров", "Борисов",
  "Королёв", "Герасимов", "Пономарёв", "Григорьев", "Лазарев", "Медведев", "Ершов",
  "Никитин", "Соболев", "Рябов", "Поляков", "Цветков", "Данилов", "Жуков", "Фролов",
  "Журавлёв", "Николаев", "Крылов", "Максимов", "Сидоров", "Осипов", "Белоусов",
  "Федотов", "Дорофеев", "Егоров", "Матвеев", "Бобров", "Дмитриев", "Калинин",
  "Анисимов", "Петухов", "Антонов", "Тимофеев", "Никифоров", "Веселов", "Филиппов",
  "Марков", "Большаков", "Суханов", "Миронов", "Ширяев", "Александров", "Коновалов",
  "Шестаков", "Казаков", "Ефимов", "Денисов", "Громов", "Фомин", "Давыдов", "Мельников",
  "Щербаков", "Блинов", "Колесников", "Карпов", "Афанасьев", "Власов", "Маслов",
  "Исаков", "Тихонов", "Аксёнов", "Гаврилов", "Родионов", "Котов", "Горбунов",
  "Кудряшов", "Быков", "Зуев", "Третьяков", "Савельев", "Панов", "Рыбаков", "Суворов",
  "Абрамов", "Воронов", "Мухин", "Архипов", "Трофимов", "Мартынов", "Емельянов",
  "Горшков", "Чернов", "Овчинников", "Селезнёв", "Панфилов", "Копылов", "Михеев",
  "Галкин", "Назаров", "Лобанов", "Лукин", "Беляков", "Потапов", "Некрасов", "Хохлов",
  "Жданов", "Наумов", "Шилов", "Воронцов", "Ермаков", "Дроздов", "Игнатьев", "Савин",
  "Логинов", "Сафонов", "Капустин", "Кириллов", "Моисеев", "Елисеев", "Кошелев",
  "Костин", "Горбачёв", "Орехов", "Ефремов", "Исаев", "Евдокимов", "Калашников",
  "Кабанов", "Носков", "Юдин", "Кулагин", "Лапин", "Прохоров", "Нестеров", "Харитонов",
  "Агафонов", "Муравьёв", "Ларионов", "Федосеев", "Зимин", "Пахомов", "Шубин",
  "Игнатов", "Филатов", "Крюков", "Рогов", "Кулаков", "Терентьев", "Молчанов",
  "Владимиров", "Артемьев", "Гурьев", "Зиновьев", "Гришин", "Кононов", "Дементьев",
  "Ситников", "Симонов", "Мишин", "Фадеев", "Комиссаров", "Мамонтов", "Носов",
  "Гуляев", "Шаров", "Устинов", "Вишняков", "Евсеев", "Лаврентьев", "Брагин",
  "Константинов", "Корнилов", "Авдеев", "Зыков", "Бирюков", "Шарапов", "Никонов",
  "Щукин", "Дьячков", "Одинцов", "Сазонов", "Якушев", "Красильников", "Гордеев",
  "Самойлов", "Князев", "Беспалов", "Уваров", "Шашков", "Бобылёв", "Доронин",
  "Белозёров", "Рожков", "Самсонов", "Мясников", "Лихачёв", "Буров", "Сысоев",
  "Фомичёв", "Русаков", "Стрелков", "Гущин", "Тетерин", "Колобов", "Субботин",
  "Фокин", "Блохин", "Селиверстов", "Пестов", "Кондратьев", "Силин", "Меркушев",
  "Лыткин", "Туров", "Островский", "Вишневский", "Покровский", "Чайковский",
  "Добрынин", "Толстой", "Шевченко", "Ткаченко", "Бондаренко", "Кравченко", "Ким",
  "Пак", "Цой", "Черных", "Седых", "Долгих", "Мамедов", "Алиев", "Гасанов", "Каримов",
  "Юсупов", "Сафин", "Хабибуллин", "Галиев", "Гарипов", "Аветисян", "Саркисян",
  "Петросян", "Гогия", "Беридзе", "Шульц", "Миллер", "Гофман",
];

// Surnames that do not change for women.
const INVARIANT_SURNAMES = new Set(["Цой", "Ким", "Пак", "Шульц", "Миллер", "Гофман"]);
const INVARIANT_ENDING = /(енко|их|ых|ян|ия|дзе)$/;

function surnameFor(base: string, sex: Sex): string {
  if (sex === "m" || INVARIANT_SURNAMES.has(base) || INVARIANT_ENDING.test(base)) {
    return base;
  }
  if (/(ский|цкий|ой)$/.test(base)) return `${base.slice(0, -2)}ая`;
  if (/(ов|ев|ёв|ин|ын)$/.test(base)) return `${base}а`;
  return base;
}

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

function transliterate(value: string): string {
  return [...value.toLowerCase()].map((char) => TRANSLIT[char] ?? char).join("");
}

const EMAIL_DOMAINS = [
  "gmail.com", "gmail.com", "gmail.com", "yandex.ru", "yandex.ru", "mail.ru",
  "mail.ru", "bk.ru", "inbox.ru", "outlook.com", "icloud.com", "ya.ru",
];

function emailFor(firstName: string, lastName: string): string {
  const first = transliterate(firstName);
  const last = transliterate(lastName);
  const local = pick([
    `${first}.${last}`,
    `${first}.${last}`,
    `${first[0]}.${last}`,
    `${last}.${first}`,
    `${first}${last[0]}${int(1, 99)}`,
    `${last}${int(70, 99)}`,
    `${first}_${last}`,
  ]);
  return `${local}@${pick(EMAIL_DOMAINS)}`;
}

function phone(): string {
  const code = pick(["900", "903", "905", "909", "910", "912", "915", "916", "917", "919",
    "920", "925", "926", "929", "950", "952", "960", "962", "963", "965", "977", "985",
    "987", "999"]);
  const digits = (n: number) => Array.from({ length: n }, () => int(0, 9)).join("");
  return `+7 ${code} ${digits(3)}-${digits(2)}-${digits(2)}`;
}

const UNIVERSITIES = ["МГУ", "МФТИ", "ВШЭ", "СПбГУ", "МГТУ им. Баумана", "МИФИ", "РЭУ им. Плеханова", "УрФУ", "НГУ", "КФУ"];
const COMPANIES = ["Яндексе", "Сбере", "Т-Банке", "Ozon", "Авито", "VK", "Лаборатории Касперского", "МТС", "Wildberries", "Альфа-Банке", "2ГИС", "JetBrains", "Райффайзене", "X5", "Билайне"];
const CONFERENCES = ["HighLoad++", "TeamLead Conf", "ProductCamp", "Codefest", "DUMP", "Heisenbug", "HolyJS", "Analyst Days"];
const CITIES = ["Казань", "Сочи", "Калининград", "Стамбул", "Тбилиси", "Ереван", "Алматы", "Нижний Новгород", "Мурманск", "Иркутск"];
const FRIENDS_GENITIVE = ["Сергея", "Маши", "Пети", "Ани", "Димы", "Лены", "Андрея", "Кати", "Олега", "Насти", "Миши", "Юли"];
const HOBBIES = ["бег", "йогу", "теннис", "настольные игры", "футбол по субботам", "скалолазание", "хор", "курсы итальянского", "волейбол"];

function howWeMet(sex: Sex): string | null {
  if (chance(0.08)) return null;
  const female = sex === "f";
  const templates: (() => string)[] = [
    () => `Учились вместе в ${pick(UNIVERSITIES)}`,
    () => `${female ? "Однокурсница" : "Однокурсник"}, ${pick(UNIVERSITIES)}`,
    () => `${female ? "Одноклассница" : "Одноклассник"}, школа № ${int(1, 1500)}`,
    () => `Работали вместе в ${pick(COMPANIES)}`,
    () => `Работали вместе в ${pick(COMPANIES)}`,
    () => `${female ? "Бывшая руководительница" : "Бывший руководитель"} в ${pick(COMPANIES)}`,
    () => `Познакомились на конференции ${pick(CONFERENCES)} ${int(2018, 2026)}`,
    () => `Познакомились в поездке: ${pick(CITIES)}, ${int(2016, 2026)}`,
    () => `${female ? "Подруга" : "Друг"} ${pick(FRIENDS_GENITIVE)}`,
    () => `${female ? "Подруга" : "Друг"} ${pick(FRIENDS_GENITIVE)}`,
    () => `Познакомились на свадьбе у ${pick(FRIENDS_GENITIVE)}`,
    () => `${female ? "Соседка" : "Сосед"} по ${pick(["даче", "подъезду", "дому", "коворкингу"])}`,
    () => `Вместе ходим на ${pick(HOBBIES)}`,
    () => `${female ? "Мама" : "Папа"} одноклассника сына`,
    () => `Клиент по фрилансу, ${int(2019, 2026)}`,
    () => `Встретились на митапе по ${pick(["Python", "React", "продакт-менеджменту", "дизайну", "аналитике"])}`,
    () => pick([
      "Наш семейный врач",
      `Риелтор, ${female ? "помогала" : "помогал"} с квартирой`,
      "Тренер в фитнес-клубе",
      "Репетитор по английскому",
      `Дизайнер интерьера, ${female ? "делала" : "делал"} проект кухни`,
      "Ментор на курсах по продукту",
      "Коллега по прошлой работе",
      `${female ? "Бывшая соседка" : "Бывший сосед"} по общежитию`,
      "Познакомились в походе на Эльбрус",
      "Познакомились в очереди в визовый центр",
    ]),
  ];
  return pick(templates)();
}

const TOPICS = ["новый проект", "поездку на Алтай", "переезд в Петербург", "смену работы", "идею своего бизнеса", "ремонт квартиры", "школу для детей", "планы на лето", "обучение на курсах по данным", "покупку машины", "книгу, которую пишет", "запуск мобильного приложения"];
const AGREEMENTS = [
  "созвониться через месяц",
  "встретиться после праздников",
  "обменяться контактами хорошего юриста",
  "познакомить с коллегой из маркетинга",
  "вернуться к вопросу в начале квартала",
  "сходить вместе на концерт",
  "обменяться книгами",
  "подумать о совместном проекте",
  "созвониться, когда будет понятно с бюджетом",
  "собраться всей компанией на даче",
];
const MONTHS_PREPOSITIONAL = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"];
const MONTHS_GENITIVE = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function noteBody(sex: Sex): string {
  const female = sex === "f";
  const templates: (() => string)[] = [
    () => `Созвонились, обсудили ${pick(TOPICS)}. Договорились ${pick(AGREEMENTS)}.`,
    () => `Встретились на кофе. ${female ? "Рассказала" : "Рассказал"} про ${pick(TOPICS)}. Договорились ${pick(AGREEMENTS)}.`,
    () => `${female ? "Сменила" : "Сменил"} работу — теперь в ${pick(COMPANIES)}. ${female ? "Довольна" : "Доволен"} командой, но много переработок.`,
    () => `Переезжает в ${pick(CITIES)} в ${pick(MONTHS_PREPOSITIONAL)}. Обещали не теряться.`,
    () => `День рождения — ${int(1, 28)} ${pick(MONTHS_GENITIVE)}. Любит ${pick(["хороший чай", "настольные игры", "джаз", "горные лыжи", "книги по истории", "кофе из турки"])}.`,
    () => `Увлекается: ${pick(HOBBIES)}. Звал${female ? "а" : ""} присоединиться.`,
    () => `Переписывались в Telegram. ${female ? "Просила" : "Просил"} совета по ${pick(["найму", "ипотеке", "выбору ноутбука", "поездке в Грузию", "собеседованию"])}.`,
    () => `Виделись на дне рождения у ${pick(FRIENDS_GENITIVE)}. Договорились ${pick(AGREEMENTS)}.`,
    () => `Поздравили с ${pick(["новой работой", "рождением дочки", "рождением сына", "свадьбой", "переездом", "защитой диссертации"])}!`,
    () => `Обсудили ${pick(TOPICS)}.\nВажно: ${pick(["не любит звонки — лучше писать", "по вторникам занят до вечера", "в отпуске до конца месяца", "просит напомнить через пару недель"])}.`,
  ];
  return pick(templates)();
}

const DAY = 24 * 60 * 60 * 1000;

function generatePeople(now: number) {
  return Array.from({ length: CONTACT_COUNT }, () => {
    const sex: Sex = chance(0.5) ? "m" : "f";
    const firstName = pick(sex === "m" ? MALE_NAMES : FEMALE_NAMES);
    const lastName = surnameFor(pick(SURNAMES), sex);
    const createdAt = new Date(now - int(30, 3 * 365) * DAY - int(0, DAY));
    return {
      sex,
      contact: {
        name: `${firstName} ${lastName}`,
        howWeMet: howWeMet(sex),
        phone: chance(0.85) ? phone() : null,
        email: chance(0.7) ? emailFor(firstName, lastName) : null,
        createdAt,
        updatedAt: createdAt,
      },
    };
  });
}

async function main() {
  loadEnvFile();
  const client = postgres(getDatabaseUrl(), { max: 1, onnotice: () => {} });
  const db = drizzle(client);

  try {
    const [{ value: existing }] = await db.select({ value: count() }).from(contacts);
    if (existing > 0) {
      console.log(
        `Database already has ${existing} contacts — seeding skipped to keep existing data safe.`,
      );
      return;
    }

    const now = Date.now();
    const people = generatePeople(now);

    await db.transaction(async (tx) => {
      const ids: number[] = [];
      for (let i = 0; i < people.length; i += BATCH_SIZE) {
        const inserted = await tx
          .insert(contacts)
          .values(people.slice(i, i + BATCH_SIZE).map((person) => person.contact))
          .returning({ id: contacts.id });
        ids.push(...inserted.map((row) => row.id));
      }

      const noteRows: NewNote[] = [];
      people.forEach(({ sex, contact }, index) => {
        const noteCount = pick([0, 0, 1, 1, 1, 2, 2, 3, 4, 5]);
        const from = contact.createdAt.getTime();
        for (let n = 0; n < noteCount; n++) {
          noteRows.push({
            contactId: ids[index],
            body: noteBody(sex),
            createdAt: new Date(from + random() * (now - from)),
          });
        }
      });

      for (let i = 0; i < noteRows.length; i += BATCH_SIZE) {
        await tx.insert(notes).values(noteRows.slice(i, i + BATCH_SIZE));
      }

      console.log(`Seeded ${ids.length} contacts and ${noteRows.length} notes.`);
    });
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error("Seeding failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
