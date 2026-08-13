
<?php
/**
 * Тестовая функция для проверки отправки сообщения в Telegram через Cloudflare Worker прокси
 * Прокси: https://telegram-proxy.albytova-elena.workers.dev/
 */

// Конфигурация
$tg_chat_id = '-1002259216582';
$tg_bot_token = '6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs';
$proxy_url = 'https://telegram-proxy.albytova-elena.workers.dev';

/**
 * Функция отправки сообщения через прокси
 */
function send_test_message($chat_id, $token, $message, $proxy_url) {
    // Формируем URL с прокси
    $url = "{$proxy_url}/bot{$token}/sendMessage";

    // Параметры сообщения
    $data = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    // Инициализация CURL
    $ch = curl_init();

    // Настройки CURL
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HEADER, false);

    // Для отладки - вывод подробной информации
    curl_setopt($ch, CURLOPT_VERBOSE, true);

    // Выполняем запрос
    $response = curl_exec($ch);

    // Проверка на ошибки CURL
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        return [
            'success' => false,
            'error' => "CURL Error: " . $error
        ];
    }

    // Получаем HTTP код
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    // Декодируем ответ
    $result = json_decode($response, true);

    // Возвращаем результат
    return [
        'success' => ($http_code == 200 && isset($result['ok']) && $result['ok'] === true),
        'http_code' => $http_code,
        'response' => $result,
        'raw_response' => $response
    ];
}

/**
 * Альтернативная функция с прямой отправкой (без прокси) для сравнения
 */
function send_test_message_direct($chat_id, $token, $message) {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";

    $data = [
        'chat_id' => $chat_id,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    return [
        'success' => ($http_code == 200 && isset($result['ok']) && $result['ok'] === true),
        'http_code' => $http_code,
        'response' => $result
    ];
}

/**
 * Проверка доступности прокси
 */
function check_proxy($proxy_url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $proxy_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    curl_setopt($ch, CURLOPT_HEADER, true);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'available' => ($http_code == 200),
        'http_code' => $http_code,
        'response' => substr($response, 0, 500)
    ];
}

/**
 * Проверка работы бота через прокси
 */
function check_bot($proxy_url, $token) {
    $url = "{$proxy_url}/bot{$token}/getMe";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    return [
        'success' => ($http_code == 200 && isset($result['ok']) && $result['ok'] === true),
        'http_code' => $http_code,
        'bot_info' => $result['result'] ?? null,
        'response' => $response
    ];
}

// ==================== ЗАПУСК ТЕСТА ====================

echo "<!DOCTYPE html>\n";
echo "<html>\n<head>\n";
echo "<meta charset='UTF-8'>\n";
echo "<title>Тест отправки сообщения в Telegram</title>\n";
echo "<style>
    body { font-family: monospace; margin: 20px; background: #f5f5f5; }
    .test { background: white; border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
    .info { color: blue; }
    pre { background: #f0f0f0; padding: 10px; overflow: auto; }
    h2 { margin-top: 0; }
</style>\n";
echo "</head>\n<body>\n";

echo "<h1>📨 Тест отправки сообщения в Telegram</h1>\n";

// 1. Проверка конфигурации
echo "<div class='test'>\n";
echo "<h2>⚙️ Конфигурация</h2>\n";
echo "<p><strong>Chat ID:</strong> " . htmlspecialchars($tg_chat_id) . "</p>\n";
echo "<p><strong>Bot Token:</strong> " . substr($tg_bot_token, 0, 10) . "..." . substr($tg_bot_token, -5) . "</p>\n";
echo "<p><strong>Proxy URL:</strong> " . htmlspecialchars($proxy_url) . "</p>\n";
echo "</div>\n";

// 2. Проверка доступности прокси
echo "<div class='test'>\n";
echo "<h2>🌐 Проверка доступности прокси</h2>\n";
$proxy_check = check_proxy($proxy_url);
if ($proxy_check['available']) {
    echo "<p class='success'>✅ Прокси доступен (HTTP {$proxy_check['http_code']})</p>\n";
    // Показываем ответ прокси
    echo "<details>\n<summary>Ответ прокси</summary>\n";
    echo "<pre>" . htmlspecialchars($proxy_check['response']) . "</pre>\n";
    echo "</details>\n";
} else {
    echo "<p class='error'>❌ Прокси НЕ ДОСТУПЕН (HTTP {$proxy_check['http_code']})</p>\n";
    echo "<p>Проверьте URL прокси. Он должен выглядеть так: https://ваш-воркер.workers.dev</p>\n";
}
echo "</div>\n";

// 3. Проверка бота через прокси
echo "<div class='test'>\n";
echo "<h2>🤖 Проверка бота через прокси</h2>\n";
$bot_check = check_bot($proxy_url, $tg_bot_token);
if ($bot_check['success']) {
    $bot_name = $bot_check['bot_info']['first_name'] ?? 'Unknown';
    $bot_username = $bot_check['bot_info']['username'] ?? 'Unknown';
    echo "<p class='success'>✅ Бот работает через прокси!</p>\n";
    echo "<p><strong>Имя бота:</strong> " . htmlspecialchars($bot_name) . "</p>\n";
    echo "<p><strong>Username:</strong> @" . htmlspecialchars($bot_username) . "</p>\n";
} else {
    echo "<p class='error'>❌ Ошибка подключения к боту через прокси (HTTP {$bot_check['http_code']})</p>\n";
    echo "<details>\n<summary>Подробности ответа</summary>\n";
    echo "<pre>" . htmlspecialchars($bot_check['response']) . "</pre>\n";
    echo "</details>\n";
}
echo "</div>\n";

// 4. Отправка тестового сообщения через прокси
echo "<div class='test'>\n";
echo "<h2>📤 Отправка тестового сообщения через прокси</h2>\n";

$test_message = "✅ <b>Тестовое сообщение</b>\n";
$test_message .= "Время: " . date('Y-m-d H:i:s') . "\n";
$test_message .= "Это сообщение отправлено через Cloudflare Worker прокси!\n";
$test_message .= "Прокси: " . $proxy_url;

$result = send_test_message($tg_chat_id, $tg_bot_token, $test_message, $proxy_url);

if ($result['success']) {
    echo "<p class='success'>✅ Сообщение успешно отправлено!</p>\n";
    echo "<p><strong>HTTP код:</strong> {$result['http_code']}</p>\n";
    echo "<details>\n<summary>Ответ Telegram API</summary>\n";
    echo "<pre>" . htmlspecialchars(json_encode($result['response'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>\n";
    echo "</details>\n";
} else {
    echo "<p class='error'>❌ Ошибка отправки сообщения!</p>\n";
    echo "<p><strong>HTTP код:</strong> {$result['http_code']}</p>\n";
    if (isset($result['error'])) {
        echo "<p><strong>Ошибка:</strong> " . htmlspecialchars($result['error']) . "</p>\n";
    }
    if (isset($result['response'])) {
        echo "<details>\n<summary>Ответ Telegram API</summary>\n";
        echo "<pre>" . htmlspecialchars(json_encode($result['response'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . "</pre>\n";
        echo "</details>\n";
    }
}
echo "</div>\n";

// 5. Прямая проверка (без прокси) для сравнения
echo "<div class='test'>\n";
echo "<h2>📡 Проверка прямой отправки (без прокси, для сравнения)</h2>\n";
$direct_result = send_test_message_direct($tg_chat_id, $tg_bot_token, "Прямое сообщение: " . date('Y-m-d H:i:s'));

if ($direct_result['success']) {
    echo "<p class='success'>✅ Прямая отправка успешна!</p>\n";
    echo "<p class='info'>ℹ️ Это значит, что Telegram API доступен напрямую (возможно VPN включен на сервере)</p>\n";
} else {
    echo "<p class='error'>❌ Прямая отправка не удалась (HTTP {$direct_result['http_code']})</p>\n";
    echo "<p class='info'>ℹ️ Это ожидаемо, если Telegram заблокирован. Нужно использовать прокси.</p>\n";
    if (isset($direct_result['response']['description'])) {
        echo "<p><strong>Описание ошибки:</strong> " . htmlspecialchars($direct_result['response']['description']) . "</p>\n";
    }
}
echo "</div>\n";

// 6. Рекомендации
echo "<div class='test'>\n";
echo "<h2>💡 Рекомендации</h2>\n";

if (!$proxy_check['available']) {
    echo "<p class='error'>⚠️ Прокси недоступен. Проверьте:</p>\n";
    echo "<ul>\n";
    echo "<li>Правильно ли указан URL прокси (https://telegram-proxy.albytova-elena.workers.dev)</li>\n";
    echo "<li>Задеплоен ли Worker на Cloudflare</li>\n";
    echo "</ul>\n";
} elseif (!$bot_check['success']) {
    echo "<p class='error'>⚠️ Бот не отвечает через прокси. Проверьте:</p>\n";
    echo "<ul>\n";
    echo "<li>Правильно ли указан токен бота: 6918947975:AAFt9DkZ5V39oK7qkfOdlgshNVZV7m3IePs</li>\n";
    echo "<li>Активен ли бот (не заблокирован, не удален)</li>\n";
    echo "<li>Правильно ли работает Worker (открыть в браузере: " . htmlspecialchars($proxy_url) . ")</li>\n";
    echo "</ul>\n";
} elseif ($result['success']) {
    echo "<p class='success'>✅ Все работает! Теперь вы можете использовать этот прокси в вашем основном коде.</p>\n";
    echo "<p>Пример использования в вашей функции _send_telegram:</p>\n";
    echo "<pre>\nfunction _send_telegram(\$method, \$token, \$parameters) {\n";
    echo "    \$url = \"https://telegram-proxy.albytova-elena.workers.dev/bot{\$token}/{\$method}\";\n";
    echo "    // ... остальной код\n";
    echo "}\n";
    echo "</pre>\n";
    echo "<p>Или при вызове вашей функции:</p>\n";
    echo "<pre>\n_send_message(\"Тестовое сообщение\", null, null);\n</pre>\n";
}

echo "</div>\n";

// 7. Информация для отладки
echo "<div class='test'>\n";
echo "<h2>🔧 Информация для отладки</h2>\n";
echo "<p><strong>PHP версия:</strong> " . phpversion() . "</p>\n";
echo "<p><strong>CURL доступен:</strong> " . (function_exists('curl_version') ? '✅ Да' : '❌ Нет') . "</p>\n";
if (function_exists('curl_version')) {
    $curl_info = curl_version();
    echo "<p><strong>CURL версия:</strong> " . $curl_info['version'] . "</p>\n";
}
echo "<p><strong>Дата/время сервера:</strong> " . date('Y-m-d H:i:s') . "</p>\n";
echo "</div>\n";

echo "</body>\n</html>\n";

?>