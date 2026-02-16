Ext.define('lk.view.main.PriceController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.price',

    LoadData: [],

    onLoad: function () {console.log("onLoad");
        const fieldRow1 = this.getView().down("[name=fieldRow1]");
        const fieldRow2 = this.getView().down("[name=fieldRow2]");
        const controller = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryPrice.php',
            params : {
                'query' : 'getData'
            },
            success: function(result) {
                if (result && result.status === 200) {
                    var
                        data = JSON.parse(result.responseText),
                        row1 = fieldRow1.getValue()-1,
                        row2 = fieldRow2.getValue();
                    let tdata = data.slice(row1, row2);

                    controller.calculate(tdata, data[row1][0], data[row1][2]);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        });
    },

    calculate: function (data, distr, price_drive) { console.log("calculate");
        var
            dataObj = [],
            allCount = 0,
            gridPrice = this.getView().down("[name=gridPrice]"),
            lblDistr = this.getView().down("[name=lblDistr]");

        lblDistr.setHtml("<h2>"+distr+"</h2>");

        for (let i = 1; i < data.length; i++) {
            let count = 0;
            if (data[i][2] === "бутылки" || data[i][2] === "бутылки premium")
                count = (+data[i][3]);
            else if (data[i][2] === "кег 20л")
                count = 19;
            else if (data[i][2] === "кег 30л")
                count = 28;

            dataObj.push({
                brewery: data[i][0],
                name: data[i][1],
                namebrew: data[i][1],
                type: data[i][2],
                count: count,
                price: +(data[i][4]),
                bar: data[i][5],
                dist: data[i][6],
                abv: data[i][7],
                ibu: data[i][8],
                price1: '',
                price2: '',
                price3: '',
                price4: '',
                price5: ''
            });

            allCount += (+count);
        }
console.log(dataObj);
        price_drive = price_drive / allCount;
console.log(price_drive);
        dataObj.forEach(function(item, i, arr) {
            if (item.type === "бутылки") {
                item.price1 = myRound(((item.price / item.count) + price_drive )*1.69);

                console.log(data[i+1][1] + " = " + item.price + " / " + item.count + " = " + (item.price / item.count));


            }
            if (item.type === "бутылки premium") {
                item.price1 = myRound(((item.price / item.count) + price_drive)*1.52);
            }
            if (item.type === "кег 20л" || item.type === "кег 30л") {
                const t = myRound(((item.price / item.count) + price_drive)*1.62);
                item.price1 = myRound(t*0.5 + 17);
                item.price2 = myRound(t + 15);
                item.price3 = myRound(t*1.5+15);
                item.price4 = myRound(t*0.3+50);
                item.price5 = myRound(t*0.5+50);
            }
        });

        gridPrice.getStore().loadData(dataObj);

        this.LoadData = dataObj;

        function myRound (num) {
            num = Math.ceil(num);
            return Math.round(num/5)*5;
        }
    },

    onPush: function () {
        //Замедление Розлив

        const panelAdmin = this.getView().up();

        for (let i = 0; i < this.LoadData.length; i++) {
            if (this.LoadData[i].bar === "Замедление времени") {
                Ext.Ajax.request({
                    method: 'GET',

                    url: './php/classes/QueryPrice.php',
                    params : {
                        'query': "loadDraftZmd",
                        'name': this.LoadData[i].name,
                        'brewery': this.LoadData[i].brewery,
                        'coin_300': this.LoadData[i].price4,
                        'coin_500': this.LoadData[i].price5,
                        'dist': this.LoadData[i].dist,
                        'abv': this.LoadData[i].abv? this.LoadData[i].abv : "null",
                        'ibu': this.LoadData[i].ibu? this.LoadData[i].ibu : "null"
                    },

                    success: function(res) {

                        if (res.responseText.indexOf('Connection Error') > -1) {
                            Ext.Msg.alert('error', res.responseText);
                            console.log(res.responseText);
                        }
                        else {
                            panelAdmin.getController().loadTasks();
                            Ext.Msg.alert('Добавлено', "Кеги добавлены");
                            //todo добавить пуш в телеграмм
                        }
                    },
                    failure: function() {
                        Ext.Msg.alert('error', 'Not Ok');
                    }
                });
            }
        }
     }
})