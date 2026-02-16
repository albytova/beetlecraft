<?php

         $db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
                    if ($db->connect_error) {
                        die('Connection Error: ' . $db->connect_error);
                    }

        switch ($_GET["query"]) {

    		case "getUpak":
    			getUpak();
    			break;

    		case "getProducts":
    			getProducts($db);
    			break;
        }

        function getUpak() {
            $spreadsheet_upak_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=642983459&single=true&output=csv";

    		$handle = fopen($spreadsheet_upak_url, "r");
    		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    		    $upak[] = $data;
    		}
    		fclose($handle);

    		$upak = json_encode($upak, JSON_UNESCAPED_UNICODE);

    		print_r($upak);
        }

        function getProducts($db) {
                    $_result = $db->query("select * from kitchen") or
                                                       die('Connection Error: ' . $db->connect_error);

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