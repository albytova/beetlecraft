<?php

        include('service.php');

        $GLOBAL_ID_SHOP = $_COOKIE['ID_SHOP'];

        switch ($_GET["query"]) {

    		case "getBaseBeer":
    			getBaseBeer($db);
    			break;

    		case "getTare":
    			getTare($db, $_GET["id_shop"]);
    			break;

    		case "addTare":
    			addTare($db, $_GET["id_shop"], $_GET["name"]);
    			break;

    		case "deleteTare":
    			deleteTare($db, $_GET["id"]);
    			break;

    		case "createPurshace":
    			createPurshace($db, $GLOBAL_ID_SHOP, $_GET["order"], $_GET["id_beer"], $_GET["supplier_name"], $_GET["date_zakaz"], $_GET["ship"]);
    			break;

    		case "editPurshace":
    			editPurshace($db, $_GET["id_purshace"], $_GET["id_beer"], $_GET["id_tare"], $_GET["count"], $_GET["cost"]);
    			break;

    		case "deletePurshace":
    			deletePurshace($db, $_GET["id_purshace"]);
    			break;

    		case "savePurshace":
    			savePurshace($db, $GLOBAL_ID_SHOP, $_GET["order"], $_GET["id_beer"], $_GET["id_tare"], $_GET["count"], $_GET["cost"], $_GET["supplier_name"], $_GET["date_zakaz"], $_GET["cost_liter"], $_GET["ship"], $_GET["is_edit"]);
    			break;

   		case "editPurshaceCost":
    			editPurshaceCost($db, $_GET["id_purshace"], $_GET["id_tare"], $_GET["cost"]);
    			break;

   		case "savePurshaceCost":
    			savePurshaceCost($db, $_GET["params"], $_GET["id_purshace"]);
    			break;

 /*   		case "savePurshaceCost":
    			savePurshaceCost($db, $_GET["id_parent"], $_GET["id_tare"], $_GET["cost"], $_GET["is_edit"]);
    			break;
*/
    		case "getPurchaseInfo":
    			getPurchaseInfo($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;

    		case "getPurchaseCost":
    			getPurchaseCost($db, $_GET["ids_parent"]);
    			break;
/*
    		case "deletePurshace":
    			deletePurshace($db, $GLOBAL_ID_SHOP, $_GET["order"]);
    			break;
*/
    		case "getTarePurchase":
    			getTarePurchase($db, $GLOBAL_ID_SHOP);
    			break;

    	}

        /* Загрузка пивоварен из базы */
        function getBaseBeer($db) {
             $_result = $db->query("SELECT * FROM get_basebeer where status=1 order by beer_name") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r ($set);
        }

         /* Получение полной информации об одной закупке */
         function getPurchaseInfo($db, $id_shop, $order) {

                $query = "SELECT pp.ID, pp.id_shop, pp.`order`, pp.ship, pp.cost_liter, pp.id_beer as beer_id, b.name, b.id_brewery AS b_id, b1.name AS brewery_name, pp.id_tare AS t_id, t.name AS tare_name, pp.`count`, pp.cost, pp.bottle_vol, pp.status, pp.date_zakaz, pp.supplier, t.type AS type_tare FROM purchase pp LEFT JOIN beer b ON pp.id_beer = b.ID LEFT JOIN brewery b1 ON b.id_brewery = b1.ID LEFT JOIN tare t ON pp.id_tare = t.ID where pp.id_shop = ".$id_shop." and pp.`order` = '".$order."' order by brewery_name";
              $_result = $db->query($query) or
                                die('Connection Error: ' . $db->connect_error);

              $set = _query_to_json($_result);
              print_r($set);
         }

         /* Получение цен закупок */
         function getPurchaseCost($db, $ids_parent) {

              $query = "delete from purchase_cost where cost = 0";
              $_result = $db->query($query) or
                                die('Connection Error: ' . $db->connect_error);

              $query = "SELECT pc.ID, pc.id_parent, pc.id_tare, pc.cost, t.name AS tare_name, t.type as type_tare, p.id_beer, b1.name AS beer_name, b1.id_brewery, bw.name AS brewery_name, p.cost_liter FROM purchase_cost pc LEFT JOIN tare t ON pc.id_tare = t.ID LEFT JOIN purchase p ON pc.id_parent = p.ID LEFT JOIN beer b1 ON p.id_beer = b1.ID LEFT JOIN brewery bw ON b1.id_brewery = bw.ID  WHERE pc.id_parent IN (".$ids_parent.")";
              $_result = $db->query($query) or
                                die('Connection Error: ' . $db->connect_error);

              $set = _query_to_json($_result);
              print_r($set);
         }

        /* Получение набора тары, привязанного к магазину */
        function getTare($db, $id_shop) {
             $_result = $db->query("SELECT * FROM tare where id_shop = ".$id_shop) or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
        }

        /* Добавление тары */
        function addTare($db, $id_shop, $name) {
             $_result = $db->query("insert into tare (id_shop, name) values (".$id_shop.", '".$name."')") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             echo $set;
        }

        /* Удаление тары из справочника */
        function deleteTare($db, $id) {
             $_result = $db->query("delete from tare where id = ".$id) or
                               die('Connection Error: ' . $db->connect_error);
             echo 1;
        }

        /* Получение списка тары для закупки (без порции розлива) */
        function getTarePurchase($db, $id_shop) {

             $_result = $db->query("SELECT * FROM tare where id_shop = ".$id_shop." and type != 2 and status = 1 order by type") or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Удаление данных о заказе */
/*        function deletePurshace ($db, $id_shop, $order) {

            $query1 = "delete FROM purchase_cost WHERE id_parent IN (SELECT id FROM purchase p WHERE p.id_shop = ".$id_shop." and p.`order` = '".$order."')";
            $query2 = "delete from purchase WHERE id_shop = ".$id_shop." and `order` = '".$order."'";

            $_result1 = $db->query($query1) or die('Delete Error: ' . $db->connect_error);
            $_result2 = $db->query($query2) or die('Delete Error: ' . $db->connect_error);

            echo 1;
        }
*/
        /* Сохраниние измененной закупки */
        function savePurshace($db, $id_shop, $order, $id_beer, $id_tare, $count, $cost, $supplier_name, $date_zakaz, $cost_liter, $ship, $is_edit) {

            $query = "insert into purchase (id_shop, purchase.order, id_beer, id_tare, count, cost, supplier, status, date_zakaz, cost_liter, ship) values (".$id_shop.", '".$order."', ".$id_beer.", ".$id_tare.", ".$count.", ".$cost.", '".$supplier_name."', '1','".$date_zakaz."', ".$cost_liter.", '".$ship."')";

            $_result = $db->query($query) or die('Insert Error: ' . $db->connect_error);

            echo $db->insert_id;
        }

        /* Создание строки закупки */
        function createPurshace($db, $id_shop, $order, $id_beer, $supplier_name, $date_zakaz, $ship) {

            $query = "insert into purchase (id_shop, purchase.order, id_beer, supplier, status, date_zakaz, ship) values ($id_shop, '$order', $id_beer, '$supplier_name', '1','$date_zakaz', '$ship')";

            $_result = $db->query($query) or die('Insert Error: ' . $db->connect_error);

            echo $db->insert_id;
        }

        /* Редактирование закупки */
        function editPurshace($db, $id_purshace, $id_beer, $id_tare, $count, $cost) {

            $query = "update purchase set id_beer=$id_beer, id_tare=$id_tare, count=$count, cost=$cost where ID = $id_purshace";

            $_result = $db->query($query) or die('Insert Error: ' . $db->connect_error);
            echo 1;
        }

        /* Удаление закупки */
        function deletePurshace($db, $id_purshace) {

            $query = "delete from purchase_cost where id_parent = $id_purshace";
            $_result = $db->query($query) or die('Insert Error: ' . $db->connect_error);

            $query = "delete from purchase where ID = $id_purshace";
            $_result = $db->query($query) or die('Insert Error: ' . $db->connect_error);

            echo 1;
        }


        /* Сохраниние измененной цены закупки */
        function savePurshaceCost($pdo, $data, $id_purshace) {

            if (empty($data)) {
                echo json_encode(['success' => false, 'message' => 'No data received']);
                exit;
            }

            // Декодируем JSON строку в массив PHP
            $items = json_decode($data, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
                exit;
            }

            try {

                $sql_delete = "delete from purchase_cost where id_parent = ?";
                $stmt = $pdo->prepare($sql_delete);
                $stmt->bind_param("i", $id_purshace);
                $stmt->execute();

                $sql = "INSERT INTO purchase_cost (id_tare, cost, id_parent) VALUES (?, ?, ?)";
                $stmt = $pdo->prepare($sql);

                $successCount = 0;

                // Выполняем запрос для каждого элемента
                foreach ($items as $item) {
                    try {
                        $stmt->execute([
                            $item['id_tare'],
                            $item['cost'],
                            $item['id_purshace']
                        ]);
                        $successCount++;
                    } catch (PDOException $e) {
                        // Логируем ошибку, но продолжаем обработку остальных элементов
                        error_log("Error inserting record: " . $e->getMessage());
                    }
                }

                echo "Успешно обработано $successCount из " . count($items) . " записей";

            } catch (PDOException $e) {
                echo 'Database error: ' . $e->getMessage();
            }
        }

        /* Редактирование измененной цены закупки */
        function editPurshaceCost($db, $id_parent, $id_tare, $cost) {

            $sql_select = "SELECT id FROM purchase_cost WHERE id_parent = ? and id_tare = ?";
            $stmt = $db->prepare($sql_select);
            $stmt->bind_param("ii", $id_parent, $id_tare);
            $stmt->execute();

            $stmt->store_result();
            if ($stmt->num_rows > 0) {

                $stmt->bind_result($id_cost);
                $stmt->fetch();

                $sql_update = "UPDATE purchase_cost SET cost = ? WHERE ID = ?";
                $stmt = $db->prepare($sql_update);
                $stmt->bind_param("ii", $cost, $id_cost);
                $stmt->execute();
                echo 0;

            } else {

                $stmt->fetch();
                $sql_update = "insert into purchase_cost (id_tare, cost, id_parent) values (?, ?, ?)";
                $stmt = $db->prepare($sql_update);
                $stmt->bind_param("iii", $id_tare, $cost, $id_parent);
                $stmt->execute();
                echo $db->insert_id;
            }

        }

        /* Сохраниние измененной цены закупки */
/*        function savePurshaceCost($db, $id_parent, $id_tare, $cost, $is_edit) {

            $query = "insert into purchase_cost (id_parent, id_tare, cost) values (".$id_parent.", ".$id_tare.", ".$cost.")";
            $_result = $db->query($query) or die('Insert Error: ' . $db->connect_error);

             echo $db->insert_id;
        }
        */
?>