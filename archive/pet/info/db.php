<?php
    $db = new mysqli("149.154.65.75:3306", "pet" ,"beetlecraft", "petbottle");

    if ($db->connect_error) {
        die('Connection Error: ' . $db->connect_error);
    }

	switch ($_GET["query"]) {

    	case "getReserv":
    		getReserv($db);
    		break;

        case "loadKntrs":
            loadKntrs($db);
            break;
    }

    function getReserv ($db) {
        $query = "select reserv.id,reserv.num,reserv.kontragent,reserv.date_reserv,reserv.count_l05,reserv.count_l1,reserv.count_l15,reserv.count_l2,reserv.is_exec,reserv.is_pay,konragent.manager,konragent.id as konragent_id,konragent.cost_05,konragent.cost_01,konragent.cost_15,konragent.cost_02 from reserv LEFT JOIN konragent ON reserv.kontragent = konragent.name ORDER BY date_reserv DESC;";

        $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
        $set = array();
                             $total_records = mysqli_num_rows($_result);
                             if($total_records >= 1){

                               while ($link = mysqli_fetch_array($_result)){
                                 $set[] = $link;
                               }
                             }
        echo json_encode($set);
    }

    function loadKntrs ($db) {
        $query = "select * from konragent ORDER BY name";

        $_result = $db->query($query) or die('Connection Error: ' . $db->connect_error);
        $set = array();
        $total_records = mysqli_num_rows($_result);
        if($total_records >= 1){

            while ($link = mysqli_fetch_array($_result)){
                $set[] = $link;
            }
        }
        echo json_encode($set);
    }
?>