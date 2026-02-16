Ext.define('lk.view.main.BeetleProfController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.beetleprof',

    load: function () {
        this.loadUpak();
        this.loadKitchen();
    },

    loadUpak: function () {
        const gridUpak = this.getView().down("[name=gridUpak]");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryBeetleProf.php',
            params : {
                'query' : 'getUpak'
            },
            success: function(result) {
                if (result && result.status == 200) {
                    const data = JSON.parse(result.responseText);
                    let dataObj = [];
                    for (let i = 0; i < data.length; i++) {
                        dataObj.push({
                            name: data[i][0],
                            type: data[i][1]
                        });
                    }
                    gridUpak.getStore().loadData(dataObj);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        })
    },

    onSendUpak: function () {
        const grid = this.getView().down("[name=gridUpak]");
        const button = this.getView().down("[name=btnDisabled]");
        let selectRows = grid.getSelection();
        let result = {};

        if (selectRows.length == 0)
            return;

        for (let i = 0; i < selectRows.length; i++) {
            let type = selectRows[i].data["type"];
            if (!result[type])
                result[type] = [];
            result[type].push(selectRows[i].data["name"]);
        }

        let resultText = "BeetleCraft: НУЖНО ЗАКАЗАТЬ", resultHtml = "<b><font size='4'>BeetleCraft: НУЖНО ЗАКАЗАТЬ</b>";
        for (let key in result) {
            resultText += "%0A%0A<b>" + key + "</b>%0A" + result[key].join("%0A");
            resultHtml += "<br><br><b>" + key + "</b><br>" + result[key].join("<br>");
        }
        resultHtml += "</font>";

        Ext.Ajax.request({
            url : "https://api.telegram.org/bot2120158110:AAHHK3gxIGJfbPQ1ghssiA4jjzi5J5wQwaQ/sendMessage?chat_id=-1001740415485&parse_mode=html&text="+resultText,
            method : 'GET',
            success : function (result) {
                grid.setVisible(false);
                label.setHtml(resultHtml);
                button.setDisabled(false);
            },
            error : function (err) {
                console.log (err);
                console.log ('error');
            }
        });
    },

    onResetUpak: function () {

        const button = this.getView().down("[name=btnDisabled]");
        button.setDisabled(true);

        const grid = this.getView().down("[name=gridUpak]");
        grid.setVisible(true);
    },

    /* Загрузка списка продуктов */
    loadKitchen: function () {
        // const gridProducts = this.getView().down("[name=gridProducts]");
        // Ext.Ajax.request({
        //     method: 'GET',
        //     url: './php/classes/QueryBeetleProf.php',
        //     params : {
        //         'query' : 'getProducts'
        //     },
        //     success: function(result) {
        //         if (result && result.status === 200) {
        //             const data = JSON.parse(result.responseText);
        //             gridProducts.getStore().loadData(data);
        //         }
        //     },
        //     failure: function(result) {
        //         console.log(result);
        //     }
        // });
    },

    /* Отправка заказа продуктов */
    onSendProduct: function () {
        const grid = this.getView().down("[name=gridProducts]");
        const label = this.getView().down("[name=lblResult]");
        const button = this.getView().down("[name=btnDisabled]");
        let selectRows = grid.getSelection();
        let result = {};

        if (selectRows.length === 0)
            return;

        for (let i = 0; i < selectRows.length; i++) {
            let place = selectRows[i].data["place"];
            if (!result[place])
                result[place] = [];
            result[place].push(selectRows[i].data["name"]);
        }

        let resultText = "ЗАМЕДЛЕНИЕ: НУЖНО ЗАКАЗАТЬ", resultHtml = "<b><font size='4'>ЗАМЕДЛЕНИЕ: НУЖНО ЗАКАЗАТЬ</b>";
        for (let key in result) {
            resultText += "%0A%0A<b>" + key + "</b>%0A" + result[key].join("%0A");
            resultHtml += "<br><br><b>" + key + "</b><br>" + result[key].join("<br>");
        }
        resultHtml += "</font>"

        Ext.Ajax.request({
            url : "https://api.telegram.org/bot2120158110:AAHHK3gxIGJfbPQ1ghssiA4jjzi5J5wQwaQ/sendMessage?chat_id=-1001740415485&parse_mode=html&text="+resultText,
            method : 'GET',
            success : function (result) {
                grid.setVisible(false);
                label.setHtml(resultHtml);
                button.setDisabled(false);
            },
            error : function (err) {
                console.log (err);
                console.log ('error');
            }
        });
    },

    /* Обновление таблицы продуктов */
    onResetProduct: function () {
        const label = this.getView().down("[name=lblResult]");
        label.setHtml("");

        const button = this.getView().down("[name=btnDisabled]");
        button.setDisabled(true);

        const grid = this.getView().down("[name=gridProducts]");
        grid.setVisible(true);
    }
});
