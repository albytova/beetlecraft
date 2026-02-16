<?php

$data = json_decode(file_get_contents("php://input"), true);

// Сохраняем входные данные в файл
// saveDataFromBotToFile ($data, 'userdata.txt');

$data = $data["callback_query"] ? $data["callback_query"] : $data["message"];
define("TOKEN", "5906780569:AAGQBZhQx7LbZ9MITO7EOsAdr69f1FxOSZA");
define("USER", $data["from"]["first_name"] . " " . $data["from"]["last_name"]);
$message = mb_strtolower(
    $data["text"] ? $data["text"] : $data["data"],
    "utf-8"
);

$method = "sendMessage";
$isSendMessage = true;
$db = new mysqli("149.154.65.75:3306", "craft", "beetlecraft", "petdb");
$last_action = getAction($db);

switch ($message) {
    case "цены":
        $send_data = [
            "text" => getContractorCost($db, $last_action),
        ];
        break;

    case "заказы":
        $send_data = [
            "text" => getOrders($db, $last_action),
        ];
        break;

    case "нужная дата":
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        setAction($db, "order_new_need_date|" . $actions[1]);
        $send_data = ["text" => "Введите дату в формате ГГГГ.ММ.ДД"];
        break;

    case "примечание":
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        setAction($db, "order_new_comment|" . $actions[1]);
        $send_data = ["text" => "Введите примечание"];
        break;

    case "отмена":
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        setAction($db, "order_new_cancel|" . $actions[1]);
        $send_data = [
            "text" => "Вы действительно хотите прекратить создание заказа?",
            "reply_markup" => [
                "resize_keyboard" => true,
                "keyboard" => [[["text" => "Нет"], ["text" => "Да"]]],
            ],
        ];
        break;

    case "да":
        $last_action = getAction($db);
        $actions = explode("|", $last_action);

        if ($actions[0] == "order_new_cancel") {
            $rez = cancelOrderCreate($db, $actions[1]);

            if ($rez == 1) {
                $send_data = getBaseKeyboard($db);
                setAction($db, "");
            }
        } elseif ($actions[0] == "order_remove") {
            changeReserv($db, $actions[1], 1);
            $order_info = getOrderInfo($db, $actions[1]);
            $rez = removeOrder($db, $actions[1]);

            if ($rez == 1) {
                $send_data = getBaseKeyboard($db);
                $send_data["text"] = "Заказ удален";

                sendMessage("Удален заказ:\n" . $order_info);
                setAction($db, "");
            }
        }
        break;

    case "нет":
        $last_action = getAction($db);
        $actions = explode("|", $last_action);

        if ($actions[0] == "order_new_cancel") {
            setAction($db, "order_new|" . $actions[1]);

            $send_data = [
                "text" => "Выберите действие",
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "is_persistent" => true,
                    "keyboard" => [
                        [
                            ["text" => "+0.5"],
                            ["text" => "+1"],
                            ["text" => "+1.5"],
                            ["text" => "+2"],
                        ],
                        [["text" => "Нужная дата"], ["text" => "Примечание"]],
                        [["text" => "Отмена"], ["text" => "Готово"]],
                    ],
                ],
            ];
        } elseif ($actions[0] == "order_remove") {
            $send_data = getBaseKeyboard($db);
            $send_data["text"] = "Удаление заказа отменено";
            setAction($db, "");
        }
        break;

    case "готово":
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        $rez = finishOrderCreate($db, $actions[1]);
        if ($rez == 1) {
            setAction($db, "");
            $order_content = getOrderInfo($db, $actions[1]);
            sendMessage("Создан заказ\n" . $order_content);

            $send_data = getBaseKeyboard($db);
            $send_data["text"] = $order_content;
            setAction($db, "");
        }

        break;

    case "/contractor":
        setAction($db, "contractor_info");
        $send_data = [
            "text" => "Выберите контрагента",
            "reply_markup" => [
                "resize_keyboard" => true,
                "keyboard" => getContractorBtn($db),
            ],
        ];
        break;

    case "/order":
        $send_data = getBaseKeyboard($db);
        break;

    case "добавить":
        setAction($db, "order_new");
        $send_data = [
            "text" => "Выберите контрагента",
            "reply_markup" => [
                "resize_keyboard" => true,
                "keyboard" => getContractorBtn($db),
            ],
        ];
        break;

    case "удалить":
        setAction($db, "order_remove");
        $send_data = [
            "text" => "Выберите заказ",
            "reply_markup" => [
                "resize_keyboard" => true,
                "keyboard" => getOrdersBtn($db),
            ],
        ];
        break;

    case "+0.5":
        $isSendMessage = true;
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        setAction($db, "order_new_amount|" . $actions[1] . "|bottle_05");
        $send_data = ["text" => "Введите количество"];
        break;

    case "+1":
        $isSendMessage = true;
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        setAction($db, "order_new_amount|" . $actions[1] . "|bottle_10");
        $send_data = ["text" => "Введите количество"];
        break;

    case "+1.5":
        $isSendMessage = true;
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        setAction($db, "order_new_amount|" . $actions[1] . "|bottle_15");
        $send_data = ["text" => "Введите количество"];
        break;

    case "+2":
        $isSendMessage = true;
        $last_action = getAction($db);
        $actions = explode("|", $last_action);
        setAction($db, "order_new_amount|" . $actions[1] . "|bottle_20");
        $send_data = ["text" => "Введите количество"];
        break;

    case "актуальные заказы":
        $send_data = ["text" => getActualOrders($db)];
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

function getBaseKeyboard($db)
{
    $send_data = [
        "text" => "Выберите действие",
        "reply_markup" => [
            "resize_keyboard" => true,
            "keyboard" => [
                [["text" => "Добавить"]],
                [["text" => "Удалить"], ["text" => "Актуальные Заказы"]],
            ],
        ],
    ];

    ($_result = $db->query(
        "DELETE FROM petbd.`order` WHERE is_finish_create = '0'"
    )) or die("Connection Error: " . $db->connect_error);

    return $send_data;
}

/* Чтение списка контрагентов и возвращение его в виде кнопок */
function getContractorBtn($db)
{
    ($_result = $db->query(
        "SELECT name FROM contractor WHERE is_relevant = '1'"
    )) or die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $len = count($set);
    $result = [];
    $res = [];
    for ($i = 0; $i < $len; $i++) {
        array_push($result, ["text" => $set[$i]["name"]]);
    }
    array_push($res, $result);

    return $res;
}

/* Чтение списка актуальных заказов и возвращение его в виде кнопок */
function getOrdersBtn($db)
{
    ($_result = $db->query(
        "SELECT o.id AS id, o.date_ship AS date_ship, c.name AS name FROM petbd.`order` o JOIN petbd.contractor c ON o.id_contractor = c.id WHERE o.is_exec = '0' AND o.is_finish_create = '1'"
    )) or die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $len = count($set);
    $result = [];
    $res = [];
    $arr_row = [];
    $l = 0;

    for ($i = 0; $i < $len; $i++) {
        $l++;
        array_push($arr_row, [
            "text" =>
                $set[$i]["name"] .
                " [" .
                $set[$i]["date_ship"] .
                "]:" .
                $set[$i]["id"],
        ]);

        if ($l == 3) {
            array_push($result, $arr_row);
            $arr_row = [];
            $l = 0;
        }
    }
    array_push($result, $arr_row);

    array_push($res, $result);

    return $result;
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
        case "contractor_info":
            $contractor = $message;
            $result = getContractorInfo($db, $contractor);
            setAction($db, $contractor);
            $send_data = [
                "text" => $result,
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Заказы"], ["text" => "Цены"]]],
                ],
            ];
            break;

        case "order_new":
            $contractor = $message;
            $id_order = getNewOrder($db, $contractor);

            setAction($db, "order_new|" . $id_order);
            $send_data = [
                "text" => "Создание заказа",
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "is_persistent" => true,
                    "keyboard" => [
                        [
                            ["text" => "+0.5"],
                            ["text" => "+1"],
                            ["text" => "+1.5"],
                            ["text" => "+2"],
                        ],
                        [["text" => "Нужная дата"], ["text" => "Примечание"]],
                        [["text" => "Отмена"], ["text" => "Готово"]],
                    ],
                ],
            ];
            break;

        case "order_new_amount":
            $order_id = $actions[1];
            $type = $actions[2];
            $dist_product = addBottleInOrder($db, $order_id, $type, $message);
            if ($dist_product != -1) {
                $result =
                    "В заказ добавлено " .
                    $message .
                    " бутылок " .
                    $dist_product;
            } else {
                $result = "Не удалось добавить бутылки в заказ";
            }

            $send_data = ["text" => $result];
            break;

        case "order_new_need_date":
            $order_id = $actions[1];
            $rez = addNeedDateInOrder($db, $order_id, $message);
            if ($rez > -1) {
                $result = "Дата добавлена в заказ";
            } else {
                $result = "Неправильный формат даты";
            }

            $send_data = ["text" => $result];
            break;

        case "order_new_comment":
            $order_id = $actions[1];
            $rez = addCommentInOrder($db, $order_id, $message);
            if ($rez > -1) {
                $result = "Примечание добавлено";
            } else {
                $result = "Ошибка добавления примечания";
            }

            $send_data = ["text" => $result];
            break;

        case "order_remove":
            $texts = explode(":", $message);
            $order_info = getOrderInfo($db, $texts[1]);
            $send_data = [
                "text" =>
                    "Вы действительно хотите удалить заказ?\n" . $order_info,
                "reply_markup" => [
                    "resize_keyboard" => true,
                    "keyboard" => [[["text" => "Нет"], ["text" => "Да"]]],
                ],
            ];
            setAction($db, $actions[0] . "|" . $texts[1]);
            break;
    }

    $send_data["chat_id"] = $chat_id;
    $send_data["parse_mode"] = "HTML";
    sendTelegram("sendMessage", $send_data);
}

// Получение ID нового заказа
function getNewOrder($db, $contractor)
{
    ($_result = $db->query(
        "SELECT ID FROM contractor c WHERE c.name ='" . $contractor . "'"
    )) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    ($_result = $db->query(
        "INSERT INTO petbd.`order` (id_contractor, is_finish_create, date_ship) VALUES (" .
            $set[0][0] .
            ", 0, CURRENT_DATE())"
    )) or die("Connection Error: " . $db->connect_error);

    return $db->insert_id;
}

// Добавление комментария к заказу
function addCommentInOrder($db, $order_id, $comment)
{
    ($_result = $db->query(
        "UPDATE `order` o set o.comment = '" .
            $comment .
            "' WHERE id = " .
            $order_id
    )) or die("Connection Error: " . $db->connect_error);
    return 1;
}

// Добавление даты доставки
function addNeedDateInOrder($db, $order_id, $need_date)
{
    ($_result = $db->query(
        "UPDATE `order` o set o.date_ship_need = '" .
            $need_date .
            "' WHERE id = " .
            $order_id
    )) or die("Connection Error: " . $db->connect_error);
    return 1;
}

// Завершение создания заказа
function finishOrderCreate($db, $order_id)
{
    ($_result = $db->query(
        "UPDATE `order` o set o.is_finish_create = '1' WHERE id = " . $order_id
    )) or die("Connection Error: " . $db->connect_error);

    changeReserv($db, $order_id, 0);
    return 1;
}

// Изменение количества бутылок в резерве
function changeReserv($db, $order_id, $is_minus)
{
    ($_result = $db->query(
        "SELECT * FROM petbd.order_amount WHERE id_order = " . $order_id
    )) or die("Connection Error: " . $db->connect_error);
    $order_amount = getSet($_result);
    if ($order_amount == -1) {
        return -1;
    }

    ($_result = $db->query("SELECT * FROM petbd.storage")) or
        die("Connection Error: " . $db->connect_error);
    $storage = getSet($_result);
    if ($storage == -1) {
        return -1;
    }

    $len_o = count($order_amount);
    $len_s = count($storage);
    for ($i = 0; $i < $len_o; $i++) {
        $product = $order_amount[$i]["id_product"];
        $reserv = $order_amount[$i]["count"];

        for ($j = 0; $j < $len_s; $j++) {
            if ($storage[$j]["id_product"] == $product) {
                $old_reserv = $storage[$j]["reserv"];

                if ($is_minus == 1) {
                    $new_reserv = $old_reserv - $reserv;
                } else {
                    $new_reserv = $old_reserv + $reserv;
                }

                ($_result = $db->query(
                    "UPDATE `storage` s set s.reserv = " .
                        $new_reserv .
                        " WHERE id = " .
                        $storage[$j]["id"]
                )) or die("Connection Error: " . $db->connect_error);
            }
        }
    }
}

// Отмена создания заказа
function cancelOrderCreate($db, $order_id)
{
    ($_result = $db->query(
        "DELETE FROM petbd.`order` WHERE id = " . $order_id
    )) or die("Connection Error: " . $db->connect_error);
    return 1;
}

// Удаление заказа
function removeOrder($db, $order_id)
{
    ($_result = $db->query(
        "DELETE FROM petbd.`order` WHERE id = " . $order_id
    )) or die("Connection Error: " . $db->connect_error);
    return 1;
}

// Добавление количества бутылок в заказ
function addBottleInOrder($db, $order_id, $type, $count)
{
    if (!empty($text_default) && !preg_match('/^\+?\d+$/', $text_default)) {
        return "Введите целое число";
    }

    ($_result = $db->query(
        "SELECT id FROM petbd.contractor_cost WHERE id_contractor = (SELECT o.id_contractor FROM `order` o WHERE o.id = " .
            $order_id .
            " limit 1) AND id_product = (SELECT id FROM product p WHERE p.name = '" .
            $type .
            "' LIMIT 1)"
    )) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $contractor_cost = $set[0][0];

    ($_result = $db->query(
        "INSERT INTO petbd.`order_amount` (id_order, id_product, count, id_contractor_cost) VALUES (" .
            $order_id .
            ", (SELECT id FROM product p WHERE p.name = '" .
            $type .
            "' LIMIT 1), " .
            $count .
            ", " .
            $contractor_cost .
            ")"
    )) or die("Connection Error: " . $db->connect_error);

    ($_result = $db->query(
        "SELECT dist FROM petbd.product WHERE name = '" . $type . "'"
    )) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    return $set[0][0];
}

// Получение информации о контрагенте
function getContractorInfo($db, $contractor)
{
    ($_result = $db->query(
        "SELECT contractor.id AS contractor_id, contractor.name AS contractor_name, contractor.entity AS enity, contractor.contact_name AS contact_name, contractor.contact_phone AS contact_phone, place.name AS place, contractor.address AS address, contractor.type_pay AS type_pay, contractor.is_deferment AS is_deferment, contractor.is_relevant AS is_relevant, contractor.last_order AS last_order, contractor.comment AS comment, contractor.operating_mode AS operating_mode FROM contractor RIGHT JOIN place ON  contractor.id_place = place.id WHERE contractor.name = '" .
            $contractor .
            "'"
    )) or die("Connection Error: " . $db->connect_error);

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
    $info = $info . "\n<pre>Юридическое лицо: " . $set[0][2];
    $info = $info . "\nКонтакт: " . $set[0][3];
    $info = $info . "\nТелефон: " . $set[0][4];
    $info = $info . "\nРайон: " . $set[0][5];
    $info = $info . "\nАдрес: " . $set[0][6];
    $info = $info . "\nРежим работы: " . $set[0][12];
    $info = $info . "\nПоследний заказ: " . $set[0][10];
    $info = $info . "\nТип оплаты: " . $set[0][7];
    $info = $info . "\nОтсрочка платежа: " . $is_defer;
    $info = $info . "\nАктуальный клиент: " . $is_relevant;
    $info = $info . "\nПримечание: " . $set[0][11];

    $info = $info . "</pre>";
    return $info;
}

// Получение списка цен контрагента
function getContractorCost($db, $contractor)
{
    ($_result = $db->query(
        "SELECT p.dist AS product_name, contractor_cost.cost as cost FROM contractor_cost RIGHT JOIN contractor ON contractor_cost.id_contractor = contractor.id RIGHT JOIN product p ON contractor_cost.id_product = p.id WHERE contractor.name = '" .
            $contractor .
            "'"
    )) or die("Connection Error: " . $db->connect_error);

    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "";
    $len = count($set);
    for ($i = 0; $i < $len; $i++) {
        $info = $info . "\n" . $set[$i][0] . ": " . $set[$i][1] . " руб";
    }

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

function getOrderInfo($db, $order_id)
{
    ($_result = $db->query(
        "SELECT o.id, o.date_ship, o.is_exec, o.is_pay, o.credit, oa.id_order, oa.id_product, oa.`count`, cc.cost, p.dist, c.name, o.date_ship_need, o.comment FROM order_amount oa INNER JOIN contractor_cost cc ON oa.id_contractor_cost = cc.id right JOIN `order` o ON oa.id_order = o.id JOIN contractor c ON cc.id_contractor = c.id JOIN product p ON cc.id_product = p.id WHERE o.id = '" .
            $order_id .
            "'"
    )) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "";
    $info = $info . "\nПокупатель: " . $set[0][10];
    $info = $info . "\nДата заказа: " . $set[0][1];
    if ($set[0][11]) {
        $info = $info . "\nНеобходимая дата доставки: " . $set[0][11];
    }
    if ($set[0][12]) {
        $info = $info . "\nПримечание: " . $set[0][12];
    }
    $info = $info . "<i>\n";

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
    $info = $info . "\nСумма = " . $all_sum . "руб</i>";

    return $info;
}

// ФОрмирование списка актуальных заказов
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

// Формирование списка заказов контрагента
function getOrders($db, $contractor)
{
    ($_result = $db->query(
        "SELECT o.id, o.date_ship, o.is_exec, o.is_pay, o.credit, oa.id_order, oa.id_product, oa.`count`, cc.cost, p.dist FROM order_amount oa INNER JOIN contractor_cost cc ON oa.id_contractor_cost = cc.id right JOIN `order` o ON oa.id_order = o.id JOIN contractor c ON cc.id_contractor = c.id JOIN product p ON cc.id_product = p.id WHERE c.name = '" .
            $contractor .
            "'"
    )) or die("Connection Error: " . $db->connect_error);
    $set = getSet($_result);
    if ($set == -1) {
        return -1;
    }

    $info = "<pre>";

    $len = count($set);
    $order_id = -1;
    for ($i = 0; $i < $len; $i++) {
        if ($order_id != $set[$i][0]) {
            $order_id = $set[$i][0];

            $info = $info . "\nДата заказа: " . $set[$i][1];
            if ($set[$i][2] == "1") {
                $info = $info . "[ВЫПОЛНЕН]";
            }
            if ($set[$i][3] == "1") {
                $info = $info . "[ОПЛАЧЕН " . $set[$i][4] . "руб]";
            } else {
                $info = $info . "[ДОЛГ " . $set[$i][4] . "руб]";
            }

            $sum = $set[$i][7] * $set[$i][8];
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
        } else {
            $sum = $set[$i][7] * $set[$i][8];
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
    }
    $info = $info . "</pre>";

    return $info;
}

function sendMessage($text)
{
    $data["chat_id"] = "@beetlepet_news";
    $data["text"] = $text;
    $data["parse_mode"] = "HTML";

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
