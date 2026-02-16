/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 */
Ext.define('beetlecraft.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    onItemSelected: function (sender, record) {
        Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', this);
    },

    onActivate: function () {

        Ext.Date.dayNames = [
            'Воскресенье',
            'Понедельник',
            'Вторник',
            'Среда',
            'Четверг',
            'Пятница',
            'Суббота'
        ];
        Ext.Date.monthNames = [
            'Января',
            'Февраля',
            'Марта',
            'Апреля',
            'Мая',
            'Июня',
            'Июля',
            'Августа',
            'Сентября',
            'Октября',
            'Ноября',
            'Декабря'
        ];

        if (localStorage.getItem("UserRight") === "111" ) {

            this.getView().lookupReference("tabBaseBeer").setHidden(true);
            this.getView().lookupReference("tabPurchase").setHidden(true);

            this.getView().items.items[0].setDisabled(true);
            this.getView().items.items[1].setDisabled(true);

            this.getView().setActiveItem(3);
        }
    },

    onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    }
});
