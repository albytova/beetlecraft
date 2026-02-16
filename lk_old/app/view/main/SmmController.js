Ext.define('lk.view.main.SmmController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.smm',

    onLoad: function () {
        this.loadInitData();
    },

    loadInitData: function () {

        var
            panel = this,
            counterLoad = 3;

        Ext.getBody().mask('Загрузка...');

        const dt = new Date;
        const today = Ext.Date.format(dt, 'd.m.Y');

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QuerySMM.php',
            params : {
                'query' : 'getSmmDraft'
            },
            success: function(result) {

                counterLoad--;
                if (counterLoad === 0) {
                    Ext.getBody().unmask();
                   // this.onToday();
                }

                if (!result || result.status !== 200)
                    return;

                let data = JSON.parse(result.responseText);

                let data_beetle_today = data.filter(function(row) {
                    return (row[9] === today && row[8] === 'BeetleCraft');
                });

                panel.getView().InitData['draft']['beetle'] = {
                        "today": data_beetle_today
                };
            },
            failure: function(result) {
                Ext.getBody().unmask();
            }
        });

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QuerySMM.php',
            params : {
                'query' : 'getSmmZmdDraft'
            },
            success: function(result) {

                counterLoad--;
                if (counterLoad === 0) {
                    Ext.getBody().unmask();
                   // this.onToday();
                }

                if (!result || result.status !== 200)
                    return;

               // let data = JSON.parse(result.responseText);
            },
            failure: function(result) {
                Ext.getBody().unmask();
            }
        });

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QuerySMM.php',
            params : {
                'query' : 'getSmmBottle'
            },
            success: function(result) {

                counterLoad--;
                if (counterLoad === 0) {
                    Ext.getBody().unmask();
                   // this.onToday();
                }

                if (!result || result.status !== 200)
                    return;

                let data = JSON.parse(result.responseText);

                let data_beetle_old = data.filter(function(row) {
                    return (row[10] === "СТАРИЧКИ");
                });
                let data_beetle_news = data.filter(function(row) {
                    return (row[10] === "НОВИНКИ");
                });
                let data_beetle_fine = data.filter(function(row) {
                    return (row[10] === "ИНТЕРЕСНОЕ");
                });

                panel.getView().InitData.bottle = {
                    'beetle': {
                        "old": data_beetle_old,
                        "news": data_beetle_news,
                        "fine": data_beetle_fine
                    }
                };
            },
            failure: function(result) {
                console.log(result);
            }
        });

        panel.getView().InitData.isInit = true;
    },

    makeTexts: function (d) {
        const areaDraftBeetle = this.getView().down("[name=areaDraftBeetle]");
        const areaBottleBeetle = this.getView().down("[name=areaBottleBeetle]");

        let textDraftBeetle = "✨ОБНОВЛЕНИЕ КРАНОВ✨<br>";
        let textBottleBeetle = "";

        let dataDraftBeetle = this.getView().InitData.draft["beetle"][d];
        let dataBottleBeetle_old = this.getView().InitData.bottle["beetle"]["old"];
        let dataBottleBeetle_news = this.getView().InitData.bottle["beetle"]["news"];
        let dataBottleBeetle_fine = this.getView().InitData.bottle["beetle"]["fine"];

        for (var i = 0; i < dataDraftBeetle.length; i++) {
            textDraftBeetle += "<br>= " + dataDraftBeetle[i][1] + " [" + dataDraftBeetle[i][0] + "]<br>";
            if (dataDraftBeetle[i][2] && dataDraftBeetle[i][2].length > 0) {
                textDraftBeetle += dataDraftBeetle[i][2] + "<br>";
            }
            if (dataDraftBeetle[i][3] && dataDraftBeetle[i][3].length > 0) {
                textDraftBeetle += dataDraftBeetle[i][3] + "  " + dataDraftBeetle[i][4] + "<br>";
            }
        }

        textBottleBeetle += "<br><br><b>НОВИНКИ</b>";
        for (var i = 0; i < dataBottleBeetle_news.length; i++) {
            textBottleBeetle += "<br>= " + dataBottleBeetle_news[i][1] + " / " + dataBottleBeetle_news[i][2] + " [ " + dataBottleBeetle_news[i][0] + " ]";
        }
        textBottleBeetle += "<br><br><b>СТАРИЧКИ</b>";
        for (var i = 0; i < dataBottleBeetle_old.length; i++) {
            textBottleBeetle += "<br>= " + dataBottleBeetle_old[i][1] + " / " + dataBottleBeetle_old[i][2] + " [ " + dataBottleBeetle_old[i][0] + " ]";
        }
        textBottleBeetle += "<br><br><b>ИНТЕРЕСНОЕ</b>";
        for (var i = 0; i < dataBottleBeetle_fine.length; i++) {
            textBottleBeetle += "<br>= " + dataBottleBeetle_fine[i][1] + " / " + dataBottleBeetle_fine[i][2] + " [ " + dataBottleBeetle_fine[i][0] + " ]";
        }

        textDraftBeetle += "<br>📌 Актуальное наличие на сайте beetlecraft.ru";

        if (dataDraftBeetle.length === 0)
            textDraftBeetle = "";

        areaDraftBeetle.setHtml(textDraftBeetle);
        areaBottleBeetle.setHtml(textBottleBeetle);
    },

    onToday: function () {
        this.makeTexts("today");
    }
})