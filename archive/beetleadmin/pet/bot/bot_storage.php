<?php

    $data = json_decode(file_get_contents('php://input'), TRUE);

    // Сохраняем входные данные в файл
    // saveDataFromBotToFile ($data, 'userdata.txt');

    $data = $data['callback_query'] ? $data['callback_query'] : $data['message'];
    define('TOKEN', '6882002492:AAHwsWW_bEqKqQR5oQ8u90dK-DsqD4C6eeQ');
    define('USER', $data['from']['first_name'] . " " . $data['from']['last_name']);
    $message = mb_strtolower(($data['text'] ? $data['text'] : $data['data']),'utf-8');

    $method = 'sendMessage';
    $isSendMessage = true;
    $db = new mysqli("149.154.65.75:3306", "craft", "beetlecraft", "petdb");

    switch ($_POST["query"]) {

        		case "getActual":
        			getActual($db);
        			break;
    }

    switch ($message) {

        case '0.5 литра':

                setAction($db, '0.5 литра');
                $send_data = ['text' => 'Введите количество'];
                break;

        case '*0.5 литра':
                setAction($db, '*0.5 литра');
                $send_data = ['text' => 'Введите количество бутылок 0.5 литра на складе'];
                break;

        case '1 литр':
                setAction($db, '1 литр');
                $send_data = ['text' => 'Введите количество'];
                break;

        case '*1 литр':
                setAction($db, '*1 литр');
                $send_data = ['text' => 'Введите количество бутылок 1 литр на складе'];
                break;

        case '1.5 литра':
                setAction($db, '1.5 литра');
                $send_data = ['text' => 'Введите количество'];
                break;

        case '*1.5 литра':
                setAction($db, '*1.5 литра');
                $send_data = ['text' => 'Введите количество бутылок 1.5 литра на складе'];
                break;

        case '2 литра':
                setAction($db, '2 литра');
                $send_data = ['text' => 'Введите количество'];
                break;

        case '*2 литра':
                setAction($db, '*2 литра');
                $send_data = ['text' => 'Введите количество бутылок 2 литра на складе'];
                break;

        case '/avail':
                setAction($db, '');
                $send_data = ['text' => getStorage($db)];
                break;

    	case '/start':
    		$send_data = [
            			'text' => 'Добавить на склад:',
            			'reply_markup'  => [
            				'resize_keyboard' => true,
            				'keyboard' => [
            						[
            						    ['text' => '0.5 литра'],
            							['text' => '1 литр'],
            							['text' => '1.5 литра'],
                                        ['text' => '2 литра']
            						]
            					]
            				]
           	];
            break;

		case '/inventr':
			setAction($db, 'inventr');
			$is_right = getRightForInventr($db);
			if ($is_right === 1) {
				$send_data = [
								'text' => "Проверка прав пройдена",
								'reply_markup'  => [
                                            				'resize_keyboard' => true,
                                            				'keyboard' => [
                                            						[
                                            						    ['text' => '*0.5 литра'],
                                            							['text' => '*1 литр'],
                                            							['text' => '*1.5 литра'],
                                                                        ['text' => '*2 литра']
                                            						]
                                            					]
                                            				]
							  ];
			}
			else
				$send_data = ['text' => "У вас нет прав на выполнение этой операции"];

        	break;


        default:
            $isSendMessage = false;
            $last_action = getAction($db);
            processDefault ($message, $last_action, $db, $data['chat'] ['id']);
    }

    $send_data['chat_id'] = $data['chat'] ['id'];
    $send_data['parse_mode'] = "HTML";

    if ($isSendMessage === true) {
        $res = sendTelegram($method, $send_data);
    }

    /* Отправка сообщения в Telegram */
    function sendTelegram($method, $data, $headers = [])
    {
    	$curl = curl_init();
    	curl_setopt_array($curl, [
    		CURLOPT_POST => 1,
    		CURLOPT_HEADER => 0,
    		CURLOPT_RETURNTRANSFER => 1,
    		CURLOPT_URL => 'https://api.telegram.org/bot' . TOKEN . '/' . $method,
    		CURLOPT_POSTFIELDS => json_encode($data),
    		CURLOPT_HTTPHEADER => array_merge(array("Content-Type: application/json"))
    	]);
    	$result = curl_exec($curl);
    	curl_close($curl);
    	return (json_decode($result, 1) ? json_decode($result, 1) : $result);
    }

    /* Записывание последнего действия */
    function setAction($db, $action) {
        $db->query("delete from action where user_name = '".USER."'") or
                                               die('Connection Error: ' . $db->connect_error);
        $db->query("insert into action (user_name, last_action) values ('".USER."','".$action."')") or
                                           die('Connection Error: ' . $db->connect_error);
    }

    /* Записывание последнего действия */
    function getAction($db) {

        $_result = $db->query("select last_action from action where user_name='".USER."'") or
                               die('Connection Error: ' . $db->connect_error);

             $set = array();
             $total_records = mysqli_num_rows($_result);
             if($total_records >= 1){

               while ($link = mysqli_fetch_array($_result)){
                 $set[] = $link;
               }
             }
             else
                return -1;

             return $set[0]["last_action"];
    }

    /* Выбор действия при вводе произвольных значений */
    function processDefault ($text_default, $last_action, $db, $chat_id) {
        $result = "";
        $actions = explode("|", $last_action);
        $send_data['chat_id'] = $chat_id;

        switch ($actions[0]) {

            case '0.5 литра':
            case '1 литр':
            case '1.5 литра':
            case '2 литра':
                $result = addToStorage($db, $text_default, $last_action);
                break;


            case '*0.5 литра':
            case '*1 литр':
            case '*1.5 литра':
            case '*2 литра':
                $result = inventrStorage($db, $text_default, $last_action);
                break;
        }

		if ($actions[0] === "*0.5 литра" || $actions[0] === "*1 литр" || $actions[0] === "*1.5 литра" || $actions[0] === "*2 литра") {

			$send_data = [
                        			'text' => $result,
                        			'chat_id' => $chat_id,
                        			'reply_markup'  => [
                        				'resize_keyboard' => true,
                        				'keyboard' => [
                        						[
                        						    ['text' => '0.5 литра'],
                        							['text' => '1 литр'],
                        							['text' => '1.5 литра'],
                                                    ['text' => '2 литра']
                        						]
                        					]
                        				]
                       	];
		}
		else
		   $send_data['text'] = $result;

        sendTelegram('sendMessage', $send_data);

    }

    /* Добавление на склад */
    function addToStorage ($db, $count, $type) {

        if (!preg_match('/^-?\d+$/', $count))
                   return "Введите целое число";

                setAction ($db, "");
                $result = db_addtostorage($db, $count, $type);

        return "Добавлено. На складе: ".$result." бутылок ".$type;
    }

    /* Работа с базой. Добавление на склад */
    function db_addtostorage($db, $count, $type) {

        $_result = $db->query("select storage_add('".$type."',".$count.") as l1") or
                                           die('Connection Error: ' . $db->connect_error);

         $set = array();
                     $total_records = mysqli_num_rows($_result);
                     if($total_records >= 1){

                       while ($link = mysqli_fetch_array($_result)){
                         $set[] = $link;
                       }
                     }
                     else
                        return -1;

         sendMessage("На склад добавлено ".$count." бутылок ".$type. ". Всего ".$set[0][0]." штук");

         return $set[0][0];
    }

    /* Инвентаризация на складе */
    function inventrStorage ($db, $count, $type) {

            if (!$count) $count = 0;

                            if (!preg_match('/^\d+$/', $count)) {
                                return "Введите целое число";
                            }
                            setAction ($db, "");

                            $trimmed = trim($type, "*");
                            $result = db_inventrstorage($db, $count, $trimmed);
                            sendMessage("Инвентаризация окончена. На складе ".$count." бутылок ".$trimmed);

         return "Инвентаризация окончена. На складе: ".$result." бутылок ".$trimmed;
    }

    /* Работа с базой. Инвентаризация на складе */
    function db_inventrstorage ($db, $count, $type) {
		$_result = $db->query("select storage_inventr('".$type."',".$count.") as l1") or
                                                   die('Connection Error: ' . $db->connect_error);

                 $set = array();
                             $total_records = mysqli_num_rows($_result);
                             if($total_records >= 1){

                               while ($link = mysqli_fetch_array($_result)){
                                 $set[] = $link;
                               }
                             }
                             else
                                return -1;

                 return $set[0][0];
    }

    /* Получение остатков на складе */
    function getStorage($db) {
        $_result = $db->query("select * from storage_get_bottle") or
                                                   die('Connection Error: ' . $db->connect_error);


        $set = array();
       		$total_records = mysqli_num_rows($_result);
       		if ($total_records >= 1) {
       			while ($link = mysqli_fetch_array($_result)) {
       				$set[] = $link;
       			}
       		} else return '';

       		$len = count($set);
       		$result = "";
       		$av = 0;
       		for ($i = 0; $i < $len; $i++) {
       			$result = $result . "\n";
                $av = $set[$i]['all'] - $set[$i]['reserv'];
                $result = $result.$set[$i]['dist'].":   ".$av." шт [ всего ".$set[$i]['all']." шт, резерв ".$set[$i]['reserv']." шт ]";
       		}

        return $result;
    }

	function getRightForInventr ($db) {
		if (USER === 'Elena Albytova' )
			return 1;
		return 0;
	}

	function sendMessage ($text) {

		$data['chat_id'] = '@beetlepet_news';
		$data['text'] = $text;

		$curl = curl_init();
    	curl_setopt_array($curl, [
    		CURLOPT_POST => 1,
    		CURLOPT_HEADER => 0,
    		CURLOPT_RETURNTRANSFER => 1,
    		CURLOPT_URL => 'https://api.telegram.org/bot' . TOKEN . '/sendMessage',
    		CURLOPT_POSTFIELDS => json_encode($data),
    		CURLOPT_HTTPHEADER => array_merge(array("Content-Type: application/json"))
    	]);
    	$result = curl_exec($curl);
    	curl_close($curl);
	}

    /* СОХРАНИТЬ ДАННЫЕ ИЗ БОТА В ФАЙЛ */
    function saveDataFromBotToFile ($data, $file_name) {
        $appdata = print_r($data, true);
        file_put_contents($file_name, "Данные от бота: $appdata", FILE_APPEND);
    }
?>