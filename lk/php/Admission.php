<?php

        include('service.php');

        $GLOBAL_ID_SHOP = _get_profil_data($db);

        switch ($_GET["query"]) {

    		case "getAdmission":
    			getAdmission($db, $GLOBAL_ID_SHOP);
    			break;

    		case "getAdmissionInfo":
    			getAdmissionInfo($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;

    		case "getForGenTextByOrder":
    			getForGenTextByOrder($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;

    		case "getForGenTextByIDs":
    			getForGenTextByIDs($db, $GLOBAL_ID_SHOP, $_GET["ids"]);
    			break;

    		case "cancelAdmission":
    			cancelAdmission($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;

    		case "applyAdmission":
    			applyAdmission($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;

    		case "sendMessageTG":
    			sendMessageTG($_GET["message"], $_GET["photo"], $_GET["document"]);
    			break;

    		case "sendMessageTGAdmin":
    			sendMessageTGAdmin($_GET["message"], $_GET["photo"], $_GET["document"]);
    			break;
    	}

        /* Получение списка закупок */
        function getAdmission($db, $id_shop) {

             $_result = $db->query("SELECT `order`, date_zakaz, supplier, id_shop FROM purchase where id_shop = ".$id_shop." and status=2 GROUP BY `order`, date_zakaz, supplier, id_shop") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Получение состава закупки */
        function getAdmissionInfo($db, $id_shop, $order) {

             $query = "SELECT pp.ID, pp.id_shop, pp.`order`, pp.id_beer as beer_id, b.name AS beer_name, b.id_brewery AS brewery_id, b1.name AS brewery_name, t.name AS tare_name, pp.`count` FROM purchase pp LEFT JOIN beer b ON pp.id_beer = b.ID LEFT JOIN brewery b1 ON b.id_brewery = b1.ID LEFT JOIN tare t ON pp.id_tare = t.ID where pp.id_shop = ".$id_shop." and pp.`order` = '".$order."' AND (t.type = 0 OR t.type = 1)";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Получение состава закупки по номеру заказа*/
        function getForGenTextByOrder($db, $id_shop, $order) {

             $query = "SELECT g.beer_name, g.beer_dist, g.brewery_name FROM purchase p left join tare t on p.id_tare = t.id left join get_basebeer g on p.id_beer = g.beer_id where p.order='".$order."' and t.type = 1";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Получение состава закупки по ID*/
        function getForGenTextByIDs($db, $id_shop, $ids) {

             $query = "SELECT g.beer_name, g.beer_dist, g.brewery_name FROM purchase p left join tare t on p.id_tare = t.id left join get_basebeer g on p.id_beer = g.beer_id where p.ID in (".$ids.")";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Возвращение завоза в закупки */
        function cancelAdmission($db, $id_shop, $order) {

            $_result = $db->query("UPDATE purchase SET status = 1 where id_shop = ".$id_shop." and `order` = '".$order."'") or
                                       die('Connection Error: ' . $db->connect_error);

            echo "1";
        }

        /* Возвращение завоза в закупки */
        function applyAdmission($db, $id_shop, $order) {

            $_result = $db->query("UPDATE purchase SET status = 3 where id_shop = ".$id_shop." and `order` = '".$order."'") or
                                       die('Connection Error: ' . $db->connect_error);

            echo "1";
        }

/* Отправка сообщения в Телеграм */
function sendMessageTG($message, $photo, $document) {
    _send_message($message, $photo, $document);
}

/* Отправка сообщения в Телеграм Администратору */
function sendMessageTGAdmin($message, $photo) {
    // _send_message_admin принимает только 2 параметра: message и photoPath
    _send_message_admin($message, $photo);
}
?>