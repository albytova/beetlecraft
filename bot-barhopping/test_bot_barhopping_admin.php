<?php

require_once('test_bot_barhopping.php');

$GLOBALS['TOKEN_ADMIN']  = '6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs';
$GLOBALS['LENA_CHAT_ID']  = '464101746';

$data_admin = json_decode(file_get_contents('php://input'), TRUE);

saveDataFromBotToFile ($data_admin, 'admindata.txt');

$message_text = "";
$user_chat_id = "";
$user = "";

// Подключаемся к базе данных
$conn_admin = mysqli_connect("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
if (!$conn_admin) {
    die("Connection failed: " . mysqli_connect_error());
}

if ($data_admin) {
    $init_data = $data_admin['callback_query'] ? $data_admin['callback_query']["message"] : $data_admin['message'];
    $message_text = $data_admin['callback_query']? $data_admin['callback_query']['data'] : $init_data['text'];
    $GLOBALS['ADMIN_CHATID'] = $init_data['from']['id'];

    $texts_user = explode("|", $init_data['caption']);
    $user = $texts_user[1];

    $texts_bar = explode("*", $init_data['caption']);
    $bar = $texts_bar[1];

    $_result = $conn_admin->query("SELECT chat_id FROM barhopping WHERE user_name='".$user."'");
    $set = array();
    $total_records = mysqli_num_rows($_result);
    if($total_records >= 1){
        while ($link = mysqli_fetch_array($_result)){
            $set[] = $link;
        }
    }

    $user_chat_id = $set[0][0];
}

// обработка нажатия кнопок
switch ($message_text) {

    case 'set_accept':
        sendAccept($conn_admin, $user_chat_id, $user, $init_data["message_id"], $bar);
        break;

    case 'set_not_accept':
        sendCancelPhoto($user_chat_id, $user, $bar, $init_data["message_id"]);
        break;

}

function sendAccept ($db, $user_chat_id, $user, $message_id, $bar) {

    $parameters = array(
        'chat_id' => $GLOBALS['LENA_CHAT_ID'],
        'message_id' => $message_id,
        'reply_markup' => json_encode(array(
            'keyboard' => array( array('Где все')),
            'resize_keyboard' => true
        ))
    );

    sendTelegram($GLOBALS['TOKEN_ADMIN'], 'deleteMessage', $parameters);

    $db->query("CALL BH_CHANGE_STATUS_BAR(0, '".$user."', 'finish')") or die('Connection Error: ' . $db->connect_error);

    $parameters_user = array(
        'text' => "✅ Бар ".$bar." пройден!",
        'chat_id' => $user_chat_id
    );

    sendTelegram($GLOBALS['TOKEN_USER'], 'sendMessage', $parameters_user);

    $_result = $db->query("SELECT bar1_status, bar2_status, bar3_status, bar4_status, bar5_status FROM barhopping WHERE user_name='".$user."'");
    $set = array();
    $total_records = mysqli_num_rows($_result);
    if($total_records >= 1){
        while ($link = mysqli_fetch_array($_result)){
            $set[] = $link;
        }
    }

    if ($set[0][0] == 'finish' && $set[0][1] == 'finish' && $set[0][2] == 'finish' && $set[0][3] == 'finish' && $set[0][4] == 'finish') {

        $db->query("update barhopping set is_finish = 1,last_bar=null WHERE user_name='".$user."'");

        $parameters_user = array(
            'text' => 'Поздравляем! Вы прошли BAR HOPPING! Заберите свой приз на баре BeetleCraft. _Будем благодарны, если расскажете про Bar Hopping в соц.сетях:)_ [t.me/beetlecraft] [https://vk.com/beetlecraft]  [https://www.instagram.com/beetle.craft]',
            'parse_mode' => 'markdown',
            'chat_id' => $user_chat_id
        );
        sendTelegram($GLOBALS['TOKEN_USER'], 'sendMessage', $parameters_user);

        $parameters_sticker = array(
            'chat_id' => $user_chat_id,
            'sticker' => "CAACAgIAAxkBAAEIh99kNBMd5IefTW8QqcLQFeu5XT72DQACVwADwZxgDMYC_bNUm6Y0LwQ"
        );
        sendTelegram($GLOBALS['TOKEN_USER'], 'sendSticker', $parameters_sticker);
    }
    sendBarMenu($user_chat_id, $db, $user);
}

function sendCancelPhoto ($user_chat_id, $user, $bar, $message_id) {

    $reply_markup = array(
        'keyboard' => array( array('Где все')),
        'resize_keyboard' => true
    );

    $parameters = array(
        'chat_id' => $GLOBALS['LENA_CHAT_ID'],
        'text' => "Фото от ".$user." не принято",
        'message_id' => $message_id,
        'reply_markup' => json_encode($reply_markup)
    );
    sendTelegram($GLOBALS['TOKEN_ADMIN'], 'sendMessage', $parameters);
    sendTelegram($GLOBALS['TOKEN_ADMIN'], 'deleteMessage', $parameters);

    $parameters = array(
        'text' => "❌ Фото из бара".$bar." не принято:( Пришлите ещё одно",
        'chat_id' => $user_chat_id
    );
    sendTelegram($GLOBALS['TOKEN_USER'], 'sendMessage', $parameters);
}

?>