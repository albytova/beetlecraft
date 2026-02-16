<?php

        include('service.php');

        $GLOBAL_ID_SHOP = _get_profil_data($db);

        switch ($_GET["query"]) {

    		case "getMenuDraft":
    			getMenuDraft($db, $GLOBAL_ID_SHOP);
    			break;

    		case "getMenuBottle":
    			getMenuBottle($db, $GLOBAL_ID_SHOP);
    			break;

    		case "removeTap":
    			removeTap($db, $GLOBAL_ID_SHOP, $_GET["id_purchase"]);
    			break;

    		case "rewertDraft":
    			rewertDraft($db, $GLOBAL_ID_SHOP, $_GET["id_purchase"]);
    			break;

    		case "rewertBottle":
    			rewertBottle($db, $GLOBAL_ID_SHOP, $_GET["id_purchase"]);
    			break;

    		case "removeBottle":
    			removeBottle($db, $GLOBAL_ID_SHOP, $_GET["id_menu"]);
    			break;

    		case "saveBottleCost":
    			saveBottleCost($db, $_GET["cost_id"], $_GET["cost"], $_GET["id_tare"], $_GET["p_id"]);
    			break;

    		case "saveDraftCost":
    			saveDraftCost($db, $_GET["cost_id"], $_GET["cost"], $_GET["id_tare"], $_GET["p_id"]);
    			break;

    		case "getMenuDraftFront":
    			getMenuDraftFront($db, $_GET["id_shop"]);
    			break;

    		case "getMenuBottleFront":
    			getMenuBottleFront($db, $_GET["id_shop"]);
    			break;

    		case "getUntappd":
    			getUntappd($db, $_GET["BID"], $untappd_client_id, $untappd_client_secret);
    			break;

    		case "payBottle":
    			payBottle($db, $_GET["id"], $_GET["count_bottle"]);
    			break;
    	}

        /* Получение кег на складе */
        function getMenuDraft($db, $id_shop) {

             $query = "SELECT m.numtap, p.id as p_id, p.id_shop, g.beer_uid, p.order, c.id as cost_id, p.id_beer, c.cost, g.beer_name, g.beer_dist, g.beer_abv, g.beer_ibu, g.beer_id, g.brewery_name, c.id_tare as id_tare_unit "
                       ."FROM purchase p  "
                       ."left join menu_draft m on p.id = m.id_purchase  "
                       ."left join tare t on p.id_tare = t.id  "
                       ."left join get_basebeer g on p.id_beer = g.beer_id "
                       ."left join purchase_cost c on p.ID = c.id_parent "
                       ."where p.id_shop=$id_shop and p.status=4 and t.type = 0 order by m.numtap";

             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Получение кег на складе */
        function getMenuDraftFront($db, $id_shop) {

             $query = "SELECT m.numtap, p.id as p_id, p.id_shop, g.beer_uid, p.order, c.id as cost_id, p.id_beer, c.cost, g.beer_name, g.beer_dist, g.beer_abv, g.beer_ibu, g.beer_id, g.brewery_name, c.id_tare as id_tare_unit, g.typebeer_name_1, g.typebeer_name_2 , g.typebeer_name_3 "
                       ."FROM purchase p  "
                       ."left join menu_draft m on p.id = m.id_purchase  "
                       ."left join tare t on p.id_tare = t.id  "
                       ."left join get_basebeer g on p.id_beer = g.beer_id "
                       ."left join purchase_cost c on p.ID = c.id_parent "
                       ."where p.id_shop=$id_shop and p.status=4 and t.type = 0 order by m.numtap";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Получение бутылок в торговом зале */
        function getMenuBottle($db, $id_shop) {
            $query = "SELECT
                        mb.id,
                        mb.count,
                        p.id as purchase_id,
                        g.beer_name,
                        g.brewery_name,
                        g.beer_abv,
                        g.beer_uid,
                        g.beer_dist,
                        p.bottle_vol,
                        c.cost,
                        c.id as cost_id,
                        t.id as id_tare
                      FROM menu_bottle mb
                      INNER JOIN purchase p ON mb.id_purchase = p.id
                      LEFT JOIN get_basebeer g ON p.id_beer = g.beer_id
                      LEFT JOIN purchase_cost c ON p.ID = c.id_parent
                      LEFT JOIN tare t ON p.id_tare = t.id
                      WHERE p.id_shop = $id_shop
                      ORDER BY g.brewery_name, g.beer_name;";

            $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

            $set = _query_to_json($_result);
            print_r($set);
        }

        /* Получение бутылок на складе */
        function getMenuBottleFront($db, $id_shop) {

             $query = "SELECT p.id as p_id, p.id_shop, p.order, p.id_beer, c.cost, g.beer_uid, g.beer_name, g.beer_dist, g.beer_abv, g.beer_ibu, g.beer_id, g.brewery_name, p.bottle_vol, c.id as cost_id, g.typebeer_name_1, g.typebeer_name_2 , g.typebeer_name_3  "
                       ."FROM purchase p "
                       ."left join tare t on p.id_tare = t.id "
                       ."left join get_basebeer g on p.id_beer = g.beer_id "
                       ."left join purchase_cost c on p.ID = c.id_parent "
                       ."where p.id_shop=$id_shop and p.status=4 and t.type = 1 order by brewery_name;";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Удаление кеги с крана */
        function removeTap($db, $id_shop, $id_purchase) {

             $query = "select remove_draft_from_menu(".$id_shop.", ".$id_purchase.") as rr";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Возврат кега на склад */
        function rewertDraft($db, $id_shop, $id_purchase) {

             $query = "update purchase set status = 5 where id_shop=".$id_shop." and ID = ".$id_purchase;
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             $query = "delete from menu_draft where id_shop=".$id_shop." and id_purchase = ".$id_purchase;
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             echo 1;
        }

        /* Уменьшение количества бутылок на складе */
        function payBottle($db, $id, $count_bottle) {

             $query = "update menu_bottle set count = $count_bottle where id=$id";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             echo 1;
        }

        /* Возврат бутылок на склад */
        function rewertBottle($db, $id_shop, $id_purchase) {

             $query = "update purchase set status = 3 where id_shop=".$id_shop." and ID = ".$id_purchase;
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             $query = "delete from menu_bottle where id_shop=".$id_shop." and id_purchase = ".$id_purchase;
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             echo 1;
        }

        /* Удаление бутылок из меню */
        function removeBottle($db, $id_shop, $id) {

             $query = "select remove_bottle_from_menu(".$id_shop.", ".$id.") as rr";
             $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Изменение стоимость бутылки */
        function saveBottleCost($db, $cost_id, $cost, $id_tare, $p_id) {

             if ($cost_id == -1) {
                          $query = "insert into purchase_cost (id_parent, id_tare, cost) values (".$p_id.", ".$id_tare.",".$cost.")";
                          $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             }
             else {
                          $query = "update purchase_cost set cost=".$cost." where ID=".$cost_id;
                          $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             }

             echo 1;
        }

        /* Изменение стоимость порции розлива */
        function saveDraftCost($db, $cost_id, $cost, $id_tare, $p_id) {

             if ($cost_id == -1) {
                          $query = "insert into purchase_cost (id_parent, id_tare, cost) values ($p_id, $id_tare, $cost)";
                          $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             }
             else {
                          $query = "update purchase_cost set cost=".$cost." where ID=".$cost_id;
                          $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
             }

             echo 1;
        }


        /* Получение информации из Untappd */
        function getUntappd($db, $beer_id, $client_id, $client_secret) {

            // Формируем URL для запроса к API Untappd
            $url = "https://api.untappd.com/v4/beer/info/$beer_id?client_id=$client_id&client_secret=$client_secret";

            // Инициализируем cURL
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            // Выполняем запрос и получаем ответ
            $response = curl_exec($ch);

            // Проверяем, была ли ошибка при выполнении запроса
            if (curl_errno($ch)) {
                // Если ошибка, возвращаем JSON с сообщением об ошибке
                echo json_encode(['error' => 'Ошибка при запросе к API: ' . curl_error($ch)]);
                curl_close($ch);
                exit;
            }

            // Закрываем соединение cURL
            curl_close($ch);

            // Декодируем JSON-ответ от Untappd API
            $data = json_decode($response, true);

            // Проверяем, есть ли данные о пиве
            if (isset($data['response']['beer'])) {
                // Формируем JSON-ответ для клиента
                $beer = $data['response']['beer'];
                $result = [
                    'name' => $beer['beer_name'],
                    'brewery' => $beer['brewery']['brewery_name'],
                    'rating' => $beer['rating_score'],
                    'description' => $beer['beer_description'],
                    'abv' => $beer['beer_abv'],
                    'ibu' => $beer['beer_ibu'],
                    'style' => $beer['beer_style'],
                    'beer_slug' => $beer['beer_slug'],
                    'label' => $beer['beer_label'],
                    'beer_label_hd' => $beer['beer_label_hd']
                ];
                echo json_encode($result);
            } else {
                // Если информация о пиве не найдена, возвращаем JSON с сообщением об ошибке
                echo json_encode(['error' => 'Информация о пиве не найдена.']);
            }

            // Устанавливаем заголовок для ответа в формате JSON
            header('Content-Type: application/json');
        }

?>