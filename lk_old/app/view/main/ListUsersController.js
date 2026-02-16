Ext.define('lk.view.main.ListUsersController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.listusers',

    onInput: function () {
        var grid = this.getView();
        this.showEditRow(null, grid, true);
    },

    onEdit: function () {
        var grid = this.getView();
        var selectedRecord = grid.getSelectionModel().getSelection()[0];
        var data = selectedRecord? selectedRecord.data : null;

        this.showEditRow(data, grid, false);
    },

    onDelete: function () {
        var grid = this.getView();
        var selectedRecord = grid.getSelectionModel().getSelection()[0];
        var data = selectedRecord? selectedRecord.data : null;

        if (data["num"])
            this.removeUser(data["num"], grid)
        else
            console.log('error get selected row');
    },

    onUpdate: function () {
        var grid = this.getView();
        grid.getStore().reload();
    },

    showEditRow: function (data, grid, is_insert) {

        if (!is_insert && !data) {
            Ext.Msg.alert("Предупреждение", "Карта не выбрана!");
            return;
        }

        Ext.create({
            xtype: 'wincard',

            InitData: data? {
                numcard: data["num"],
                nameuser: data["name"],
                surnameuser: data["surname"],
                phone: data["phone"],
                dt_burn: data["birthday"],
                untuppd: data["untuppd"],
                is_reg: data["is_reg"],
                in1c: data["in1c"]
            } : null,
            isAdd: is_insert,

            listeners: {
                close: function () {
                    grid.getStore().reload();
                }
            }
        }).show();
    }

})