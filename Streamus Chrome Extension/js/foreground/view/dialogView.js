define(function () {
    'use strict';

    var DialogView = Backbone.View.extend({

        tagName: 'div',

        className: 'alert',

        template: _.template($('#dialogTemplate').html()),

        events: {
            'click button.close': 'close'
        },

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));

            return this;
        },

        initialize: function () {

            //  Set the dialog's class based on the model's type.
            var className = 'alert-' + this.model.get('type');
            this.$el.addClass(className);
        
            this.listenTo(this.model, 'destroy', this.remove);
        },

        close: function () {
            this.model.destroy();
        }

    });

    return DialogView;
});