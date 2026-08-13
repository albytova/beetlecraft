// Cloudflare Worker прокси для Telegram Bot API
// Источник: https://github.com/ndneighbor/telegram-cloudflare-proxy

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Проверка здоровья сервиса (корневой путь)
    if (path === "/" || path === "") {
        return new Response(JSON.stringify({
            status: "ok",
            message: "Telegram Bot API Proxy is running",
            usage: "https://your-worker.workers.dev/bot<YOUR_TOKEN>/<method>"
        }), {
            headers: { "Content-Type": "application/json" }
        });
    }

    // Извлекаем путь после /bot
    if (!path.startsWith("/bot")) {
        return new Response("Not Found. Use /bot<YOUR_TOKEN>/<method>", { status: 404 });
    }

    // Формируем URL для Telegram API
    const telegramUrl = `https://api.telegram.org${path}`;

    // Копируем метод и заголовки
    const method = request.method;
    const headers = new Headers(request.headers);

    // Убираем заголовки, которые могут мешать
    headers.delete("host");
    headers.delete("cf-ray");

    // Формируем тело запроса для POST/PUT методов
    let body = null;
    if (method !== "GET" && method !== "HEAD") {
        body = await request.arrayBuffer();
    }

    // Отправляем запрос в Telegram
    try {
        const response = await fetch(telegramUrl, {
            method: method,
            headers: headers,
            body: body
        });

        // Создаем ответ с CORS заголовками
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        responseHeaders.set("Access-Control-Allow-Headers", "Content-Type");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
        });

    } catch (error) {
        return new Response(JSON.stringify({
            error: "Failed to connect to Telegram API",
            details: error.message
        }), {
            status: 502,
            headers: { "Content-Type": "application/json" }
        });
    }
}

// Обработка OPTIONS запросов для CORS
async function handleOptions(request) {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
        }
    });
}

addEventListener("fetch", event => {
    const request = event.request;

    if (request.method === "OPTIONS") {
        event.respondWith(handleOptions(request));
    } else {
        event.respondWith(handleRequest(request));
    }
});