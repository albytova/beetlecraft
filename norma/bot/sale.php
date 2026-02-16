<?php

        //$db = new mysqli("127.0.0.1:3307", "craft" ,"beetlecraft2018", "beetlecraft");
        $db = new mysqli("109.95.210.219:3306", "u177778_craft" ,"beetlecraft2018", "u177778_beetlecraft");

        if ($db->connect_error) {
            die('Connection Error: ' . $db->connect_error);
        }


       switch ($_GET["query"]) {

    		case "getBeers":
    			getBeers($db);
    			break;

    		case "getDayResult":
    			getDayResult($db);
    			break;

    		case "getSumPay":
    			getSumPay($db);
    			break;

    		case "addBeer":
    			addBeer($db, $_GET["newname"]);
    			break;

    		case "deleteBeer":
    			deleteBeer($db, $_GET["id"]);
    			break;

    		case "editBeer":
    			editBeer($db, $_GET["id"], $_GET["newcost"]);
    			break;

    		case "sendMessageTelegram":
    			sendMessageTelegram($_GET["message"]);
    			break;

    		case "savePay":
    			savePay($db, $_GET["id_shop_nsi"], $_GET["count"], $_GET["cost"]);
    			break;
        }

        function _query_to_json($_result) {

                    $set = array();
                     $total_records = mysqli_num_rows($_result);
                     if($total_records >= 1){

                       while ($link = mysqli_fetch_array($_result)){
                         $set[] = $link;
                       }
                     }
                     return json_encode($set);

        }

function addBeer($db, $newname) {
             $_result = $db->query("insert into norma_shop_nsi (name) values ('$newname')") or
                               die('Connection Error: ' . $db->connect_error);
             echo 1;
}

function deleteBeer($db, $id) {
             $_result = $db->query("update norma_shop_nsi set is_delete='1' where id=$id") or
                               die('Connection Error: ' . $db->connect_error);
             echo 1;
}

function editBeer($db, $id, $newcost) {
             $_result = $db->query("update norma_shop_nsi set cost=$newcost where id=$id") or
                               die('Connection Error: ' . $db->connect_error);
             echo 1;
}

function getBeers($db) {
             $_result = $db->query("SELECT * FROM norma_shop_nsi where is_delete = '0' order by order_p asc") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
}

function getSumPay($db) {
             $_result = $db->query("SELECT SUM(cost) AS total_sales_today FROM norma_shop_sale WHERE DATE(dt_sale) = CURDATE();") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
}

function getDayResult($db) {
             $_result = $db->query("SELECT "
                                        ."ns.name AS shop_name, "
                                        ."IFNULL(SUM(nss.count), 0) AS total_count "
                                    ."FROM "
                                        ."norma_shop_nsi ns "
                                    ."LEFT JOIN "
                                        ."norma_shop_sale nss ON ns.id = nss.id_shop_nsi "
                                        ."AND DATE(nss.dt_sale) = CURDATE() "
                                    ."GROUP BY "
                                        ."ns.id, ns.name "
                                    ."HAVING "
                                        ."total_count > 0 "
                                    ."ORDER BY "
                                        ."total_count DESC;") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
}

function savePay($db, $id_shop_nsi, $count, $cost) {
             $_result = $db->query("insert into norma_shop_sale (id_shop_nsi, count, cost) values ($id_shop_nsi, $count, $cost)") or
                               die('Connection Error: ' . $db->connect_error);

             echo 1;
}

        /* Отправка сообщения в Telegram */
        function sendMessageTelegram($message) {

            $tg_chat_id  = '-1002346600370';
            $tg_bot_token = "7980636586:AAFM46EKVcpQMl_G-iZIQspeNgYQeot_tKo";

                        $parameters = array(
                            'chat_id' => $tg_chat_id,
                            'text' => $message
                        );

                        $url = "https://api.telegram.org/bot" .$tg_bot_token. "/sendMessage";

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
?>