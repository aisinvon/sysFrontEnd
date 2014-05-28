/// <reference path="jQuery.1.7.2.min.js" />
/// <reference path="jquery.validate.js" />
/// <reference path="jquery.validate.unobtrusive.js" />
/// <reference path="underscore.js" />

jQuery.validator.addMethod("greaterthanequal", function (value, element, params) {
    if (!value) {
        return true;
    }
    var $this = $(this);
    var name = $(element).attr("name");
    var prefix = '';

    if (name.indexOf('.') != -1) {
        var lastIndex = name.lastIndexOf('.');
        prefix = name.substr(0, lastIndex) + '.';
    }
    var targetName = prefix + params.target;
    var $target = $(element).parents(".mod_input").find("[name='" + targetName + "']");
    var targetValue = $target.val();

    validRelationOnce($this, $target);  

    return $.trim(targetValue) == '' || value >= targetValue;
});
jQuery.validator.unobtrusive.adapters.add("greaterthanequal", ["target"], function (options) {
    options.rules["greaterthanequal"] = {
        "target": options.params.target
    };
    options.messages["greaterthanequal"] = options.message;
});

jQuery.validator.addMethod("lessthanequal", function (value, element, params) {
    if (!value) {
        return true;
    }
    var $this = $(this);
    var name = $(element).attr("name");
    var prefix = '';

    if (name.indexOf('.') != -1) {
        var lastIndex = name.lastIndexOf('.');
        prefix = name.substr(0, lastIndex) + '.';
    }
    var targetName = prefix + params.target;
    var $target = $(element).parents(".mod_input").find("[name='" + targetName + "']");
    var targetValue = $target.val();

    validRelationOnce($this, $target);

    return $.trim(targetValue) == '' || value <= targetValue;
});
jQuery.validator.unobtrusive.adapters.add("lessthanequal", ["target"], function (options) {
    options.rules["lessthanequal"] = {
        "target": options.params.target
    };
    options.messages["lessthanequal"] = options.message;
});

function validRelationOnce($this,$target) {
    if ($target.data("validHasCalled")) {
        $target.data("validHasCalled") = false;
    } else {
        setTimeout(function () {
            $this.data("validHasCalled", true);
            $target.valid();
        }, 100);
    }
}