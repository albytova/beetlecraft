let API_GRID;
let DAY_SUM = 0;

init();

function init () {

    let gridApi;

    $.ajax({
        url: 'sale.php',
        type : 'GET',
        data: {
            query: "getBeers"
        },
        success : function (res) {

            let
                rowData = JSON.parse(res);

            const columnDefs = [
                {
                    headerName: "Наименование",
                    field: "name",
                    editable: false,  // Разрешаем редактирование
                    flex: 1 // Гибкая ширина (занимает оставшееся место)
                },
                {
                    headerName: "$",
                    field: "cost",
                    editable: false,
                    width: 70
                },
                {
                    headerName: "Ξ",
                    field: "count",
                    editable: true,
                    width: 70, // Фиксированная ширина
                    cellEditor: 'agNumberCellEditor',
                    cellEditorParams: { min: 0, step: 1 }
                }
            ];

            // Настройки таблицы
            const gridOptions = {
                columnDefs: columnDefs,
                rowData: rowData,
                defaultColDef: {
                    sortable: false,  // Разрешаем сортировку
                    resizable: false  // Разрешаем изменять размер колонок
                },
                singleClickEdit: true,  // Редактирование по одному клику
                rowSelection: {
                    mode: 'singleRow',
                    checkboxes: true,
                    enableClickSelection: true,
                },
                onCellValueChanged: (event) => {

                    const allData = API_GRID.getRenderedNodes().map(node => node.data);
                    const result = getResult(allData);

                    $("#resultText").html("ИТОГО: " + result + " руб");
                }
            };

            const myGridElement = document.querySelector('#myGrid');
            API_GRID = agGrid.createGrid(myGridElement, gridOptions);

        },
        error : function () {
            console.log ('error');
        }
    });

    $.ajax({
        url: 'sale.php',
        type : 'GET',
        data: {
            query: "getSumPay"
        },
        success : function (res) {

            let
                rowData = JSON.parse(res);

            if (rowData[0]["total_sales_today"] > 0) {
                DAY_SUM = parseInt(rowData[0]["total_sales_today"]);
                $("#sumText").html("Продаж за день: " + DAY_SUM + " руб");
            }
        },
        error : function () {
            console.log ('error');
        }
    });
}

function addRow () {

    let newName = prompt("Введите название");
    if (newName && newName.length > 0) {

        $.ajax({
            url: 'sale.php',
            type : 'GET',
            data: {
                query: "addBeer",
                newname: newName
            },
            success : function (res) {

                reloadGrid();
            },
            error : function () {
                console.log ('error');
            }
        });
    }
}

function deleteRow () {

    const record = API_GRID.getSelectedRows();

    if (!record || !record[0])
        return;

    let isBoss = confirm("Вы действительно хотите удалить "+ record[0]["name"] +"?");
    if (isBoss) {

        $.ajax({
            url: 'sale.php',
            type : 'GET',
            data: {
                query: "deleteBeer",
                id: record[0]["id"]
            },
            success : function (res) {

                reloadGrid();
            },
            error : function () {
                console.log ('error');
            }
        });
    }
}

function reloadGrid () {

    $.ajax({
        url: 'sale.php',
        type : 'GET',
        data: {
            query: "getBeers"
        },
        success : function (res) {

            let rowData = JSON.parse(res);
            API_GRID.setGridOption("rowData", rowData);
        },
        error : function () {
            console.log ('error');
        }
    });
}

function editRow () {

    const record = API_GRID.getSelectedRows();

    if (!record || !record[0])
        return;

    let newCost = prompt("Введите новую сумму");
    if (newCost > 0) {

        $.ajax({
            url: 'sale.php',
            type : 'GET',
            data: {
                query: "editBeer",
                id: record[0]["id"],
                newcost: newCost
            },
            success : function (res) {

                reloadGrid();
            },
            error : function () {
                console.log ('error');
            }
        });
    }
}

function getResult (data) {

    let resultSum = 0;

    data.forEach((element) => {
        if (element.count && parseInt(element.count) > 0)
            resultSum += parseInt(element.count) * parseInt(element.cost);
    });

    return resultSum;
}

function closeDay (text) {

    let payTerminal = prompt('Сумма оплат по терминалу:');
    if (payTerminal > 0) {

        let message = moment().format('DD.MM.YYYY') + "\n\n";
        message += "Продажи за день: " + DAY_SUM + " руб\n";
        message += "Продажи по терминалу: " + payTerminal + " руб\n\n";

        console.log(message);

        $.ajax({
            url: 'sale.php',
            type : 'GET',
            data: {
                query: "getDayResult"
            },
            success : function (res) {

                let rowData = JSON.parse(res);

                for (let i = 0; i < rowData.length; i++) {
                    message += rowData[i]["shop_name"] + " - " + rowData[i]["total_count"] + "шт\n";
                }

                $.ajax({
                    url: 'sale.php',
                    type : 'GET',
                    data: {
                        query: "sendMessageTelegram",
                        message: message
                    },
                    success : function (res) {
                        DAY_SUM = 0;
                        $("#sumText").html("Продаж за день: ");
                    },
                    error : function () {
                        console.log ('error');
                    }
                });
            },
            error : function () {
                console.log ('error');
            }
        });
    }
}

function click333 (text) {

    const allData = API_GRID.getRenderedNodes().map(node => node.data);
    const result = getResult(allData);

   if (result <= 0)
       return;

    let pay = prompt('Сумма', result);

    if (pay > 0) {

        DAY_SUM += result;
        $("#resultText").html("ИТОГО: ");
        $("#sumText").html("Продаж за день: " + DAY_SUM + " руб");

        for (let i = 0; i < allData.length; i++) {
            if (allData[i]["count"] && allData[i]["count"] > 0) {
                let data = {
                    id: allData[i]["id"],
                    name: allData[i]["name"],
                    cost:  allData[i]["count"] * allData[i]["cost"],
                    count: allData[i]["count"]
                };
                savePay(data);
                allData[i]["count"] = null;
            }
        }

        API_GRID.setGridOption("rowData", allData);
    }
}

function savePay (data) {

    $.ajax({
        url: 'sale.php',
        type : 'GET',
        data: {
            query: "savePay",
            id_shop_nsi: data["id"],
            count: data["count"],
            cost: data["cost"]
        },
        success : function (res) {

            let
                rowData = JSON.parse(res);

            console.log(rowData);
        },
        error : function () {
            console.log ('error');
        }
    });
}