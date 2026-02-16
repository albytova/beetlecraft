Ext.define('beetlecraft.view.main.Analytics.PaymentController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.payment',

    onActivate: function () {

        this.load();
    },

    load: function () {

        const me = this;

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Payment.php',
            params: {
                "query": "getShifts"
            },

            success: function (result) {

                let rez = JSON.parse(result.responseText);
                if (rez.length === 0)
                    return;

                const gridPayment = me.getView().lookupReference("grid_payment");

                for (let i = 0; i < rez.length; i++) {

                    if ( parseInt(rez[i]["money_all"]) >= 20000)
                        rez[i]["payment"] = 1400 + parseInt(rez[i]["money_all"])*0.07;
                    else
                        rez[i]["payment"] = 1400;
                }

                gridPayment.getStore().loadData(rez);
            },

            failure: function (result) {
                Ext.Msg.alert("Внимание", result.responseText);
            }
        })
    },

    onSendPaymentWeek: function () {

        const storePayment = Ext.data.StoreManager.lookup("storePayment");
        const dataPayment = storePayment.getData().items;

        let dataWeek = [];
        for (let i = 0; i < dataPayment.length; i++) {

            let dt_shift = new Date (dataPayment[i].data["date_shift"]);
            const day_week = Ext.Date.format(dt_shift, "D");

            if (day_week === "Вос") {

                dataWeek.push( dataPayment[i].data );
                dataWeek.push( dataPayment[i+1].data );
                dataWeek.push( dataPayment[i+2].data );
                dataWeek.push( dataPayment[i+3].data );
                dataWeek.push( dataPayment[i+4].data );
                dataWeek.push( dataPayment[i+5].data );
                dataWeek.push( dataPayment[i+6].data );

                break;
            }
        }

        let objWeek = {};
        for (let i = 0; i < dataWeek.length; i++) {

            if (!objWeek[ dataWeek[i]["barman"] ])
                objWeek[ dataWeek[i]["barman"] ] = 0;

            objWeek[ dataWeek[i]["barman"] ] += parseInt(dataWeek[i]["payment"]);
        }

        let message = "Зарплата за последнюю неделю:\n\n";
        for (let barman in objWeek) {

            message += barman + " " + objWeek[barman] + "\n";
        }

        Ext.Ajax.request({
            method: 'GET',
            url: './php/Admission.php',
            params: {
                'query': 'sendMessageTGAdmin',
                'message': message,
                'photo': "",
                'document': null
            },
            success: function (result) {
                console.log("Сообщение отправлено");
                Ext.Msg.alert('Untappt', 'Сообщение отправлено Администратору');
            },
            failure: function (result) {
                Ext.Msg.alert(result.responseText);
            }
        })
    }
});
