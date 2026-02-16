    <?php

        require_once 'dompdf/autoload.inc.php';
        use Dompdf\Dompdf;

        $db = new mysqli("127.0.0.1:3307", "craft" ,"beetlecraft2018", "beetlecraft");
        //$db = new mysqli("109.95.210.219:3306", "u177778_craft" ,"beetlecraft2018", "u177778_beetlecraft");

        if ($db->connect_error) {
            die('Connection Error: ' . $db->connect_error);
        }

        $untappd_client_id = '249F2A5D9807CA76D4E06B5BBE8F60124EACDDCB';
        $untappd_client_secret = 'F14F94983A2AED236905DAA21821D47A8154EDEF';

        function _query_to_json($_result) {

                    $set = array();
                     $total_records = mysqli_num_rows($_result);
                     if($total_records >= 1){

                       while ($link = mysqli_fetch_array($_result)){
                         $set[] = $link;
                       }
                     }
                     return json_encode($set);

        }

        /* Получение содержимого таблицы База Пива из таблицы Контент */
        function _get_basebeer_from_google () {

                    $spreadsheet_basebeer_url= "https://docs.google.com/spreadsheets/d/e/2PACX-1vTvRJHysaqAifHn5Gl30RrnKurB8fd_WN-2bEIZFItFoF9rMUIj2WCm4M6zXvB8hoiXMjOOdneFuJAo/pub?gid=46544836&single=true&output=csv";

            		$handle = fopen($spreadsheet_basebeer_url, "r");
            		while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            		    $basebeer[] = $data;
            		}
            		fclose($handle);

            		return $basebeer;

        }

         /* Получение полной информации об одной закупке */
         function _get_profil_data ($db) {

                if ( isset($_COOKIE['ID_SHOP']) )
                  return $_COOKIE['ID_SHOP']; //переделать на после логированния
                else
                    return -1;
         }

/* Генерирование ценников с максимум 7 строками на лист */
function _create_price_tags($data) {
    $max_rows_per_page = 7; // Максимальное количество строк на листе
    $items_per_row = 4; // Количество ценников в строке
    $items_per_page = $max_rows_per_page * $items_per_row; // Максимальное количество ценников на листе

    $total_items = count($data);
    $total_pages = ceil($total_items / $items_per_page);

    // Основной HTML с CSS
    $html = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"/><style type="text/css">
        body { font-family: DejaVu Sans; font-size: 19px; margin: 0; padding: 0; }
        .tg  {border-spacing:0;border-collapse:unset; width: 100%;}
        .tg .tg-0lax > div {width: 100%;height: 19px;overflow:hidden;}
        .tg .tg-1lax > div {width: 100%;height: 72px;overflow:hidden;}
        .tg .tg-2lax > div {width: 100%;height: 23px;overflow:hidden;}
        .tg .tg-3lax > div {width: 100%;height: 15px;overflow:hidden;}
        .tg td{border-color:black;border-style:solid;border-width:1px;font-size:12px;
          overflow:hidden;padding:0;word-break:normal;}
        .tg .tg-0lax{text-align:center;border-bottom:solid white;}
        .tg .tg-1lax{border-bottom:solid white;border-top:solid white;text-align:center;padding:1;line-height:1;}
        .tg .tg-2lax{text-align:center;vertical-align:bottom;border-top:solid white;padding:0;line-height:1;font-size:18px;font-weight:bolder;}
        .tg .tg-3lax{text-align:center;vertical-align:top;border-top:solid white;padding:0;font-size:9px;}
        .page-break {page-break-after: always;}
        .price-table {width: 100%;}
    </style></head><body>';

    for ($page = 0; $page < $total_pages; $page++) {
        // Вычисляем диапазон данных для текущей страницы
        $start_index = $page * $items_per_page;
        $end_index = min(($page + 1) * $items_per_page, $total_items);
        $page_data = array_slice($data, $start_index, $end_index - $start_index);

        $items_on_page = count($page_data);

        $html .= '<table class="tg price-table">';

        for ($i = 0; $i < $items_on_page; $i += $items_per_row) {
            // Определяем количество ценников в текущей строке
            $items_in_current_row = min($items_per_row, $items_on_page - $i);

            // Заполнение строки с пивоварней
            $html .= '<tr style="line-height: 15px">';
            for ($j = 0; $j < $items_in_current_row; $j++) {
                $index = $i + $j;
                $html .= '<td class="tg-0lax"><div style="font-size:13px">'.htmlspecialchars($page_data[$index]["brewery_name"]).'</div></td>';
            }
            // Добавляем пустые ячейки если нужно
            for ($j = $items_in_current_row; $j < $items_per_row; $j++) {
                $html .= '<td class="tg-0lax"><div style="font-size:13px">&nbsp;</div></td>';
            }
            $html .= '</tr>';

            // Заполнение строки с названием, стилем и градусом
            $html .= '<tr style="line-height: 14px">';
            for ($j = 0; $j < $items_in_current_row; $j++) {
                $index = $i + $j;
                $html .= '<td class="tg-1lax"><div style="font-size:15px"><b>'.htmlspecialchars($page_data[$index]["beer_name"]).'</b><div style="font-size:12px">'.htmlspecialchars($page_data[$index]["beer_dist"]).'<br>ABV '.htmlspecialchars($page_data[$index]["beer_abv"]).'%</div></div></td>';
            }
            for ($j = $items_in_current_row; $j < $items_per_row; $j++) {
                $html .= '<td class="tg-1lax"><div style="font-size:15px">&nbsp;</div></td>';
            }
            $html .= '</tr>';

            // Заполнение строки с ценой
            $html .= '<tr>';
            for ($j = 0; $j < $items_in_current_row; $j++) {
                $index = $i + $j;
                $html .= '<td class="tg-2lax"><div>'.htmlspecialchars($page_data[$index]["cost"]).'₽</div></td>';
            }
            for ($j = $items_in_current_row; $j < $items_per_row; $j++) {
                $html .= '<td class="tg-2lax"><div>&nbsp;</div></td>';
            }
            $html .= '</tr>';

            // Заполнение строки с юр.лицом
            $html .= '<tr>';
            for ($j = 0; $j < $items_in_current_row; $j++) {
                $urlico = "ИП Албутова Е.В.";
                $html .= '<td class="tg-3lax"><div>'.$urlico.'</div></td>';
            }
            for ($j = $items_in_current_row; $j < $items_per_row; $j++) {
                $html .= '<td class="tg-3lax"><div>&nbsp;</div></td>';
            }
            $html .= '</tr>';
        }

        $html .= '</table>';

        // Добавляем разрыв страницы, если это не последняя страница
        if ($page < $total_pages - 1) {
            $html .= '<div class="page-break"></div>';
        }
    }

    $html .= '</body></html>';

    // Генерируем PDF
    $html_encoded = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
    $dompdf = new Dompdf();
    $dompdf->loadHtml($html_encoded, "UTF-8");
    $dompdf->setPaper('A4', 'portrait');

    // Настройки для корректной работы разрывов страниц
    $dompdf->set_option('isPhpEnabled', true);
    $dompdf->set_option('isRemoteEnabled', true);

    $dompdf->render();

    $pdf_data = $dompdf->output();
    $rez = file_put_contents("../cen_beetle.pdf", $pdf_data);

    return $total_pages;
}

        /* Отправка сообщения в Telegram */
        function _send_message($message, $photoPath, $documentPath) {

            // Test;
            $tg_chat_id  = '-1002124877252';

            // Prodaction
            //$tg_chat_id  = '-1001799024183';

            $tg_bot_token = '6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs';

            if (isset($photoPath) && (strlen($photoPath) > 10))  {

                    _send_photo($tg_chat_id, $tg_bot_token, $message, $photoPath);
            }
            else {

                    if (isset($documentPath) && (strlen($documentPath) > 10))  {

                        _send_document($tg_chat_id, $tg_bot_token, $message, $documentPath);
                    }
                    else {

                        $parameters = array(
                            'chat_id' => $tg_chat_id,
                            'parse_mode' => "HTML",
                            'text' => $message
                        );

                        _send_telegram('sendMessage', $tg_bot_token, $parameters);
                    }
            }
        }

        /* Отправка сообщения в Telegram для Админа */
        function _send_message_admin($message, $photoPath) {
            $tg_chat_id  = '-1002259216582';
            $tg_bot_token = '6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs';

            if (isset($photoPath) && (strlen($photoPath) > 10))  {

                    _send_photo($tg_chat_id, $tg_bot_token, $message, $photoPath);
            }
            else {

                $parameters = array(
                    'chat_id' => $tg_chat_id,
                    'parse_mode' => "HTML",
                    'text' => $message
                );

                _send_telegram('sendMessage', $tg_bot_token, $parameters);
            }
        }

        /* Отправка фотографии и текстого сообщения в Telegram */
        function _send_photo($tg_chat_id, $tg_bot_token, $caption, $photoPath) {

            // URL для отправки фото через Telegram Bot API
            $url = "https://api.telegram.org/bot$tg_bot_token/sendPhoto";

            // Подготовка данных для отправки
            $postData = [
                'chat_id' => $tg_chat_id,
                'photo' => $photoPath,
                'caption' => $caption,
                'parse_mode' => "HTML"
            ];

            // Инициализация cURL
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            // Выполнение запроса
            $response = curl_exec($ch);

            // Проверка на ошибки
            if (curl_errno($ch)) {
                echo 'Ошибка cURL: ' . curl_error($ch);
            } else {
                // Вывод ответа от Telegram API
                echo $response;
            }

            // Закрытие соединения
            curl_close($ch);

           // _send_telegram('sendPhoto', $parameters);
        }

        /* Отправка документа и текстого сообщения в Telegram */
        function _send_document($tg_chat_id, $tg_bot_token, $caption, $documentPath) {

            // URL для отправки документа через Telegram Bot API
            $url = "https://api.telegram.org/bot$tg_bot_token/sendDocument";
            $file = new CURLFile("../cen_beetle.pdf", mime_content_type("../cen_beetle.pdf"), basename("../cen_beetle.pdf"));
            // Подготовка данных для отправки
            $postData = [
                'chat_id' => $tg_chat_id,
                'document' => $file,//$documentPath,
                'caption' => $caption,
                'parse_mode' => "HTML"
            ];

            // Инициализация cURL
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: multipart/form-data']); // Важно!

            // Выполнение запроса
            $response = curl_exec($ch);

            // Проверка на ошибки
            if (curl_errno($ch)) {
                echo 'Ошибка cURL: ' . curl_error($ch);
            } else {
                // Вывод ответа от Telegram API
                echo $response;
            }

            // Закрытие соединения
            curl_close($ch);

           // _send_telegram('sendPhoto', $parameters);
        }

        /* Отправка сообщения в Telegram */
        function _send_telegram($method, $tg_bot_token, $parameters, $headers = [])
        {
        	$token = '6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs';
            $url = "https://api.telegram.org/bot" .$tg_bot_token. "/".$method;

            $options = array(
                'http' => array(
                    'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                    'method' => 'POST',
                    'content' => http_build_query($parameters)
                )
            );

            $context = stream_context_create($options);
            file_get_contents($url, false, $context);
        }
    ?>