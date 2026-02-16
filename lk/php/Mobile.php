<?php

        include('service.php');

        $GLOBAL_ID_SHOP = _get_profil_data($db);

        switch ($_GET["query"]) {

    		case "getMenuDraft":
    			getMenuDraft($db, $GLOBAL_ID_SHOP);
    			break;

    		case "getLastShift":
    			getLastShift($db, $GLOBAL_ID_SHOP);
    			break;

    		case "saveDraftBalance":
    			saveDraftBalance($db, $_GET["id"], $_GET["balance"]);
    			break;

    		case "getDraftStorage":
    			getDraftStorage($db, $GLOBAL_ID_SHOP);
    			break;

    		case "closeShift":
    			closeShift(
    			    $db,
    			    $_GET["date_shift"],
    			    $GLOBAL_ID_SHOP,
    			    $_GET["money_all"],
    			    $_GET["money_acquiring"],
    			    $_GET["money_transfer"],
    			    $_GET["money_cash"],
    			    $_GET["money_shift_cash"],
    			    $_GET["id_user"]
    			);
    			break;
    	}

        /* Получение кег на складе */
        function getMenuDraft($db, $id_shop) {

             $query = "SELECT m.numtap, m.id as m_id, p.id as p_id, m.balance, p.id_shop, p.id_tare, t.name as tare_name, p.id_beer, g.beer_name, g.beer_dist, g.beer_id, g.brewery_name "
                      ." FROM purchase p "
                       ." left join menu_draft m on p.id = m.id_purchase "
                       ." left join tare t on p.id_tare = t.id "
                       ." left join get_basebeer g on p.id_beer = g.beer_id "
                       ." where p.id_shop=$id_shop and p.status=4 and t.type = 0 order by m.numtap";

             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Закрытие смены */
        function closeShift($db, $date_shift, $id_shop, $money_all, $money_acquiring, $money_transfer, $money_cash, $money_shift_cash, $id_user) {

                $sql_insert = "insert into shift (id_shop, date_shift, money_all, money_acquiring, money_transfer, money_cash, id_user, is_close) values (?, ?, ?, ?, ?, ?, ?, 1)";
                $stmt = $db->prepare($sql_insert);
                $stmt->bind_param("isiiiii", $id_shop, $date_shift, $money_all, $money_acquiring, $money_transfer, $money_shift_cash, $id_user);
                $stmt->execute();

                $sql_update = "UPDATE shift_cash SET cash = ? WHERE id_shop = ?";
                $stmt = $db->prepare($sql_update);
                $stmt->bind_param("ii", $money_cash, $id_shop);
                $stmt->execute();
                echo 1;
        }

        /* Получение даты последней смены */
        function getLastShift($db, $id_shop) {

             $query = "select s.date_shift, c.cash from shift s left join shift_cash c on s.id_shop = c.id_shop where s.id_shop = $id_shop order by s.date_shift desc limit 1 ";

             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Сохранение остатков кег */
        function saveDraftBalance($db, $id, $balance) {

             $_result = $db->query("update menu_draft set balance='$balance' where id=$id") or die('Connection Error: ' . $db->connect_error);

             echo 1;
        }


        /* Получение кег на складе */
        function getDraftStorage($db, $id_shop) {

             $query = "SELECT g.beer_name, t.name as tare_name
                       FROM purchase p
                       left join tare t on p.id_tare = t.id
                       left join get_basebeer g on p.id_beer = g.beer_id
                       where p.id_shop=$id_shop and p.status=3 and t.type = 0";

             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }
?>