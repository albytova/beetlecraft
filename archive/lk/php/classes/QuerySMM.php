<?php

         $db = new mysqli("149.154.65.75:3306", "craft" ,"beetlecraft", "beetledb");
                    if ($db->connect_error) {
                        die('Connection Error: ' . $db->connect_error);
                    }

        switch ($_GET["query"]) {

    		case "getSmmDraft":
    			getSmmDraft();
    			break;

//    		case "getSmmZmdDraft":
//    			getSmmZmdDraft($db);
//    			break;

    		case "getSmmBottle":
    			getSmmBottle();
    			break;
        }

//        function getSmmZmdDraft ($db) {
//            $_result = $db->query("SELECT * FROM zmd_draft WHERE date_smm IS NOT null") or
//                                               die('Connection Error: ' . $db->connect_error);
//
//                             $set = array();
//                             $total_records = mysqli_num_rows($_result);
//                             if($total_records >= 1){
//
//                               while ($link = mysqli_fetch_array($_result)){
//                                 $set[] = $link;
//                               }
//                             }
//                             echo json_encode($set);
//        }

        function getSmmDraft() {
            $spreadsheet_draft_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvRJHysaqAifHn5Gl30RrnKurB8fd_WN-2bEIZFItFoF9rMUIj2WCm4M6zXvB8hoiXMjOOdneFuJAo/pub?gid=594664287&single=true&output=csv";

    		$handle = fopen($spreadsheet_draft_url, "r");
    		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    		    $draft[] = $data;
    		}
    		fclose($handle);

    		$draft = json_encode($draft, JSON_UNESCAPED_UNICODE);

    		print_r($draft);
        }

        function getSmmBottle() {
            $spreadsheet_bottle_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=1801578177&single=true&output=csv";

    		$handle = fopen($spreadsheet_bottle_url, "r");
    		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
    		    $bottle[] = $data;
    		}
    		fclose($handle);

    		$bottle = json_encode($bottle, JSON_UNESCAPED_UNICODE);

    		print_r($bottle);
        }

?>