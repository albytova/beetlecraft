<?php

    include ("../php/lib/untappdPHP.php");

    $GLOBALS['ClientID'] = "249F2A5D9807CA76D4E06B5BBE8F60124EACDDCB";
    $GLOBALS['ClientSecret'] = "F14F94983A2AED236905DAA21821D47A8154EDEF";


	switch ($_POST["query"]) {

		case "getDraft":
			getDraft ();
			break;

		case "findBeerFromUntappd":
			findBeerFromUntappd($_POST["brewery_name"], $_POST["name"]);
			break;

		case "fullBeerFromUntappd":
			fullBeerFromUntappd($_POST["bid"]);
			break;

		case "getBottle":
			getBottle();
			break;
		case "getFood":
			getFood();
			break;
	}

	function getDraft() {
		$spreadsheet_draft_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=126767324&single=true&output=csv";

		$handle = fopen($spreadsheet_draft_url, "r");
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		    $draft_data[] = $data;
		}
		fclose($handle);

		//$full_data = getBeerFromDB ($draft_data, $db);

		print_r ( json_encode($draft_data, JSON_UNESCAPED_UNICODE) );
	}

	function findBeerFromUntappd ($brewery_name, $name) {

		$ut = new UntappdPHP($GLOBALS['ClientID'], $GLOBALS['ClientSecret']);
        $info = $ut->get("/search/beer", array("q" => $brewery_name." ".$name));

		$data = json_encode($info);
        print_r($data);
	}

	function fullBeerFromUntappd ($bid) {

		$ut = new UntappdPHP($GLOBALS['ClientID'], $GLOBALS['ClientSecret']);
        $info = $ut->get("/beer/info/".$bid);

		$data = json_encode($info);
        print_r($data);
	}

     // Получение массива из выборки из базы
     function getSet($_result)
     {
         $set = [];
         $total_records = mysqli_num_rows($_result);
         if ($total_records >= 1) {
             while ($link = mysqli_fetch_array($_result)) {
                 $set[] = $link;
             }
         } else {
             return -1;
         }
         return $set;
     }

	function getBottle() {
		$spreadsheet_bottle_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=1801578177&single=true&output=csv";

		$handle = fopen($spreadsheet_bottle_url, "r");
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		    $bottle_data[] = $data;
		}
		fclose($handle);
		print_r(json_encode($bottle_data, JSON_UNESCAPED_UNICODE));
	}

	function getFood() {
		$spreadsheet_food_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=1315206811&single=true&output=csv";

		$handle = fopen($spreadsheet_food_url, "r");
		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
		    $food_data[] = $data;
		}
		fclose($handle);
		print_r(json_encode($food_data, JSON_UNESCAPED_UNICODE));
	}
?>