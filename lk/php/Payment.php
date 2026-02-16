<?php

        include('service.php');

        $GLOBAL_ID_SHOP = _get_profil_data($db);

        switch ($_GET["query"]) {

    		case "getShifts":
    			getShifts($db, $GLOBAL_ID_SHOP);
    			break;
    	}

        /* Получение списка смен */
        function getShifts($db, $id_shop) {

                     $_result = $db->query("SELECT s.id, s.date_shift, u.name as barman, s.money_all FROM shift s left join user u on s.id_user = u.id where s.id_shop = $id_shop order by s.date_shift desc") or
                                       die('Connection Error: ' . $db->connect_error);

                     $set = _query_to_json($_result);
                     print_r($set);
        }


?>