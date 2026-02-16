<?php

$data = json_decode(file_get_contents("php://input"), true);

$data = $data["message"];
$message_text = $data["text"];

$GLOBALS["TOKEN_USER"] = "6376796480:AAGBtyFdNQnWI6fOSM4vKcwMxErw6GuxR_o";
$GLOBALS["CHAT_ID_USER"] = $data["chat"]["id"];
$GLOBALS["USER"] = $data["from"]["username"]
    ? $data["from"]["username"]
    : $data["from"]["id"];

// Подключаемся к базе данных
$conn_user = mysqli_connect(
    "149.154.65.75:3306",
    "craft",
    "beetlecraft",
    "beetledb"
);
if (!$conn_user) {
    die("Connection failed: " . mysqli_connect_error());
}

$GLOBALS["CONN_USER"] = $conn_user;
$message_text = str_replace(["🍻"], "", $message_text);

// обработка нажатия кнопок
switch ($message_text) {
    case "/start":
    case "...":
        $parameters = [
            "chat_id" => $data["chat"]["id"],
            "text" =>
                "Добро пожаловать в Секретного Пивного Санту - место, где хорошие люди дарят друг другу пиво🎅🎅\n\nВы готовы участвовать?",
            "reply_markup" => json_encode([
                "keyboard" => [["Участвую🍻"]],
                "resize_keyboard" => true,
            ]),
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendMessage", $parameters);
        break;

    case "Участвую":
        insertUser($conn_user, $GLOBALS["USER"]);
        $parameters = [
            "chat_id" => $data["chat"]["id"],
            "text" =>
                "Как вас представить вашему Тайному Пивному Санте (имя+фамилия или любой псевдоним, чтобы вас можно было идентифицировать)?",
            "reply_markup" => json_encode([
                "keyboard" => [["Я передумал(а)"]],
                "resize_keyboard" => true,
            ]),
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendMessage", $parameters);
        setAction($conn_user, "set_alias");
        break;

    case "Я купил Подарок":
        sendBuy($conn_user, $GLOBALS["USER"]);
        $parameters = [
            "chat_id" => $data["chat"]["id"],
                                                        "reply_markup" => json_encode([
                                                            "keyboard" => [["🍻"]],
                                                            "resize_keyboard" => true,
                                                        ]),
            "text" =>
                "+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++плюсики в карму❤"
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendMessage", $parameters);
        setAction($conn_user, "a buy present");
        break;

    case "Я передумал(а)":
        $parameters = [
            "chat_id" => $data["chat"]["id"],
            "text" => "☹\n\nКогда будете готовы, нажмите Участвую↓",
            "reply_markup" => json_encode([
                "keyboard" => [["Участвую🍻"]],
                "resize_keyboard" => true,
            ])
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendMessage", $parameters);
        setAction($conn_user, "cancel");
        break;

    case "Отправить мой контакт":
        setSendSanta($conn_user);
        $parameters = [
            "chat_id" => $data["chat"]["id"],
            "text" =>
                "Поздравляем с участием!\n\n29 декабря вам придет сообщение с именем вашего Тайного Пивного Санты. Купите любое пиво в BeetleCraft и оставьте его для Тайного Пивного Санты, назвав полученное имя.\n\nСпасибо за участие!",
            "reply_markup" => json_encode([
                "keyboard" => [["Вам спасибо!"]],
                "resize_keyboard" => true,
            ]),
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendMessage", $parameters);
        break;

    case "Хочу остаться инкогнито":
        $parameters = [
            "chat_id" => $data["chat"]["id"],
            "sticker" =>
                "CAACAgEAAxkBAAELCg1lidEBRXUm1L74iIDLlm9XqU-bXgACDQADoQUMDREdW5nit7BRMwQ",
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendSticker", $parameters);
        $parameters = [
            "chat_id" => $data["chat"]["id"],
            "text" =>
                "Поздравляем с участием!\n\n29 декабря вам придет сообщение с именем вашего Тайного Пивного Санты. Купите любое пиво в BeetleCraft и оставьте его для Тайного Пивного Санты, назвав полученное имя.\n\nСпасибо за участие!",
            "reply_markup" => json_encode([
                "keyboard" => [["Вам спасибо!"]],
                "resize_keyboard" => true,
            ]),
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendMessage", $parameters);
        break;

    case "Вам спасибо!":
        $parameters = [
            "chat_id" => $data["chat"]["id"],
            "sticker" =>
                "CAACAgEAAxkBAAELCgtlidCooL_WKrJLvHMX-N13BKz9oQACXAEAAi3fUAhlp6bkUC94YDME",
        ];
        sendTelegram($GLOBALS["TOKEN_USER"], "sendSticker", $parameters);
        break;

    default:
        $last_action = getAction($conn_user);
        processDefault(
            $message_text,
            $last_action,
            $conn_user,
            $data["chat"]["id"]
        );
}

/* Выбор действия при вводе произвольных значений */
function processDefault($message, $last_action, $conn_user, $chat_id)
{
    $result = "";
    $send_data = [];

    $parameters = [];
    switch ($last_action) {
        case "set_alias":
            setAlias($conn_user, $message);
            $parameters = [
                "chat_id" => $chat_id,
                "text" =>
                    "Отправить ссылку на ваш Telegram-аккаунт вашему Тайному Пивному Санте (чтобы списаться, встретиться и угостить друг друга пивом)?",
                "reply_markup" => json_encode([
                    "keyboard" => [
                        ["Хочу остаться инкогнито", "Отправить мой контакт"],
                    ],
                    "resize_keyboard" => true,
                ]),
            ];
            break;
    }
    sendTelegram($GLOBALS["TOKEN_USER"], "sendMessage", $parameters);
    setAction($conn_user, "");
}

/* Записывание последнего действия */
function setAction($db, $action)
{
    $db->query(
        "delete from action where user_name = '" . $GLOBALS["USER"] . "'"
    ) or die("Connection Error: " . $db->connect_error);
    $db->query(
        "insert into action (user_name, last_action) values ('" .
            $GLOBALS["USER"] .
            "','" .
            $action .
            "')"
    ) or die("Connection Error: " . $db->connect_error);
}

/* Записывание последнего действия */
function getAction($db)
{
    ($_result = $db->query(
        "select last_action from action where user_name='" .
            $GLOBALS["USER"] .
            "'"
    )) or die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    return $set[0]["last_action"];
}

// Получение массива из выборки из базы
function getSet($_result)
{
    $set = [];
    $total_records = mysqli_num_rows($_result);
    if ($total_records >= 1) {
        while ($link = mysqli_fetch_array($_result)) {
            $set[] = $link;
        }
    } else {
        return -1;
    }
    return $set;
}

/* Отправка сообщения в Telegram */
function sendTelegram($token, $method, $parameters, $headers = [])
{
    $url = "https://api.telegram.org/bot" . $token . "/" . $method;

    $options = [
        "http" => [
            "header" => "Content-type: application/x-www-form-urlencoded\r\n",
            "method" => "POST",
            "content" => http_build_query($parameters),
        ],
    ];

    $context = stream_context_create($options);
    file_get_contents($url, false, $context);
}

/* Отправка простого текстого сообщения в Telegram */
function sendMessage($token, $chat_id, $message)
{
    $parameters = [
        "chat_id" => $chat_id,
        "text" => $message,
        "parse_mode" => "HTML",
    ];

    sendTelegram($token, "sendMessage", $parameters);
}

/* Добавление пользователя в базу */
function insertUser($db, $user)
{
    $db->query("delete from secretsanta where user = '" . $user . "'") or
        die("Connection Error: " . $db->connect_error);
    $db->query("insert into secretsanta (user) values ('" . $user . "')") or
        die("Connection Error: " . $db->connect_error);
}


/* Добавление пользователя в базу */
function sendBuy($db, $user)
{
	$db->query(
            "update secretsanta set is_get_beer='1' where user = '" .
                $user .
                "'"
        ) or die("Connection Error: " . $db->connect_error);


	($_result = $db->query(
            "SELECT ss.id_santa, (SELECT chat_id from secretsanta WHERE id=ss.id_santa) AS santa_chat_id FROM secretsanta ss WHERE ss.`user` = '".$user."'"
        )) or die("Connection Error: " . $db->connect_error);

	$set = getSet($_result);
        if ($set == -1) {
            return -1;
        }

    $chat_id = $set[0]["santa_chat_id"];
    $parameters = array(
    	                'text' => "Подарок от Тайного Пивного Санты ждёт вас в BeetleCraft!",
    	                'chat_id' => $chat_id
    	            );

    sendTelegram($GLOBALS["TOKEN_USER"], 'sendMessage', $parameters);
}

function setSendSanta($db)
{
    $db->query(
        "update secretsanta set is_sent_santa='1' where user = '" .
            $GLOBALS["USER"] .
            "'"
    ) or die("Connection Error: " . $db->connect_error);
}

function setAlias($db, $alias)
{
    $db->query(
        "update secretsanta set alias='".$alias."' where user = '" .
            $GLOBALS["USER"] .
            "'"
    ) or die("Connection Error: " . $db->connect_error);
}

?>
