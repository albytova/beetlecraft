<?php

        include('service.php');

        $GLOBAL_ID_SHOP = _get_profil_data($db);

        switch ($_GET["query"]) {

    		case "getStorageDraft":
    			getStorageDraft($db, $GLOBAL_ID_SHOP);
    			break;

    		case "getStorageBottle":
    			getStorageBottle($db, $GLOBAL_ID_SHOP);
    			break;

    		case "setTap":
    			setTap($db, $_GET["id_purchase"], $_GET["numtap"], $_GET["id_beer"], $_GET["id_shop"]);
    			break;

    		case "createPriceTags":
    			createPriceTags($db, $_GET["ids"]);
    			break;

    		case "moveToShop":
    			moveToShop($db, $_GET["id_purchase"], $GLOBAL_ID_SHOP, $_GET["id_beer"], $_GET["count"]);
    			break;

    		case "hideDraft":
    			visibleDraft($db, $GLOBAL_ID_SHOP, $_GET["id_purchase"], 5);
    			break;

    		case "visibleDraft":
    			visibleDraft($db, $GLOBAL_ID_SHOP, $_GET["id_purchase"], 3);
    			break;

    		case "removeBottle":
    			removeBottle($db, $_GET["id_purchase"]);
    			break;
    	}

        /* Получение кег на складе */
        function getStorageDraft($db, $id_shop) {

             $query = "SELECT p.id as p_id, p.id_shop, p.order, p.status, g.beer_uid, p.id_beer, g.beer_name, g.beer_dist, g.beer_abv, g.beer_ibu, g.beer_id, g.brewery_name, g.typebeer_name_1, g.typebeer_name_2, g.typebeer_name_3 "
                       ."FROM purchase p "
                       ."left join tare t on p.id_tare = t.id "
                       ."left join get_basebeer g on p.id_beer = g.beer_id "
                       ."where p.id_shop=$id_shop and p.status in (3,5) and t.type = 0;";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Получение бутылок на складе */
        function getStorageBottle($db, $id_shop) {

             $query = "SELECT p.id as p_id, p.id_shop, p.order, g.beer_uid, p.id_beer, g.beer_name, g.beer_dist, g.beer_abv, g.beer_ibu, g.beer_id, g.brewery_name, p.bottle_vol, p.count  "
                       ."FROM purchase p "
                       ."left join tare t on p.id_tare = t.id "
                       ."left join get_basebeer g on p.id_beer = g.beer_id "
                       ."where p.id_shop=$id_shop and p.status=3 and t.type = 1;";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Постановка кега на кран */
        function setTap($db, $id_purchase, $numtap, $id_beer, $id_shop) {

            $_result = $db->query("UPDATE purchase SET status = 4 where id = ".$id_purchase) or
                                       die('Connection Error: ' . $db->connect_error);

            $_result = $db->query("delete from menu_draft where id_shop=".$id_shop." and numtap=".$numtap) or
                                       die('Connection Error: ' . $db->connect_error);

            $_result = $db->query("insert into menu_draft (id_purchase, numtap, id_beer, id_shop) values (".$id_purchase.", ".$numtap.", ".$id_beer.", ".$id_shop.")") or
                                       die('Connection Error: ' . $db->connect_error);
            echo $db->insert_id;
        }

        /* Удаление бутылок со склада */
        function removeBottle($db, $id_purchase) {

             $query = "delete from purchase_cost where id_parent = $id_purchase;";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $query = "delete from purchase where ID = $id_purchase;";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             echo "1";
        }

        /* Создание ценников */
        function createPriceTags($db, $ids) {
             $query = "SELECT g.brewery_name, g.beer_name, g.beer_dist, g.beer_abv, g.beer_ibu, c.cost "
                       ."FROM purchase p "
                       ."left join get_basebeer g on p.id_beer = g.beer_id "
                       ."left join purchase_cost c on c.id_parent = p.ID "
                       ."where p.id in (".$ids.")";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

                    $set = array();
                     $total_records = mysqli_num_rows($_result);
                     if($total_records >= 1){

                       while ($link = mysqli_fetch_array($_result)){
                         $set[] = $link;
                       }
                     }

             $rez = _create_price_tags($set);

             _send_message("Нужны ценники", "", "https://beetlecraft.ru/lk/cen_beetle.pdf");

             print_r ($rez);
        }

        /* Скрытие кега */
        function visibleDraft ($db, $id_shop, $id_purchase, $status) {

             $_result = $db->query("UPDATE purchase SET status = $status where ID = ".$id_purchase) or
                                                    die('Connection Error: ' . $db->connect_error);
             echo 1;
        }

        /* Перемещение бутылок в торговый зал */
        function moveToShop($db, $id_purchase, $id_shop, $id_beer, $count) {

            $_result = $db->query("UPDATE purchase SET status = 4 where id = ".$id_purchase) or
                                       die('Connection Error: ' . $db->connect_error);

            $_result = $db->query("insert into menu_bottle (id_purchase, id_beer, id_shop, count) values ($id_purchase, $id_beer, $id_shop, $count)") or
                                       die('Connection Error: ' . $db->connect_error);

            echo $db->insert_id;
        }
?>