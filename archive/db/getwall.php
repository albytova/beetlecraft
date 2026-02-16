<?php
	$url = "https://api.vk.com/method/wall.get?domain=beetlecraft&count=1&access_token=f4b261d8f4b261d8f4b261d833f4db237bff4b2f4b261d8a83b5f6fcb739c6c983009da&fields=activity&v=5.108";

	if(!ini_set('default_socket_timeout', 15)) 
		echo -1;
	else {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_URL, $url);
		$result = curl_exec($ch);
		curl_close($ch);
		echo $result;
	}
?>