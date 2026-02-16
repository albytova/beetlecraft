<?php

require_once('bot_barhopping_admin.php');

const TOKEN_USER = '6138426587:AAFiWZuZkBPOBWeA3Tq0o1KlyFERoKMGxTo';

$data = json_decode(file_get_contents('php://input'), TRUE);

// Сохраняем входные данные в файл
saveDataFromBotToFile ($data, 'apidata.txt');

$data = $data['message'];
$message_text = $data['text'];
$chat_id = $data['chat']['id'];
$username = $data['from']["username"];

define ("CHAT_ID_USER", $chat_id);

// Подключаемся к базе данных
$conn = mysqli_connect("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// ОТПРАВКА ФОТО
if ($data['photo']) {
    processingPhoto ($data, $username);

    exit;
}

// обработка нажатия кнопок
switch ($message_text) {

    case '/start':
        sendStart ($chat_id, $conn, $username);
        break;

    case 'отмена':
        sendCancel ($chat_id, $conn, $username);
        break;

    case 'Назад в меню':
        sendBarMenu ($chat_id);
        break;

    case 'Пара Пинт':
        sendStartBar($chat_id, 'Пара Пинт', $conn, $username);
        break;

    case 'Corner/74':
        sendStartBar($chat_id, 'Corner/74', $conn, $username);
        break;

    case 'Bootleggers':
        sendStartBar($chat_id, 'Bootleggers', $conn, $username);
        break;

    case 'BBQ Bar':
        sendStartBar($chat_id, 'BBQ Bar', $conn, $username);
        break;

    case 'ТакиДа':
        sendStartBar($chat_id, 'ТакиДа', $conn, $username);
        break;
}

/* ОБРАБОТКА ПРИЁМА ФОТКИ */
function processingPhoto ($data, $username) {

    $new_bot_token = "6286751970:AAFWQ-ALf20NyOyrTNF6W-QZHS1Z6JGdV6w";
    $new_chat_id = "464101746";

    // Отправляем сообщение пользователю, чтобы ждал
    $reply_markup = array(
        'keyboard' => array( array('Назад в меню')),
        'resize_keyboard' => true
    );
    $parameters_sticker = array(
        'chat_id' => $data['chat']['id'],
        'reply_markup' => json_encode($reply_markup),
        'sticker' => 'CAACAgIAAxkBAAEIf2JkMG0BOr5LRm7KzEwIIbonjBQ-DQAC1wcAAkb7rAT1kHU4SQWQni8E'
    );
    $parameters_text = array(
        'text' => "Ждите подтверждения от Админки",
        'chat_id' => $data['chat']['id'],
        'reply_markup' => json_encode($reply_markup)
    );
    sendTelegram(TOKEN_USER, 'sendMessage', $parameters_text);
    sendTelegram(TOKEN_USER, 'sendSticker', $parameters_sticker);

    // Сохраняем фото на сервер
    $url = "https://api.telegram.org/bot".TOKEN_USER."/getFile?file_id=".$data['photo'][2]["file_id"];
    $curl_handle = curl_init($url);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);
    $json_response = curl_exec($curl_handle);
    curl_close($curl_handle);
    $response = json_decode($json_response);
    if($response->{'ok'} == true){
        $file_path = $response->{'result'}->{'file_path'};
        $photo_url = "https://api.telegram.org/file/bot".TOKEN_USER."/".$file_path;

        file_put_contents("./photo/".$username.".jpg", file_get_contents($photo_url));
    }

    // Отправляем сообщение админу
    $reply_markup = array(
        'keyboard' => array( array('Подтвердить', 'Не подходит')),
        'resize_keyboard' => true
    );

    $arrayQuery = array(
        'chat_id' => $new_chat_id,
        'caption' => "Отправлено фото:\nИмя: ".$data["from"]["last_name"]." ".$data["from"]["first_name"]."\nUSERNAME: ".$username,
        'reply_markup' => json_encode($reply_markup),
        'photo' => curl_file_create(__DIR__ . "/photo/".$username.".jpg", 'image/jpg' , $username.".jpg")
    );
    $ch = curl_init('https://api.telegram.org/bot'.$new_bot_token .'/sendPhoto');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $arrayQuery);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HEADER, false);
    $res = curl_exec($ch);
    curl_close($ch);

}

/* СОХРАНИТЬ ДАННЫЕ ИЗ БОТА В ФАЙЛ */
function saveDataFromBotToFile ($data, $file_name) {
    $appdata = print_r($data, true);
    file_put_contents($file_name, "Данные от бота: $appdata", FILE_APPEND);
}

/*  ИНИЦИАЛИЗАЦИЯ БОТА */
function sendStart ($chat_id, $db, $username) {

    sendBarMenu ($chat_id);

    $db->query("CALL BH_START('".$username."')") or die('Connection Error: ' . $db->connect_error);
}

/*  НАЖАТИЕ КНОПКИ ОТМЕНА */
function sendCancel ($chat_id, $db, $user_name) {

    sendBarMenu ($chat_id);

    $db->query("CALL BH_CHANGE_STATUS_BAR(0, '".$user_name."', 'empty')") or die('Connection Error: ' . $db->connect_error);
}

/* ОТПРАВКА МЕНЮ КНОПОК С БАРАМИ */
function sendBarMenu ($chat_id, $type = 0) {

    $bar_name1 = 'Пара Пинт';
    $bar_name2 = 'Corner/74';
    $bar_name3 = 'Bootleggers';
    $bar_name4 = 'BBQ Bar';
    $bar_name5 = 'ТакиДа';

  //  if ($type == 0)
        $bar_name1 = "[".$bar_name1."]";

    $reply_markup = array(
        'keyboard' => array(
            array($bar_name1, $bar_name2),
            array($bar_name3, $bar_name4, $bar_name5)
        ),
        'resize_keyboard' => true
    );

    $parameters = array(
        'text' => "Добро пожаловать в бот Bar Hopping!\n\nВыберите пункт меню ↓",
        'chat_id' => $chat_id,
        'reply_markup' => json_encode($reply_markup)
    );

    sendTelegram(TOKEN_USER, 'sendMessage', $parameters);
}

/* НАЖАТИЕ КНОПКИ С БАРОМ */
function sendStartBar ($chat_id, $bar_name, $db, $user_name) {

    $reply_markup = array(
        'keyboard' => array( array('отмена')),
        'resize_keyboard' => true
    );

    $parameters = array(
        'text' => "Пришли фото из ".$bar_name." с пивом и барменом",
        'chat_id' => $chat_id,
        'reply_markup' => json_encode($reply_markup)
    );

    sendTelegram(TOKEN_USER, 'sendMessage', $parameters);

    changeStatusBar ($db, $user_name, $bar_name, "start");
}

/* ПОЛУЧИТЬ ИДЕНТИФИКАТОР БАРА */
function getBarType ($bar_name) {
    define("BARS", array(
        "Пара Пинт" => 1,
        "Corner/74" => 2,
        "Bootleggers" => 3,
        "BBQ Bar" => 4,
        "ТакиДа" => 5
    ));

    return BARS[$bar_name];
}

/* ИЗМЕНЕНИЕ СТАТУСА СОСТОЯНИЯ БАРА */
function changeStatusBar ($db, $user_name, $bar_name, $status) {

    $bar_type = getBarType ($bar_name);

    $db->query("CALL BH_CHANGE_STATUS_BAR(".$bar_type.", '".$user_name."', 'start')") or die('Connection Error: ' . $db->connect_error);
}

/* Отправка сообщения в Telegram */
function sendTelegram($token, $method, $parameters, $headers = [])
{
    $url = "https://api.telegram.org/bot" .$token. "/".$method;

    $options = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($parameters),
        ),
    );

    $context = stream_context_create($options);
    file_get_contents($url, false, $context);
}
