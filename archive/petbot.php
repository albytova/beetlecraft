<?php
//todo добавить отмену заказа при создании
//связь резерва со складом
    $data = json_decode(file_get_contents('php://input'), TRUE);
    $data1 = $data;

    $data = $data['callback_query'] ? $data['callback_query'] : $data['message'];
   // define('TOKEN', '5422293676:AAEjnWjEC_3pflbwbrBxPZuDjyBKaogXlrQ');
    define('TOKEN', '5431539744:AAHRG169zfN2irRk4VtpdNqG9LK4PFvB1YI');

    define('USER', $data['from']['first_name']." ".$data['from']['last_name']);
    define('GOOGLEKONTRG', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSckhCHjvZ1qeVSxVyL8rNnINeLpxCV1CT3TCCWOLVFVESHaAh--6UhmfpkIgS4s2yUQngJLGGVgmXx/pub?gid=0&single=true&output=csv');
    define('COMMANDS', array (
        "A1" => "1 литр",
        "A2" => "1.5 литра",
        "A3" => "отметить выполнение",
        "A4" => "контрагенты",
        "A5" => "заказы",
        "A6" => "остатки",
        "A7" => "добавить заказ",
    ));

    $message = mb_strtolower(($data['text'] ? $data['text'] : $data['data']),'utf-8');

    $method = 'sendMessage';
    $isSendMessage = true;
    $db = new mysqli("149.154.65.75:3306", "pet" ,"beetlecraft", "petbottle");

    switch ($message) {
        case 'контрагенты':
                $send_data = ['text' => getKontragets()];
                    break;

        case 'невыполненные заказы':
                $send_data = ['text' => getZakazes($db)];
                    break;

        case '0.5 литра':
                setAction($db, '0.5 литра');
                $send_data = ['text' => 'Введите количество'];
                break;

        case '1 литр':
                setAction($db, '1 литр');
                $send_data = ['text' => 'Введите количество'];
                break;

        case '1.5 литра':
                setAction($db, '1.5 литра');
                $send_data = ['text' => 'Введите количество'];
                break;

        case 'удалить заказ':
                        setAction($db, 'удалить заказ');
                        $send_data = ['text' => 'Введите номер заказа, который нужно удалить'];
                        break;

        case 'остатки':
                setAction($db, '');
                $send_data = ['text' => getSklad($db)];
                break;

        case 'добавить заказ':
                setAction($db, 'выберите контрагента');
                $send_data = [
                    'text' => 'Выберите контрагента',
                    'reply_markup'  => [
            				'resize_keyboard' => true,
            				'keyboard' => getKontragetsBtn()
            	    ]
                ];
                break;

    	case '/sklad':
    		$send_data = [
            			'text' => 'Добавить на склад:',
            			'reply_markup'  => [
            				'resize_keyboard' => true,
            				'keyboard' => [
            						[
            						    ['text' => '0.5 литра'],
            							['text' => '1 литр'],
            							['text' => '1.5 литра'],
            							['text' => 'Остатки']
            						]
            					]
            				]
           	];
            break;
    	case '/reserv':
    		$send_data = [
                                     			'text' => 'Резерв:',
                                     			'reply_markup'  => [
                                     				'resize_keyboard' => true,
                                     				'keyboard' => [
                                     						[
                                     							['text' => 'Добавить заказ'],
                                     							//['text' => 'Контрагенты'],

                                     							['text' => 'Удалить заказ']
                                     						],
                                     						[
                                     						    ['text' => 'Невыполненные заказы']
                                     						]
                                     					]
                                     				]
                                     			];
        break;
    	case '/sell':
    		$send_data =  [
                                                              			'text' => 'Отгрузка:',
                                                              			'reply_markup'  => [
                                                              				'resize_keyboard' => true,
                                                              				'keyboard' => [
                                                              						[
                                                              							['text' => 'Отметить выполнение'],
                                                              							['text' => 'Отгрузки']
                                                              						]
                                                              					]
                                                              				]
                                                              			];
        break;

        case '+0.5':
                            $isSendMessage = true;
                            $last_action = getAction($db);
                            $actions = explode("|", $last_action);
                            $num = $actions[1];
                            $send_data =  ['text' =>  "Введите количество"];
                            setAction ($db, "new_zakaz_05|".$num);
                            break;

        case '+1.0':
                            $isSendMessage = true;
                            $last_action = getAction($db);
                            $actions = explode("|", $last_action);
                            $num = $actions[1];
                            $send_data =  ['text' =>  "Введите количество"];
                            setAction ($db, "new_zakaz_10|".$num);
                            break;

        case '+1.5':
                            $isSendMessage = true;
                            $last_action = getAction($db);
                            $actions = explode("|", $last_action);
                            $num = $actions[1];
                            $send_data =  ['text' =>  "Введите количество"];
                            setAction ($db, "new_zakaz_15|".$num);
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
        $_result = $db->query("insert into logs(user, message) values ('".USER."','".$mess."')") or
                                           die('Connection Error: ' . $db->connect_error);
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
                            setLog($db, "Добавление на склад: 0.5 литра - ".$text_default." штук");
                            $result = addToSklad($db, $text_default, 5);
                            $result = "На складе: ".$result." поллитрушек";
                            break;

            case '1 литр':
                if (!preg_match('/^\+?\d+$/', $text_default)) {
                    $result = "Введите целое число";
                    break;
                }
                setAction ($db, "");
                setLog($db, "Добавление на склад: 1 литр - ".$text_default." штук");
                $result = addToSklad($db, $text_default, 1);
                $result = "На складе: ".$result." литрушек";
                break;
            break;


            case '1.5 литра':
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                 $result = "Введите целое число";
                                 break;
                            }
                            setAction ($db, "");
                            setLog($db, "Добавление на склад: 1.5 литра - ".$text_default." штук");
                            $result = addToSklad($db, $text_default, 15);
                            $result = "На складе: ".$result." полторашек";
                            break;

            case 'выберите контрагента':
                                        setLog($db, "Выбран контрагент для добавления заказа - ".$text_default);
                                        $num = getNewZakaz($db, $text_default);
                                        $result = "Создан заказ №".$num;
                                        setAction ($db, "new_zakaz|".$num);
                                        $send_data ['reply_markup'] = [
                                               'resize_keyboard' => true,
                                               'keyboard' => [
                                                     [
                                                         ['text' => '+0.5'],
                                                         ['text' => '+1.0'],
                                                         ['text' => '+1.5']
                                                     ],
                                                     [
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
                            $db->query("update reserv set count_l05=".$text_default." where num='".$num."'");
                            $result = "В заказ №".$num." добавлено ".$text_default." бутылок 0.5 литра";
                            setAction ($db, "new_zakaz|".$num);
                                                                    $send_data ['reply_markup'] = [
                                                                           'resize_keyboard' => true,
                                                                           'keyboard' => [
                                                                                 [
                                                                                     ['text' => '+0.5'],
                                                                                     ['text' => '+1.0'],
                                                                                     ['text' => '+1.5']
                                                                                 ],
                                                                                 [
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
                            $db->query("update reserv set count_l1=".$text_default." where num='".$num."'");
                            $result = "В заказ №".$num." добавлено ".$text_default." бутылок 1 литр";
                            setAction ($db, "new_zakaz|".$num);
                                                                    $send_data ['reply_markup'] = [
                                                                           'resize_keyboard' => true,
                                                                           'keyboard' => [
                                                                                 [
                                                                                     ['text' => '+0.5'],
                                                                                     ['text' => '+1.0'],
                                                                                     ['text' => '+1.5']
                                                                                 ],
                                                                                 [
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
                            $db->query("update reserv set count_l15=".$text_default." where num='".$num."'");
                            $result = "В заказ №".$num." добавлено ".$text_default." бутылок 1.5 литра";
                            setAction ($db, "new_zakaz|".$num);
                                                                    $send_data ['reply_markup'] = [
                                                                           'resize_keyboard' => true,
                                                                           'keyboard' => [
                                                                                 [
                                                                                     ['text' => '+0.5'],
                                                                                     ['text' => '+1.0'],
                                                                                     ['text' => '+1.5']
                                                                                 ],
                                                                                 [
                                                                                     ['text' => 'Готово'],
                                                                                     ['text' => 'Отмена']
                                                                                 ]
                                                                           ]
                                                                    ];
                            break;


            case 'new_zakaz_comment':
                            $num = $actions[1];
                            $db->query("update reserv set comment='".$text_default."' where num='".$num."'");
                            $result = "Готово";
                            setAction ($db, "");
                            break;

            case 'удалить заказ':
                            if (!preg_match('/^\+?\d+$/', $text_default)) {
                                                                        $result = "Введите целое число";
                                                                        break;
                                                        }
                            $db->query("CALL DeleteZakaz('".$text_default."')");
                            $result = "Готово";
                            setAction ($db, "");
                            break;
        }


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
                     return $set[0]["l1"];
    }

    /* Чтение списка контрагентов из Google-таблицы */
    function getKontragets() {

    		$handle = fopen(GOOGLEKONTRG, "r");
    		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    		    $kdata[] = $data;
    		}
    		fclose($handle);

    		$len = count($kdata);
            $text = "";
            		for ($i = 1; $i < $len; $i++) {
                        if (empty($kdata[$i][1]) != 1) {
            		        $text = $text."\n".$kdata[$i][1];
            		    }
            		}

            return $text;
    }

    /* Чтение списка контрагентов из Google-таблицы и возвращение его в виде кнопок */
    function getKontragetsBtn() {
    $handle = fopen(GOOGLEKONTRG, "r");
        		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        		    $kdata[] = $data;
        		}
        		fclose($handle);

        		$len = count($kdata);
        		$res = array ();
                $result = array();
                $k = -1;
                		for ($i = 1; $i < $len; $i++) {

                            if (empty($kdata[$i][1]) != 1) {

                                if ($k++ === 3) {
                                    $k = 0;
                                    array_push ($res, $result);
                                    $result = array();
                                }

                		       array_push( $result, ['text' => $kdata[$i][1] ] );
                		    }
                		}

                		array_push ($res, $result);


                return $res;

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

        $result = "На складе:\n";
        $result = $result."0.5:   ".$d05." шт [ всего ".$set[0]['l05']." шт, резерв ".$set[0]['l05r']." шт ]\n";
        $result = $result."1.0:   ".$d1." шт [ всего ".$set[0]['l1']." шт, резерв ".$set[0]['l1r']." шт ]\n";
        $result = $result."1.5:   ".$d15." шт [ всего ".$set[0]['l15']." шт, резерв ".$set[0]['l15r']." шт ]";

        return $result;
    }

    /* Получение списка невыполненных заказов */
    function getZakazes ($db) {
         $_result = $db->query("SELECT * FROM reserv WHERE is_exec = 0") or
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

        $len = count($set);
            $text = "";
            		for ($i = 0; $i < $len; $i++) {

            		        $result = $result."\n";

                            $kntr = strtoupper($set[$i]['kontragent']);
            		        $result = "".$result.$kntr." [".$set[$i]['date_reserv']."]";
                            $result = $result."\n<pre>0.5л: ".$set[$i]['count_l05'];
                            $result = $result."\n1.0л: ".$set[$i]['count_l1'];
                            $result = $result."\n1.5л: ".$set[$i]['count_l15'];
                            $result = $result."\nномер заказа №".$set[$i]['num'];
                            $result = $result."\nкомментарий: ".$set[$i]['comment']."</pre>\n";
            		}

                return $result;
    }
?>