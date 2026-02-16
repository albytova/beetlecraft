<?php
// Конфигурация бота
define("BOT_TOKEN", "7966769250:AAGv2AUOP48JmKw69NKNIkZ9hqlxclUkM3Y");
define("API_URL", "https://api.telegram.org/bot" . BOT_TOKEN . "/");
define("WEBHOOK_URL", "https://beetlecraft.ru/norma/bot/bot_norma.php");
define("REQUEST_TIMEOUT", 5); // Таймаут запросов в секундах
// Настройки подключения к БД
$db_host = "109.95.210.219:3306";
$db_user = "u177778_craft";
$db_pass = "beetlecraft2018";
$db_name = "u177778_beetlecraft";
$db_connect_timeout = 3; // Таймаут подключения к БД
/* Функция для логгирования ошибок */
function logError($error)
{
    file_put_contents("bot_errors.log", date("[Y-m-d H:i:s] ") . $error . "\n", FILE_APPEND);
}

/* Подключение к базе данных с таймаутом */
function connectDB()
{
    global $db_host, $db_user, $db_pass, $db_name, $db_connect_timeout;

    try
    {
        $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
        $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, $db_connect_timeout);

        if ($conn->connect_error)
        {
            throw new Exception("DB connection failed: " . $conn->connect_error);
        }

        $conn->set_charset("utf8");
        return $conn;
    }
    catch(Exception $e)
    {
        logError($e->getMessage());
        return false;
    }
}

/* Получение списка партнеров из БД */
function getPartnersList()
{
    $conn = connectDB();
    $result = $conn->query("SELECT id, name FROM norma_partners");
    $partners = [];
    while ($row = $result->fetch_assoc())
    {
        $partners[] = $row;
    }
    $conn->close();
    return $partners;
}

/* Создание клавиатуры с партнерами */
function createPartnersKeyboard()
{
    $partners = getPartnersList();
    if (empty($partners))
    {
        return false;
    }

    $keyboard = ['keyboard' => []];
    $row = [];

    foreach ($partners as $index => $partner)
    {
        $row[] = ['text' => $partner['name']];

        // Перенос на новую строку после 2 кнопок
        if (count($row) == 3 || $index == count($partners) - 1)
        {
            $keyboard['keyboard'][] = $row;
            $row = [];
        }
    }

    // Добавляем кнопку "Назад"
    $keyboard['keyboard'][] = [['text' => 'Отмена']];

    return $keyboard;
}

/* Обработка команды /making_sale */
function handleMakingSale($chat_id)
{
    $keyboard = createPartnersKeyboard();

    if (!$keyboard)
    {
        apiRequestWebhook('sendMessage', ['chat_id' => $chat_id, 'text' => '⚠️ В базе данных нет партнеров']);
        return;
    }

    apiRequestWebhook('sendMessage', ['chat_id' => $chat_id, 'text' => 'Выберите партнера:', 'reply_markup' => json_encode($keyboard) ]);
}

/* Безопасная отправка запроса к API Telegram */
function safeApiRequest($method, $parameters)
{
    try
    {
        $options = ["http" => ["method" => "POST", "header" => "Content-Type: application/json\r\n", "content" => json_encode($parameters) , "timeout" => REQUEST_TIMEOUT, ], ];

        $context = stream_context_create($options);
        $response = file_get_contents(API_URL . $method, false, $context);

        return $response ? json_decode($response, true) : false;
    }
    catch(Exception $e)
    {
        logError("API request failed: " . $e->getMessage());
        return false;
    }
}

/* Обработка сообщения с таймаутом */
function processMessageWithTimeout($message)
{
    set_time_limit(10); // Максимальное время выполнения
    try
    {
        $result = processMessage($message);
        return $result;
    }
    catch(Exception $e)
    {
        logError("Message processing failed: " . $e->getMessage());
        return false;
    }
}

// Функция для отправки запросов к API Telegram
function apiRequestWebhook($method, $parameters)
{
    if (!is_string($method))
    {
        error_log("Method name must be a string\n");
        return false;
    }

    if (!$parameters)
    {
        $parameters = [];
    }
    elseif (!is_array($parameters))
    {
        error_log("Parameters must be an array\n");
        return false;
    }

    $parameters["method"] = $method;

    header("Content-Type: application/json");
    echo json_encode($parameters);
    return true;
}

// Сохраняем расход в базу данных
function saveExpend($amount, $purpose)
{
    $conn = connectDB();

    $stmt = $conn->prepare("INSERT INTO norma_expend (date, cost, name) VALUES (NOW(), ?, ?)");
    $stmt->bind_param("ds", $amount, $purpose);

    $result = $stmt->execute();

    $stmt->close();
    $conn->close();

    return $result;
}

// Сохраняем сорт в базу данных
function saveBeer($beername, $beercount)
{
    $conn = connectDB();

    $stmt = $conn->prepare("INSERT INTO norma_making (name, capacity) VALUES (?, ?)");
    $stmt->bind_param("sd", $beername, $beercount);

    $result = $stmt->execute();

    $stmt->close();
    $conn->close();

    return $result;
}

// Сохраняем отгрузку в базу данных
function saveSale($data, $count_keg)
{
    $data = explode("|", $data);
    $parthner = $data[0];
    $beer = $data[1];
    $keg = $data[2];

    $conn = connectDB();

    $stmt = $conn->prepare("SELECT id FROM norma_partners WHERE name = '$parthner'");
    $stmt->execute();
    $result = $stmt->get_result();
    $parhner_id = $result->fetch_assoc();
    $parhner_id = $parhner_id["id"];

    $stmt = $conn->prepare("SELECT id FROM norma_making WHERE name = '$beer'");
    $stmt->execute();
    $result = $stmt->get_result();
    $beer_id = $result->fetch_assoc();
    $beer_id = $beer_id["id"];

    $capacity = 0;
    if ($keg == "Кег 20л") $capacity = 20 * $count_keg;
    else if ($keg == "Кег 30л") $capacity = 30 * $count_keg;

    $stmt = $conn->prepare("INSERT INTO norma_making_sale (id_partners, id_making, capacity) VALUES ($parhner_id, $beer_id, $capacity)");

    $result = $stmt->execute();

    $stmt->close();
    $conn->close();

    return $result;
}

// Получаем расходы пользователя
function getUserExpenses()
{
    $conn = connectDB();

    $stmt = $conn->prepare("SELECT date, name, cost FROM norma_expend ORDER BY date DESC");
    $stmt->execute();

    $result = $stmt->get_result();
    $expenses = $result->fetch_all(MYSQLI_ASSOC);

    $stmt->close();
    $conn->close();

    return $expenses;
}

function sendStartMessage($chat_id)
{

    apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "/expend - Расходы\n/making - Производство\n/making_sale - Отгрузки", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Расходы"], ["text" => "Производство"], ["text" => "Отгрузки"], ], ], ], ]);
}

// Функция для обработки входящих сообщений
function processMessage($message)
{
    $chat_id = $message["chat"]["id"];
    $text = trim($message["text"]);
    $text = $message["callback_query"] ? trim($message["callback_query"]) : trim($message["text"]);
    $user_id = $message["from"]["id"];
    $user_name = $message["from"]["first_name"] ?? "Пользователь";

    if (empty($text) || $user_id === 0)
    {
        return false;
    }

    /* Подключаемся к базе данных для хранения состояний */
    $conn = connectDB();
    if (!$conn)
    {
        safeApiRequest("sendMessage", ["chat_id" => $chat_id, "text" => "⚠️ Временные технические проблемы. Попробуйте позже.", ]);
        return false;
    }

    /* Проверяем, есть ли ожидание ввода для этого пользователя */
    $stmt = $conn->prepare("SELECT step, temp_amount FROM norma_user_states WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $state = $result->fetch_assoc();

    /* Если есть ожидание ввода */
    if ($text != "Отмена" && $state)
    {
        switch ($state["step"])
        {
            case "waiting_amount" : if (is_numeric($text))
            {
                /* Обновляем состояние - ждём цель расхода */
                $stmt = $conn->prepare("UPDATE norma_user_states SET step = 'waiting_purpose', temp_amount = ? WHERE user_id = ?");
                $stmt->bind_param("si", $text, $user_id);
                $stmt->execute();

                apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Теперь укажите цель расхода:", ]);
            }
            else
            {
                apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Пожалуйста, введите корректную сумму (только цифры):", ]);
            }
            $conn->close();
            return;

        case "waiting_purpose" : $amount = $state["temp_amount"];
        $purpose = $text;

        if (saveExpend($amount, $purpose))
        {
            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "✅ Расход сохранён\n\n" . "/expend - Расходы\n/making - Производство\n/making_sale - Отгрузки", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Расходы"], ["text" => "Производство"], ["text" => "Отгрузки"], ], ], ], ]);
        }
        else
        {
            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "❌ Ошибка при сохранении расхода", ]);
        }

        /* Удаляем состояние пользователя */
        $stmt = $conn->prepare("DELETE FROM norma_user_states WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        $conn->close();
        return;

    case "waiting_beername":
        if (strlen($text) > 2)
        {
            $stmt = $conn->prepare("UPDATE norma_user_states SET step = 'waiting_beercount', temp_amount = ? WHERE user_id = ?");
            $stmt->bind_param("si", $text, $user_id);
            $stmt->execute();

            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Теперь объем в литрах:", ]);
        }
        else
        {
            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Введите корректное название (длинее двух символов):", ]);
        }
        $conn->close();
        return;

    case "waiting_delete_beer":
        $stmt = $conn->prepare("UPDATE norma_user_states SET step = 'waiting_delete_beer_name', temp_amount = ? WHERE user_id = ?");
        $stmt->bind_param("si", $text, $user_id);
        $stmt->execute();

        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Вы действитель хотите удалить сорт: $text?", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Да"], ["text" => "Нет"]]], ], ]);

        $conn->close();
        return;

    case "waiting_delete_beer_name":

        if ($text == "Нет") cancelAction($user_id, $chat_id);
        else
        {

            if ($text == "Да")
            {

                $beername = $state["temp_amount"];

                $stmt = $conn->prepare("UPDATE norma_making set is_delete = 1 where name=?");
                $stmt->bind_param("s", $beername);
                $stmt->execute();

                cancelAction($user_id, $chat_id);
            }
        }
        return;

    case "waiting_beercount":
        $beername = $state["temp_amount"];
        $beercount = $text;

        if (saveBeer($beername, $beercount))
        {
            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "✅ Сорт сохранён\n\n" . "/expend - Расходы\n/making - Производство\n/making_sale - Отгрузки", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Расходы"], ["text" => "Производство"], ["text" => "Отгрузки"], ], ], ], ]);
        }
        else
        {
            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "❌ Ошибка при сохранении сорта", ]);
        }

        /* Удаляем состояние пользователя */
        $stmt = $conn->prepare("DELETE FROM norma_user_states WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        $conn->close();
        return;

    case "waiting_sale_parthners":
        $parhner = $text;
        $keyboard = createBeerKeyboard();
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Выберите сорт", "reply_markup" => json_encode($keyboard) , ]);

        $stmt = $conn->prepare("UPDATE norma_user_states SET step = 'waiting_sale_parthners_keg', temp_amount='$parhner' WHERE user_id = $user_id");
        $stmt->execute();
        $conn->close();
        return;

    case "waiting_sale_parthners_keg":
        $parhner = $state["temp_amount"];
        $beer = $text;
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Выберите тару", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Кег 20л"], ["text" => "Кег 30л"], ["text" => "Отмена"]]], ]]);

        $stmt = $conn->prepare("UPDATE norma_user_states SET step = 'waiting_sale_parthners_keg_save', temp_amount='$parhner|$beer' WHERE user_id = $user_id");
        $stmt->execute();
        $conn->close();
        return;

    case "waiting_sale_parthners_keg_save":
        $savedata = $state["temp_amount"];
        $keg = $text;
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Введите количество", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Отмена"]]], ]]);

        $stmt = $conn->prepare("UPDATE norma_user_states SET step = 'waiting_sale_parthners_keg_save_finish', temp_amount='$savedata|$keg' WHERE user_id = $user_id");
        $stmt->execute();
        $conn->close();
        return;

    case "waiting_sale_parthners_keg_save_finish":
        $savedata = $state["temp_amount"];
        $count_keg = $text;

        if (saveSale($savedata, $count_keg))
        {
            $ost = getMakingCount();
            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "✅ Отгрузка сохранена\n\n$ost\n" . "/expend - Расходы\n/making - Производство\n/making_sale - Отгрузки", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Расходы"], ["text" => "Производство"], ["text" => "Отгрузки"], ], ], ], ]);
        }
        else
        {
            apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "❌ Ошибка при сохранении отгрузки", ]);
        }

        /* Удаляем состояние пользователя */
        $stmt = $conn->prepare("DELETE FROM norma_user_states WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        $conn->close();
        return;
    }
    return;
}

$command = $text;
switch ($command)
{
    case "/start":
        sendStartMessage($chat_id);
    break;

    case "/making":
    case "Производство":
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => getMakingCount() , "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Удалить"], ["text" => "➕ Добавить сорт"]], ], ], "parse_mode" => "Markdown", ]);
    break;

    case "/expend":
    case "Расходы":
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Выберите действие:", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Отмена"], ["text" => "📊 Аналитика"], ["text" => "➕ Добавить расход"], ], ], ], ]);
    break;

    case "/making_sale":
    case "Отгрузки":
        /* Создаем запись о состоянии пользователя */
        $stmt = $conn->prepare("INSERT INTO norma_user_states (user_id, step) VALUES (?, 'waiting_sale_parthners')
                                   ON DUPLICATE KEY UPDATE step = 'waiting_sale_parthners', temp_amount = NULL");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        handleMakingSale($chat_id);
    break;

    case "📊 Аналитика":
        handleAnalytics($chat_id);
    break;

    case "➕ Добавить расход":
        /* Создаем запись о состоянии пользователя */
        $stmt = $conn->prepare("INSERT INTO norma_user_states (user_id, step) VALUES (?, 'waiting_amount')
                                   ON DUPLICATE KEY UPDATE step = 'waiting_amount', temp_amount = NULL");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Введите сумму расхода:", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Отмена"]]], ], ]);
    break;

    case "➕ Добавить сорт":
        /* Создаем запись о состоянии пользователя */
        $stmt = $conn->prepare("INSERT INTO norma_user_states (user_id, step) VALUES (?, 'waiting_beername')
                                   ON DUPLICATE KEY UPDATE step = 'waiting_beername', temp_amount = NULL");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Введите название сорта:", "reply_markup" => ["resize_keyboard" => true, "keyboard" => [[["text" => "Отмена"]]], ], ]);
    break;

    case "Удалить":
        /* Создаем запись о состоянии пользователя */
        $stmt = $conn->prepare("INSERT INTO norma_user_states (user_id, step) VALUES (?, 'waiting_delete_beer')
                                   ON DUPLICATE KEY UPDATE step = 'waiting_delete_beer', temp_amount = NULL");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        $keyboard = createBeerKeyboard();

        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Выберите сорт", "reply_markup" => json_encode($keyboard) , ]);
    break;

    case "Отмена":
        cancelAction($user_id, $chat_id);
    break;

    default:
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "Я не понимаю эту команду. Попробуйте /help", ]);
}

$conn->close();
}

// Инициализация сессии
if (session_status() === PHP_SESSION_NONE)
{
    session_start();
}

// Основной код
try
{
    $content = file_get_contents("php://input");
    $update = json_decode($content, true);
    if (!$update)
    {
        /* Обработка вебхука */
        handleWebhookSetup();
        exit();
    }

    if (isset($update["message"]))
    {
        processMessageWithTimeout($update["message"]);
    }
}
catch(Exception $e)
{
    logError("Main execution failed: " . $e->getMessage());
    http_response_code(500);
}

/* Функция для обработки установки вебхука */
function handleWebhookSetup()
{
    if (isset($_GET["setwebhook"]))
    {
        $result = safeApiRequest("setWebhook", ["url" => WEBHOOK_URL]);
        echo $result ? "Webhook установлен" : "Ошибка установки webhook";
    }
    elseif (isset($_GET["removewebhook"]))
    {
        $result = safeApiRequest("deleteWebhook", []);
        echo $result ? "Webhook удалён" : "Ошибка удаления webhook";
    }
}

function cancelAction($user_id, $chat_id)
{

    $conn = connectDB();
    $stmt = $conn->prepare("DELETE FROM norma_user_states WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    sendStartMessage($chat_id);
    $conn->close();
}

// Получение остатков по производству
function getMakingCount()
{
    $conn = connectDB();
    if (!$conn)
    {
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "⚠️ Ошибка подключения к базе данных", ]);
        return;
    }

    $stmt = $conn->prepare("SELECT m.id, m.name, m.capacity AS total_produced, m.is_delete, COALESCE(SUM(s.capacity), 0) AS total_sold, (m.capacity - COALESCE(SUM(s.capacity), 0)) AS current_stock FROM norma_making m LEFT JOIN norma_making_sale s ON m.id = s.id_making WHERE m.is_delete = 0 GROUP BY m.id, m.name, m.capacity ORDER BY m.name");
    $stmt->execute();
    $result = $stmt->get_result();
    $beerData = $result->fetch_all(MYSQLI_ASSOC);

    if (empty($beerData))
    {
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "На складе ноль остатков", ]);
        return;
    }

    // Формируем сообщение
    $message = "Остатки на складе:\n";

    foreach ($beerData as $data)
    {
        $message .= sprintf("▪️ %s: %d литров {%dл}\n", $data["name"], $data["current_stock"], $data["total_produced"]);
    }

    return $message;
}

// Получение списка расходов
function handleAnalytics($chat_id)
{
    $conn = connectDB();
    if (!$conn)
    {
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "⚠️ Ошибка подключения к базе данных", ]);
        return;
    }

    // Получаем данные за последний год, сгруппированные по месяцам
    $stmt = $conn->prepare("
            SELECT
                YEAR(date) AS year,
                MONTH(date) AS month,
                SUM(cost) AS total_amount,
                COUNT(*) AS count
            FROM
                norma_expend
            WHERE
                date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
            GROUP BY
                YEAR(date), MONTH(date)
            ORDER BY
                year DESC, month DESC
        ");
    $stmt->execute();
    $result = $stmt->get_result();
    $monthlyData = $result->fetch_all(MYSQLI_ASSOC);

    if (empty($monthlyData))
    {
        apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => "📊 У вас нет расходов за последний год", ]);
        return;
    }

    // Формируем сообщение
    $message = "📈 Аналитика расходов за год:\n\n";
    $totalYear = 0;

    foreach ($monthlyData as $data)
    {
        $monthName = date("F", mktime(0, 0, 0, $data["month"], 1));
        $message .= sprintf("📅 %s %d:\n▪️ Всего расходов: %d\n▪️ Сумма: %d руб.\n\n", $monthName, $data["year"], $data["count"], intval($data["total_amount"]));
        $totalYear += $data["total_amount"];
    }

    $message .= "💵 Общая сумма за год: " . intval($totalYear) . " руб.";

    $stmt = $conn->prepare("
            SELECT name, cost, date
            FROM norma_expend
            ORDER BY date DESC
        ");
    $stmt->execute();
    $result = $stmt->get_result();
    $recentExpenses = $result->fetch_all(MYSQLI_ASSOC);

    if (!empty($recentExpenses))
    {
        $message .= "\n\nПоследние расходы:\n";
        foreach ($recentExpenses as $expense)
        {
            $date = date("d.m.Y", strtotime($expense["date"]));
            $message .= sprintf("▪️ %s - %d руб. (%s)\n", $expense["name"], intval($expense["cost"]) , $date);
        }
    }

    apiRequestWebhook("sendMessage", ["chat_id" => $chat_id, "text" => $message, "parse_mode" => "Markdown", ]);
}

/* Получение списка сортов */
function getBeerList()
{
    $conn = connectDB();
    $result = $conn->query("SELECT * FROM norma_making WHERE is_delete=0");
    $beers = [];
    while ($row = $result->fetch_assoc())
    {
        $beers[] = $row;
    }
    $conn->close();
    return $beers;
}

function createBeerKeyboard()
{
    $beers = getBeerList();
    $keyboard = ["keyboard" => [], "resize_keyboard" => true, ];
    $row = [];

    foreach ($beers as $index => $beer)
    {
        $row[] = ["text" => $beer["name"], ];

        // После каждых 4 кнопок или в конце массива добавляем строку
        if (count($row) == 4 || $index == count($beers) - 1)
        {
            $keyboard["keyboard"][] = $row;
            $row = []; // Сбрасываем текущую строку

        }
    }

    // Добавляем кнопку "Назад" в отдельную строку
    $keyboard["keyboard"][] = [["text" => "Отмена"]];

    return $keyboard;
}

// Логируем входящие данные
file_put_contents("bot_log.txt", date("Y-m-d H:i:s") . "\n" . $content . "\n\n", FILE_APPEND);
?>
