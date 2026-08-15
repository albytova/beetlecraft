var NAMES_ID = [];
var NAMES = {};
var PRICES = {};
var finalMessage = "";
var globalTotal = 0;

// Функция переключения чекбоксов оплаты
function selectPayment(type) {
    if (type === 'cash') {
        $('#payment-card').prop('checked', false);
        $('#cash-change-block').slideDown(200);
    } else {
        $('#payment-cash').prop('checked', false);
        $('#cash-change-block').slideUp(200);
        $('#cash-given').val('');
        $('#change-result').text('');
    }
}

// Калькулятор сдачи
function calculateChange() {
    let given = +$('#cash-given').val();
    if (given > 0 && given >= globalTotal) {
        let change = given - globalTotal;
        $('#change-result').text(`Сдача: ${change} руб.`).removeClass('text-danger').addClass('text-success');
    } else if (given > 0 && given < globalTotal) {
        $('#change-result').text('Сумма меньше стоимости заказа!').removeClass('text-success').addClass('text-danger');
    } else {
        $('#change-result').text('');
    }
}

// Загрузка меню из Google Таблицы через send_zakaz.php
function loadNames() {
    $.ajax({
        method: 'GET',
        url: './send_zakaz.php',
        data: { 'query': 'getNames' },
        success: function(result) {
            if (!result) return;
            try {
                let data = JSON.parse(result);
                data.forEach((element, index) => {
                    let id = element[0];
                    let name = element[1];
                    let price = element[2] ? parseInt(element[2]) : 0;

                    let bgColor = (index % 2 === 0) ? '#f8f9fa' : '#ffffff';

                    // Добавляем верстку, используя CSS-классы вместо инлайн-стилей
                    $("#p-names").append(
                        `<div style="background-color: ${bgColor};" class="dish-row">` +
                        `<span class="dish-info">${name} <span class="text-success ml-2 font-weight-bold">${price} ₽</span></span>` +
                        `<input id="dish-${id}" type="number" class="form-control text-center font-weight-bold dish-input" min="0" max="10" value="0">` +
                        `</div>`
                    );

                    NAMES_ID.push(id);
                    NAMES[id] = name;
                    PRICES[id] = price;
                });
            } catch (e) {
                console.error("Ошибка парсинга JSON меню:", e);
            }
        }
    });
}

// Инициализация при загрузке документа
$(document).ready(function() {
    loadNames();
});

// ШАГ 1: Проверка заказа перед показом модального окна
function check_zakaz() {
    let count = 0;
    globalTotal = 0;

    let dishListHtml = "";
    let messageText = "🔔 <b>Новый заказ:</b>\n\n";

    NAMES_ID.forEach((id) => {
        let c = +document.getElementById("dish-" + id).value;
        if (c > 0) {
            let cost = PRICES[id] * c;
            globalTotal += cost;
            count += c;

            dishListHtml += `<li class="list-group-item d-flex justify-content-between align-items-center border-left-0 border-right-0 rounded-0 px-0">` +
                `<span style="font-size: 15px;"><b>${NAMES[id]}</b> <span class="text-muted">x${c}</span></span>` +
                `<span class="font-weight-bold text-dark">${cost} руб.</span>` +
                `</li>`;

            messageText += `• ${NAMES[id]} — ${c} шт. (${cost} руб.)\n`;
        }
    });

    if (count === 0) {
        $("#message-success").hide();
        $("#message-error").show();
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
    }
    $("#message-error").hide();

    let comment = document.getElementById("area-comment").value.trim();
    if (comment) {
        messageText += `\n💬 <b>Комментарий:</b> ${comment}\n`;
    }

    finalMessage = messageText;

    $("#modal-dish-list").html(dishListHtml);
    $("#modal-total-price").text(globalTotal);

    $('#payment-card').prop('checked', true);
    selectPayment('card');

    let myModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    myModal.show();
}

// ШАГ 2: Финальная отправка в Telegram
function send_zakaz() {
    let paymentMethod = $('#payment-cash').is(':checked') ? "Наличные" : "Безнал";
    let changeText = "";

    if (paymentMethod === "Наличные") {
        let given = +$('#cash-given').val();
        if (given > 0 && given < globalTotal) {
            alert("Введенная сумма наличных меньше общей стоимости заказа!");
            return;
        }
        changeText = given > 0 ? ` (Сдача с ${given} руб., сдача: ${given - globalTotal} руб.)` : " (Без сдачи)";
    }

    let fullTelegramMessage = finalMessage + `\n💰 <b>Итого к оплате:</b> ${globalTotal} руб.\n💳 <b>Оплата:</b> ${paymentMethod}${changeText}`;

    let modalElement = document.getElementById('confirmModal');
    let modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) { modalInstance.hide(); }

    $.ajax({
        method: 'POST',
        url: './send_zakaz.php',
        data: {
            'query': 'sendZakazNew',
            'message': fullTelegramMessage
        },
        success: function(result) {
            if (result.toString().trim() === "1") {
                $("#message-error").hide();
                $("#message-success").show();
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

                NAMES_ID.forEach((id) => {
                    document.getElementById("dish-" + id).value = 0;
                });
                document.getElementById("area-comment").value = "";
            } else {
                $("#message-success").hide();
                $("#message-error").text("Произошла ошибка на сервере. Попробуйте отправить еще раз.").show();
            }
        },
        error: function() {
            $("#message-success").hide();
            $("#message-error").text("Не удалось связаться с сервером. Проверьте internet.").show();
        }
    });
}
