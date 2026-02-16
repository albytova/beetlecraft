<?php

        include('service.php');

        $GLOBAL_ID_SHOP = _get_profil_data($db);

        switch ($_GET["query"]) {

    		case "getTare":
    			getTare($db, $GLOBAL_ID_SHOP );
    			break;

    		case "addTare":
    			addTare($db, $GLOBAL_ID_SHOP , $_GET["name"]);
    			break;

    		case "deleteTare":
    			deleteTare($db, $_GET["id"]);
    			break;

    		case "editTare":
    			editTare($db, $_GET["name"], $_GET["id"], $_GET["formula"], $_GET["count_unit"], $_GET["type"]);
    			break;

    	}

        /* Получение списка тар */
        function getTare($db, $id_shop) {
             $_result = $db->query("SELECT * FROM tare where status=1 and id_shop = ".$id_shop) or
                               die('Connection Error: ' . $db->connect_error);

             $set = _query_to_json($_result);
             print_r($set);
        }

        /* Добавление тары */
        function addTare($db, $id_shop, $name) {
             $_result = $db->query("insert into tare (id_shop, name) values (".$id_shop.", '".$name."')") or
                               die('Connection Error: ' . $db->connect_error);

             echo 1;
        }

        /* Удаление тары */
        function deleteTare($db, $id) {
             $_result = $db->query("update tare set status=2 where id = ".$id) or
                               die('Connection Error: ' . $db->connect_error);
             echo 1;
        }

        /* Редактирование тары */
        function editTare($db, $name, $id, $formula, $count_unit, $type) {
             $_result = $db->query("update tare set name = '".$name."', formula='".$formula."', count_unit=".$count_unit.", type=".$type." where id = ".$id) or
                               die('Connection Error: ' . $db->connect_error);
             echo 1;
        }
?>