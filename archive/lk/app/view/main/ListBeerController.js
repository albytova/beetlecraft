Ext.define('lk.view.main.ListBeerController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.listbeer',

    onEditTypeBeer: function (editor, e) {

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryBeer.php',
            params : {
                'query' : 'updateTypeBeer',
                'id': e.record.data.id,
                'name': e.newValues.name
            },
            success: function(result) {
                if (result && result.status == 200)
                    e.record.commit();
            },
            failure: function(result) {
                console.log(result);
            }
        })
    },

    onRemoveTypeBeer: function () {
        const grid = this.getView().down("[name=gridTypeBeer]");
        let selectRow = grid.getSelection();

        if (selectRow.length == 0)
            return;

        let id = selectRow[0].data["id"];

        if (id) {
            Ext.Msg.confirm(
                "Удаление типа пива",
                "Вы действительно хотите удалить типа пива: "+selectRow[0].data["name"]+"?",
                function (answer) {
                    if (answer == 'yes') {
                        Ext.Ajax.request({
                            method: 'GET',
                            url: './php/classes/QueryBeer.php',
                            params : {
                                'query' : 'removeTypeBeer',
                                'id': id
                            },
                            success: function(result) {
                                if (result && result.status == 200)
                                    grid.getStore().reload();
                            },
                            failure: function(result) {
                                console.log(result);
                            }
                        })
                    }
                }
            );
        }
    },

    onAddTypeBeer: function () {
        const grid = this.getView().down("[name=gridTypeBeer]");

        Ext.Msg.prompt(
            "Добавление типа пива",
            "Название",
            function (answer, text) {

                if (answer && answer.length > 0) {
                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/classes/QueryBeer.php',
                        params : {
                            'query' : 'addTypeBeer',
                            'name': text
                        },
                        success: function(result) {
                            if (result && result.status == 200)
                                grid.getStore().reload();
                        },
                        failure: function(result) {
                            console.log(result);
                        }
                    })
                }

            }

        );
    },

    onAddBrewery: function () {
        const grid = this.getView().down("[name=gridBrewery]");

        Ext.Msg.prompt(
            "Добавление пивоварни",
            "Название",
            function (answer, text) {

                if (answer && answer.length > 0) {
                    Ext.Ajax.request({
                        method: 'GET',
                        url: './php/classes/QueryBeer.php',
                        params : {
                            'query' : 'addBrewery',
                            'name': text
                        },
                        success: function(result) {
                            if (result && result.status == 200) {
                                grid.getStore().reload();
                                setTimeout(function () {
                                    let rec = grid.getStore().findRecord("name", text);
                                    grid.getSelectionModel().select(rec);
                                    grid.getView().focusRow(rec);
                                }, 1000);
                            }
                        },
                        failure: function(result) {
                            console.log(result);
                        }
                    })
                }

            }

        );
    },

    onEditBrewery: function (editor, e) {
        const grid = this.getView().down("[name=gridBrewery]");

        Ext.Ajax.request({
            method: 'GET',
            url: './php/classes/QueryBeer.php',
            params : {
                'query' : 'updateBrewery',
                'id': e.record.data.id,
                'name': e.newValues.name,
                'untuppd': e.newValues.untuppd
            },
            success: function(result) {
                if (result && result.status == 200) {
                    e.record.commit();
                    grid.store.load();
                    setTimeout(function () {
                        let rec = grid.getStore().findRecord("name", e.newValues.name);
                        grid.getSelectionModel().select(rec);
                        grid.getView().focusRow(rec);
                    }, 1000);
                }
            },
            failure: function(result) {
                console.log(result);
            }
        })
    },

    onRemoveBrewery: function () {
        const grid = this.getView().down("[name=gridBrewery]");
        let selectRow = grid.getSelection();

        if (selectRow.length == 0)
            return;

        let id = selectRow[0].data["id"];

        if (id) {
            Ext.Msg.confirm(
                "Удаление пивоварни",
                "Вы действительно хотите удалить пивоварню: "+selectRow[0].data["name"]+"?",
                function (answer) {
                    if (answer == 'yes') {
                        Ext.Ajax.request({
                            method: 'GET',
                            url: './php/classes/QueryBeer.php',
                            params : {
                                'query' : 'removeBrewery',
                                'id': id
                            },
                            success: function(result) {
                                if (result && result.status == 200)
                                    grid.getStore().reload();
                            },
                            failure: function(result) {
                                console.log(result);
                            }
                        })
                    }
                }
            );
        }
    }

})