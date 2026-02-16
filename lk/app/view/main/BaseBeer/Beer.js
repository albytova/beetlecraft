Ext.define('beetlecraft.view.main.BaseBeer.Beer', {
    extend: 'Ext.window.Window',
    xtype: 'beer',

    controller: "beer",

    maximizable: true,

    bodyPadding: 10,

    items: [
        {
            xtype: 'combobox',
            label: 'Пивоварня',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            reference: 'cmb_brewery',
            store: {
                autoLoad: true,
                fields: [
                    "id", "name", "UID", "status"
                ],
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/Brewery.php',
                    extraParams: {
                        'query': 'getBrewery'
                    }
                }
            }
        },
        {
            xtype: 'textfield',
            reference: 'txt_name',
            label: 'Название'
        },
        {
            xtype: 'textfield',
            reference: 'txt_dist',
            label: 'Описание'
        },
        {
            xtype: 'numberfield',
            reference: 'txt_abv',
            label: 'ABV (%)'
        },
        {
            xtype: 'numberfield',
            reference: 'txt_ibu',
            label: 'IBU'
        },
        {
            xtype: 'combobox',
            label: 'Тип',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            reference: 'cmb_type_1',
            store: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/TypeBeer.php',
                    extraParams: {
                        'query': 'getTypeBeer'
                    }
                }
            }
        },
        {
            xtype: 'combobox',
            label: 'Тип',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            reference: 'cmb_type_2',
            store: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/TypeBeer.php',
                    extraParams: {
                        'query': 'getTypeBeer'
                    }
                }
            }
        },
        {
            xtype: 'combobox',
            label: 'Тип',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            reference: 'cmb_type_3',
            store: {
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    method: 'GET',
                    url: './php/TypeBeer.php',
                    extraParams: {
                        'query': 'getTypeBeer'
                    }
                }
            }
        },
        {
            xtype: 'numberfield',
            reference: 'txt_uid',
            label: 'Untappd BID'
        }
    ],

    buttons: {
        close: "closeWin",
        save: "saveBeer"
    }
});
