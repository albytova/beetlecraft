function init () {
 //   getDraftGoogle();
 //   getBottleGoogle();
    getFood();
}

function getDraftGoogle () {

    var
        result = [];

    $.ajax({
        url : "tv.php",
        type : 'POST',
        data: {
            query: "getDraft"
        },
        success : function (res) {

            var
                data = JSON.parse(res);

            for (var i = 0; i < data.length; i++) {
                if (data[i][1].length == 0)
                    continue;

                var obj = getFormatDraftRow(data[i]);

                result.push(obj);
            }

            getDataFromUntappd (result);

            for (let i = 0; i < result.length; i++) {
                $("#tv-cell-" + result[i]["NUM_TAP"]).append("<span>"+result[i]["name"]+"</span>");
                $("#tv-cell-" + result[i]["NUM_TAP"]).append(" [<span><i>"+result[i]["brewery_name"]+"</i></span>]");
               // $("#tv-cell-" + result[i]["NUM_TAP"]).append("<images class='images-fluid' class='tv-cell-images' src='" +result[i]["beer_label"]+"'/>");
                $("#tv-cell-" + result[i]["NUM_TAP"]).append("<span>"+result[i]["style"]+"</span>");
                //$("#tv-cell-" + result[i]["NUM_TAP"]).append("<br><span style='color: yellow'>Untappd "+result[i]["untappd_rating"]+"</span>");
            }

            },
        error : function () {
            console.log ('error');
        }
    });
}

function getDataFromUntappd (data) {

    //for (var i = 0; i < data.length; i++) {
    for (var i = 0; i < 1; i++) {

        setTimeout(
            function (iii) {

                $.ajax({
                    url: "tv.php",
                    type: 'POST',
                    data: {
                        query: "findBeerFromUntappd",
                        brewery_name: data[iii]["brewery_name"],
                        name: data[iii]["name"]
                    },
                    success: function (res) {

                        let
                            u_data = JSON.parse(res);

                        let beers = u_data.response.beers;
                        if (!beers)
                            return;

                        beers = beers.items;
                        let beer = beers[0].beer;
                        if (beers.length > 1) {
                            for (let k = 0; k < beers.length; k++) {
                                if (beers[k].beer.beer_name == data[iii]["name"]) {
                                    beer = beers[k].beer;
                                    break;
                                }
                            }
                        }

                        fillFullDataFromUntappd(beer, iii, data[iii]);
                    },
                    error: function () {
                        console.log('error');
                    }

                })
            }
            , 2000, i)
    }
}

function fillFullDataFromUntappd (beer, num, beer_data) {

    $.ajax({
        url: "tv.php",
        type: 'POST',
        data: {
            query: "fullBeerFromUntappd",
            bid: beer.bid
        },
        success: function (res) {

            let
                u_data = JSON.parse(res);

            u_data = u_data.response.beer;
            beer_data["beer_label"] = u_data.beer_label_hd;
            beer_data["rating"] = u_data.rating_score;
            showBeer(num, beer_data);
        },
        error: function () {
            console.log('error');
        }

    })
}

function showBeer (num, data) {
    $("#tv-cell-"+(num+1)).append("<images class='tv-cell-images' src='" +data["beer_label"]+"'/>");
}

function getFormatDraftRow (data) {

    var TYPES = [
            "0,5л",
            "1л",
            "1,5л"
        ],
        obj = {
            NUM_TAP: data[0],
            brewery_name: data[1],
            id_brewery: null,
            id: data[0],
            beer_id: null,
            name: data[2],
            name_text: null,
            style: data[3],
            abv: data[7],
            ibu: +data[8],
            filter_names: [data[4]]
            //untappd_bid: data[13],
            //beer_label: data[14],
            //untappd_rating: data[15]
        };

    if (!!data[5])
        obj.filter_names.push(data[5]);

    if (!!data[6])
        obj.filter_names.push(data[6]);

    var type_rub = "р";
    obj[ TYPES[0] ] = data[10] + type_rub;
    obj[ TYPES[1] ] = data[11] + type_rub;
    obj[ TYPES[2] ] = data[12] + type_rub;
    obj[ "info-"+TYPES[0] ] = {cost: data[10], cost_id: 0};
    obj[ "info-"+TYPES[1] ] = {cost: data[11], cost_id: 1};
    obj[ "info-"+TYPES[2] ] = {cost: data[12], cost_id: 2};
    obj[ "type-cost-"+TYPES[0] ] = TYPES[0];
    obj[ "type-cost-"+TYPES[1] ] = TYPES[1];
    obj[ "type-cost-"+TYPES[2] ] = TYPES[2];

    return obj;
}

function getFood () {
    console.log(1);
    $("#tv-food").css("background", "url('https://beetlecraft.ru/images/mlvch/pinca_pepe.jpg')");
}
