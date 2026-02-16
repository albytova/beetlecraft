<?php

        include('service.php');

        $GLOBAL_ID_SHOP = $_COOKIE['ID_SHOP'];

        switch ($_GET["query"]) {

    		case "getPurchases":
    			getPurchases($db, $GLOBAL_ID_SHOP);
    			break;

    		case "deletePurchase":
    			deletePurchase($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;

    		case "approvePurchase":
    			approvePurchase($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;
    	}

        /* Получение списка закупок */
        function getPurchases($db, $id_shop) {
             $_result = $db->query("SELECT p.order FROM purchase p where id_shop = 1 and status=1 GROUP BY p.order") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Удалить закупку */
        //todo переделать
        function deletePurchase($db, $id_shop, $order) {
             $_result = $db->query("delete from purchase_cost where id_parent in (select id from purchase where id_shop = ".$id_shop." and purchase.order='".$order."')") or
                               die('Connection Error: ' . $db->connect_error);
             $_result = $db->query("delete FROM purchase where id_shop = ".$id_shop." and `order` = '".$order."'") or
                               die('Connection Error: ' . $db->connect_error);

             echo "1";
        }

        /* Утвердить закупку */
        function approvePurchase($db, $id_shop, $order) {
                     $_result = $db->query("UPDATE purchase SET status = 2 where id_shop = ".$id_shop." and `order` = '".$order."'") or
                                       die('Connection Error: ' . $db->connect_error);

                     echo "1";
        }
?>