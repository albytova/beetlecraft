<?php
	//todo добавить отмену заказа при создании
	//при отмене заказа не обнуляется резерв
	$data = json_decode(file_get_contents('php://input'), TRUE);
	$data1 = $data;

	$data = $data['callback_query'] ? $data['callback_query'] : $data['message'];

    const TOKEN = '5551790894:AAEoHHTbV5q02jXZ-RncsgwznDkjKAy6g08';
	define('USER', $data['from']['first_name'] . " " . $data['from']['last_name']);
    const GOOGLEKONTRG = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSckhCHjvZ1qeVSxVyL8rNnINeLpxCV1CT3TCCWOLVFVESHaAh--6UhmfpkIgS4s2yUQngJLGGVgmXx/pub?gid=0&single=true&output=csv';

	$message = mb_strtolower(($data['text'] ? $data['text'] : $data['data']), 'utf-8');

	$method = 'sendMessage';
	$isSendMessage = true;
	$db = new mysqli("149.154.65.75:3306", "pet", "beetlecraft", "petbottle");

	switch ($message) {

		case 'заказы':
			$send_data = ['text' => getZakazes($db)];
			break;

		case 'удалить':
			setAction($db, 'удалить заказ');
			$send_data = ['text' => 'Введите номер заказа, который нужно удалить'];
			break;

		case 'добавить':
			setAction($db, 'выберите контрагента');
			$send_data = [
				'text' => 'Выберите контрагента',
				'reply_markup' => [
					'resize_keyboard' => true,
					'keyboard' => getKontragetsBtn()
				]
			];
			break;

		case 'готово':

			$last_action = getAction($db);
            $actions = explode("|", $last_action);
            $num = $actions[1];
            $db->query("CALL ReservOnSklad('" . $num . "')");
            setAction($db, "");

            $resultText = "Создан заказ ".$num;
            $zakazInfo = getShipMinInfo($db, $num);

            sendMessage($resultText);
            sendMessage($zakazInfo);

			$send_data = [
				'text' => "Создан заказ ".$num,
				'reply_markup' => [
					'resize_keyboard' => true,
					'inline_keyboard' => [
						[
							['text' => 'Добавить'],
							['text' => 'Удалить'],
							['text' => 'Заказы']
						]
					]
				]
			];
			break;

		case 'отмена':
			$last_action = getAction($db);
            $actions = explode("|", $last_action);
            $num = $actions[1];
            $db->query("CALL DeleteZakaz('" . $num . "')");
            setAction($db, "");

			$send_data = [
	            'text' => 'Создание заказа №'.$num.' отменено',
	            'reply_markup' => [
	                'resize_keyboard' => true,
	                'keyboard' => [
	                    [
	                        ['text' => 'Добавить'],
	                        ['text' => 'Удалить'],
	                        ['text' => 'Заказы']
	                    ]
	                ]
	            ]
	        ];
			break;

		case '/reserv':
			$send_data = [
				'text' => 'Выберите действие',
				'reply_markup' => [
					'resize_keyboard' => true,
					'keyboard' => [
                    	                    [
                    	                        ['text' => 'Добавить'],
                    	                        ['text' => 'Удалить'],
                    	                        ['text' => 'Заказы']
                    	                    ]
                    	                ]
				]
			];
			break;

		case '/sell':

			setAction($db, "ship");

			$send_data = [
				'text' => 'Выберите заказ',
				'reply_markup' => [
					'resize_keyboard' => true,
					'keyboard' => getShipmentsBtn($db)
				]
			];
			break;

		case '+0.5':
			$isSendMessage = true;
			$last_action = getAction($db);
			$actions = explode("|", $last_action);
			$num = $actions[1];
			$send_data =  ['text' => "Введите количество"];
			setAction($db, "new_zakaz_05|" . $num);
			break;

		case '+1':
			$isSendMessage = true;
			$last_action = getAction($db);
			$actions = explode("|", $last_action);
			$num = $actions[1];
			$send_data =  ['text' => "Введите количество"];
			setAction($db, "new_zakaz_10|" . $num);
			break;

		case '+1.5':
			$isSendMessage = true;
			$last_action = getAction($db);
			$actions = explode("|", $last_action);
			$num = $actions[1];
			$send_data =  ['text' => "Введите количество"];
			setAction($db, "new_zakaz_15|" . $num);
			break;

		case '+2':
			$isSendMessage = true;
			$last_action = getAction($db);
			$actions = explode("|", $last_action);
			$num = $actions[1];
			$send_data =  ['text' => "Введите количество"];
			setAction($db, "new_zakaz_2|" . $num);
			break;

		case 'примечание':
			$isSendMessage = true;
			$last_action = getAction($db);
			$actions = explode("|", $last_action);
			$num = $actions[1];
			$send_data =  ['text' => "Введите примечание"];
			setAction($db, "new_zakaz_comment|" . $num);
			break;

		case 'выполнено':

			$isSendMessage = true;
			$last_action = getAction($db);
			$actions = explode("|", $last_action);
			$num = $actions[1];

			$send_data = [
				'text' => 'Отметить заказ №'.$num. " выполненным?",
				'reply_markup' => [
					'resize_keyboard' => true,
					'keyboard' => [
                                                      	                    [
                                                      	                        ['text' => 'Да']
                                                      	                    ]
                                  ]
                ]
			];

			break;

		case 'да':

        			$isSendMessage = true;
        			$last_action = getAction($db);
        			$actions = explode("|", $last_action);
        			$num = $actions[1];
        			setExecZakaz($db, $num);
					$send_data = [
                    				'text' => 'Готово',
                    				'reply_markup' => [
                    					'resize_keyboard' => true,
                    					'keyboard' => getShipmentsBtn($db)
                    				]
                    			];
					setAction($db, "");

        	break;

		case 'подробнее':

        			$isSendMessage = true;
        			$last_action = getAction($db);
        			$actions = explode("|", $last_action);
        			$num = $actions[1];

					$send_data = [
                    				'text' => getShipMaxInfo($db, $num)
                    			];
        	break;

		case 'расчёт':

        			$isSendMessage = true;
        			$last_action = getAction($db);
        			$actions = explode("|", $last_action);
        			$num = $actions[1];

					$send_data = [
                    				'text' => getShipCalculate($db, $num)
                    			];
        	break;

		default:

			$isSendMessage = false;
			$last_action = getAction($db);
			processDefault($message, $last_action, $db, $data['chat']['id']);
	}

	$send_data['chat_id'] = $data['chat']['id'];
	$send_data['parse_mode'] = "HTML";

	if ($isSendMessage === true) {
		$res = sendTelegram($method, $send_data);
	}

    /* СОХРАНИТЬ ДАННЫЕ ИЗ БОТА В ФАЙЛ */
    function saveDataFromBotToFile ($data, $file_name) {
        $appdata = print_r($data, true);
        file_put_contents($file_name, "Данные от бота: $appdata", FILE_APPEND);
    }

    /* Отправка сообщения в Telegram */
	function sendTelegram($method, $data, $headers = [])
	{
		$curl = curl_init();
		curl_setopt_array(
			$curl,
			[
				CURLOPT_POST => 1,
				CURLOPT_HEADER => 0,
				CURLOPT_RETURNTRANSFER => 1,
				CURLOPT_URL => 'https://api.telegram.org/bot' . TOKEN . '/' . $method,
				CURLOPT_POSTFIELDS => json_encode($data),
				CURLOPT_HTTPHEADER => array_merge(array("Content-Type: application/json"))
			]
		);
		$result = curl_exec($curl);
		curl_close($curl);
		return (json_decode($result, 1) ? json_decode($result, 1) : $result);
	}

	/* Записывание лога в базу */
	function setLog($db, $mess)
	{
		$_result = $db->query("insert into logs(user, message, current) values ('" . USER . "','" . $mess . "', NOW())")
			or die('Connection Error: ' . $db->connect_error);
	}

	/* Записывание последнего действия */
	function setAction($db, $action)
	{
		$db->query("delete from actions where user_name = '" . USER . "'")
			or die('Connection Error: ' . $db->connect_error);
		$db->query("insert into actions(user_name, last_action) values ('" . USER . "','" . $action . "')")
			or die('Connection Error: ' . $db->connect_error);
	}

	/* Записывание последнего действия */
	function getAction($db)
	{
		$_result = $db->query("select last_action from actions where user_name='" . USER . "'")
			or die('Connection Error: ' . $db->connect_error);

		$set = array();
		$total_records = mysqli_num_rows($_result);
		if ($total_records >= 1) {
			while ($link = mysqli_fetch_array($_result)) {
				$set[] = $link;
			}
		} else return -1;

		return $set[0]["last_action"];
	}

	/* Выбор действия при вводе произвольных значений */
	function processDefault($text_default, $last_action, $db, $chat_id)
	{
		$result = "";
		$actions = explode("|", $last_action);
		$send_data['chat_id'] = $chat_id;
		$send_data['parse_mode'] = "HTML";

		switch ($actions[0]) {

			case 'ship':
				$dd = explode(": ", $text_default);
				$result = getShipMinInfo($db, $dd[1]);

				setAction($db, "choose_ship|" . $dd[1]);

				$send_data['reply_markup'] = [
					'resize_keyboard' => true,
					'keyboard' => [
						[
							['text' => 'Выполнено'],
							['text' => 'Подробнее'],
                            ['text' => 'Расчёт']
						]
					]
				];
				break;

			case 'выберите контрагента':
				$num = getNewZakaz($db, $text_default);
				$result = "Создан заказ №" . $num;

				setAction($db, "new_zakaz|" . $num);

				$send_data['reply_markup'] = [
					'resize_keyboard' => true,
					'keyboard' => [
						[
							['text' => '+0.5'],
							['text' => '+1'],
							['text' => '+1.5'],
                            ['text' => '+2']
						],
						[
							['text' => 'Примечание'],
							['text' => 'Готово'],
							['text' => 'Отмена']
						]
					]
				];
				break;

			case 'new_zakaz_05':
				if (!empty($text_default) && !preg_match('/^\+?\d+$/', $text_default)) {
					$result = "Введите целое число";
					break;
				}
				$num = $actions[1];
				$db->query("update reserv set count_l05=" . $text_default . " where num='" . $num . "'");
				$result = "В заказ №" . $num . " добавлено " . $text_default . " бутылок 0.5 литра";
				setAction($db, "new_zakaz|" . $num);
				$send_data['reply_markup'] = [
					'resize_keyboard' => true,
					'keyboard' => [
						[
							['text' => '+0.5'],
							['text' => '+1'],
							['text' => '+1.5'],
                            ['text' => '+2']
						],
						[
							['text' => 'Примечание'],
							['text' => 'Готово'],
							['text' => 'Отмена']
						]
					]
				];
				break;

			case 'new_zakaz_10':
				if (!empty($text_default) && !preg_match('/^\+?\d+$/', $text_default)) {
					$result = "Введите целое число";
					break;
				}
				$num = $actions[1];
				$db->query("update reserv set count_l1=" . $text_default . " where num='" . $num . "'");
				$result = "В заказ №" . $num . " добавлено " . $text_default . " бутылок 1 литр";
				setAction($db, "new_zakaz|" . $num);
				$send_data['reply_markup'] = [
					'resize_keyboard' => true,
					'keyboard' => [
						[
							['text' => '+0.5'],
							['text' => '+1'],
							['text' => '+1.5'],
                            ['text' => '+2']
						],
						[
							['text' => 'Примечание'],
							['text' => 'Готово'],
							['text' => 'Отмена']
						]
					]
				];
				break;

			case 'new_zakaz_15':
				if (!empty($text_default) && !preg_match('/^\+?\d+$/', $text_default)) {
					$result = "Введите целое число";
					break;
				}
				$num = $actions[1];
				$db->query("update reserv set count_l15=" . $text_default . " where num='" . $num . "'");
				$result = "В заказ №" . $num . " добавлено " . $text_default . " бутылок 1.5 литра";
				setAction($db, "new_zakaz|" . $num);

				$send_data['reply_markup'] = [
					'resize_keyboard' => true,
					'keyboard' => [
						[
							['text' => '+0.5'],
							['text' => '+1.0'],
							['text' => '+1.5'],
                            ['text' => '+2']
						],
						[
							['text' => 'Примечание'],
							['text' => 'Готово'],
							['text' => 'Отмена']
						]
					]
				];
				break;

			case 'new_zakaz_2':
				if (!empty($text_default) && !preg_match('/^\+?\d+$/', $text_default)) {
					$result = "Введите целое число";
					break;
				}
				$num = $actions[1];
				$db->query("update reserv set count_l2=" . $text_default . " where num='" . $num . "'");
				$result = "В заказ №" . $num . " добавлено " . $text_default . " бутылок 2 литра";
				setAction($db, "new_zakaz|" . $num);

				$send_data['reply_markup'] = [
					'resize_keyboard' => true,
					'keyboard' => [
						[
							['text' => '+0.5'],
							['text' => '+1.0'],
							['text' => '+1.5'],
                            ['text' => '+2']
						],
						[
							['text' => 'Примечание'],
							['text' => 'Готово'],
							['text' => 'Отмена']
						]
					]
				];
				break;

			case 'new_zakaz_comment':
				$num = $actions[1];
				$db->query("update reserv set comment='" . $text_default . "' where num='" . $num . "'");
				$result = "В заказ №" . $num . " добавлено примечание: " . $text_default;
				setAction($db, "new_zakaz|" . $num);

				$send_data['reply_markup'] = [
					'resize_keyboard' => true,
					'keyboard' => [
						[
							['text' => '+0.5'],
							['text' => '+1.0'],
							['text' => '+1.5'],
                            ['text' => '+2']
						],
						[
							['text' => 'Примечание'],
							['text' => 'Готово'],
							['text' => 'Отмена']
						]
					]
				];
				break;

			case 'удалить заказ':
				if (!preg_match('/^\+?\d+$/', $text_default)) {
					$result = "Введите целое число";
					break;
				}

				$mess = getZakazName($db, $text_default);
				$db->query("CALL DeleteZakaz('" . $text_default . "')");

				sendMessage("Удален заказ №".$text_default."\n".$mess);
                $result = "Готово";
                setAction($db, "");

				break;
		}

		$send_data['text'] = $result;
		sendTelegram('sendMessage', $send_data);
	}

	/* Создание нового заказа */
	function getNewZakaz($db, $kontragent)
	{
		$_result = $db->query("select CreateNewZakaz('" . $kontragent . "') as num")
			or die('Connection Error: ' . $db->connect_error);
        //saveDataFromBotToFile ("select CreateNewZakaz('" . $kontragent . "') as num", "appdata.txt");
		$set = array();
		$total_records = mysqli_num_rows($_result);
		if ($total_records >= 1) {
			while ($link = mysqli_fetch_array($_result)) {
				$set[] = $link;
			}
		} else return -1;
		return $set[0]["num"];
	}

	/* Удаление заказа */
	function getZakazName ($db, $num)
	{

		$_result = $db->query("SELECT * FROM reserv WHERE is_exec = 0 and reserv.num = ".$num)
            			or die('Connection Error: ' . $db->connect_error);

            		$set = array();
            		$total_records = mysqli_num_rows($_result);
            		if ($total_records >= 1) {
            			while ($link = mysqli_fetch_array($_result)) {
            				$set[] = $link;
            			}
            		} else return '';

        $result = $set[0]['kontragent']." [".$set[0]['date_reserv']."]";

    	return $result;
	}

	/* Чтение списка контрагентов из Google-таблицы и возвращение его в виде кнопок */
	function getKontragetsBtn()
	{
		$handle = fopen(GOOGLEKONTRG, "r");
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
			$kdata[] = $data;
		}
		fclose($handle);

		$len = count($kdata);
		$res = array();
		$result = array();
		$k = -1;
		for ($i = 1; $i < $len; $i++) {
			if (empty($kdata[$i][1]) != 1) {
				if ($k++ === 3) {
					$k = 0;
					array_push($res, $result);
					$result = array();
				}

				array_push($result, ['text' => $kdata[$i][1]]);
			}
		}

		array_push($res, $result);

		return $res;
	}


	/* Чтение списка заказов и возвращение его в виде кнопок */
    	function getShipmentsBtn($db)
    	{

			$_result = $db->query("SELECT * FROM reserv WHERE is_exec = 0")
				or die('Connection Error: ' . $db->connect_error);

			$set = array();
			$total_records = mysqli_num_rows($_result);
			if ($total_records >= 1) {
				while ($link = mysqli_fetch_array($_result)) {
					$set[] = $link;
				}
			};

			$len = count($set);
    		$res = array();
    		$result = array();
    		$k = -1;

			for ($i = 0; $i < $len; $i++) {

    				if ($k++ === 2) {
    					$k = 0;
    					array_push($res, $result);
    					$result = array();
    				}

    				array_push($result, ['text' => $set[$i]['kontragent'].": ".$set[$i]['num'] ]);
			}

    		array_push($res, $result);
    		return $res;
    	}


	/* Получение списка невыполненных заказов */
	function getZakazes($db)
	{
		$_result = $db->query("SELECT * FROM reserv WHERE is_exec = 0")
			or die('Connection Error: ' . $db->connect_error);

		$set = array();
		$total_records = mysqli_num_rows($_result);
		if ($total_records >= 1) {
			while ($link = mysqli_fetch_array($_result)) {
				$set[] = $link;
			}
		} else return '';

		$len = count($set);
		$result = "";
		$text = "";
		for ($i = 0; $i < $len; $i++) {
			$result = $result . "\n";

			$kntr = strtoupper($set[$i]['kontragent']);
			$result = "" . $result . $kntr . " [" . $set[$i]['date_reserv'] . "]";
			$result = $result . "\n<pre>0.5л: " . $set[$i]['count_l05'];
			$result = $result . "\n1.0л: " . $set[$i]['count_l1'];
			$result = $result . "\n1.5л: " . $set[$i]['count_l15'];
			$result = $result . "\n2.0л: " . $set[$i]['count_l2'];
			$result = $result . "\nномер заказа №" . $set[$i]['num'];
			$result = $result . "\nПримечание: " . $set[$i]['comment'] . "</pre>\n";
		}

		return $result;
	}

	function getShipMinInfo($db, $num) {
		$_result = $db->query("SELECT * FROM reserv WHERE reserv.num = ".$num)
        			or die('Connection Error: ' . $db->connect_error);

        		$set = array();
        		$total_records = mysqli_num_rows($_result);
        		if ($total_records >= 1) {
        			while ($link = mysqli_fetch_array($_result)) {
        				$set[] = $link;
        			}
        		} else return '';

        		$result = "";

           			$kntr = strtoupper($set[0]['kontragent']);
        			$result = "" . $result . $kntr . " [" . $set[0]['date_reserv'] . "]";
        			$result = $result . "\n<pre>0.5л: " . $set[0]['count_l05'];
        			$result = $result . "\n1.0л: " . $set[0]['count_l1'];
        			$result = $result . "\n1.5л: " . $set[0]['count_l15'];
        			$result = $result . "\n2.0л: " . $set[0]['count_l2'];
        			$result = $result . "\nномер заказа №" . $set[0]['num'];
        			$result = $result . "\nПримечание: " . $set[0]['comment'] . "</pre>\n";


        		return $result;
    }

    function getShipMaxInfo ($db, $num) {
		$_result = $db->query("SELECT kontragent FROM reserv WHERE reserv.is_exec = 0 and reserv.num = ".$num)
        			or die('Connection Error: ' . $db->connect_error);

        $set = array();
        $total_records = mysqli_num_rows($_result);
        if ($total_records >= 1) {
        	while ($link = mysqli_fetch_array($_result)) {
        		$set[] = $link;
        	}
        }
        else return '';

		$kntr = $set[0]['kontragent'];

				$handle = fopen(GOOGLEKONTRG, "r");
        		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        			$kdata[] = $data;
        		}
        		fclose($handle);

        		$len = count($kdata);
        		$result = "";
        		for ($i = 1; $i < $len; $i++) {

        		    if (mb_strtolower($kdata[$i][1]) === $kntr) {

        		        $result = "<b>".$kdata[$i][1]."</b>";
						$result = $result."\nЮр.название: ".$kdata[$i][2];
						$result = $result."\nКонтактное лицо: ".$kdata[$i][3]." ".$kdata[$i][4];
						$result = $result."\nТип оплаты: ".$kdata[$i][5];
						$result = $result."\nКрышки: <b>".$kdata[$i][13]."</b>";
						$result = $result."\nАдрес: ".$kdata[$i][6]."";
						$result = $result."\n\nМенеджер: ".$kdata[$i][0].", ".$kdata[$i][11].", ".$kdata[$i][12];
        		        break;
        		    }

        		}


        return $result;
    }

    function getShipCalculate ($db, $num) {
    		$_result = $db->query("SELECT kontragent, count_l05, count_l1, count_l15, count_l2 FROM reserv WHERE reserv.is_exec = 0 and reserv.num = ".$num)
            			or die('Connection Error: ' . $db->connect_error);

            $set = array();
            $total_records = mysqli_num_rows($_result);
            if ($total_records >= 1) {
            	while ($link = mysqli_fetch_array($_result)) {
            		$set[] = $link;
            	}
            }
            else return '';

    		$kntr = $set[0]['kontragent'];
    		$count05 = $set[0]['count_l05'];
    		$count1 = $set[0]['count_l1'];
    		$count15 = $set[0]['count_l15'];
    		$count2 = $set[0]['count_l2'];

    				$handle = fopen(GOOGLEKONTRG, "r");
            		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            			$kdata[] = $data;
            		}
            		fclose($handle);

            		$len = count($kdata);
            		$result = "";
            		for ($i = 1; $i < $len; $i++) {

            		    if (mb_strtolower($kdata[$i][1]) === $kntr) {
							$rez1 = 0; $rez2 = 0; $rez3 = 0; $rez4 = 0; $itogo = 0;

							if ($count05 > 0) {
								$rez1 = $kdata[$i][7] * $count05;
								$result = $result."\n0.5 литра: ".$kdata[$i][7]." * ".$count05." = ".$rez1." руб";
								$itogo = $itogo + $rez1;
							}

							if ($count1 > 0) {
								$rez2 = $kdata[$i][8] * $count1;
								$result = $result."\n1 литр: ".$kdata[$i][8]." * ".$count1." = ".$rez2." руб";
								$itogo = $itogo + $rez2;
							}

							if ($count15 > 0) {
								$rez3 = $kdata[$i][9] * $count15;
								$result = $result."\n1.5 литра: ".$kdata[$i][9]." * ".$count15." = ".$rez3." руб";
								$itogo = $itogo + $rez3;
							}

							if ($count2 > 0) {
								$rez4 = $kdata[$i][10] * $count2;
								$result = $result."\n2 литра: ".$kdata[$i][10]." * ".$count2." = ".$rez4." руб";
								$itogo = $itogo + $rez4;
							}

							if ($itogo > 0) {
								$result = $result."\nИтого: ".$itogo." руб";
							}
    						break;
            		    }

            		}


            return $result;
        }

	function setExecZakaz ($db, $num) {
		$mess = getZakazName($db, $num);

		$_result = $db->query("CALL ExecZakaz('" . $num . "')")
    			or die('Connection Error: ' . $db->connect_error);
        sendMessage("Заказ $num выполнен\n".$mess);
	}

	function sendMessage ($text) {

		$data['chat_id'] = '@youpacklive';
		$data['parse_mode'] = "HTML";
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