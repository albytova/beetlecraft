function load () {

    $.ajax({
        method: 'GET',
        url: 'db.php',
        data: {
            'query': 'getReserv'
        },
        success: function (result) {
            if (result) {
                let data = JSON.parse(result);

                data = formatForGrid(data);

                data = sortReserv(data);

                $("#jsGrid").jsGrid({
                    width: "100%",

                    inserting: false,
                    editing: true,
                    sorting: true,
                    paging: false,
                    selecting: true,

                    data: data,

                    fields: [
                        { title: "Номер", name: "num", type: "text", editing: false},
                        { title: "Клиент", name: "f_kontragent", type: "text", editing: false},
                        { title: "Дата", name: "f_date_reserv", type: "text", editing: false },
                        { title: "Заказ", name: "reserv_text", type: "text", editing: false },
                        { title: "Сумма", name: "all_sum", type: "text", editing: false },
                        { title: "Выпол-нено", type: "checkbox", name: "b_is_exec", sorting: false, editing: false },
                        { title: "Опла-чено", type: "checkbox", name: "b_is_pay", sorting: false },
                    ]
                });
            }

        }
    })
}

function loadKntrs () {
    $.ajax({
        method: 'GET',
        url: 'db.php',
        data: {
            'query': 'loadKntrs'
        },
        success: function (result) {
            if (result) {
                let data = JSON.parse(result);

                var $select = $('#select-klient');
                $.each(data,function(key, value)
                {
                    $select.append('<option value=' + value["id"] + '>' + value["name"] + '</option>'); // return empty
                });
                load();
            }
        }
    })
}

function sortReserv (data) {
    let initData = getInputValues();

    let managerFilterData = [];
    if (initData.manager == "0")
        managerFilterData = data;
    else {
        data.forEach(function(item, i, arr) {
            switch (initData.manager) {
                case "1":
                    if (item["manager"] == 1) managerFilterData.push(item);
                    break;
                case "2":
                    if (item["manager"] == 2) managerFilterData.push(item);
                    break;
                case "3":
                    if (item["manager"] == 3) managerFilterData.push(item);
                    break;
            }
        })
    }

    let klientFilterData = [];
    if (initData.klient == "0")
        klientFilterData = managerFilterData;
    else {
        managerFilterData.forEach(function(item, i, arr) {
            if (item["konragent_id"] == initData.klient)
                klientFilterData.push(item);
        })
    }
    let dateFilterData = [];
    klientFilterData.forEach(function(item, i, arr) {
        let c_date = new Date(item["date_reserv"]);
        if (c_date >= initData.d_date_from && c_date <= initData.d_date_to)
            dateFilterData.push(item);
    })

    return dateFilterData;
}

function getInputValues () {
    let manager = $("#select-manager").val();
    let klient = $("#select-klient").val();
    let date_from = $("#date-from").val();
    let date_to = $("#date-to").val();
    return {
        manager: manager,
        klient: klient,
        date_from: date_from,
        d_date_from: new Date(date_from),
        date_to: date_to,
        d_date_to: new Date(date_to)
    };
}

function formatForGrid (data) {
    data.forEach(function(item, i, arr) {
        item["b_is_exec"] = item["is_exec"] == "1" ? true : false;
        item["b_is_pay"] = item["is_pay"] == "1" ? true : false;

        item["f_date_reserv"] = moment(item["date_reserv"]).format("DD.MM.YYYY");
        item["all_sum"] = "";
        let cost_05 = 0, cost_1 = 0, cost_15 = 0, cost_2 = 0;

        let arr_reserv = [];
        if (item["count_l05"] != "0") {
            arr_reserv.push("0.5л = "+item["count_l05"]);
            cost_05 = (+(item["count_l05"]))*(+(item["cost_05"]));
        }
        if (item["count_l1"] != "0") {
            arr_reserv.push("1л = "+item["count_l1"]);
            cost_1 = (+(item["count_l1"]))*(+(item["cost_01"]));
        }
        if (item["count_l15"] != "0") {
            arr_reserv.push("1.5л = "+item["count_l15"]);
            cost_15 = (+(item["count_l15"]))*(+(item["cost_15"]));
        }
        if (item["count_l2"] != "0") {
            arr_reserv.push("2л = "+item["count_l2"]);
            cost_2 = (+(item["count_l2"]))*(+(item["cost_02"]));
        }

        item["all_sum"] = cost_05 + cost_1 + cost_15 + cost_2;
        item["all_sum"] = item["all_sum"] > 0 ? item["all_sum"] + "р" : "";

        item["reserv_text"] = arr_reserv.join(",");
        item["f_kontragent"] = "<font size='4'>" + item["kontragent"] + "</font>";
        item["reserv_text"] = "<i><font size='2'>" + item["reserv_text"] + "</font></i>";


    });
    return data;
}