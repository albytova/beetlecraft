loadData();

function loadData() {
    //$("#currentdata").html(moment().format("DD.MM.YYYY")); //todo передавать дату в скрипт
    $("#currentdata").html("13.01.2020");

    var request = $.ajax({
        url: "./gettoday.php",
        type: "post"
    });

    request.done(function (response, textStatus, jqXHR){
        if (textStatus != "success")
            return;

        var data = JSON.parse(response);

        $("#jsGrid").jsGrid({

            width: "100%",
            height: "auto",

            inserting: false,
            editing: false,
            sorting: true,
            paging: false,

            data: data,

            fields: [
                { name: "name", title:"Name", type: "text", width: 150 },
                { name: "type", title:"Type", type: "text", width: 50 },
                { name: "globex", title:"Globex", type: "number", width: 50 },
                { name: "open_interest", title:"Open Interest", type: "number", width: 50 },
                { name: "oi_change", title:"Change", type: "number", width: 50 },
            ]
        });
    });
}