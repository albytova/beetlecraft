<?php


	switch ($_GET["query"]) {

    	case "sendZakazNew":
    		sendZakazNew();
    		break;

      case "getNames":
        getNames();
        break;
    }

    function sendZakazNew() {

		    $txt = strval($_GET["message"]);
		    sendMessage($txt);
         echo 1;
    }


     function getNames() {

    $spreadsheet_draft_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vSD1r9VP0YvFoXgJej3T58742n-YJP1md_UuARAFDuucK01CEP9nQtFjknrGw7qpqrODH3CdEuSEgeF/pub?gid=2083851813&single=true&output=csv";

     		$handle = fopen($spreadsheet_draft_url, "r");
     		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
     		    $draft_data[] = $data;
     		}
     		fclose($handle);

     		print_r(json_encode($draft_data, JSON_UNESCAPED_UNICODE));

     }



/* Отправка сообщения в Telegram для Админа */
function sendMessage($message) {
    $tg_chat_id  = '-1004486032240';
    $tg_bot_token = '6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs';


        $parameters = array(
            'chat_id' => $tg_chat_id,
            'parse_mode' => "HTML",
            'text' => $message
        );

        _send_telegram('sendMessage', $tg_bot_token, $parameters);
    
}


    /* Отправка сообщения в Telegram (универсальная функция) */
function _send_telegram($method, $tg_bot_token, $parameters, $headers = []) {
    // Используем прокси вместо прямого API
    $proxy_url = 'https://telegram-proxy.albytova-elena.workers.dev';
    $url = "{$proxy_url}/bot{$tg_bot_token}/{$method}";

    // Инициализация cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    // Если переданы файлы (для sendPhoto, sendDocument и т.д.)
    $hasFile = false;
    foreach ($parameters as $key => $value) {
        if ($value instanceof CURLFile) {
            $hasFile = true;
            break;
        }
    }

    if ($hasFile) {
        // Для multipart/form-data (отправка файлов)
        curl_setopt($ch, CURLOPT_POSTFIELDS, $parameters);
    } else {
        // Для обычных POST запросов
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($parameters));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
    }

    // Выполнение запроса
    $response = curl_exec($ch);

    // Проверка на ошибки
    if (curl_errno($ch)) {
        error_log('CURL Error (_send_telegram): ' . curl_error($ch));
        curl_close($ch);
        return false;
    }

    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($http_code != 200) {
        error_log("HTTP Error (_send_telegram): {$http_code}");
        return false;
    }

    return json_decode($response, true);
}
?>