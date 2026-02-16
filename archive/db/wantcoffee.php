<?php
	
	include "safemysql.class.php";

	try {
		$db = new SafeMySQL(array('host' => '213.159.210.185', 'user' => 'lena', 'pass' => 'beetlecraft201', 'db' => 'craft_coffee')); 
	}
	catch (Exception $e) {
		echo $e;
		exit();
	}
	switch ($_POST["query"]) {
		case "getDiscounts":
			getDiscounts($db);
			break;		
		case "saveTik":
			saveTik($db);
			break;	
		case "getTiks":
			getTiks($db);
			break;				
		case "closeTik":
			closeTik($db);
			break;							
	}


	function getDiscounts($db) {
		$info = $db->getAll('SELECT id, name FROM craft_coffee.discounts');
		$str_result = "[";
		foreach ($info as $value) {
			$str_result = $str_result."{";	
			$str_result = $str_result."\"id\":\"".$value["id"]."\",";
			$str_result = $str_result."\"name\":\"".$value["name"]."\"";
			$str_result = $str_result."},";
		}
		$str_result = substr($str_result, 0, -1);
		if ($str_result)
			$str_result = $str_result."]";
		else 
			$str_result = "[]";
		print_r($str_result);
	}

	function saveTik($db) {
		$str_result = $db->getAll(
			"INSERT INTO tiks (id_discounts, name, surname, date_create, date_finish) VALUES (?i, ?s, ?s, ?s, ?s)", 
			$_POST["id_discounts"], 
			$_POST["name"], 
			$_POST["surname"], 
			$_POST["date_create"], 
			$_POST["date_finish"]);
		$id = $db->insertId();
		echo "#".$id;
	}

	function closeTik($db) {
		$str_result = $db->query(
			"UPDATE tiks SET is_close=?i, date_close=?s WHERE id=?i", 
			1, 
			$_POST["date_create"], 
			$_POST["id_tik"]);
	}

	function getTiks($db) {
		$info = $db->getAll('select tiks.id,tiks.id_discounts,tiks.name,tiks.surname,tiks.date_create,tiks.date_finish,tiks.is_close,(select name from discounts where discounts.id = tiks.id_discounts) as discount_name FROM tiks order by date_create desc;');
		$str_result = "[";
		foreach ($info as $value) {
			$str_result = $str_result."{";	
			$str_result = $str_result."\"id\":\"".$value["id"]."\",";
			$str_result = $str_result."\"id_discounts\":\"".$value["id_discounts"]."\",";
			$str_result = $str_result."\"discount_name\":\"".$value["discount_name"]."\",";
			$str_result = $str_result."\"name\":\"".$value["name"]." ".$value["surname"]."\",";
			$str_result = $str_result."\"date_create\":\"".$value["date_create"]."\",";
			$str_result = $str_result."\"date_finish\":\"".$value["date_finish"]."\",";
			$str_result = $str_result."\"is_close\":\"".$value["is_close"]."\"";
			$str_result = $str_result."},";
		}
		$str_result = substr($str_result, 0, -1);
		if ($str_result)
			$str_result = $str_result."]";
		else 
			$str_result = "[]";
		print_r($str_result);
	}

?>