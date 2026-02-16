<?php
// Проверяем, был ли отправлен файл
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['photo'])) {
    $uploadDir = 'uploads/'; // Папка для сохранения файлов
    $uploadFile = $uploadDir . basename($_FILES['photo']['name']);

    // Проверяем, существует ли папка uploads
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true); // Создаем папку, если её нет
    }

    // Проверяем, является ли файл изображением
    $imageFileType = strtolower(pathinfo($uploadFile, PATHINFO_EXTENSION));
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];

    if (!in_array($imageFileType, $allowedTypes)) {
        echo json_encode(['message' => 'Ошибка: разрешены только JPG, JPEG, PNG и GIF файлы.']);
        exit;
    }

    // Проверяем размер файла (например, не более 5 МБ)
    if ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['message' => 'Ошибка: файл слишком большой. Максимальный размер — 5 МБ.']);
        exit;
    }

    // Пытаемся переместить файл в папку uploads
    if (move_uploaded_file($_FILES['photo']['tmp_name'], $uploadFile)) {
        echo json_encode(['message' => 'Файл успешно загружен.']);
    } else {
        echo json_encode(['message' => 'Ошибка при загрузке файла.']);
    }
} else {
    echo json_encode(['message' => 'Ошибка: файл не был отправлен.']);
}
?>