<?php
//todo добавить отмену заказа при создании

    $data = json_decode(file_get_contents('php://input'), TRUE);
    $data = $data['callback_query'] ? $data['callback_query'] : $data['message'];

    define('TOKEN', '5334374924:AAGp4svOAUaD1GpGRyMMpGbsQLYP204k7mw');
    define('USER', $data['from']['first_name']." ".$data['from']['last_name']);
    define('GOOGLEKONTRG', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSckhCHjvZ1qeVSxVyL8rNnINeLpxCV1CT3TCCWOLVFVESHaAh--6UhmfpkIgS4s2yUQngJLGGVgmXx/pub?gid=0&single=true&output=csv');

    $message = mb_strtolower(($data['text'] ? $data['text'] : $data['data']),'utf-8');

    $method = 'sendMessage';
    $isSendMessage = true;
    $db = new mysqli("149.154.65.75:3306", "pet" ,"beetlecraft", "petbottle");

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
                $send_data = ['text' => getSklad($db)];
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

    /* Записывание лога в базу */
    function setLog($db, $mess) {
        $_result = $db->query("insert into logs(user, message, current) values ('" . USER . "','" . $mess . "', NOW())")
        			or die('Connection Error: ' . $db->connect_error);
    }

    /* Записывание последнего действия */
    function setAction($db, $action) {
        $db->query("delete from actions where user_name = '".USER."'") or
                                               die('Connection Error: ' . $db->connect_error);
        $db->query("insert into actions(user_name, last_action) values ('".USER."','".$action."')") or
                                           die('Connection Error: ' . $db->connect_error);
    }

    /* Записывание последнего действия */
    function getAction($db) {
        $_result = $db->query("select last_action from actions where user_name='".USER."'") or
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
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                $result = "Введите целое число";
                                break;
                            }
                            setAction ($db, "");
                            $result = addToSklad($db, $text_default, 5);
                            $result = "На складе: ".$result." бутылок 0.5 литра";
                            break;

            case '*0.5 литра':
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                $result = "Введите целое число";
                                break;
                            }
                            setAction ($db, "");
                            $result = inventrSklad($db, $text_default, 5);
                            $result = "На складе: ".$text_default." бутылок 0.5 литра. Инвентаризация закончена";
                            break;

            case '1 литр':
                if (!preg_match('/^\+?\d+$/', $text_default)) {
                    $result = "Введите целое число";
                    break;
                }
                setAction ($db, "");
                $result = addToSklad($db, $text_default, 1);
                $result = "На складе: ".$result." бутылок 1 литр";
                break;
            break;

            case '*1 литр':
                if (!preg_match('/^\+?\d+$/', $text_default)) {
                    $result = "Введите целое число";
                    break;
                }
                setAction ($db, "");
                $result = inventrSklad($db, $text_default, 1);
                $result = "На складе: ".$text_default." бутылок 1 литр. Инвентаризация закончена";
                break;
            break;

            case '1.5 литра':
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                 $result = "Введите целое число";
                                 break;
                            }
                            setAction ($db, "");
                            $result = addToSklad($db, $text_default, 15);
                            $result = "На складе: ".$result." бутылок 1.5 литра";
                            break;

            case '*1.5 литра':
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                 $result = "Введите целое число";
                                 break;
                            }
                            setAction ($db, "");
                            $result = inventrSklad($db, $text_default, 15);
                            $result = "На складе: ".$text_default." бутылок 1.5 литра. Инвентаризация закончена";
                            break;

            case '2 литра':
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                 $result = "Введите целое число";
                                 break;
                            }
                            setAction ($db, "");
                            $result = addToSklad($db, $text_default, 2);
                            $result = "На складе: ".$result." бутылок 2 литра";
                            break;

            case '*2 литра':
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                 $result = "Введите целое число";
                                 break;
                            }
                            setAction ($db, "");
                            $result = inventrSklad($db, $text_default, 2);
                            $result = "На складе: ".$text_default." бутылок 2 литра. Инвентаризация закончена";
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

    /* Создание нового заказа */
    function getNewZakaz ($db, $kontragent) {
        $_result = $db->query("select CreateNewZakaz('".$kontragent."') as num") or
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
                     return $set[0]["num"];
    }

    /* Добавление на склад */
    function addToSklad ($db, $count, $type) {

        $_result = $db->query("select AddToSklad(".$count.",".$type.") as l1") or
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

		 $t = "";
		 if ($type === 5)
		    $t = "0.5 литра";
		 else if ($type === 1)
		           $t = "1 литр";
		      else if ($type === 2)
		            $t = "2 литра";
		            else
		                $t = "1.5 литра";

         sendMessage("На склад добавлено: ".$count." бутылок ".$t);

         return $set[0]["l1"];
    }

    /* Инвентаризация на складе */
    function inventrSklad ($db, $count, $type) {

		$query = -1;
		$t = "";
		switch ($type) {

			case 5:
				$query = "UPDATE sklad SET l05 = ".$count." WHERE id = 1;";
				$t = "0.5 литра";
				break;

			case 1:
				$query = "UPDATE sklad SET l1 = ".$count." WHERE id = 1;";
				$t = "1 литр";
				break;

			case 15:
				$query = "UPDATE sklad SET l15 = ".$count." WHERE id = 1;";
				$t = "1.5 литра";
				break;

			case 2:
				$query = "UPDATE sklad SET l2 = ".$count." WHERE id = 1;";
				$t = "2 литра";
				break;
		}

		if ($query != -1) {

	        $_result = $db->query("CALL SaveStateToLogs ('".USER."')") or die('Connection Error: ' . $db->connect_error);
	        $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
			sendMessage("Проведена инвентаризация: Бутылок ".$t." ".$count." штук");
		}

		return 1;
    }

    /* Получение остатков на складе */
    function getSklad($db) {
        $_result = $db->query("select * from sklad where id = 1") or
                                                   die('Connection Error: ' . $db->connect_error);

                 $set = array();
                             $total_records = mysqli_num_rows($_result);
                             if($total_records >= 1){

                               while ($link = mysqli_fetch_array($_result)){
                                 $set[] = $link;
                               }
                             }
                             else
                                return '';

        $d05 = $set[0]['l05'] - $set[0]['l05r'];
        $d1 = $set[0]['l1'] - $set[0]['l1r'];
        $d15 = $set[0]['l15'] - $set[0]['l15r'];
        $d2 = $set[0]['l2'] - $set[0]['l2r'];

        $result = "На складе:\n";
        $result = $result."0.5:   ".$d05." шт [ всего ".$set[0]['l05']." шт, резерв ".$set[0]['l05r']." шт ]\n";
        $result = $result."1.0:   ".$d1." шт [ всего ".$set[0]['l1']." шт, резерв ".$set[0]['l1r']." шт ]\n";
        $result = $result."1.5:   ".$d15." шт [ всего ".$set[0]['l15']." шт, резерв ".$set[0]['l15r']." шт ]\n";
        $result = $result."2.0:   ".$d2." шт [ всего ".$set[0]['l2']." шт, резерв ".$set[0]['l2r']." шт ]";

        return $result;
    }

	function getRightForInventr ($db) {
		if (USER === 'Elena Albytova' || USER === 'Sergey Zheleznov')
			return 1;
		return 0;
	}

	function sendMessage ($text) {

		$data['chat_id'] = '@youpacklive';
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

?>