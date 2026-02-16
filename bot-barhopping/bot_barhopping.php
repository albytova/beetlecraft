<?php

$data = json_decode(file_get_contents('php://input'), TRUE);

// Сохраняем входные данные в файл
//saveDataFromBotToFile ($data, 'userdata.txt');

$data = $data['message'];
$message = $data['text'];

//$GLOBALS['TOKEN_USER'] = '6887269825:AAEKd-xuZ5q3cRE302xEX-MH4PKhQCrJmis';
$GLOBALS['TOKEN_USER'] = '6138426587:AAFiWZuZkBPOBWeA3Tq0o1KlyFERoKMGxTo';
$GLOBALS['CHAT_ID_USER'] = $data['chat']['id'];
$GLOBALS['USER'] = $data['from']["username"]? $data['from']["username"] : $data['from']["id"];
//$GLOBALS['FLUD_CHAT_ID'] = '-4076549616';
$GLOBALS['FLUD_CHAT_ID'] = '-1001906454878';

// Подключаемся к базе данных
$conn_user = mysqli_connect("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
if (!$conn_user) {
    die("Connection failed: " . mysqli_connect_error());
}

// ОТПРАВКА ФОТО
if ($data['photo']) {
    processingPhoto ($data, $conn_user);
}

$message = str_replace(["✅ ", "🍺 "], "", $message);

// обработка нажатия кнопок
switch ($message) {

    case '/start':
    case '...':
    case 'Погнали':
        sendHelp (true);
        break;

    case '/help':
        sendHelp (false);
        break;

    case '/address':
        sendAddress ($conn_user);
        break;

    case 'Начать Bar Hopping':
        sendChat($conn_user);
        break;

    case 'отмена':
        sendCancel ($conn_user);
        break;

    case 'Назад в меню':
        sendBarMenu ($conn_user);
        break;

    case "Хочу!":
        $last_action = getAction($conn_user);
        $actions = explode("|", $last_action);
        sendStartBar($actions[1], $conn_user, 1);
        break;

    case "Обшибся":
        sendBarMenu ($conn_user);
        break;

    default:
        $last_action = getAction($conn_user);
        processDefault(
            $message,
            $last_action,
            $conn_user
        );
}

/* Выбор действия при вводе произвольных значений */
function processDefault($message, $last_action, $conn_user)
{
	$actions = explode("|", $last_action);
    switch ($actions[0]) {
        case "choose_bar":
            sendStartBar($message, $conn_user, 0);
            break;
    }
}

function sendChat ($conn_user) {

    $keyboard = array(
        "inline_keyboard" => array(
            array(
                array(
                    "text" => "Присоединиться к Чату-Болталке Бархоппинга",
                    "url" => "https://t.me/+IFohwHexRIFjYTNi"
                )
            )
        )
    );

    $parameters_text = array(
        'text' => "Не забудьте присоединиться к чату ↓",
        'chat_id' => $GLOBALS['CHAT_ID_USER'],
        "reply_markup" => json_encode($keyboard)
    );

    sendTelegram('sendMessage', $parameters_text);

    startBarHopping($conn_user);
}

/* Отправка правил Бар Хоппинга */
function sendHelp ($is_keyboard) {

    $text = "<b>Добро пожаловать на Bar Hopping</b>\n\n Хватит бессистемно тусить по барам! Мы предлагаем вам маршрут, тщательно подобранный професиональными <s>алкоголиками</s> гурманами\n\nВ этом БарХоппинге бары предоставляют участникам специальные скидки в специальные дни: \n~ по понедельникам акция на настойки 1+1<b> в BBQ Bar</b>\n~ по вторникам скидка 15% на в блины <b>в блин-баре Блин ОК</b> \n~ по средам Пилс по 100 рублей за бокал <b>в BeetleCraft</b> \n~ по четвергам скидка 20% на бар <b>в баре Malevichi</b>\nЧтобы получить скидку, покажите бот Bar Hopping на телефоне.\n\n 1. Выбираете кнопку с баром\n 2. Получаете задание\n 3. Отправляете фото выполненного задания\n 4. Идёте в следующий бар\n ..\n 99. Проходите все бары, выкладываете в соц.сети с хэштегом #barhopping, получаете уважение и завистливые взгляды\n 100. Через месяц получаете новый маршрут\n \n\n <i>/start - Начать Bar Hopping заново\n /address - Показать всю информацию о барах\n /help - Прочитать эти правила ещё раз </i>\n\nПрисоединяйтесь к Флудилке Бархоппинга по ссылке⤵️\nhttps://t.me/+IFohwHexRIFjYTNi";
    if ($is_keyboard) {
        $keyboard = array(
            'keyboard' => array(
                array("Начать Bar Hopping")
            ),
            'resize_keyboard' => true
        );
    }

    $parameters_text = array(
        'chat_id' => $GLOBALS['CHAT_ID_USER'],
        "reply_markup" => $keyboard? json_encode($keyboard) : false,
        "caption" => $text,
        'parse_mode' => "HTML",
        'photo' => curl_file_create(__DIR__ . "/img/barhopping.jpg", 'image/jpg' , "barhopping.jpg")
    );
    $ch2 = curl_init('https://api.telegram.org/bot'.$GLOBALS['TOKEN_USER'] .'/sendPhoto');
    curl_setopt($ch2, CURLOPT_POST, 1);
    curl_setopt($ch2, CURLOPT_POSTFIELDS, $parameters_text);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch2, CURLOPT_HEADER, false);
    curl_exec($ch2);
    curl_close($ch2);
}

function sendAddress ($db) {

	$bars = getStatusBar ($db);
	$text = "<u>БАРЫ УЧАСТНИКИ [ <a href='https://yandex.ru/maps/?um=constructor%3A48bd408006fc296e8278c9bd58aa583f5b2989b0e882a759539c6a5b860d7181&source=constructorLink'>все бары на карте по ссылке ]</a></u>\n\n";

	for ($i = 0; $i < count($bars); $i++) {
		$num = $i + 1;
		$text = $text."<b>".$num.". ".$bars[$i]["name"]."</b>\n= ".$bars[$i]["address"]."\n= ".$bars[$i]["time_work"]."\n= ".$bars[$i]["2gis"]."\n\n";
	}

    $parameters = array(
        'text' => $text,
        'chat_id' => $GLOBALS['CHAT_ID_USER'],
        'parse_mode' => "HTML"
    );

    sendTelegram('sendMessage', $parameters);
}

/* ОБРАБОТКА ПРИЁМА ФОТКИ */
function processingPhoto ($data, $db) {

	$last_action = getAction($db);
    $actions = explode("|", $last_action);

    if ($actions[0] != "choose_bar" || empty($actions[1])) {
       sendMessage("⛔ БАР НЕ ВЫБРАН");
       return;
    }

    // Получаем название бара
    $last_bar = $actions[1];

    // Отправляем сообщение пользователю, чтобы ждал
    $reply_markup = array(
        'keyboard' => array( array('Назад в меню')),
        'resize_keyboard' => true
    );
    $stickers = array("CAACAgEAAxkBAAEIh8VkNA23wNvg5by3giy0sI4SHcMMvAACVwADoQUMDXcFX0Y2otyWLwQ", "CAACAgIAAxkBAAEIf2JkMG0BOr5LRm7KzEwIIbonjBQ-DQAC1wcAAkb7rAT1kHU4SQWQni8E","CAACAgIAAxkBAAEIh8dkNA6MDLwX_hrikdntf5w5p6SZtgAC_wADZQYyA3wKxSkKPrBZLwQ", "CAACAgIAAxkBAAEIh8lkNA60uGEVIMP3QQrkzWZ2yMaJMAAC1hEAAtWfMEga_4fjbOe4eC8E", "CAACAgIAAxkBAAEIh8tkNA7LfqK62kiYJrD1JhkULMuzIgACWQMAAggHAgABtnh8vKCP0_wvBA", "CAACAgIAAxkBAAEIh81kNA7twknneZuvF8cMhY_XPMWRBQACcAMAAggHAgABckyEvcQMR4kvBA", "CAACAgIAAxkBAAEIh89kNA8XBdkY6ejbHUG27KPzpAurnAACqQMAAggHAgABzPVATz7gJuUvBA", "CAACAgIAAxkBAAEIh9FkNA8lkUBe6gRb6EAldrgCYveHFQAC8gMAAggHAgABSUGDeIy_hNovBA", "CAACAgIAAxkBAAEIh9NkNA9VoyZtSPHf_ln3jDkigctrSAACSCcAAq3XCEjYNRB30KCm6C8E", "CAACAgIAAxkBAAEIh-lkNBQ7dSY-tYz6FHUlWnBM7iI6tQACDQADLDXuDBYd3xH_w-YsLwQ", "CAACAgIAAxkBAAEIh-tkNBRPMyxV11qAjoGCrMuqW9IcVAACEQADLDXuDM2FwqEK670AAS8E", "CAACAgIAAxkBAAEIh-9kNBRoWdrmpQ50ZD3h4Y3HMdK89AACFwADLDXuDNiPmDjSp36XLwQ");
    $sticker = array_rand($stickers);
    $parameters_sticker = array(
        'chat_id' => $data['chat']['id'],
        'reply_markup' => json_encode($reply_markup),
        'sticker' => $stickers[$sticker]
    );
    $parameters_text = array(
        'text' => "Ждите подтверждения",
        'chat_id' => $data['chat']['id'],
        'reply_markup' => json_encode($reply_markup)
    );
    sendTelegram('sendMessage', $parameters_text);
    sendTelegram('sendSticker', $parameters_sticker);

    // Сохраняем фото на сервер
    $url = "https://api.telegram.org/bot".$GLOBALS['TOKEN_USER']."/getFile?file_id=".$data['photo'][2]["file_id"];
    $curl_handle = curl_init($url);
    curl_setopt($curl_handle, CURLOPT_RETURNTRANSFER, true);
    $json_response = curl_exec($curl_handle);
    curl_close($curl_handle);
    $response = json_decode($json_response);
    if($response->{'ok'} == true){
        $file_path = $response->{'result'}->{'file_path'};
        $photo_url = "https://api.telegram.org/file/bot".$GLOBALS['TOKEN_USER']."/".$file_path;

        file_put_contents("./photo/".$GLOBALS['USER'].".jpg", file_get_contents($photo_url));
    }

    //Отправка в чат TODO ЭТО БЕСПОЛЕЗНАЯ ХУЙНЯ
//    $_result = $db->query("select * from bh_barhopping where user_name='".$GLOBALS['USER']."'") or die('Connection Error: ' . $db->connect_error);
//    $set = array();
//    $total_records = mysqli_num_rows($_result);
//    if($total_records >= 1){
//        while ($link = mysqli_fetch_array($_result)){
//            $set[] = $link;
//        }
//    }
//    if ($set[0][0] == 'N')
//        exit;

    $fluddata = array(
        'chat_id' => $GLOBALS['FLUD_CHAT_ID'],
        'caption' => $last_bar,
        'photo' => curl_file_create(__DIR__ . "/photo/".$GLOBALS['USER'].".jpg", 'image/jpg' , $GLOBALS['USER'].".jpg")
    );
    $ch2 = curl_init('https://api.telegram.org/bot'.$GLOBALS['TOKEN_USER'] .'/sendPhoto');
    curl_setopt($ch2, CURLOPT_POST, 1);
    curl_setopt($ch2, CURLOPT_POSTFIELDS, $fluddata);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch2, CURLOPT_HEADER, false);
    curl_exec($ch2);
    curl_close($ch2);

	sendAccept($db, $last_bar);
}

/* Подтверждение прохождения бара */
function sendAccept ($db, $bar) {

	changeStatusBar ($db, $bar, "finish");

    $parameters_user = array(
        'text' => "✅ Бар ".$bar." пройден!",
        'chat_id' => $GLOBALS['CHAT_ID_USER']
    );

    sendTelegram('sendMessage', $parameters_user);

    $bars = getStatusBar ($db);

    $type_bar = 0;
	$is_finish = 1;
	for ($i = 0; $i < count($bars); $i++) {
		if ($bars[$i]['name'] == $bar) {
			$type_bar = $bars[$i]['type'];
		}
		if ($bars[$i]['status'] != 'finish') {
			$is_finish = 0;
			break;
		}
	}

    if ($is_finish == 1) {

        $db->query("update barhopping set is_finish = 1,last_bar=null WHERE user_name='".$user."'");

        $parameters_user = array(
            'text' => "Поздравляем! Вы прошли BAR HOPPING! Делитесь впечатлениями в соц.сетях!\n\n Bar Hopping создан командой BeetleCraft:\n~ t.me/beetlecraft\n~ https://vk.com/beetlecraft\n~ https://www.instagram.com/beetle.craft\n\nНовый маршрут будет доступен 4 марта 2024",
            'parse_mode' => "HTML",
            'chat_id' => $GLOBALS['CHAT_ID_USER']
        );
        sendTelegram('sendMessage', $parameters_user);

        $parameters_sticker = array(
            'chat_id' => $GLOBALS['CHAT_ID_USER'],
            'sticker' => "CAACAgIAAxkBAAEIh99kNBMd5IefTW8QqcLQFeu5XT72DQACVwADwZxgDMYC_bNUm6Y0LwQ"
        );
        sendTelegram('sendSticker', $parameters_sticker);

        setAction($db, 'finish');
    }
    else {

        $next_bar = "";
        $type_bar = $type_bar + 1;
    	for ($i = 0; $i < count($bars); $i++) {
    		if ($bars[$i]['type'] == $type_bar) {
    			sendMessage("Следующий бар - <b><u>".$bars[$i]['name']."</u></b>");
    		}
    	}

        sendBarMenu($db);

    }
}

/* СОХРАНИТЬ ДАННЫЕ ИЗ БОТА В ФАЙЛ */
function saveDataFromBotToFile ($data, $file_name) {
    $appdata = print_r($data, true);
    file_put_contents($file_name, "Данные от бота: $appdata", FILE_APPEND);
}

/*  ИНИЦИАЛИЗАЦИЯ БОТА */
function startBarHopping ($db) {

    $db->query("delete from bh_barhopping where chat_id='".$GLOBALS['CHAT_ID_USER']."'") or die('Connection Error: ' . $db->connect_error);
    $db->query("insert into bh_barhopping (user_name, chat_id) values ('".$GLOBALS['USER']."','".$GLOBALS['CHAT_ID_USER']."')") or die('Connection Error: ' . $db->connect_error);

    sendBarMenu ($db);
}

/*  НАЖАТИЕ КНОПКИ ОТМЕНА */
function sendCancel ($db) {

	setAction($db, "choose_bar");
    sendBarMenu ($db);
}

/* Получение списка баров со статусами прохождения */
function getStatusBar ($db) {

	$user = $GLOBALS['USER'];

    $_result = $db->query("select * from bh_barhopping where user_name='".$user."'") or
    die('Connection Error: ' . $db->connect_error);
    $bh_barhopping = getSet($_result);
	$user_info = $bh_barhopping[0];

    $_result = $db->query("select * from bh_bar bb where bb.is_actual = '1' ORDER BY bb.`type`") or
    die('Connection Error: ' . $db->connect_error);
    $bh_bar = getSet($_result);

	for ($i = 0; $i < count($bh_bar); $i++) {
		$type = $bh_bar[$i]["type"];
		$status = "";
		$column_status = "";
		switch ($type) {
                case 1:
                    $status = $user_info["bar1_status"];
                    $column_status = "bar1_status";
                    break;
                case 2:
                    $status = $user_info["bar2_status"];
                    $column_status = "bar2_status";
                    break;
                case 3:
                    $status = $user_info["bar3_status"];
                    $column_status = "bar3_status";
                    break;
                case 4:
                    $status = $user_info["bar4_status"];
                    $column_status = "bar4_status";
                    break;
                case 5:
                    $status = $user_info["bar5_status"];
                    $column_status = "bar5_status";
                    break;
                case 6:
                    $status = $user_info["bar6_status"];
                    $column_status = "bar6_status";
                    break;
                case 7:
                    $status = $user_info["bar7_status"];
                    $column_status = "bar7_status";
                    break;
                case 8:
                    $status = $user_info["bar8_status"];
                    $column_status = "bar8_status";
                    break;
                case 9:
                    $status = $user_info["bar9_status"];
                    $column_status = "bar9_status";
                    break;
                case 10:
                    $status = $user_info["bar10_status"];
                    $column_status = "bar10_status";
                    break;
            }
			$bh_bar[$i]["status"] = $status;
			$bh_bar[$i]["column_status"] = $column_status;
	}
    return $bh_bar;
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

/* ОТПРАВКА МЕНЮ КНОПОК С БАРАМИ */
function sendBarMenu ($db) {

	$user = $GLOBALS['USER'];
	$chat_id = $GLOBALS['CHAT_ID_USER'];
	$bars = getStatusBar ($db);
	$len = count($bars);
	$keyboard = array();
	$arr_row = array();
	$k = 0;
    for ($i = 0; $i < $len; $i++) {
        $button_text = "";

	    switch ($bars[$i]["status"]) {
	        case 'finish':
	            $button_text = "✅ ".$bars[$i]["name"];
	            break;
	        case 'start':
	            $button_text = "🍺 ".$bars[$i]["name"];
	            break;
			case 'empty':
	            $button_text = $bars[$i]["name"];
	            break;
	    }

		$k++;
	    if ($k < 3) {
			array_push($arr_row, $button_text);
		}
		else {
			array_push($keyboard, $arr_row);
			$arr_row = array($button_text);
			$k = 1;
		}
    }
    if ($k != 0)
        array_push($keyboard, $arr_row);

    $reply_markup = array(
        'keyboard' => $keyboard,
        'resize_keyboard' => true
    );

    $parameters = array(
        'chat_id' => $chat_id,
        'text' => "\n\nНажмите кнопку с баром ↓",
        'reply_markup' => json_encode($reply_markup)
    );
    sendTelegram('sendMessage', $parameters);

	setAction($db, "choose_bar");
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

/* НАЖАТИЕ КНОПКИ С БАРОМ */
function sendStartBar ($bar_name, $db, $not_finish) {

	if (empty($bar_name))
		return;

	$user = $GLOBALS['USER'];
	$bars = getStatusBar($db);

	//проверка на прохождение бара
	if ($not_finish == 0) {
		$is_exec_bar = 0;
		for ($i = 0; $i < count($bars); $i++) {
			if ($bars[$i]["name"] == $bar_name && $bars[$i]["status"] == 'finish') {
				$is_exec_bar = 1;
				break;
			}
		}

		if ($is_exec_bar == 1) {
			$reply_markup = array(
                'keyboard' => array( array('Обшибся', 'Хочу!')),
                'resize_keyboard' => true
            );
			$parameters = array(
                        'chat_id' => $GLOBALS["CHAT_ID_USER"],
                        'text' => "Бар ".$bar_name." уже пройден. Вы хотите пройти его ещё раз?",
                        'reply_markup' => json_encode($reply_markup)
                    );
			setAction($db, "choose_bar|".$bar_name);
            sendTelegram('sendMessage', $parameters);
            return;
		}
	}

    $reply_markup = array(
        'keyboard' => array( array('Назад в меню')),
        'resize_keyboard' => true
    );

	$bars = getStatusBar($db);
	$task_message = "";
	for ($i = 0; $i < count($bars); $i++) {
		if ($bars[$i]["name"] == $bar_name) {
			$task_message = strval($bars[$i]["task"]);
			$task_message = str_replace("n", "\n", $task_message);
			sendMessage("<b><u>".$bar_name."</u></b>\nадрес: ".$bars[$i]["address"]."\nрежим работы: ".$bars[$i]["time_work"]."\nсоц.сеть: ".$bars[$i]["inst"]);
			break;
		}
	}

	$parameters = array(
            'chat_id' => $GLOBALS["CHAT_ID_USER"],
            'parse_mode' => "HTML",
            'text' => $task_message,
            'reply_markup' => json_encode($reply_markup)
        );

    sendTelegram('sendMessage', $parameters);

    changeStatusBar ($db, $bar_name, "start");

    setAction($db, "choose_bar|".$bar_name);
}


/* ИЗМЕНЕНИЕ СТАТУСА СОСТОЯНИЯ БАРА */
function changeStatusBar ($db, $bar_name, $status) {

	$bars = getStatusBar($db);

	for ($i = 0; $i < count($bars); $i++) {
		if ($bars[$i]["name"] == $bar_name) {
			$type = $bars[$i]["type"];
			$db->query("update bh_barhopping set bar".$type."_status = '".$status."' where user_name='".$GLOBALS['USER']."'") or die('Connection Error: ' . $db->connect_error);
			break;
		}
	}
}

/* Отправка сообщения в Telegram */
function sendTelegram($method, $parameters, $headers = [])
{
	$token = $GLOBALS['TOKEN_USER'];
    $url = "https://api.telegram.org/bot" .$token. "/".$method;

    $options = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($parameters)
        )
    );

    $context = stream_context_create($options);
    file_get_contents($url, false, $context);
}

/* Отправка простого текстого сообщения в Telegram */
function sendMessage($message)
{
    $parameters = array(
        'chat_id' => $GLOBALS['CHAT_ID_USER'],
        'parse_mode' => "HTML",
        'text' => $message
    );

    sendTelegram('sendMessage', $parameters);
}

function sendPhoto ($token, $parameters) {

    $ch = curl_init('https://api.telegram.org/bot'.$token.'/sendPhoto');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $parameters);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_exec($ch);
    curl_close($ch);
}

?>


