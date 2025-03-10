const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const usersFile = "users.json";

// Читаем данные пользователей
function getUsers() {
    if (!fs.existsSync(usersFile)) return {};
    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

// Сохраняем данные пользователей
function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Получаем баланс пользователя
app.post("/get-balance", (req, res) => {
    const { userId } = req.body;
    let users = getUsers();
    
    if (!users[userId]) {
        users[userId] = { balance: 1000 }; // Новый пользователь с 1000 коинов
        saveUsers(users);
    }

    res.json({ balance: users[userId].balance });
});

// Открываем кейс
app.post("/open-case", (req, res) => {
    const { userId } = req.body;
    let users = getUsers();

    if (!users[userId]) {
        users[userId] = { balance: 1000 };
    }

    if (users[userId].balance < 100) {
        return res.status(400).json({ error: "Недостаточно коинов!" });
    }

    // Списываем 100 коинов за открытие
    users[userId].balance -= 100;

    // Шансы выпадения предметов
    const items = [
        { name: "Нож 🔪", chance: 1 },
        { name: "Перчатки 🧤", chance: 5 },
        { name: "Редкий скин ✨", chance: 15 },
        { name: "Обычный скин 🎭", chance: 30 },
        { name: "Пусто ❌", chance: 49 }
    ];

    // Генерируем выпадение
    let rand = Math.random() * 100;
    let drop = "Пусто ❌";
    
    for (let item of items) {
        if (rand < item.chance) {
            drop = item.name;
            break;
        }
        rand -= item.chance;
    }

    saveUsers(users);
    res.json({ drop, balance: users[userId].balance });
});

app.listen(3000, () => console.log("Сервер запущен на порту 3000"));
