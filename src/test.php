<?php

// Увеличиваем лимит времени выполнения до 300 секунд (5 минут)
set_time_limit(300);

$client_id = '249F2A5D9807CA76D4E06B5BBE8F60124EACDDCB';
$client_secret = 'F14F94983A2AED236905DAA21821D47A8154EDEF';
$beer_id = '1591952';

// Количество записей с комментариями, которые нужно получить
$target_comment_count = 200;

// Переменная для хранения последнего ID чекина
$max_id = null;

// Массив для хранения комментариев
$comments = [];

// Цикл для получения записей с комментариями
while (count($comments) < $target_comment_count) {
    // Формируем URL для запроса к API Untappd
    $url = "https://api.untappd.com/v4/beer/checkins/$beer_id?client_id=$client_id&client_secret=$client_secret&limit=25";
    if ($max_id) {
        $url .= "&max_id=$max_id"; // Добавляем max_id, если он есть
    }

    // Инициализация cURL
    $ch = curl_init();

    // Настройка параметров cURL
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Выполнение запроса и получение ответа
    $response = curl_exec($ch);

    // Проверка на ошибки
    if (curl_errno($ch)) {
        echo 'Ошибка cURL: ' . curl_error($ch);
        break;
    } else {
        // Декодирование JSON ответа
        $data = json_decode($response, true);

        // Проверка на наличие данных
        if (isset($data['response']['checkins']['items'])) {
            $checkins = $data['response']['checkins']['items'];

            // Перебор записей
            foreach ($checkins as $checkin) {
                // Проверка, есть ли комментарий
                if (!empty($checkin['checkin_comment'])) {
                    // Добавляем комментарий в массив
                    $comments[] = $checkin['checkin_comment'];

                    // Обновляем max_id для следующего запроса
                    $max_id = $checkin['checkin_id'];

                    // Остановка, если набрали 200 комментариев
                    if (count($comments) >= $target_comment_count) {
                        break 2; // Выход из обоих циклов
                    }
                }
            }
        } else {
            echo "Нет данных о чекинах.";
            break;
        }
    }

    // Закрытие cURL
    curl_close($ch);

    // Задержка между запросами (1 секунда)
    sleep(1);
}

// Вывод комментариев на экран
if (!empty($comments)) {
    echo "<h2>Комментарии:</h2>";
    foreach ($comments as $comment) {
        echo htmlspecialchars($comment) . "<br><hr>";
    }
} else {
    echo "Нет записей с комментариями.";
}

// Сохранение комментариев в CSV-файл
if (!empty($comments)) {
    $filename = 'comments.csv';
    $file = fopen($filename, 'w');

    // Запись заголовка CSV
    fputcsv($file, ['Comment']);

    // Запись комментариев в CSV
    foreach ($comments as $comment) {
        fputcsv($file, [$comment]);
    }

    fclose($file);
    echo "<br>Комментарии сохранены в файл: $filename";
}

?>