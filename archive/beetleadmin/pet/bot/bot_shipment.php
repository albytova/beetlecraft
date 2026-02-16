<?php

$data = json_decode(file_get_contents("php://input"), true);

// Сохраняем входные данные в файл
// saveDataFromBotToFile ($data, 'userdata.txt');

$data = $data["callback_query"] ? $data["callback_query"] : $data["message"];
define("TOKEN", "6730179998:AAHX2-BuhdAv8rv6qH28f3eqVI23C-COrj4");
define("USER", $data["from"]["first_name"] . " " . $data["from"]["last_name"]);
$message = mb_strtolower(
    $data["text"] ? $data["text"] : $data["data"],
    "utf-8"
);

$method = "sendMessage";
$isSendMessage = true;
$db = new mysqli("149.154.65.75:3306", "craft", "beetlecraft", "petdb");
$last_action = getAction($db);
$actions = explode("|", $last_action);

switch ($message) {
    case "/sale":
        $send_data = [
            "text" => getActualOrders($db),
        ];
        break;

    case "/task":
        $send_data = getTaskBaseKeyboards($db);
        break;

    case "/ship":
        setAction($db, "ships");
        $send_data = [
            "text" => "Выберите заказ",
            "reply_markup" => [
                "resize_keyboard" => true,
                "keyboard" => getShipBaseKeyboards($db),
            ],
        ];
        break;

    case "добавить":
        setAction($db, "new_task");
        $send_data = [
            "text" => "Введите текст задачи",
            "reply_markup" => [
                "resize_keyboard" => true,
                "keyboard" => [[["text" => "Отмена"], ["text" => "Сохранить"]]],
            ],
        ];
        break;

    case "отмена":
        if ($actions[0] == "new_task") {
            $send_data = getTaskBaseKeyboards($db);
            setAction($db, "");
        }
        break;

    case "сохранить":
        if ($actions[0] == "new_task") {
            $send_data = [
                "text" => "Это срочная задача?",
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Да"], ["text" => "Нет"]]],
                ],
            ];
        }
        break;

    case "да":
        if ($actions[0] == "new_task") {
            $rez = saveTask($db, $actions[1], "1");
            if ($rez == 1) {
                $send_data = getTaskBaseKeyboards($db);
                setAction($db, "");
            }
        } elseif ($actions[0] == "new_task_info") {
            $rez = setExecTask($db, $actions[1]);
            if ($rez == 1) {
                setAction($db, "new_task_info");
                $send_data = getTaskBaseKeyboards($db);
            }
        } elseif ($actions[0] == "order_exec") {
                     $rez = setExecOrder($db, $actions[1]);
                     if ($rez == 1) {
                         setAction($db, "");
                         $send_data = [
                                     "text" => "Выберите заказ",
                                     "reply_markup" => [
                                         "resize_keyboard" => true,
                                         "keyboard" => getShipBaseKeyboards($db),
                                     ],
                                 ];
                     }
                 }
        break;

    case "нет":
        if ($actions[0] == "new_task") {
            $rez = saveTask($db, $actions[1], "0");
            if ($rez == 1) {
                $send_data = getTaskBaseKeyboards($db);
                setAction($db, "");
            }
        }
        elseif ($actions[0] == "new_task_info") {
            setAction($db, "new_task_info");
            $send_data = getTaskBaseKeyboards($db);
        }
        break;

    case "задачи":
        setAction($db, "new_task_info");
        $send_data = [
            "text" => "Выберите задачу",
            "reply_markup" => [
                "resize_keyboard" => true,
                "keyboard" => getTasksBtn($db),
            ],
        ];
        break;

    case "расчет":
            $texts = explode("|", $message);
            $send_data = [
                "text" => getOrderInfo($db, $actions[1]),
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Подробнее"], ["text" => "Расчет"], ["text" => "Выполнено"]]],
                ],
            ];
            break;

    case "подробнее":
            $texts = explode("|", $message);
            $send_data = [
                "text" => getContractorInfo($db, $actions[2]),
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Подробнее"], ["text" => "Расчет"], ["text" => "Выполнено"]]],
                ],
            ];
            break;

    case "выполнено":
            $texts = explode("|", $message);
            setAction($db, "order_exec|".$actions[1]);
            $send_data = [
                "text" => "Отметить заказ выполненным?",
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Да"]]],
                ],
            ];
            break;

    default:
        $isSendMessage = false;
        processDefault($message, $last_action, $db, $data["chat"]["id"]);
}

$send_data["chat_id"] = $data["chat"]["id"];
$send_data["parse_mode"] = "HTML";

if ($isSendMessage === true) {
    $res = sendTelegram($method, $send_data);
}

// Формирование базового экрана с отгрузками
function getShipBaseKeyboards($db)
{
    ($_result = $db->query(
        "SELECT o.id AS id, c.name AS contractor FROM petbd.`order` o JOIN petbd.contractor c ON o.id_contractor = c.id WHERE o.is_exec = '0' AND o.is_finish_create = '1'"
    )) or die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $len = count($set);
    $result = [];
    $res = [];
    for ($i = 0; $i < $len; $i++) {
        array_push($result, [
            "text" => $set[$i]["contractor"] . "|" . $set[$i]["id"],
        ]);
    }
    array_push($res, $result);

    return $res;
}

// Формирование базового экрана с задачами
function getTaskBaseKeyboards($db)
{
    $send_data = [
        "text" => getTasks($db),
        "reply_markup" => [
            "resize_keyboard" => true,
            "keyboard" => [[["text" => "Добавить"], ["text" => "Задачи"]]],
        ],
    ];

    return $send_data;
}

// Сохранение задачи
function saveTask($db, $text, $is_quickly)
{
    $db->query(
        "insert into task (task, date_task, is_exec, is_quickly) values ('" .
            $text .
            "',CURRENT_DATE(),'0','" .
            $is_quickly .
            "')"
    ) or die("Connection Error: " . $db->connect_error);
    return 1;
}

// Отметить задачу выполненной
function setExecTask($db, $id)
{
    $db->query("update task set is_exec='1' where id=" . $id) or
        die("Connection Error: " . $db->connect_error);
    return 1;
}

// Отметить отгрузку выполненной
function setExecOrder($db, $id)
{
    $db->query("UPDATE petbd.`order` o set o.is_exec='1' where id=" . $id) or
        die("Connection Error: " . $db->connect_error);
    return 1;
}

/* Чтение списка задач и возвращение его в виде кнопок */
function getTasksBtn($db)
{
    ($_result = $db->query("SELECT id, task FROM task WHERE is_exec = '0'")) or
        die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $len = count($set);
    $result = [];
    $res = [];
    for ($i = 0; $i < $len; $i++) {
        array_push($result, ["text" => $set[$i]["id"]]);
    }
    array_push($res, $result);

    return $res;
}

/* Отправка сообщения в Telegram */
function sendTelegram($method, $data, $headers = [])
{
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_POST => 1,
        CURLOPT_HEADER => 0,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_URL => "https://api.telegram.org/bot" . TOKEN . "/" . $method,
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => array_merge(["Content-Type: application/json"]),
    ]);
    $result = curl_exec($curl);
    curl_close($curl);
    return json_decode($result, 1) ? json_decode($result, 1) : $result;
}

/* Записывание последнего действия */
function setAction($db, $action)
{
    $db->query("delete from action where user_name = '" . USER . "'") or
        die("Connection Error: " . $db->connect_error);
    $db->query(
        "insert into action (user_name, last_action) values ('" .
            USER .
            "','" .
            $action .
            "')"
    ) or die("Connection Error: " . $db->connect_error);
}

/* Записывание последнего действия */
function getAction($db)
{
    ($_result = $db->query(
        "select last_action from action where user_name='" . USER . "'"
    )) or die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    return $set[0]["last_action"];
}

/* Выбор действия при вводе произвольных значений */
function processDefault($message, $last_action, $db, $chat_id)
{
    $result = "";
    $actions = explode("|", $last_action);
    $action = $actions[0];

    $send_data = [];

    switch ($action) {
        case "new_task":
            setAction($db, "new_task|" . $message);
            $send_data = [
                "text" => "Текст добавлен",
            ];
            break;

        case "new_task_info":
            setAction($db, "new_task_info|" . $message);
            $send_data = [
                "text" => "Отметить задачу выполненной?",
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Нет"], ["text" => "Да"]]],
                ],
            ];
            break;

        case "ships":
            $texts = explode("|", $message);
            setAction($db, "ships|" . $texts[1]);
            $send_data = [
                "text" => getOrderContent($db, $texts[1]),
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Подробнее"], ["text" => "Расчет"], ["text" => "Выполнено"]]],
                ],
            ];
            break;
    }

    $send_data["chat_id"] = $chat_id;
    $send_data["parse_mode"] = "HTML";
    sendTelegram("sendMessage", $send_data);
}

// Формирование списка задач
function getTasks($db)
{
    ($_result = $db->query(
        "SELECT * FROM task WHERE task.is_exec = '0' ORDER BY is_quickly ASC"
    )) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "";

    $len = count($set);
    for ($i = 0; $i < $len; $i++) {
        $info = $info . "#" . $set[$i]["id"];
        $info = $info . " [" . $set[$i]["date_task"] . "]  ";
        if ($set[$i]["is_quickly"] == "1") {
            $info = $info . "<b>[СРОЧНО]</b>  ";
        }
        $info = $info . $set[$i]["task"] . "\n";
    }

    return $info;
}

// Подробная информация о заказе
function getOrderInfo($db, $order_id)
{
    $_result = $db->query(
        "SELECT o.id, o.date_ship, o.is_exec, o.is_pay, o.credit, oa.id_order, oa.id_product, oa.`count`, cc.cost, p.dist, c.name, o.date_ship_need, o.comment FROM order_amount oa INNER JOIN contractor_cost cc ON oa.id_contractor_cost = cc.id right JOIN `order` o ON oa.id_order = o.id JOIN contractor c ON cc.id_contractor = c.id JOIN product p ON cc.id_product = p.id WHERE o.id = '".$order_id."'"
    ) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "";

    $len = count($set);
    $all_sum = 0;
    for ($i = 0; $i < $len; $i++) {
        $sum = $set[$i][7] * $set[$i][8];
        $all_sum += $sum;
        $info =
            $info .
            "\n" .
            $set[$i][9] .
            ": " .
            $set[$i][7] .
            "шт * " .
            $set[$i][8] .
            "руб = " .
            $sum .
            "руб";
    }
    $info = $info . "\nСумма = " . $all_sum . "руб";

    return $info;
}

// Подробная информация о заказе
function getOrderContent($db, $order_id)
{
    $_result = $db->query(
        "SELECT o.id AS id, o.date_ship as date_ship, oa.`count` AS oa_count, p.dist AS p_dist, c.name as c_name, o.date_ship_need AS date_ship_need, o.comment AS comment, c.id as c_id FROM order_amount oa INNER JOIN contractor_cost cc ON oa.id_contractor_cost = cc.id right JOIN `order` o ON oa.id_order = o.id JOIN contractor c ON cc.id_contractor = c.id JOIN product p ON cc.id_product = p.id WHERE o.id = '".$order_id."'"
    ) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "";
    $info = $info . "<b>".$set[0]["c_name"]." [".$set[0]["date_ship"]."]</b>";
    if ($set[0]["date_ship_need"]) {
        $info = $info . "\nНеобходимая дата доставки: " . $set[0]["date_ship_need"];
    }
    if ($set[0]["comment"]) {
        $info = $info . "\n" . $set[0]["comment"];
    }
    $info = $info . "\n";

    $len = count($set);
    for ($i = 0; $i < $len; $i++) {
        $info =
            $info .
            "\n" .
            $set[$i]["p_dist"] .
            ": " .
            $set[$i]["oa_count"] .
            "шт";
    }

    $last_action = getAction($db);
    setAction($db, $last_action."|".$set[0]["c_id"]);

    return $info;
}

function getActualOrders($db)
{
    ($_result = $db->query(
        "SELECT o.id, o.date_ship, o.is_exec, o.is_pay, o.credit, oa.id_order, oa.id_product, oa.`count`, cc.cost, p.dist, c.name, o.date_ship_need, o.comment FROM order_amount oa INNER JOIN contractor_cost cc ON oa.id_contractor_cost = cc.id right JOIN `order` o ON oa.id_order = o.id JOIN contractor c ON cc.id_contractor = c.id JOIN product p ON cc.id_product = p.id WHERE o.is_finish_create = 1 and o.is_exec = '0'"
    )) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "";

    $len = count($set);
    $order_id = -1;
    for ($i = 0; $i < $len; $i++) {
        if ($order_id != $set[$i][0]) {
            $order_id = $set[$i][0];

            $info =
                $info .
                "\n\n<b>" .
                $set[$i][10] .
                " [ " .
                $set[$i][1] .
                " ]</b>";
            if ($set[$i][11]) {
                $info = $info . "\nНеобходимая дата доставки: " . $set[$i][11];
            }
            if ($set[$i][12]) {
                $info = $info . "\nПримечание: " . $set[$i][12];
            }

            $info =
                $info . "\n<i>" . $set[$i][9] . ": " . $set[$i][7] . "шт</i>";
        } else {
            $info =
                $info . "\n<i>" . $set[$i][9] . ": " . $set[$i][7] . "шт</i>";
        }
    }

    return $info;
}

// Получение информации о контрагенте
function getContractorInfo($db, $contractor)
{
    $_result = $db->query(
        "SELECT contractor.id AS contractor_id, contractor.name AS contractor_name, contractor.entity AS enity, contractor.contact_name AS contact_name, contractor.contact_phone AS contact_phone, place.name AS place, contractor.address AS address, contractor.type_pay AS type_pay, contractor.is_deferment AS is_deferment, contractor.is_relevant AS is_relevant, contractor.last_order AS last_order, contractor.comment AS comment, contractor.operating_mode AS operating_mode FROM contractor RIGHT JOIN place ON  contractor.id_place = place.id WHERE contractor.id = " .
            $contractor
    ) or die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "";
    $is_defer = "Есть";
    if ($set[0][8] == "0") {
        $is_defer = "Нет";
    }

    $is_relevant = "Да";
    if ($set[0][9] == "0") {
        $is_relevant = "Нет";
    }

    $info = $info . $set[0][1];
    $info = $info . "\nЮридическое лицо: " . $set[0][2];
    $info = $info . "\n\nКонтакт: " . $set[0][3];
    $info = $info . "\nТелефон: " . $set[0][4];
    $info = $info . "\n\nРайон: " . $set[0][5];
    $info = $info . "\nАдрес: " . $set[0][6];
    $info = $info . "\nРежим работы: " . $set[0][12];
    $info = $info . "\n\nПоследний заказ: " . $set[0][10];
    $info = $info . "\nТип оплаты: " . $set[0][7];
    $info = $info . "\nОтсрочка платежа: " . $is_defer;
    $info = $info . "\nАктуальный клиент: " . $is_relevant;
    $info = $info . "\nПримечание: " . $set[0][11];

    return $info;
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

function sendMessage($text)
{
    $data["chat_id"] = "@beetlepet_news";
    $data["text"] = $text;

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_POST => 1,
        CURLOPT_HEADER => 0,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_URL => "https://api.telegram.org/bot" . TOKEN . "/sendMessage",
        CURLOPT_POSTFIELDS => json_encode($data),
        CURLOPT_HTTPHEADER => array_merge(["Content-Type: application/json"]),
    ]);
    $result = curl_exec($curl);
    curl_close($curl);
}

/* СОХРАНИТЬ ДАННЫЕ ИЗ БОТА В ФАЙЛ */
function saveDataFromBotToFile($data, $file_name)
{
    $appdata = print_r($data, true);
    file_put_contents($file_name, "Данные от бота: $appdata", FILE_APPEND);
}
?>
