<?php
	switch ($_POST["query"]) {
		case "getDraft":
			getDraft();
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
		print_r(json_encode($draft_data, JSON_UNESCAPED_UNICODE));
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