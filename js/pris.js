/**
 * global config
 */
var prisGCfg = {
    chartColor: ['#1f5675', '#4c89a1', '#8ebfd7', '#d3eef6', '#934821', '#d77a3b', '#e89e58', '#fcd2a5', '#cf942a', '#ffce31', '#f8ef80', '#fcfbdf', '#216037', '#5e9b73', '#8fc3a0', '#c6e5d1']
}
/** 
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 *slide
    example:
    fedLib.switchable({
        container:".switchable",
        content:".contentBox",
        trigger:".triggerBox",
        effect:"scrollx",
        pageButton:[".btnPrev",".btnNext"],
        interval: 5000,
        autoPlay:true
    });
*/
var fedLib = {};
fedLib.switchable = function(options) {
    /**
     * configure
     */
    var defaults = {
        container: "",
        /*slide wrap*/
        content: "",
        /*slide content*/
        trigger: "",
        /*slide touch element*/
        pageButton: [],
        /*page button*/
        steps: 1,
        /*content length*/
        effect: 'fade',
        /*JS effect*/
        autoPlay: false,
        /*auto play or not*/
        interval: 3000,
        /*time interval*/
        activeClass: "on",
        /*current touch element*/
        speed: 300,
        /*effect speed*/
        eventType: "mouseover",
        /*trigger event type*/
        delay: 0,
        /*effect delay*/
        init: null,
        /*initialize*/
        onChange: null /*call back when slide changes*/
    },

        /**
         * global private variable
         */
        currentIndex = 0,
        timer = 0,
        opts = {},
        _this, sprite, lis, total, page, trigger, btnPrev, btnNext,
        lw, lh;
    opts = $.extend(defaults, options);
    _this = $(opts.container);
    sprite = _this.find(opts.content);
    if (_this.length <= 0 || sprite.length <= 0) return false;

    lis = sprite.children();
    total = lis.length;
    page = Math.ceil(total / opts.steps);
    trigger = _this.find(opts.trigger).children();
    btnPrev = _this.find(opts.pageButton[0]);
    btnNext = _this.find(opts.pageButton[1]);

    if (opts.init != null) opts.init();
    initStyle();
    addEvent();
    autoCutover();

    /**
     * initialize css
     */

    function initStyle() {
        lw = lis.eq(0).outerWidth();
        lh = lis.eq(0).outerHeight();
        switch (opts.effect) {
            default:
            case "scrollx":
                sprite.css({
                    "width": 99999,
                    "position": "absolute"
                });
                lis.css({
                    "float": "left"
                });
                var tw = lw * opts.steps;
                for (var i = 0; i < opts.steps; i++) {
                    $(lis).eq(total - i - 1).clone().prependTo(sprite);
                    sprite.css("left", -tw);
                }
                break;
            case "scrolly":
                sprite.css({
                    "position": "absolute"
                });
                var th = lh * opts.steps;
                for (var i = 0; i < opts.steps; i++) {
                    $(lis).eq(total - i - 1).clone().prependTo(sprite);
                    sprite.css("top", -th);
                }
                break;
            case "fade":
                lis.css({
                    "opacity": 0,
                    "z-index": 0,
                    "position": "absolute"
                });
                lis.eq(0).css({
                    "opacity": 1,
                    "z-index": 1
                });
                break;
            case "visible":
                lis.css({
                    "display": "none"
                });
                lis.eq(0).css({
                    "display": "block"
                });
                break;
        }
    }

    /**
     * slide switch
     */

    function cutover() {
        if (opts.onChange != null) opts.onChange(currentIndex, page);
        /*change touch element class*/
        trigger.eq(currentIndex).addClass(opts.activeClass).siblings().removeClass(opts.activeClass);
        /*detect JS effect*/
        switch (opts.effect) {
            default:
            case "scrollx":
                var tw = lw * opts.steps;
                sprite.stop().animate({
                    "left": -tw * currentIndex - tw
                }, opts.speed);
                break;
            case "scrolly":
                var th = lh * opts.steps;
                sprite.stop().animate({
                    "top": -th * currentIndex - th
                }, opts.speed);
                break;
            case "fade":
                lis.eq(currentIndex).stop().animate({
                    "opacity": 1
                }).siblings().stop().animate({
                    "opacity": 0
                });
                lis.eq(currentIndex).css("z-index", 1).siblings().css("z-index", 0);
                break;
            case "visible":
                lis.eq(currentIndex).css("display", "block").siblings().css("display", "none");
                break;
        }
    }

    /**
     * add event
     */

    function addEvent() {
        var delayed = 0;
        /*add event to touch element*/
        trigger.each(function(i, e) {
            $(e).bind(opts.eventType, function() {
                clearInterval(delayed);
                delayed = setInterval(function() {
                    currentIndex = i;
                    cutover();
                    clearInterval(delayed);
                }, opts.delay)
            });
        });

        /*mouse is in the slide or not*/
        _this.bind({
            "mouseenter": function() {
                clearInterval(timer);
            },
            "mouseleave": function() {
                autoCutover();
            }
        });

        /*page turning*/
        btnPrev.click(function() {
            currentIndex--;
            if (currentIndex == -2) {
                currentIndex = page - 2;
                if (opts.effect == "scrollx") sprite.css("left", -lw * opts.steps * page);
                if (opts.effect == "scrolly") sprite.css("top", -lh * opts.steps * page);
            }
            cutover();
        });
        btnNext.click(function() {
            currentIndex++;
            if (currentIndex == page) {
                currentIndex = 0;
                if (opts.effect == "scrollx") sprite.css("left", 0);
                if (opts.effect == "scrolly") sprite.css("top", 0);
            }
            cutover();
        });
    }

    /**
     * auto play
     */

    function autoCutover() {
        if (page <= 1) return false;
        if (!opts.autoPlay) return false;
        timer = setInterval(function() {
            currentIndex++;
            if (currentIndex == page) {
                currentIndex = 0;
                sprite.css("left", 0)
            }
            cutover();
        }, opts.interval);
    }
}

/**
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 * Get image size faster
 * @version 2011.05.27
 * @author  TangBin
 * @see     http://www.planeart.cn/?p=1121
 * @param   {String}    image url
 * @param   {Function}  size ready
 * @param   {Function}  load complete (option)
 * @param   {Function}  load error (option)
 * @example imgReady('http://www.google.com.hk/intl/zh-CN/images/logo_cn.png', function () {
        alert('size ready: width=' + this.width + '; height=' + this.height);
    });
 */
var imgReady = (function() {
    var list = [],
        intervalId = null,

        // excu queue
        tick = function() {
            var i = 0;
            for (; i < list.length; i++) {
                list[i].end ? list.splice(i--, 1) : list[i]();
            };
            !list.length && stop();
        },

        // stop excu queue
        stop = function() {
            clearInterval(intervalId);
            intervalId = null;
        };

    return function(url, ready, load, error) {
        var onready, width, height, newWidth, newHeight,
            img = new Image();

        img.src = url;

        // if image is cached, then get data from cache
        if (img.complete) {
            ready.call(img);
            load && load.call(img);
            return;
        };

        width = img.width;
        height = img.height;

        // when load error
        img.onerror = function() {
            error && error.call(img);
            onready.end = true;
            img = img.onload = img.onerror = null;
        };

        // image size ready
        onready = function() {
            newWidth = img.width;
            newHeight = img.height;
            if (newWidth !== width || newHeight !== height ||
                // if image was loaded in other places, then detect its area
                newWidth * newHeight > 1024) {
                ready.call(img);
                onready.end = true;
            };
        };
        onready();

        // when load complete
        img.onload = function() {
            // onload may be fater than onready in a timer
            // check and be sure that onready excu before onload
            !onready.end && onready();

            load && load.call(img);

            // IE gif animation will excu onload function as loop, so clear onload
            img = img.onload = img.onerror = null;
        };

        // add to queue, and excu regularly
        if (!onready.end) {
            list.push(onready);
            // only use one timer
            if (intervalId === null) intervalId = setInterval(tick, 40);
        };
    };
})();

/**
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 * extend new Date()
 * Get the custom date of before or after
 * example: customAddDay.addDays(1)
 */
Date.prototype.addDays = function(num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
};
/**
 * convert string to Date obj
 * example: new Date().convertDate('2014-01-02')
 */
Date.prototype.convertDate = function(date) {
    var flag = true;
    var dateArray = date.split("-");
    if (dateArray.length != 3) {
        dateArray = date.split("/");
        if (dateArray.length != 3) {
            return null;
        }
        flag = false;
    }
    var newDate = new Date();
    if (flag) {
        newDate.setFullYear(dateArray[0], dateArray[1] - 1, dateArray[2]);
    } else {
        newDate.setFullYear(dateArray[2], dateArray[1] - 1, dateArray[0]);
    }
    newDate.setHours(0, 0, 0);
    return newDate;
};
/**
 * date format
 * example: new Date().format('yyyy-MM-dd hh:mm:ss')
 * d: date, 1
 * dd: date, 01
 * ddd: Sun
 * dddd: Sunday
 * M: 1
 * MM: 01
 * MMM: Jan
 * MMMM: January
 * yy: 14
 * yyyy: 2014
 * h: hour type of 12, without 0
 * hh: hour type of 12, with 0
 * H: hour type of 24, without 0
 * HH: hour type of 24, with 0
 * m: minutes, without 0
 * mm: minutes, with 0
 * s: second, without 0
 * ss: second, with 0
 * l: milliscond, without 0
 * ll: milliscond, with 0
 * tt: am/pm
 * TT: AM/PM
 * return format date
 */
Date.prototype.format = function(str) {
    var date = this;
    var zeroize = function(value, length) {
        if (!length) {
            length = 2;
        }
        value = new String(value);
        for (var i = 0, zeros = ''; i < (length - value.length); i++) {
            zeros += '0';
        }
        return zeros + value;
    };

    return str.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|yy(?:yy)?|([hHmstT])\1?|[lLZ])\b/g, function($0) {
        switch ($0) {
            case 'd':
                return date.getDate();
            case 'dd':
                return zeroize(date.getDate());
            case 'ddd':
                return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][date.getDay()];
            case 'dddd':
                return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
            case 'M':
                return date.getMonth() + 1;
            case 'MM':
                return zeroize(date.getMonth() + 1);
            case 'MMM':
                return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
            case 'MMMM':
                return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
            case 'yy':
                return new String(date.getFullYear()).substr(2);
            case 'yyyy':
                return date.getFullYear();
            case 'h':
                return date.getHours() % 12 || 12;
            case 'hh':
                return zeroize(date.getHours() % 12 || 12);
            case 'H':
                return date.getHours();
            case 'HH':
                return zeroize(date.getHours());
            case 'm':
                return date.getMinutes();
            case 'mm':
                return zeroize(date.getMinutes());
            case 's':
                return date.getSeconds();
            case 'ss':
                return zeroize(date.getSeconds());
            case 'l':
                return date.getMilliseconds();
            case 'll':
                return zeroize(date.getMilliseconds());
            case 'tt':
                return date.getHours() < 12 ? 'am' : 'pm';
            case 'TT':
                return date.getHours() < 12 ? 'AM' : 'PM';
        }
    });
};
/**
 * remove one value from an Array
 * example:
 *  var arr = new Array("1","2","3","4");
 *  arr.remove('1');
 */
Array.prototype.remove = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) {
            this.splice(i, 1);
            break;
        }
    }
}


/**
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 * ---------------------------------------------------------------------------------
 * all pages function
 */
var fedPris = {
    // ie is lt ie9 or not, return true or false
    oldIE: function() {
        var b = document.createElement('b');
        b.innerHTML = '<!--[if lt IE 9]><i></i><![endif]-->';
        return b.getElementsByTagName('i').length === 1;
    },

    // change even or odd table rows' background when hover
    tdEvenOdd: function() {
        var tr = ('tbody tr'),
            $tr = $(tr),
            td = $tr.find('td'),
            lastParentIdx;

        // $('tbody tr:even').removeClass('odd even').addClass('odd');
        // $('tbody tr:odd').removeClass('odd even').addClass('even');

        // if td has rowspan attribute, then set its class to 'rowspan' and its parent node's class to 'parent'
        td.each(function() {
            var _this = $(this),
                tdParent = _this.parent(),
                rowValue = _this.attr('rowspan');

            if (rowValue != undefined && rowValue !== '' && rowValue !== '1') {
                _this.addClass('rowspan').parent().addClass('parent');
            }
        });

        // tr hover change background color
        $(document).on('mouseenter', tr, function() {
            var _this = $(this),
                // get the length of element 'parent' before hover element
                lastParentIdx = _this.prevAll('.parent').length - 1;

            _this.addClass('on');

            if (_this.hasClass('parent')) {
                _this.removeClass('parentOn');
            } else {
                // set the last 'parent' element's class before hover element
                _this.siblings('.parent').eq(lastParentIdx).addClass('parentOn');
                _this.siblings().removeClass('parentOn');
            }
        });

        $(document).on('mouseleave', tr, function() {
            $(this).removeClass('on').siblings().removeClass('parentOn');
        });
    },

    // nav hover
    navHover: function() {
        // get default highlight nav position
        var defaultOn = $('.nav>.wrap>ul>li').index($('.on')),
            hoverDelay;

        $('.nav li').hover(function() {
            var _this = $(this);

            _this.addClass('on').siblings().not('.on').removeClass('on');
            hoverDelay = setTimeout(function() {
                _this.children('ul').show();
            }, 100);
        }, function() {
            var _this = $(this);

            clearTimeout(hoverDelay);
            _this.removeClass('on');
            _this.children('ul').hide();
        });

        $('.nav>.wrap>ul>li').mouseleave(function() {
            $('.nav>.wrap>ul>li').eq(defaultOn).addClass('on');
        });
    },

    // select all check boxes
    selectAll: function() {
        var defauNum = $('#billing_table input:checked').length;

        // set submit button to disable when there is no checked checkbox after page loading
        if (defauNum === 0) {
            $('#billing_table').siblings().find('.black_btn:contains(Submit)').prop('disabled', 'disabled').addClass('btn_disabled');
        }

        // click checkbox
        $('.main').on('click', 'input:checkbox', function() {
            var _this = $(this),
                num,
                closestTable = _this.closest('table'),
                allCheckBox = closestTable.find('tbody input:checkbox').not(':disabled'),
                selectAllBox = closestTable.find('.select_all input'),
                totalNum = allCheckBox.length;

            // detect is it select all checkbox or single checkbox
            if (_this.prop('checked')) {
                _this.parent().hasClass('select_all') ? allCheckBox.prop('checked', true) : _this.prop('checked', true);
            } else {
                _this.parent().hasClass('select_all') ? allCheckBox.prop('checked', false) : _this.prop('checked', false);
            }

            // get the num of selecte items and show it on page
            num = closestTable.find('input:checked').not('.select_all input').length;
            closestTable.siblings().find('.num_toBeSbmt').text(num);

            // get number of checkbox to detemine if highlight submit button
            if (num === 0) {
                closestTable.siblings().find('.black_btn:contains(Submit)').prop('disabled', 'disabled').addClass('btn_disabled').removeClass('prim');
            } else {
                closestTable.siblings().find('.black_btn:contains(Submit)').removeAttr('disabled').removeClass('btn_disabled').addClass('prim');
            }

            // detect num equals total num of checkbox or not
            if (num === totalNum && totalNum !== 0) {
                selectAllBox.prop('checked', 'checked');
            } else {
                selectAllBox.removeAttr('checked');

            }
        });
    },

    // go to page top
    toTop: function() {
        $('.to_top').click(function() {
            $('html, body').stop().animate({
                scrollTop: 0
            }, 400);

            return false;
        });

        // prevent toTop btn showing below footer

        function toTopBtnAdjust() {
            var toTopObj = $('.pageWrapper .fixed'),
                pageHeight = $(document).height(),
                scrollTop = $(window).scrollTop(),
                winHeight = $(window).height();
            if ((pageHeight - scrollTop - winHeight) < 65) {
                toTopObj.css({
                    bottom: 115 - (pageHeight - scrollTop - winHeight)
                });
            } else {
                toTopObj.css({
                    bottom: ""
                });
            }
        }

        $(window).scroll(function() {
            toTopBtnAdjust();
        });
        toTopBtnAdjust();
    },

    /**
     * feedback pop win
     */
    feedback: function() {
        $('#to_feedback').click(function() {
            var $this = $(this),
                feedbackStr = $('.pop_feedback', this).html(),
                clonedHtml = "<div id='pop_feedback' class='pop_win_in'><div class='pop_feedback'>" + feedbackStr + "</div></div>";

            // pop up window append and show
            fedPris.popWinShow({
                id: "#pop_feedback",
                maskOut: true,
                maskIn: false,
                newPop: clonedHtml
            });

            return false;
        });

        // close all pop up win when click send feedback
        /* $('#pop_win').on('click', '.js_btn_feedback', function(){
            $('<b>Sent.</b>').appendTo($('#pop_feedback .pop_feedback'));
        });*/
    },

    // show right fixed_table and operation
    fixedTable: function() {
        //show fixed_table
        $('.add_row').click(function(e) {
            $('.reject_text').hide();
            if ($(this).hasClass('on')) {
                $(this).removeClass('on');
                $('.fixed_table').hide();
            } else {
                $(this).addClass('on');
                $('.fixed_table').show();
            }
            e.stopPropagation();
        });

        // hide fixed_table when click anywhere except click fixed_table
        $(document).click(function() {
            $('.fixed_table').hide();
            $('.add_row, #customize').removeClass('on');
        });

        // stopPropagation when click body to hide fixed_table
        $(document).on('click', '.fixed_table', function(e) {
            e.stopPropagation();
        });

        // click to add one record
        /*$('#add_record').click(function () {
            var record = $(this).siblings('.data_table').find('.editable').clone();
            // append new record to table
            $('#billing_table>tbody').append(record);
            $('.select_all input').removeAttr('checked');
            // change even or odd table rows' background again when add one new record
            fedPris.tdEvenOdd();
            // select all check boxes
            fedPris.selectAll('.select_all input');
        });*/
    },

    // tip of table column 'status'
    showTip: function() {
        $('.main').on('mouseenter', '.jsTipIco', function() {
            var _this = $(this);

            _this.next('.jsTip').show();
            _this.closest('td').css('zIndex', '2');
        });
        $('.main').on('mouseleave', '.jsTipIco', function() {
            var _this = $(this);

            _this.next('.jsTip').hide();
            _this.closest('td').removeAttr('style');
        });
    },

    // click reject then show reject textarea
    rejTextarea: function() {
        $('.td_action').on('click', '.reject', function(e) {
            $(this).next('.reject_text').show();
            $(this).closest('td').addClass('cur');
            $(this).closest('tr').siblings().find('.reject_text').hide();
            $(this).closest('tr').siblings().find('.cur').removeClass('cur');
            $('.add_row').removeClass('on');
            $('.fixed_table').hide();
            e.stopPropagation();
        });

        $(document).click(function() {
            $('.reject_text').hide();
        });

        $(document).on('click', '.reject_text', function(e) {
            e.stopPropagation();
        });

        $('.td_action').on('click', '.cancel', function() {
            $(this).parent().hide();
            $('.add_row').removeClass('on');
            $('.fixed_table').hide();
        });
    },

    /** table sort
        for example: if you want to sort a table, then:
        sortTable('id name');
    */
    sortTable: function(tableEle) {
        // table head click event
        $('thead th', tableEle).click(function() {

            // if not set property 'data-type', return
            var dataType = $(this).attr('data-type');
            if (dataType == undefined || dataType == '') return;

            var table = $(this).closest('table'),
                index = table.find('thead th').index(this) + 1,
                arr = [],
                // exclude rows which have class 'editable' and tr in thead 'status'
                row = table.find('tbody tr').not('.editable, .jsTip tr');
            $.each(row, function(i) {
                arr[i] = row[i];
            });
            // if click table head twice, then reverse sort
            if ($(this).hasClass('ascend')) {
                arr.reverse();
                $(this).removeClass('ascend descend').addClass('descend').siblings().removeClass('ascend descend');
            } else {
                arr.sort(howSort(index, dataType));
                $(this).removeClass('ascend descend').addClass('ascend').siblings().removeClass('ascend descend');
            }
            // create new fragment to save new sortable rows
            var fragment = document.createDocumentFragment();
            $.each(arr, function(i) {
                fragment.appendChild(arr[i]);
            });
            // prepend new rows to top of table
            table.find('tbody').not('.jsTip tbody').prepend(fragment);
            // change even or odd table rows' background again when sort table
            fedPris.tdEvenOdd();
        });

        // delete row
        /*$('table').delegate('.del', 'click', function () {
            $(this).closest('tr').remove();
            // change even or odd table rows' background again when sort table
            fedPris.tdEvenOdd();
        });*/

        // value compare

        function howSort(index, dataType) {
            return function(a, b) {
                // get each TD text
                var aStr = $(a).find('td:nth-child(' + index + ')').text().replace(/\s*/, ''),
                    bStr = $(b).find('td:nth-child(' + index + ')').text().replace(/\s*/, '');
                //compare two string or number
                if (dataType != 'text') {
                    aStr = convert(aStr, dataType);
                    bStr = convert(bStr, dataType);
                    if (aStr < bStr) {
                        return -1;
                    } else if (aStr > bStr) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    return aStr.localeCompare(bStr);
                }
            }
        }

        // convert dataType        

        function convert(data, dataType) {
            switch (dataType) {
                case 'int':
                    return parseInt(data);
                case 'float':
                    return parseFloat(data);
                default:
                    return data.toString();
            }
        }
        return {
            'howSort': howSort
        };
    },

    /** tab switch
        default usage: prisTab('id name');
        customized usage: if want to show the second tab, then: prisTab('id name', '1');;
    */
    prisTab: function(tabId, index) {
        if (tabId === undefined) {
            tabId === '.tab'
        }

        var tabIndex = index,
            tabTit = $(tabId + '>.tab_tit'),
            tabCon = $(tabId + '>.tab_con'),
            tabLi = $(tabId + '>.tab_tit>li'),
            tabOn = $(tabId + '>.tab_tit>.on'),
            tabIndex = tabLi.index(tabOn);

        // if not set parameter index, show first tab
        if (tabIndex == undefined || tabIndex == '' || tabIndex == '-1') {
            $('li', tabTit).eq(0).addClass('on').siblings().removeClass('on');
            tabCon.eq(0).show().siblings('.tab_con').hide();
        } else {
            $('li', tabTit).eq(tabIndex).addClass('on').siblings().removeClass('on');
            tabCon.eq(tabIndex).show().siblings('.tab_con').hide();
        }

        $('.main').on('click', 'li', function() {
            //tabLi.click(function () {
            tabIndex = $(this).parent().children('li').index($(this));
            $(this).addClass('on').siblings().removeClass('on');
            $(this).parent().siblings('.tab_con').eq(tabIndex).show().siblings('.tab_con').hide();
        });

        return tabIndex;
    },

    /** show and hide tips of input and textarea
    default usage: inputTips();
    customized usage: if want to use it for a specified mod, then: inputTips('id name');
    */
    inputTips: function(id) {
        var inputEle = ('.text, textarea'),
            inputDisabled = $('input:disabled, textarea:disabled, textarea[readonly=readonly], select:disabled'),
            inputTip;
        if (id == undefined || id == '') {
            inputTip = $('input[tip], textarea[tip]');
        } else {
            inputTip = $('input[tip], textarea[tip]', id);
        }
        // get input or textarea default value
        for (var i = 0; i < inputTip.length; i++) {
            var nowIpt = inputTip.eq(i),
                nowIptTip = nowIpt.attr('tip'),
                nowIptVal = nowIpt.attr('value');
            // if element input or textarea have value attribute, then ignore tip attribute
            if (nowIptVal == undefined || nowIptVal == '' || nowIptVal == nowIptTip) {
                nowIpt.val(nowIptTip);
                nowIpt.addClass('default');
            } else {
                nowIpt.addClass('normal');
            }
        }
        // if input is disabled, then addClass
        for (var j = 0; j < inputDisabled.length; j++) {
            inputDisabled.eq(j).addClass('disabled');
        }
        // input focus and blur
        $(document).on('click', inputEle, function() {
            var _this = $(this),
                defTip = _this.attr('tip');
            _this.addClass('on');
            if (_this.val() == defTip) {
                _this.val('');
                _this.addClass('normal');
            }
        });
        $(document).on('blur', inputEle, function() {
            // .blur(function() {
            var _this = $(this),
                defTip = _this.attr('tip');
            _this.removeClass('on');
            if ((_this.val()).replace(/\s*/g, '') == '') {
                _this.val(defTip);
                _this.removeClass('normal').addClass('default');
            }
        });
    },

    // clear each input's default value
    clearIptDefaultVal: function() {
        var inputTip = $('input[tip], textarea[tip]');
        inputTip.each(function() {
            var _this = $(this);
            if (_this.val() == _this.attr('tip')) {
                _this.val('');
            }
        });
    },

    /** mod show or hide
    default usage: modShowHide();
    customized usage: if want to show the second mod_toggle, then: modShowHide('1');
    */
    modShowHide: function(index) {

        $('.mod_toggle').each(function() {
            var modIpt = $('.mod_input', this),
                modIptLen = modIpt.length,
                i;

            for (i = 0; i < modIptLen; i++) {
                modIpt.eq(i).attr('data-mod-idx', i);
                modIpt.eq(i).find('.tit_index').text(i + 1);
                modIpt.eq(0).addClass('mod_input_first');
            }
        });

        var textareaMod, cloneMod, urlHash,
            // cloneMod's attribute data-mod-idx
            cloneModIdx = 0;

        // open related module from hash in URL
        urlHash = window.location.hash;
        if (urlHash != undefined || urlHash != '') {
            $(urlHash).addClass('on').siblings('.mod_toggle').removeClass('on');
        }

        if (index != undefined || index != '') {
            $('.mod_toggle').eq(index).addClass('on');
            $('.mod_toggle').eq(index).children('.upload_tip').hide();
            $('.mod_toggle').eq(index).find('.toggle_con').show();
        }

        // click title show or hide textarea
        $('.mod_toggle').delegate('.addIco', 'click', function() {
            var mod = $(this).closest('.mod_toggle');
            urlHash = $(this).closest('.mod_toggle').attr('id');
            textareaMod = $(this).parent().siblings('.toggle_con').find('.mod_input:eq(0)');
            if (mod.hasClass('on')) {
                mod.removeClass('on');
            } else {
                mod.addClass('on').siblings('.mod_toggle').removeClass('on');
                mod.siblings('.mod_toggle').find('.upload_tip').show();
                // anchor position
                window.location.hash = urlHash;
            }
        });

        // click btn to add one more textarea
        $('.newInfoIco').click(function(e) {
            var thisModIpt = $(this).closest('.mod_toggle').find('.mod_input'),
                thisModIptIdx = thisModIpt.attr('data-mod-idx'),
                lastModIptIdx = parseInt($(this).closest('.mod_toggle').find('.mod_input:last').attr('data-mod-idx'));

            // find and get first 'mod_input'
            textareaMod = $(this).parent().siblings('.toggle_con').find('.mod_input:eq(0)');
            cloneModIdx = lastModIptIdx + 1;

            // clone first 'mod_input'
            cloneMod = textareaMod.clone().removeClass('mod_input_first').attr('data-mod-idx', cloneModIdx);
            // from backend
            var $cloneMod = $(cloneMod);

            // change attribute 'for', 'id', 'name' of input, labe, textarea, select
            changeIptName('label', cloneMod, 'for');
            changeIptName('.text, select, textarea', cloneMod, 'id');
            changeIptName('.text, select, textarea', cloneMod, 'name');
            changeIptName('.field-validation-valid, .field-validation-error', cloneMod, 'data-valmsg-for');
            changeIptName('.field-validation-valid span, .field-validation-error span', cloneMod, 'for');

            // insert html code to page
            $(cloneMod).insertBefore($(this).closest('.mod_toggle').find('.toggle_con .upload_tip'));
            // from backend
            $.validator.unobtrusive.parseDynamicContent($cloneMod);

            // show and hide tips of input and textarea
            fedPris.inputTips(cloneMod);

            e.stopPropagation();
        });

        /**
        change attribute 'for', 'id', 'name' of input, label, textarea, select elements
        ele: the element
        eleParent: the parent node of ele
        attrName: means 'for', 'id', 'name' attribute
        */

        function changeIptName(ele, eleParent, attrName) {
            $(ele, eleParent).each(function() {
                var defauLabel = $(this).attr(attrName),
                    newLabel,
                    dataCopy = $(this).attr('data-copy');

                // if attribute contain number, then change that number by index value; else append index value to the end of attribute
                if (/\d+/g.test(defauLabel) === true) {
                    newLabel = defauLabel.replace(/\d+/g, cloneModIdx);
                } else {
                    newLabel = defauLabel + '_' + cloneModIdx;
                }

                // if clone module has element tit_index, then increase its value by index value
                if ($('.tit_index', eleParent)) {
                    $(eleParent).find('.tit_index').text(cloneModIdx + 1);
                }

                // if cloneMod contain field-validation-error, then change it to field-validation-valid and remove its child node 'span'
                if ($(ele).hasClass('field-validation-error')) {
                    $('.field-validation-error span', eleParent).remove();
                    $('.field-validation-error', eleParent).attr('class', 'field-validation-valid');
                }

                $('.input-validation-error', eleParent).removeClass('input-validation-error');
                $('.hasDatepicker', eleParent).removeClass('hasDatepicker');

                // set elements of cloneMod new attribute
                if (defauLabel != undefined && defauLabel != '') {
                    $(this).attr(attrName, newLabel);
                }

                //  if data-copy is 'yes', then reserve the value when copy the module
                if (dataCopy === undefined || dataCopy === '') {
                    $(this).val('').removeClass('normal');
                }
            });
        }

        // click btn to delete one textarea
        $('.toggle_con').delegate('.delInfoIco', 'click', function() {
            var textareaIndex = $(this).closest('.toggle_con').find('.mod_input').index($(this).parent()),
                textareaNum = $(this).closest('.toggle_con').find('.mod_input').length - 1;
            // can't remove first textarea, only can remove last textarea
            if (textareaIndex != 0 && textareaIndex == textareaNum) {
                $(this).parent().remove();
            }
        });

        // change 'Summary' border when focus on it
        $('#Summary').focus(function() {
            $(this).parent().addClass('on');
        }).blur(function() {
            $(this).parent().removeClass('on');
        });
    },

    // show date customize
    showCustomize: function() {
        $('#customize').click(function(e) {
            $(this).addClass('on');
            $('.fixed_table').show();
            e.stopPropagation();
        });
    },

    // date picker
    datePicker: function() {
        var curYear = new Date().getFullYear(),
            monthOption = {
                selectedYear: curYear,
                startYear: curYear - 2,
                finalYear: curYear + 2
            };
        // set month only
        try {
            $('#from, #to, .only_month').monthpicker(monthOption).bind('monthpicker-hide', function() {
                var _this = $(this),
                    thisVal = _this.val();

                if (thisVal != '') {
                    _this.addClass('normal');
                }
            });
        } catch (e) {}

        // set date and month
        $('body').on('focus', '.date_month', function() {
            var $this = $(this),
                maxDate = $this.attr('max-date'),
                minDate = $this.attr('min-date'),
                // datepicker default option
                pickOpt = {
                    changeMonth: true,
                    changeYear: true,
                    minDate: '-10y',
                    maxDate: '0',
                    onClose: function() {
                        var _this = $(this),
                            thisVal = _this.val();
                        if (thisVal != '') {
                            _this.addClass('normal');
                        }
                        setTimeout(function() {
                            _this.trigger('blur');
                        }, 100);
                    }
                };

            if ($this.attr('id') === 'Birthdate') {
                pickOpt.minDate = '-80y';
                pickOpt.maxDate = '-10y';
                pickOpt.defaultDate = '-30y';
            } else if (maxDate === undefined && minDate === undefined) {
                pickOpt = pickOpt;
            } else if (maxDate !== undefined && minDate === undefined) {
                pickOpt.maxDate = maxDate;
            } else if (maxDate === undefined && minDate !== undefined) {
                pickOpt.minDate = minDate;
            } else if (maxDate !== undefined && minDate !== undefined) {
                pickOpt.maxDate = maxDate;
                pickOpt.minDate = minDate;
            }

            $this.datepicker(pickOpt);
        });

        // set date and month for meeting room
        $('body').on('focus', '.date_month_meeting', function() {
            $(this).datepicker({
                changeMonth: true,
                changeYear: true,
                minDate: '-10y',
                maxDate: '+1y',
                onClose: function() {
                    var _this = $(this),
                        thisVal = _this.val();
                    if (thisVal != '') {
                        _this.addClass('normal');
                    }
                    setTimeout(function() {
                        _this.trigger('blur');
                    }, 100);
                }
            });
        });

        // stopPropagation
        $('.ui-datepicker').click(function(e) {
            e.stopPropagation();
        });
    },

    // structure report chart range select
    rangeSelect: function() {
        var curMon = new Date().getMonth();

        $('.tab_chart .auto_btn_h16').click(function() {
            $(this).addClass('on').siblings('.auto_btn_h16').removeClass('on');
        });

        if(!fedPris.oldIE()){
            $('#6_month').click(function() {
                var chart = $('#report_con_1').highcharts(),
                    startMonth = curMon - 5;
                // if current month equal or before June, then show data from January -- June.
                if (startMonth < 1) {
                    chart.xAxis[0].setExtremes(0, 5);
                } else {
                    chart.xAxis[0].setExtremes(startMonth, curMon);
                }
            });
            $('#ytd').click(function() {
                var chart = $('#report_con_1').highcharts();
                chart.xAxis[0].setExtremes(0, curMon);
            });
            $('#1_year').click(function() {
                var chart = $('#report_con_1').highcharts();
                chart.xAxis[0].setExtremes(0, 11);
            });
        }
    },

    // add class to staff table
    staffTableClass: function(tableId) {
        // var target = $(tableId + (' thead th:lt(2)')).addClass('first_two');
        // $('tbody tr', tableId).eq(0).addClass('first_tr');
        // $('tbody tr', tableId).each(function() {
        //     $('td:lt(2)', this).addClass('first_two');
        // });

        $(tableId).delegate('thead th', 'click', function() {
            $('tbody tr', tableId).removeClass('first_tr');
            fedPris.staffTableClass(tableId);
        });
    },

    // edit and then select project for .staff_table
    editSlctProj: function() {
        // action edit
        $('.act_edit').click(function() {
            var $tableObj = $(this).parent().siblings('.staff_table');

            $(this).hide().siblings('.act_more').show();
            $tableObj.find('.proj_slct').show();
            $tableObj.find('.proj_slct').siblings('.proj_slcted').hide();

            return false;
        });

        // action cancel
        $('.act_cancel').click(function() {
            var $tableObj = $(this).parent().parent().siblings('.staff_table');

            $(this).parent().hide();
            $(this).parent().siblings('.act_edit').show();
            $tableObj.find('.proj_slcted').show();
            $tableObj.find('.proj_slcted').siblings('.proj_slct').hide();
        });
    },

    // change homepage project status
    projStatus: function() {
        var pNumber = $('#p_number'),
            outOfDay = parseInt(pNumber.text()),
            status;

        if (1 < outOfDay && outOfDay < 11) {
            status = 1;
        } else if (10 < outOfDay && outOfDay < 21) {
            status = 2;
        } else if (20 < outOfDay && outOfDay < 31) {
            status = 3;
        } else if (30 < outOfDay && outOfDay < 41) {
            status = 4;
        } else if (40 < outOfDay && outOfDay < 51) {
            status = 5;
        } else if (50 < outOfDay && outOfDay) {
            status = 6;
        }

        switch (status) {
            case 1:
                changeLiClass('1');
                break;
            case 2:
                changeLiClass('2');
                break;
            case 3:
                changeLiClass('3');
                break;
            case 4:
                changeLiClass('4');
                break;
            case 5:
                changeLiClass('5');
                break;
            case 6:
                changeLiClass('6');
                break;
            default:
                changeLiClass('0');
        }

        function changeLiClass(num) {
            $(pNumber).closest('li').attr('class', 'status_' + num);
        }
    },

    /**
     * [clickBrowse: click and browse to upload user image]
     * @param  {[string]} status [error type]
     */
    clickBrowse: function(status) {
        $('#tip_imgLoading').remove();

        if (status === 'extError' || status === 'sizeError') {
            $('#up_erorMsg').show().text('Image should be Jpg, GIF or PNG, and less than 200kb.');
        } else if (status === 'error') {
            $('#pop_crop .editPhotoArea').append("<p id='tip_imgLoading' class='mt tc tip_imgLoading'>Unable to upload image. Please try again.</p>");
        } else {
            //show image crop pop window
            fedPris.popWinShow({
                id: "#pop_crop",
                maskOut: true,
                maskIn: false
            });

            $('#up_erorMsg').hide();
            $('#pop_crop .editPhotoArea').append("<p id='tip_imgLoading' class='mt tc'>Loading...</p>");
        }
    },

    // 
    /**
     * [getImgUrlFromServer: get image url frm server]
     * @param  {[string]} imgUrl [image url]
     */
    getImgUrlFromServer: function(imgUrl) {
        $('#tip_imgLoading').hide();

        // preview upload image 
        fedPris.previewImg('#userImg', imgUrl);
    },

    /**
     * upload image on profile page
     */
    uploadingImg: function() {
        //choose file
        $('body').delegate('.fileBrowser', 'click', function() {
            var fileUploaderWrapper = $(this).parent();
            $('.fileInput', fileUploaderWrapper).trigger('click');
        });

        //Discard changes
        $('.jsDiscardLink').click(function() {
            window.jcropApi.destroy();

            $('.fileField  .fileNameDisplay').html('No file selected').addClass('fileNameDisplayNoFile');
            if (window.jcropApi) {
                window.jcropApi.destroy();
                window.jcropApi = false;
            }
            $(".editPhotoArea").html("");
            $("#previewImg").attr("src", "./images/photo-preview.png").css({
                "width": "",
                "height": "",
                "margin-left": "",
                "margin-top": ""
            });
        });
    },

    /**
     * [previewImg: preview upload image]
     */
    previewImg: function(img, imgUrl) {
        var newImgUrl = imgUrl + '&time=' + (new Date()).getTime();
        window.jcropApi = false;

        $(".editPhotoArea").html('<img alt="" src="" id="userImg">');
        var imgObj = $(img);

        //assign sample image
        imgObj.attr('src', newImgUrl);
        $("#previewImg, #getImgSize").attr('src', newImgUrl);

        if (window.jcropApi) {
            window.jcropApi.destroy();
            window.jcropApi = false;
        }
        if (window.timer) {
            window.clearTimeout(window.timer);
        }
        window.timer = setTimeout(function() {
            // excu only after got image size
            imgReady(imgUrl, function() {
                var thisW = this.width;
                if (thisW !== 0) {
                    var w = $("#userImg").width();
                    var h = $("#userImg").height();
                    window.jcropApi = $.Jcrop('#userImg', {
                        onChange: fedPris.showPreview,
                        onSelect: fedPris.showPreview,
                        keySupport: false,
                        maxSize: [398, 398],
                        aspectRatio: (110 / 130),
                        setSelect: [0, 0, 398, 398]
                    });
                }
            });
        }, 1000);
    },

    /**
     * [showPreview: Show Preview thumb]
     * @param  {[obj]} coords
     */
    showPreview: function(coords) {
        var rx = 110 / coords.w;
        var ry = 130 / coords.h;

        rx = (rx == 0) ? 1 : rx;
        ry = (ry == 0) ? 1 : ry;

        photoX = $("#userImg").width();
        photoY = $("#userImg").height();

        $("#previewImg").css({
            width: Math.round(rx * photoX) + 'px',
            height: Math.round(ry * photoY) + 'px',
            marginLeft: '-' + Math.round(rx * coords.x) + 'px',
            marginTop: '-' + Math.round(ry * coords.y) + 'px'
        });
    },

    // meeting room calendar scroll
    meetRoomScrol: function() {
        // click to show pop up meeting map
        $('.mapIco').click(function() {
            var _this = $(this),
                _thisPare = $(this).parent(),
                _thisRoomIntro = _this.siblings('.room_intro'),
                /*_thisRoomIntroW = _thisRoomIntro.outerWidth(),
                _thisRoomIntroWHalf = _thisRoomIntroW / 2 - 135,
                _thisLeft = _thisPare.position().left + 40,*/
                clonedHtml = "<div id='pop_room_intro' class='pop_win_in pop_room_intro'><div class='room_intro'>" + _thisRoomIntro.html() + "</div></div>";

            // pop up window append and show
            fedPris.popWinShow({
                id: "#pop_room_intro",
                maskOut: true,
                maskIn: false,
                newPop: clonedHtml,
                fixed: false
            });

            $('#pop_win .pop_loading').hide();
        });

        $('#meet_room').on('click', '.meet_scroll_btn', function() {
            var _this = $(this),
                meetRoomCale = $('.meet_cale_in');

            // show more meeting room area when click scroll up and down btn
            if (_this.hasClass('on')) {
                $('.meet_scroll_btn').removeClass('on');
                meetRoomCale.removeAttr('style');
                $('.meet_cale').removeAttr('style');
            } else {
                $('.meet_scroll_btn').addClass('on');
                meetRoomCale.stop().animate({
                    top: -45
                }, 400);
                $('.meet_cale').css('height', 1436);
            }

            // set page position when click scroll up and down btn
            if (_this.hasClass('up')) {
                window.location.hash = 'meet_room';
            } else {
                var downBtnToTop = $('body')[0].scrollHeight - $(window).height();

                $('html, body').stop().animate({
                    scrollTop: downBtnToTop
                }, 400);
            }

        });
    },

    /**
    meeting room choose date
    caleId: the data which element render to
    meetingUrl: data url
    */
    meetRoomChosDate: function() {
        var dateTxt = $('#cur_date').val(),
            dateObj = new Date().convertDate(dateTxt),
            curDate = ('0' + dateObj.getDate()).slice(-2),
            curMonth = ('0' + (dateObj.getMonth() + 1)).slice(-2),
            curYear = dateObj.getFullYear(),
            curWeekday,
            curYmd = curYear + '-' + curMonth + '-' + curDate,
            // caleId's parent node
            parentNode = $('.tab_con'),
            weekday = new Array(7),
            meetingUrl = $('#data_meeting_prefix').val() + '?date=' + curYmd + '&' + $('.tab_tit').find('.on').attr('data-meeting'),
            roomUrl = $('.tab_tit .on').attr('data-room'),
            // define start time and end time when hover on .ui-cal-date
            hoverSTime, hoverSTime, hoverSTimeNum, hoverETimeNum,
            // define start time and end time when select on .ui-cal-date
            selectingSTime, selectingETime, selectingSTimeNum, selectingETimeNum,
            // employee id
            curEid = $('#cur_eid').val(),
            // employee name
            curTitle = $('#cur_ename').val(),
            // new meeting event object
            curNewCalEvent = {},
            eachNotes,
            curTabTxt = $('.tab_tit .on').text(),
            curTab = $('.tab_tit .on'),
            curTabIdx = $('#meet_room .tab_tit li').index(curTab),
            curRoomWrap = $('.meet_cale_in').eq(curTabIdx);

        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";

        // detect which room should be rended
        rendMeeting(curRoomWrap, meetingUrl, roomUrl, curYmd);
        // getRoomByTitle(curRoomWrap, curTabTxt, curYmd);

        //get current weekday
        curWeekday = weekday[dateObj.getDay()].slice(0, 3);

        // set current date, month, year when page loading
        setCurYMWD(parentNode, curYear, curMonth, curWeekday, curDate);

        /**
         * set date, month, year for .date_chos
         */

        function setCurYMWD(parentNode, y, m, w, d) {
            var dateEle = $('.date_chos .date strong', parentNode),
                YearMonthEle = $('.date_chos ins', parentNode),
                weekdayEle = $('.date_chos .date em', parentNode),
                ymd = y + '-' + m + '-' + d;

            YearMonthEle.text(y + '.' + m);
            weekdayEle.text(w);
            dateEle.text(d);

            $('.date_chos .date_month_meeting', parentNode).attr('data-time', ymd);
        }

        /**
         * render meeting data to page
         * caleId: meeting render to here
         * meetingUrl: data source
         * roomUrl: meeting resource data url
         * date: current date
         */

        function rendMeeting(caleId, meetingUrl, roomUrl, date) {
            // show loading img before data loaded
            fedPris.popWinShow({
                id: ".pop_loading",
                maskIn: true,
                maskOut: false
            });

            // clear calendar
            $(caleId).cal('destroy');

            // var rooms = null;
            // get rooms
            $.getJSON(roomUrl, function(data) {
                var rooms = data,
                    roomsNum = data.meetingRoomId.length;

                // detect each tab's meeting room number, if number > 11, set class="tab_con_out" to "overflow-x:scroll"
                setMeetingRoomScroll(caleId, roomsNum);

                // access json data out of getJson function
                parseRoomAfter(caleId, meetingUrl, rooms, date);
            });
        }

        /**
         * [setMeetingRoomScroll: detect each tab's meeting rooms number, if number > 11, set right width of .tab_con_in and set .tab_con_out to 'overflow-x: scroll'
         * @param {object} id
         * @param {number} num [how much rooms]
         */

        function setMeetingRoomScroll(id, num) {
            var newNum = num,
                // width of class="tab_con_out": .date_chos width + all .room_status width
                tabConOutW = 92 * newNum + 71,
                tabCon = $(id).closest('.tab_con_out'),
                newId = $(id).parent();

            // if number > 11, set class="tab_con_out" to "overflow-x:scroll"
            if (num > 11) {
                tabCon.removeClass('x_scroll').addClass('x_scroll');
                $(id).closest('.tab_con_in').css('width', tabConOutW + 'px');
            }
        }

        /**
         * render meeting data after get room data
         * caleId: meeting render to here
         * meetingUrl: data source
         * rooms: meeting rooms
         * date: current date
         */

        function parseRoomAfter(caleId, meetingUrl, rooms, date) {
            var roomData = rooms,
                roomLen = roomData.meetingRoomId.length,
                caleIdParent = $(caleId).parent();

            // get meetings
            $.getJSON(meetingUrl, function(data) {
                var meetingData = data;

                if (meetingData === null || roomData === null) return;

                $(caleId).cal({
                    resources: roomData.resource,
                    daystodisplay: 1,
                    minwidth: 92,
                    gridincrement: '30 mins',
                    maskeventlabel: 'H:i',
                    masktimelabel: {
                        '00': 'H:i',
                        '30': '--'
                    },
                    allowresize: false,
                    allowmove: false,
                    allowselect: false,
                    allowremove: true,
                    allownotesedit: false,
                    allowoverlap: false,
                    allowhtml: true,
                    startdate: date,
                    events: meetingData,
                    onload: function() {
                        // add new event when select time range
                        calSelect();
                        // set each .ui-cal-date attr meeting room id
                        setCalRoomId(caleId, roomData.meetingRoomId);
                        if (roomLen > 11) {
                            // if meeting rooms > 11, scroll button and timeline of meeting room when scroll .tab_con_out
                            scrollBtnTimeline(caleIdParent);
                        }
                    },
                    eventremove: function(uid, $event) {
                        deleteMeeting($event.uid);
                    }
                });

            }).done(function() {
                hideLoading();
            });
        }

        /**
         * [setOverflowScroll: if meeting rooms > 11, scroll button and timeline of meeting room when scroll .tab_con_out]
         * @param {object} button and timeline's wrap element
         */

        function scrollBtnTimeline(id) {
            var $newId = $(id).closest('.tab_con_out'),
                defauScrollLeftV = $newId.scrollLeft();

            $('.meet_scroll_btn', $newId).css('left', defauScrollLeftV + 14);
            $('.ui-cal-timeline', $newId).css('left', defauScrollLeftV);

            // when scroll x, move .meet_scroll_btn and .ui-cal-timeline
            $newId.scroll(function() {
                var _this = $(this),
                    scrollLeftV = _this.scrollLeft();

                $('.meet_scroll_btn', $newId).css('left', scrollLeftV + 14);
                $('.ui-cal-timeline', $newId).css('left', scrollLeftV);
            });
        }

        /**
         * get and log each meeting's offset top value,
         * then detect one meeting's value in this column's all meeting value array or not
         */

        function getEachMeetingTop(id, direction) {
            var eachMeetingTopAray = [],
                uniqueMeetingTopAray = [],
                eachMeetingTop,
                eachMeetingBottom;

            // when selecting from up to bottom
            if (direction === 'upDown') {
                $(id).each(function() {
                    eachMeetingTop = $(this).offset().top;
                    eachMeetingTopAray.push(eachMeetingTop);
                });
                // when selecting from bottom to top
            } else {
                $(id).each(function() {
                    // eachMeetingBottom = $(window).height() - ($(this).offset().top + $(this).outerHeight());
                    eachMeetingBottom = $(this).offset().top + $(this).outerHeight();
                    eachMeetingTopAray.push(eachMeetingBottom);
                });
            }

            // remove duplicate data
            uniqueMeetingTopAray = $.unique(eachMeetingTopAray);

            return uniqueMeetingTopAray;
        }

        /**
         * delete meeting by using uid
         */

        function deleteMeeting(uid) {
            var deleteUrl = $('#data_post_delete').val() + '?bookingId=' + uid;

            // show loading img before data loaded
            fedPris.popWinShow({
                id: ".pop_loading",
                maskIn: true,
                maskOut: false
            });

            $.post(deleteUrl, function(data) {
                if (data.success === true) {
                    // hide loading img
                    hideLoading();
                }
            });
        }

        /**
         * set each .ui-cal-date attr meeting room id
         * caleId: meeting render to here
         * data: meetingRoomId data source
         */

        function setCalRoomId(caleId, meetingRoomData) {
            var uiCal = $('.ui-cal-date', caleId),
                uiCalLen = uiCal.length,
                i;

            for (i = 0; i < uiCalLen; i++) {
                uiCal.eq(i).attr('meetingRoomId', meetingRoomData[i]);
            }
        }

        /**
         * add new event when select time range
         */

        function calSelect() {
            var curDate = parseFloat($('#cur_date').val().replace(/-/g, '')),
                tabIdx = $('#meet_room .tab_tit li').index($('#meet_room .tab_tit .on')),
                curMeetingDate = parseFloat($('#meet_room .tab_con').eq(tabIdx).find('.date_chos .date_month_meeting').attr('data-time').replace(/-/g, '')),
                // define all current column meetings offset top value
                columnOffsetTopAray = [],
                startPageY,
                selectingPageY;

            // only can add new meeting today and after
            if (curMeetingDate < curDate) {
                $('#meet_room .tab_con').eq(tabIdx).find('.meet_cale_in_mask').show();
                return;
            }

            $('.ui-cal-date').selectable({
                delay: 0,
                start: function(event) {
                    var selectedMeetingRoom = $(this).attr('meetingroomid');

                    columnOffsetTopAray.length = 0;
                    // compare column's room id with event room id, if same, add class .cur_cal_event
                    compareRoomId(selectedMeetingRoom);
                    // get pageY value when start to selecting
                    startPageY = event.pageY;
                },
                selecting: function(event, ui) {
                    var uiSelectingLen = $('.ui-selecting').length,
                        thisOffsetTop = $('.ui-selecting:last').offset().top - (uiSelectingLen * 30) + 30,
                        thisOffsetBottom = $('.ui-selecting:last').offset().top + 30,
                        isInAray;

                    selectingPageY = event.pageY;

                    if (uiSelectingLen > 1) {

                        if (selectingPageY < startPageY) {
                            // when selecting from bottom to top
                            columnOffsetTopAray = getEachMeetingTop('.cur_cal_event', 'downUp');
                            isInAray = $.inArray(thisOffsetTop, columnOffsetTopAray);
                        } else {
                            // when selecting from top to bottom
                            columnOffsetTopAray = getEachMeetingTop('.cur_cal_event', 'upDown');
                            isInAray = $.inArray(thisOffsetBottom, columnOffsetTopAray);
                        }

                        if (isInAray !== -1) {
                            // disable select action when hover on .ui-cal-date to prevent repeat calendar
                            $('.ui-cal-date').selectable('disable');
                        }
                    }

                    $('.cur_cal_event').bind('hover', eventHover);
                },
                stop: function() {
                    var resource = $(this).attr('resource'),
                        meetingRoomId = $(this).attr('meetingRoomId'),
                        uiSelectedLastIdx = $('.ui-cal-time', this).index($('.ui-selected:last'));

                    selectingSTime = $('.ui-selected:first', this).attr('time');
                    if (uiSelectedLastIdx === 47) {
                        selectingETime = '00:00:00';
                    } else {
                        selectingETime = $(this).find('.ui-selected:last').next().attr('time');
                    }
                    selectingSTimeNum = parseFloat(selectingSTime.replace(/:/, ''));
                    selectingETimeNum = parseFloat(selectingETime.replace(/:/, ''));

                    // unbind hover event after selected
                    $('.cur_cal_event').unbind('hover', eventHover);
                    $('.ui-cal-event').removeClass('cur_cal_event');

                    // enable select calendar and pass through data
                    eAfterSelected(selectingSTimeNum, selectingETimeNum, resource, meetingRoomId);
                }
            });
        }

        /**
         * compare column's room id with event room id, if same, add class .cur_cal_event
         */

        function compareRoomId(id) {
            $('.ui-cal-event').each(function() {
                var eventMeetingRoom = $(this).attr('meetingroomid');

                if (eventMeetingRoom === id) {
                    $(this).addClass('cur_cal_event');
                }
            });
        }

        // hover on .ui-cal-date when select time range
        var eventHover = function() {
            var _this = $(this);

            // disable select action when hover on .ui-cal-date to prevent repeat calendar
            $('.ui-cal-date').selectable('disable');
        }

        /**
         * enable select calendar and pass through data
         * selectingSTimeNum: get start time after selected
         * selectingETimeNum: get end time after selected
         * resource: get resource attr after selected
         * meetingRoomId: get meetingRoomId attr after selected
         */

            function eAfterSelected(selectingSTimeNum, selectingETimeNum, resource, meetingRoomId) {
                // alert('selectingSTimeNum: ' + selectingSTimeNum + '  / selectingETimeNum: '  + selectingETimeNum + '--------------- hoverSTimeNum: ' + hoverSTimeNum + '/ hoverETimeNum: ' + hoverETimeNum);

                var tabIdx = $('#meet_room .tab_tit li').index($('#meet_room .tab_tit .on')),
                    curDate = $('#meet_room .tab_con').eq(tabIdx).find('.date_chos .date_month_meeting').attr('data-time'),
                    curUidSum = parseFloat($('#cur_uidSum').val()),
                    canHoveredLen,
                    hoveredFirst = $('.ui_cal_hovered:first'),
                    hoveredLast = $('.ui_cal_hovered:last');

                canHoveredLen = $('.ui_cal_hovered').length;
                $('#cur_uidSum').val(curUidSum + 1);

                fedPris.popWinShow({
                    id: ".pop_meeting",
                    maskOut: true,
                    maskIn: false
                });
                // $('#pop_win_mask, #pop_win .pop_meeting').show();
                // $('#pop_win .pop_meeting_eror, #pop_win .pop_win_in_mask').hide();
                // $('#pop_win .pop_win_in_mask').css('background', 'none');

                /**
                 * new meeting object
                 */
                curNewCalEvent.uid = curUidSum;
                curNewCalEvent.resource = resource;
                curNewCalEvent.roomId = meetingRoomId;
                curNewCalEvent.title = curTitle;
                curNewCalEvent.eid = curEid;
                curNewCalEvent.begins = curDate + ' ' + selectingSTime;
                curNewCalEvent.ends = curDate + ' ' + selectingETime;
                // if meeting end date equal 00:00:00, then change the date of this meeting to next day
                if (selectingETime === '00:00:00') {
                    var customAddDay = new Date().convertDate(curDate),
                        nextDayObj = customAddDay.addDays(1),
                        nextDayDate = ('0' + nextDayObj.getDate()).slice(-2),
                        nextDayMonth = ('0' + (nextDayObj.getMonth() + 1)).slice(-2),
                        nextDayYear = nextDayObj.getFullYear(),
                        nextDay = nextDayYear + '-' + nextDayMonth + '-' + nextDayDate;

                    curNewCalEvent.ends = nextDay + ' ' + selectingETime;
                } else {
                    curNewCalEvent.ends = curDate + ' ' + selectingETime;
                }

                $('#new_meet_time').text(curNewCalEvent.begins.slice(0, 16) + ' -- ' + curNewCalEvent.ends.slice(0, 16));
                $('#new_meet_requ').text(curTitle);

                // clear hover start time and end time
                selectingSTimeNum = null;
                selectingETimeNum = null;
                selectingSTime = '';
                selectingETime = '';

                // enable select action when hover on .ui-cal-date
                $('.ui-cal-date').selectable('enable');
            }

            // click close btn
        $('body').on('click', '#pop_win .delInfoIco, #pop_win_mask', function() {
            calClear();
        });

        // click ok btn
        $('body').on('click', '#pop_win .js_sbmt_meet', function() {
            // newCalAray.push(curNewCalEvent);
            var tabIdx = $('#meet_room .tab_tit li').index($('#meet_room .tab_tit .on')),
                caleId = $('#meet_room .tab_con').eq(tabIdx).find('.meet_cale_in '),
                postNewUrl = $('#data_post_new').val();

            // show loading img before data loaded
            fedPris.popWinShow({
                id: ".pop_loading",
                maskIn: true,
                maskOut: false
            });

            eachNotes = $('#new_meet_subj').val();
            curNewCalEvent.notes = eachNotes;

            // post new meeting event to server
            $.post(postNewUrl, curNewCalEvent, function(data) {
                if (data.success === true) {
                    // change local uid to server uid
                    curNewCalEvent.uid = data.uid;
                    // render new meeting to room
                    renderNewMeet(caleId, curNewCalEvent);
                    $('#pop_win_mask, #pop_win .pop_meeting, #pop_win .pop_win_in_mask').hide();
                } else {
                    $('#meeting_eror_tip').text(data.message);
                    $('#pop_win .pop_meeting, #pop_win .pop_win_in_mask').hide();
                    $('#pop_win_mask, #pop_win .pop_meeting_eror').show();
                }

                // hide loading img
                hideLoading();
            });

            calClear();
        });

        /**
         * post object to send auto response mail after booked meeting
         * @param  {[type]} calObj [description]
         */
        // function postMailObj (calObj){
        //     var postMailUrl = $('#data_post_mail').val(),
        //         curBuilding = $('#meet_room .tab_tit .on').text(),
        //         postMailObj = {};

        //     postMailObj.eid = calObj.eid,
        //     postMailObj.begins = calObj.begins,
        //     postMailObj.ends = calObj.ends,
        //     postMailObj.location = curBuilding + " " + calObj.roomId;

        //     $.post(postMailUrl, postMailObj, function(data) {});
        // }

        function calClear() {
            $('.ui-cal-time').removeClass('ui-selected');
            $('.ui-cal-event').removeClass('ui_cal_hovered');
            $('#pop_win_mask, #pop_win .pop_meeting, #pop_win .pop_meeting_eror').hide();
            // clear meeting subject
            $('#new_meet_subj').val('');
        }

        // show or hide loading img        

        function hideLoading() {
            $('#pop_win .pop_loading, #pop_win .pop_win_in_mask').hide();
            // $('#pop_win .pop_win_in_mask').css('background', '#ebe3d9');
        }

        /**
         * render new meeting to room
         * caleId: meeting render to here
         * data: new meeting object
         */

        function renderNewMeet(caleId, data) {
            $(caleId).cal('add', data);
        }

        // change date
        $('.main').on('change', '.date_chos .date_month_meeting', function() {
            var _this = $(this);

            // format date value
            _this.datepicker("option", "dateFormat", "yy-mm-dd-DD");

            var startDate = _this.val(),
                refresh = 'true',
                parentNode = _this.closest('.tab_con').find('.meet_cale_in'),
                dateWrap = '.tab_con',
                curYmd = startDate.slice(0, 10),
                curBuilding = _this.closest('.tab_con').siblings('.tab_tit').find('.on').text();

            // reset current date, month, year when date changed
            curYear = startDate.slice(0, 4);
            curMonth = startDate.slice(5, 7);
            curWeekday = startDate.slice(11, 14);
            curDate = startDate.slice(8, 10);
            meetingUrl = $('#data_meeting_prefix').val() + '?date=' + curYmd + '&' + $('.tab_con:first').siblings('.tab_tit').find('.on').attr('data-meeting');
            roomUrl = $('.tab_tit .on').attr('data-room');

            setCurYMWD(dateWrap, curYear, curMonth, curWeekday, curDate);

            // detect which room should be rended
            rendMeeting(parentNode, meetingUrl, roomUrl, curYmd);
        });

        // click and change tab
        $('.main').on('click', '#meet_room .tab_tit li', function() {
            var _this = $(this),
                thisIdx = $('#meet_room .tab_tit li').index(_this),
                meetRoomWrap = $('.meet_cale_in').eq(thisIdx),
                newCurYmd = $('.date_month_meeting').eq(thisIdx).attr('data-time');

            meetingUrl = $('#data_meeting_prefix').val() + '?date=' + newCurYmd + '&' + _this.attr('data-meeting');
            roomUrl = $(this).attr('data-room');
            curBuilding = _this.text();

            // detect which room should be rended
            rendMeeting(meetRoomWrap, meetingUrl, roomUrl, newCurYmd);
        });
    },

    /**
     * [setDaultRoom: set default meeting room tab]
     */
    setDaultRoom: function() {
        var daultRoomIndex = fedPris.prisTab('#meet_room');

        // set default meeting room tab
        setDaultRoom(daultRoomIndex);
        // set default meeting room tab

        function setDaultRoom(index) {
            var $li = $('#meet_room .tab_tit li'),
                strDefaultRoom = $li.eq(daultRoomIndex).text(),
                $checkbox = $('.tab_defauRoom_val'),
                status = $li.eq(index).attr('data-status');

            $li.eq(daultRoomIndex).attr('data-status', 'default');
            $checkbox.val(strDefaultRoom);

            // click set default checkbox: when clicked, set room value for id="tab_defauRoom_val",
            $('.tab_defauRoom_val').click(function() {
                var $this = $(this).parent(),
                    newIndex = $('#meet_room .tab_tit li').index($('#meet_room .tab_tit .on')),
                    strRoom = $li.eq(newIndex).text(),
                    postUrlPrefix = $this.attr('data-post-defauRoom'),
                    postUrl;

                if ($checkbox.prop('checked') === false) {
                    $checkbox.val('');
                } else {
                    $checkbox.val(strRoom);
                    // post default room to server
                    postUrl = $this.attr('data-post-defauRoom') + "?floor=" + strRoom;
                    $.post(postUrl, function(data) {});
                }
                $li.eq(newIndex).attr('data-status', 'default').siblings().removeAttr('data-status');
            });

            // click each tab: check current tab has attr data-status or not, if yes, set checkbox to 'checked' 
            $li.click(function() {
                var $this = $(this);
                status = $this.attr('data-status');

                if (status === undefined || status === '') {
                    $checkbox.prop('checked', false);
                } else {
                    $checkbox.prop('checked', true);
                }
            });
        }
    },

    // get title property and change it to tooltip
    titleTips: function(id) {
        var titEle,
            titEleClass,
            // hover element's title attribution
            titCon,
            // html code of #tool_tip
            tipCon,
            // #tool_tip left value
            tipLeft,
            // #tool_tip top value
            tipTop,
            // hover element's height
            titEleH,
            // hover element's width
            titEleW,
            // hover element's data-title attribute
            dataTit;
        // adjust tool tip's top value
        // fixedLeft = Number(fixedLeft),
        // fixedTop = Number(fixedTop);

        if (id === undefined) {
            titEle = '.tit_tip, input, div, button, i, span';
        } else {
            titEle = id;
        }

        // $(document).on('hover', titEle, function() {
        $(titEle).mouseenter(function() {
            var _this = $(this);
            dataTit = _this.attr('data-title');
            titCon = _this.attr('title');

            // if 'data-title' of hover element equal 'no_tit_tip' or it has no title attribute, then return
            if (dataTit === 'no_tit_tip' || titCon === undefined) return;

            // add new attribute 'data-title' to hover element
            if (dataTit == undefined || dataTit == '') {
                titCon = this.title;
                _this.attr('data-title', titCon);
            } else {
                titCon = dataTit;
            }

            // remove title attribute
            this.title = '';
            // get hover element's height
            titEleH = _this.outerHeight();
            titEleW = _this.outerWidth();

            // if there is title attribute in elements
            if (titCon != undefined && titCon != '') {
                // get hover element's top and left value
                // tipLeft = _this.offset().left + fixedLeft;
                // tipTop = _this.offset().top + titEleH + 8 - fixedTop;
                tipLeft = _this.offset().left;
                tipTop = _this.offset().top + titEleH + 8;

                // if there is not #tool_tip, create it
                if ($('#tool_tip').length === 0) {
                    tipCon = '<div id="tool_tip" class="tool_tip" style="left:' + tipLeft + 'px; top:' + tipTop + 'px;"><i></i><div class="tool_txt">' + titCon + '</div></div>';
                    $('.pageWrapper').append(tipCon);
                } else {
                    // if #tool_tip exists, just change its text
                    $('#tool_tip').css({
                        'left': tipLeft,
                        'top': tipTop
                    });
                    $('#tool_tip .tool_txt').html(titCon);
                }

                if (id !== undefined) {
                    titEleClass = id.replace(/[.#]/, '') + '_tool_tip';
                    $('#tool_tip').addClass(titEleClass);
                }

                $('#tool_tip').show();
            }
        })

        // $(document).on('mouseleave', titEle, function() {
        .mouseleave(function() {
            // hide #tool_tip when mouseout
            $('#tool_tip').hide();
            $('#tool_tip').attr('class', 'tool_tip');
        });
    },

    // pop up window close
    /*popWin: function() {
        var pop = $('#pop_win_mask, #pop_win .pop_win_in, #pop_win .pop_win_in_mask');
        // close pop up window
        $('#pop_win').on('click', '.pop_win_close', function() {
            $('#pop_win').attr('style', '');
            $(pop).hide();
        });
    },*/

    /**
     * === show pop up window
     * id: elements to show, id or class;
     * maskOut: {boolean} show #pop_win_mask or not;
     * maskIn: {boolean} show .pop_win_in_mask or not;
     * autoClose: setTimeout of pop up window, ms, fox example: autoClose: 3000. Default is false;
     * newPop: {html string} if need to create a pop up content;
     * outAreaClose: {boolean} true: close pop up window from outside of pop up, or false. Default is true;
     * fixed: {boolean} true: position:fixed, false: position:absolute. Default is true;
     *
     * === example:
     * ====== fedPris.popWinShow({
     *  id: "#pop_win_unlock",
     *  maskOut: true,
     *  maskIn: false,
     *  autoClose: 3000,
     *  newPop: (newPop's html),
     *  outAreaClose: true,
     *  fixed: true
     *  });
     */
    popWinShow: function(option) {
        var pop = $('#pop_win'),
            popIn = $('.pop_win_in'),
            mask = $('#pop_win_mask'),
            inMask = $('#pop_win .pop_win_in_mask'),
            // default options
            defaultOpt = {
                maskOut: true,
                maskIn: false,
                autoClose: false,
                outAreaClose: true,
                fixed: true
            },
            closePop,
            popW,
            popTopV,
            popLeftV;

        var opt = {};
        opt = $.extend(defaultOpt, option);

        // clear #pop_win attribute width and margin
        pop.attr('style', '');
        // show pop and mask
        $(opt.id).show().siblings().hide();
        opt.maskOut === true ? mask.show() : mask.hide();
        opt.maskIn === true ? inMask.show() : inMask.hide();

        // create new pop up
        if (opt.newPop !== undefined) {
            // if no related pop up win, then create it
            if ($(opt.id).length === 0) {
                pop.append(opt.newPop);
            }
            // else only show it
            $(opt.id).show().siblings().hide();
        }

        // pop up window auto close
        if (opt.autoClose !== false) {
            setTimeout(function() {
                closePop();
            }, opt.autoClose);
        };

        // close pop up window from outside of pop up
        if (opt.outAreaClose === true) {
            mask.click(function() {
                closePop();
            });
        }

        // set #pop_win to position fixed or absolute
        if (opt.fixed) {
            pop.removeClass('pop_win_absolute');
        } else {
            pop.addClass('pop_win_absolute');
            var scrollTopV = $(window).scrollTop() + 50;
            if (scrollTopV > 150) {
                pop.css('top', scrollTopV);
            }
        }
        // if position of pop is fixed, then set #pop_win top value automatically; if position of pop is absolute, then use fixed value
        popW = $(opt.id).outerWidth();
        popTopV = -($(opt.id).outerHeight() / 2) + 'px';
        popLeftV = -(popW / 2) + 'px';
        pop.css({
            'width': popW,
            'marginTop': popTopV,
            'marginLeft': popLeftV
        });

        // click to close pop up window
        pop.on('click', '.pop_win_close', function() {
            closePop();
        });

        // close pop up window
        closePop = function() {
            // if the pop up window is new created, remove it; if not, just hide it
            opt.newPop === undefined ? $(opt.id).hide() : $(opt.id).remove();
            popIn.hide();
            mask.hide();
            inMask.hide();
        }
    },

    /**
     * close all pop up window
     * @param {num} time excu funtion after the time. 3000 is 3 seconds.
     */
    closeAllPop: function(time) {
        var popIn = $('#pop_win .pop_win_in'),
            mask = $('#pop_win_mask'),
            inMask = $('#pop_win .pop_win_in_mask');

        if (time === undefined) {
            popIn.hide();
            mask.hide();
            inMask.hide();
        } else {
            setTimeout(function() {
                popIn.hide();
                mask.hide();
                inMask.hide();
            }, time)
        }

    },

    /**
     * === TODO: drop this function, replace it with function 'dialog'
     * === confirm dialog to replace system's alert function
     * id: id or class. Default is '#pop_win_unlock'.
     * message: {string} the content will be showed in .js_message of #pop_win_unlock.
     * clickId: {string} when pop up window shows, click clickId, then excute function 'excuFun'. Default is null.
     * excuFun: {function} click clickId, then excute this function. Default is null.
     */
    confirmDialog: function(option) {
        // default options
        var defaultOpt = {
            id: "#pop_win_unlock",
            message: '',
            clickId: null,
            excuFun: null
        };

        var opt = {};
        opt = $.extend(defaultOpt, option);

        // set content in .js_message
        if (opt.message !== '') {
            $('.js_message', opt.id).text(opt.message);
        }

        // click clickId, excute function 'excuFun'
        if (opt.excuFun !== null && opt.clickId !== null) {
            $(opt.clickId).unbind().bind('click', function() {
                (opt.excuFun && typeof(opt.excuFun) === "function") && opt.excuFun();
            });
        }

        // show related pop up window
        fedPris.popWinShow({
            id: opt.id,
            maskIn: true,
            maskOut: true
        });
    },

    /**
     * === confirm dialog to replace system's alert function
     * id: dialog's id or class. Default is '#pop_win_dialog'.
     * message: {string} the content will be showed in .js_message of dialog.
     * type: {string}, there are two types: confirm or alert, alert type of dialog do not have message and only have one button. Default is 'confirm'.
     * btnOkTxt: {string}, text showing ok button. Default is Ok.
     * btnCancelTxt: {string}, text showing cancel button. Default is Cancel.
     * clickId: {string} when pop up window shows, click clickId, then excute function 'excuFun'. Default is null.
     * excuFun: {function} click clickId, then excute this function. Default is null.
     *
     * === example:
     * ====== alert dialog:
     * fedPris.dialog({
     *      message: "test",
     *      type: "alert"
     *   });
     *
     * ====== confirm dialog:
     * fedPris.dialog({
     *      message: "xxxxxxxxxxxdlfsjdlfskdlf",
     *      clickId: ".sbmt",
     *      excuFun: changeMesg
     * });
     */
    dialog: function(option) {
        // default options
        var defaultOpt = {
            id: "#pop_win_dialog",
            message: '',
            type: "confirm",
            btnOkTxt: 'Ok',
            btnCancelTxt: 'Cancel',
            clickId: null,
            excuFun: null
        },
            // id of dialog
            dialogId,
            // html string of dialog
            dialogStr,
            // top html string of dialog
            dialogTop,
            // bottom html string of dialog
            dialogBotm,
            // message of dialog
            dialogMsg,
            // buttons of dialog
            dialogBtn;

        var opt = {};
        opt = $.extend(defaultOpt, option);

        // replace .# of id or class
        dialogId = opt.id.replace(/[.|#]/g, '');

        // top html string of dialog
        dialogTop = "<div id='" + dialogId + "' class='pop_win_in pop_win_dialog'>";
        // bottom html string of dialog
        dialogBotm = "</div>";
        // message of dialog
        opt.message === '' ? dialogMsg = '' : dialogMsg = "<p class='tc js_message'>" + opt.message + "</p>";
        // buttons of dialog
        if (opt.type === 'confirm') {
            dialogBtn = "<p class='tc mt'><button class='auto_c_btn cancel pop_win_close' type='button'>" + opt.btnCancelTxt + "</button><button class='auto_c_btn prim sbmt' type='button'>" + opt.btnOkTxt + "</button></p>";
        } else {
            dialogBtn = "<p class='tc mt'><button class='auto_c_btn prism pop_win_close' type='button'>" + opt.btnOkTxt + "</button></p>";
        }

        // join html string of dialog
        dialogStr = dialogTop + dialogMsg + dialogBtn + dialogBotm;
        // append dialog to page
        $('#pop_win').append(dialogStr);

        // click clickId, excute function 'excuFun'
        if (opt.excuFun !== null && opt.clickId !== null) {
            $(opt.clickId).unbind().bind('click', function() {
                (opt.excuFun && typeof(opt.excuFun) === "function") && opt.excuFun();
            });
        }

        // show related pop up window
        fedPris.popWinShow({
            id: '#' + dialogId,
            maskIn: true,
            maskOut: true
        });

        // click to remove dialog
        $('#pop_win').on('click', '.pop_win_close', function() {
            // $('#pop_win').attr('style', '');
            $(opt.id).remove();
        });
    },

    // click to show pop up window to add headcount
    addHeadc: function() {
        $(document).on('click', '.action_p', function(e) {
            var _this = $(this);

            _this.siblings('.pop_headc').show();
            _this.closest('tr').siblings().find('.pop_headc').hide();
            e.stopPropagation();
        });

        // click to hide pop up window
        $(document).on('click', '.pop_headc .close', function() {
            $(this).closest('.pop_headc').hide();
        });

        // click other places to hide pop up window
        $(document).click(function() {
            $('.pop_headc').hide();
        });

        // stopPropagation when click on pop up window
        $(document).on('click', '.pop_headc', function(e) {
            e.stopPropagation();
        });
    },

    // profile page back to previous page and print
    print: function() {
        $(".black_btn:contains('Print'), .print_btn").click(function() {
            window.print();
        });
    },

    /**
     * get data of events and display them in event elements' title attribute
     * event: event object
     * ele: each event element
     */
    renderDataToTit: function(event, ele) {
        // event start time
        var startTime,
            // event end time
            endTime,
            // event title
            calTitle,
            // event location
            calLoc,
            // event description
            calDes,
            title,
            className;

        if (event.start === null || event.allDay === true) {
            startTime = '';
        } else {
            startTime = '<strong>Start: </strong><br/>' + event.start.format('yyyy-MM-dd HH:mm:ss');
        }

        if (event.end === null || event.allDay === true) {
            endTime = '';
        } else {
            endTime = '<strong>End: </strong><br/>' + event.end.format('yyyy-MM-dd HH:mm:ss');
        }

        // if allDay is true, and start time is not null, and end time is not null, and the day of start time & end time is different
        if (event.start !== null && event.end !== null && event.allDay !== false && event.start.getDate() !== event.end.getDate()) {
            startTime = '<strong>Start: </strong><br/>' + event.start.format('yyyy-MM-dd HH:mm:ss');
            endTime = '<strong>End: </strong><br/>' + event.end.format('yyyy-MM-dd HH:mm:ss');
        }

        if (event.title === '') {
            calTitle = '';
        } else {
            calTitle = event.title;
        }

        if (event.location === '') {
            calLoc = '';
        } else {
            calLoc = '<strong>Location: </strong><br/>' + event.location;
        }

        if (event.description === '') {
            calDes = '';
        } else {
            calDes = '<strong>Description: </strong><br/>' + event.description;
        }

        // detect different event type and set different class
        var reg = /^<.*\>/,
            str = String(reg.exec(calTitle)),
            dayType = str.replace(/<|>/g, '').toLowerCase();

        switch (dayType) {
            case 'work day':
                className = 'workingDay';
                break;
            case 'giactivity':
                className = 'activityDay';
                break;
            case 'training':
                className = 'trainingDay';
                break;
            case 'holiday':
                className = 'holiday';
                break;
            default:
                // default do nothing
        }

        // combine data of events
        title = "<p>" + calTitle + "</p>" +
            "<p>" + startTime + "</p>" +
            "<p>" + endTime + "</p>" +
            "<p>" + calLoc + "</p>" +
            "<p>" + calDes + "</p>";

        // set data to elements' title attribute
        $(ele).addClass(className).attr('title', title).attr('target', '_blank');
        if (dayType !== 'giactivity') {
            $(ele).removeAttr('href');
        }
    },

    /**
     * render other source to index fullcalendar
     * @param  {[type]} eid -render to which element
     * @param  {[type]} dataUrl -data source url
     */
    renderSourceToFullCal: function(eid, dataUrl, dayType) {
        //ADD GI EVENTS
        var giEvents = [];
        $.ajax({
            type: "get",
            url: "http://hzmis/Proxy/api/sp_calendar?site=gihz&title=gi-calendar",
            success: function(data) {

                $.each(data, function(key, rec) {
                    giEvents.push({
                        id: rec.row.ows_ID,
                        title: "<" + dayType + ">" + rec.row.ows_Title,
                        allDay: rec.row.ows_fAllDayEvent,
                        start: rec.row.ows_EventDate,
                        end: rec.row.ows_EndDate,
                        location: rec.row.ows_Location,
                        description: rec.row.ows_Description,
                        url: "https://collaborate.statestr.com/sites/gihz/Lists/GICalendar/DispForm.aspx?ID=" + rec.row.ows_ID

                    });
                });

                $('#mod_l_calendar').fullCalendar('addEventSource', giEvents);
            }

        });
    },

    // render news on index page
    renderNewsToIdx: function(id) {
        var i,
            len,
            htmlStr = '',
            newId = id;

        if (newId === '#gihz') {
            $.ajax({
                type: "get",
                url: "http://hzmis/Proxy/api/SP_List?site=gi&title=GI%20Activities",
                success: function(data) {
                    // only get the first 5 items
                    data.length > 5 ? len = 5 : len = data.length;

                    for (i = 0; i < len; i++) {
                        // if there are picture url and link
                        if(data[i].row.ows_Pic !== undefined && data[i].row.ows_URL !== undefined){
                            htmlStr += "<li class='item clearfix'><img src='" + data[i].row.ows_Pic.replace(/,/g, '') + "' /><div class='img_r'><h5><a target='_blank' href='" + data[i].row.ows_URL.split(',')[0] + "'>" + data[i].row.ows_LinkTitle + "</a></h5><p>" + data[i].row.ows_Time + "</p><p class='desc'>" + data[i].row.ows_Venue + "</p></div></li>";
                        }
                    }

                    $(newId).html(htmlStr);
                }
            });
        }
    },

    // edit project page: set checkbox, and change project title name
    changeTitStatus: function() {
        var status = $('.proj_status:checked').val();

        // check if status is Close
        if (status === 'Close') {
            $('#proj_titName .editIco_l').hide();
            // set all input and textarea of special id to disabled 
            fedPris.disableIpt('#edit_proj', 'close', '.not_disable');
        }

        // switch open and close
        $('.proj_status').change(function() {
            var _this = $(this);

            status = _this.val();

            if (status === 'Open') {
                $('#proj_titName .editIco_l').show();
                // set all input and textarea of special id to enable 
                fedPris.disableIpt('#edit_proj', 'open', '.not_disable');
            } else {
                $('#proj_titName .editIco_l').hide();
                // set all input and textarea of special id to disabled 
                fedPris.disableIpt('#edit_proj', 'close', '.not_disable');
            }
        });

        // change and edit title
        $('#proj_titName .editIco_l').click(function() {
            var _this = $(this);

            if (_this.hasClass('save_ico')) {
                var iptValue = _this.siblings('.proj_titName_ipt').val();

                _this.siblings('.proj_titName_ipt').hide();
                _this.siblings('span').text(iptValue).show();
                _this.removeClass('save_ico');
            } else {
                $('.proj_titName_ipt').show();
                _this.addClass('save_ico').siblings('span').hide();
            }

        });

        // request unlock project
        /*$('#requ_unlock').click(function () {
            fedPris.confirmDialog({
                id: "#pop_win_unlock",
                message: "Are you sure??????",
                clickId: "#pop_win_unlock .sbmt",
                excuFun: fedPris.closeAllPop
            });
        });*/
    },

    /**
     * set all input and textarea of special id to disabled
     * id: id or calss of element
     * not: elements which not disabled
     */
    disableIpt: function(id, status, not) {
        var textEle = $('.text, select', id).not(not),
            textareaEle = $('textarea', id).not(not);

        if (status === 'open') {
            textEle.removeProp('disabled').removeClass('disabled');
            textareaEle.removeProp('readonly').removeClass('disabled');
        } else {
            textEle.prop('disabled', 'disabled').addClass('disabled');
            textareaEle.prop('readonly', 'readonly').addClass('disabled');
        }
    },

    /**
     * elements multiple select
     * id: id of module multiple select
     */
    selectMulti: function(id) {
        var newId = id.replace(/[.#]/, ''),
            jsParent = id + ' .js_parent';

        // don't highlight text when click with shift or ctrl key
        try {
            document.getElementById(newId).onselectstart = function() {
                return false;
            }
        } catch (e) {}

        // click on each row to select elements
        $(id).on('click', '.js_parent', function(e) {
            var _this = $(this),
                ele = $(jsParent),
                selectedEle = _this.parent().find('.selected'),
                selectedEleLen = selectedEle.length,
                _thisIdx = ele.index(_this);

            if (_this.hasClass('selected')) {
                if (e.ctrlKey || e.shiftKey) {
                    _this.removeClass('selected');
                } else {
                    selectedEleLen === 0 ? _this.removeClass('selected') : _this.siblings().removeClass('selected');
                }
            } else {
                e.ctrlKey ? _this.addClass('selected') : _this.addClass('selected').siblings().removeClass('selected');

                if (e.shiftKey) {
                    ele.removeClass('selected');
                    if (selectedEleLen === 0) {
                        ele.removeClass('selected');
                        for (var i = 0; i < (_thisIdx + 1); i++) {
                            ele.eq(i).addClass('selected');
                        }
                    } else {
                        var idxAray = [],
                            eachIdx,
                            minIdx,
                            maxIdx;

                        selectedEle.each(function() {
                            eachIdx = ele.index($(this));
                            idxAray.push(eachIdx);
                        });

                        minIdx = Math.min.apply(Math, idxAray);
                        maxIdx = Math.max.apply(Math, idxAray);

                        if (_thisIdx > maxIdx) {
                            for (var i = minIdx; i < (_thisIdx + 1); i++) {
                                ele.eq(i).addClass('selected');
                            }
                        } else if (_thisIdx < minIdx) {
                            for (var i = _thisIdx; i < (maxIdx + 1); i++) {
                                ele.eq(i).addClass('selected');
                            }
                        }
                    }
                }
            }

        });

        /**
         * dblclick on each row to select elements
         */
        $(id).on('dblclick', '.js_parent', function() {
            var _this = $(this),
                _thisParent = _this.parent();

            if (_thisParent.hasClass('js_tls_result')) {
                $('.to_l', id).triggerHandler('click');
            } else {
                $('.to_r', id).triggerHandler('click');
            }
        });

        // click right or left arrow to add or delete selected data
        $('.tls_btn span', id).click(function() {
            var _this = $(this);

            if (_this.hasClass('to_r')) {
                // move selected person to right of pop up window .js_tls_result
                fedPris.moveSlctToR(id);
            } else {
                var slctEid;

                // remove selected person from right to left in pop up window
                $('.js_tls_result .selected', id).each(function() {
                    var _that = $(this);

                    slctEid = _that.attr('eid');
                    $(".tls_table .js_parent[eid='" + slctEid + "']", id).show().removeClass('selected js_none');
                    _that.remove();
                });
            }
        });
    },

    /**
     * move selected person to right of pop up window .js_tls_result
     * id: id of module multiple select
     */
    moveSlctToR: function(id) {
        var clonedHtml = '',
            selectedId,
            selectedName,
            // selected ele on left of pop up window
            selectedEle,
            selectedNameFilter,
            // right of pop up window .js_tls_result
            container;

        selectedEle = $('.tls_table .selected', id);
        container = $('.tls_result', id);

        selectedEle.each(function() {
            selectedId = $('td:first', this).text(),
            selectedName = $('td:last', this).text(),
            selectedNameFilter = selectedName.replace(/\'/, '-');

            clonedHtml += "<p class='js_parent' ename='" + selectedNameFilter + "' eid=" + selectedId + "><span class='js_child'>" + selectedId + "</span>/<span class='js_child'>" + selectedName + "</span></p>";
        });

        selectedEle.addClass('js_none').removeClass('selected').hide();
        $(clonedHtml).appendTo(container);
    },

    /**
     * team leader selector
     * id: id of module multiple select
     */
    selectTL: function(id) {
        var idx,
            slctBtn = $('.tls_slct_btn'),
            dataUrl,
            filterIpt = id + ' .js_tls_ipt .text';

        // detect each tls_selected_list is blank or not: if not blank, then show it
        $('.tls_selected_list').each(function() {
            var _this = $(this),
                tagP = $('p', _this),
                tagPLen = tagP.length;

            if (tagPLen > 0) {
                _this.show();
            }
        });

        // focus on input .offshor_mana and show pop up window
        slctBtn.click(function() {
            //if this page is locked, then can't select person
            if ($('.proj_status:checked').val() === 'Close' || $('input#close').length === 0) return;

            var _this = $(this),
                popTitle = _this.parent().siblings('.label').text().replace(/\*|\:/g, '') + ' selector',
                filterDefauStr = $(filterIpt).removeClass('normal').attr('tip'),
                dataUrl = _this.attr('data-source-idName'),
                jsTableTrLen = $('.js_parent', id).length;

            // if there is data in .js_table>.in>table, don't loading json data again
            if (jsTableTrLen === 0) {
                // append loading tip
                $('.js_table .in', id).append("<p id='tls_tip' class='mt tc'>Loading, please wait...</p>");
                // loading data
                $.getJSON(dataUrl, function(data) {
                    var nameList = data;

                    // render name list to pop up window
                    renderName(nameList);
                    // filter data by input txt
                    fedPris.listFilter(filterIpt, (id + ' .js_table .js_parent'));
                }).done(function() {
                    // hide loading tip
                    $('#tls_tip').hide();
                });
            }

            // set pop up window's title
            $(id + '>h4').text(popTitle);
            // reset filter input's value
            $(filterIpt).val(filterDefauStr);
            // get index of select button on age
            idx = $('.tls_slct_btn').index(_this);
            // set a mark for pop up window to check user clicking same btn or not
            $(id).attr('data-idx', idx);
            // clear result on the right of pop up window
            $('.js_tls_result', id).html('');
            // show and reset class for the left rows of pop up window
            $('.js_table tbody tr', id).show().removeClass('selected js_none');

            // elements multiple select
            fedPris.selectMulti(id);
            _this.siblings('.tls_selected_list').find('.js_parent').each(function() {
                var slctEid = $(this).attr('eid');
                $(".tls_table .js_parent[eid='" + slctEid + "']", id).addClass('selected');
            });
            // move selected person to right of pop up window .js_tls_result
            fedPris.moveSlctToR(id);
            fedPris.popWinShow({
                id: id,
                maskOut: true,
                maskIn: false
            });

        });

        /**
         * render name list to pop up window
         */

        function renderName(data) {
            var list = data,
                listLen = list.length,
                i,
                listHtml = '';

            // get each person's id and name
            for (i = 0; i < listLen; i++) {
                listHtml += "<tr class='js_parent' eid=" + list[i].id + "><td>" + list[i].id + '</td><td>' + list[i].name + "</td></tr>";
            }
            // append all person to pop up window
            $('.js_table tbody', id).html('').append(listHtml);
        }

        // click ok btn to get and submit selected data
        $('.sbmt', id).click(function() {
            var selectedAray = [],
                selectedObj = {},
                selectedId,
                idNumber,
                selectedName,
                selectedNameFilter,
                clonedHtml = '',
                tlsSelectedList = $('.tls_selected_list').eq(idx);

            $('.js_tls_result p', id).each(function() {
                var _this = $(this);

                selectedObj.id = _this.attr('eid'),
                // only get numbers of selectedObj.id
                idNumber = selectedObj.id.replace(/^[A-Za-z]/gi, ''),
                selectedObj.name = _this.attr('ename');
                selectedNameFilter = selectedObj.name.replace(/\-/, "'");

                clonedHtml += "<p class='js_parent' ename='" + selectedObj.name + "' eid=" + selectedObj.id + "><a href='/Profile/Edit?userId=" + idNumber + "'><span class='js_child'>" + selectedObj.id + "</span><span>/</span><span class='js_child'>" + selectedNameFilter + "</span></a><i class='delIco'></i></p>";
                selectedAray.push(selectedObj);
            });

            if (selectedAray.length === 0) return;
            tlsSelectedList.html('').append(clonedHtml).show();
            $('#pop_win_mask, ' + id).hide();
            // get selected person's name, and append them to input's value
            fedPris.storeSlctVal(tlsSelectedList, idx);
        });

        /**
         *  delete selected person
         * aray: Array of selected person's eid
         */
        $('.tls_selected_list').on('click', '.delIco', function() {
            //if this page is locked, then can't select person
            if ($('.proj_status:checked').val() === 'Close' || $('input#close').length === 0) return;

            var _this = $(this),
                _thisIdx = $('.tls_slct_btn').index(_this.closest('.tls_selected_list').siblings('.tls_slct_btn')),
                delPerson = _this.parent().attr('eid'),
                childLen = $('.tls_selected_list p').length - 1,
                tlsSelectedList = $('.tls_selected_list').eq(_thisIdx);

            if (childLen === 0) {
                $('.tls_selected_list').hide();
            }
            _this.parent().remove();
            // show person in pop up window after delete selected person
            fedPris.showDeleted(delPerson, id);
            // get selected person's name, and append them to input's value
            fedPris.storeSlctVal(tlsSelectedList, _thisIdx);
        });

    },

    /**
     * filter data by input txt
     * ipt: which input to type text
     * list: which list to be searched
     */
    listFilter: function(ipt, list) {
        var newList = $(list);

        $(ipt).keyup(function() {
            var _this = $(this),
                _thisVal = _this.val(),
                _thisValLen = _thisVal.length;

            // only excu when type more than 4 chars
            if (_thisValLen > 1) {
                newList.each(function() {
                    var _that = $(this),
                        _thatStr = _that.text();
                    /**
                     * search by typed string:
                     * if not match, hide list items;
                     * if matche, show the related list items (exclude which on the right of pop up window);
                     */
                    setTimeout(function() {
                        _that.hasClass('js_none') || _thatStr.search(new RegExp(_thisVal, 'i')) < 0 ? _that.hide() : _that.show();
                    }, 500);
                });
            } else {
                newList.not('.js_none').show();
            }
        });
    },

    /**
     * show person after delete selected person on pop up window
     * eid: eid of deleted person
     */
    showDeleted: function(eid, id) {
        var localEid = eid,
            newId = id;

        $('.js_table tbody tr', newId).each(function() {
            var _this = $(this),
                thisEid = _this.attr('eid');

            if (thisEid === localEid) {
                _this.show();
            }
        });

        $('.js_tls_result .js_parent', newId).each(function() {
            var _this = $(this),
                thisEid = _this.attr('eid');

            if (thisEid === localEid) {
                _this.remove();
            }
        });
    },

    /**
     * get selected person's name, and append them to input's value
     * id: the selected person where to show on the page
     * idx: index value of which module
     */
    storeSlctVal: function(id, idx) {
        var newId = id,
            newIdx = idx,
            selectedName,
            selectedNameFilter,
            clonedName = '',
            clonedId = '';

        $('p', newId).each(function() {
            var _this = $(this);

            selectedId = _this.attr('eid');
            selectedName = _this.attr('ename');
            selectedNameFilter = selectedName.replace(/\-/, "'");
            clonedId += selectedId + '/';
            clonedName += selectedNameFilter + '/';
        });

        // set input value as selected person and id
        $('.tls_slctId').eq(newIdx).val(clonedId);
        $('.tls_slctName').eq(newIdx).val(clonedName);
    },

    /**
     * trigger same select on page
     * if two or more select have same class, the others will be triggered to be selected when click one of them
     */
    TriggerSameSlct: function() {
        $('select').change(function() {
            var _this = $(this);

            if (_this.attr('data-group') === undefined) return;

            var _thisGroup = _this.attr('data-group'),
                _thisTxt = $('option:selected', _this).text();

            $('select').each(function() {
                var _that = $(this),
                    _thatGroup = _that.attr('data-group');

                if (_thisGroup === _thatGroup) {
                    $('option', _that).each(function() {
                        var _thisOpt = $(this),
                            _thisOptTxt = _thisOpt.text();

                        if (_thisTxt === _thisOptTxt) {
                            _thisOpt.prop('selected', 'selected');
                        }
                    });
                }
            });
        });
    },

    /**
     * blur a hidden input when focus on it
     */
    blurHiddenIpt: function(ipt) {
        $(ipt).click(function() {
            $(this).blur();
        });
    },

    /**
     * [tree: organization tree of index page]
     */
    tree: function() {
        // set class of first and last element
        $('.org_level>ul>li:first').addClass('first_pare');
        $('.org_level li:last').addClass('last_child');

        // click to expand or collapse
        $('.org_level').on('click', '.expColIco', function() {
            var _this = $(this),
                _thisPare = _this.parent();

            if (!_thisPare.hasClass('last_child')) {
                // show or hide when expand and collapse
                if (_thisPare.hasClass('collapse')) {
                    _thisPare.removeClass('collapse').next().show();
                } else {
                    _thisPare.addClass('collapse').next().hide();
                }
            }
        });
    },

    /**
     * This is to fix highcharts not showing ie8 and lower.
     * Check for ie version. If ie8 and ie8 lower, send the entire chart config to the
     * Highcharts export server and display a generated image of the chart.
     * @param  {string} id
     * @param  {object} opt, setting option
     */
    fixHighchartForIE: function(id, svgData) {
        var tip,
            tipH,
            img = $('.img_loading').clone(),
            apiPrefix = $('#api_prefix').val();

        $('#' + id).html(img);

        $.ajax({
            url: apiPrefix + '/HighchartsExport/ImageUrl',
            type: 'POST',
            contentType: 'text/xml',
            data: svgData,
            success: function(data) {
                $('#' + id).html('');
                $('<img>').attr('src', data.message).appendTo('#' + id);
            }
        });

        // show a tip when page has chart and on ie8 and lower
        tip = "<div id='chart_tip' class='chart_tip'><p>Charts are rendered as picture due to IE8 security fix. For better experience, please use modern browser like IE9+.</p><button type='button' class='del binIco'><i></i></button></div>";

        if (fedPris.oldIE() && $('#chart_tip').length === 0) {
            $('.pageWrapper').append(tip);
            $('#chart_tip').stop().animate({
                "top": 0
            }, 800);
        }

        $(document).on('click', '.del', function() {
            closeTip();
        });

        function closeTip() {
            tipH = $('#chart_tip').outerHeight();

            $('#chart_tip').stop().animate({
                "top": "-" + tipH
            }, 800);
        }
    },

    /**
     * renderStaffAtrackHour: render Atrack Hours for staff ito page
     */
    renderStaffAtrackHour: function() {
        var staffItoChart,
            staffItoChartOption,
            araySeriesData = [],
            arayName = [],
            arayEid = [],
            arayLeaderKey = [],
            defaultJson = $('#atrack_chart').attr('data-source-atrack'),
            strMonth = new Date().getMonth() + 1,
            strYear = new Date().getFullYear(),
            strMonYear = strYear + '-' + strMonth + '-1',
            strTimeTxt = new Date().convertDate(strMonYear).format('MMM, yyyy');

        // chart option
        staffItoChartOption = {
            chart: {
                renderTo: 'atrack_chart',
                type: 'column',
                width: 888,
                inverted: true,
                reflow: false,
                marginTop: 70,
                borderRadius: 0,
                events: {
                    load: function(e) {
                        isLeader();
                        //clear array when chart loaded
                        araySeriesData = [];
                        arayName = [];
                        arayLeaderKey = [];
                    }
                }
            },
            title: {
                text: 'Atrack Hours (h)'
            },
            subtitle: {
                text: strTimeTxt,
                y: 35,
                style: {
                    color: '#999',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }
            },
            credits: {
                enabled: false
            },
            colors: prisGCfg.chartColor,
            legend: {
                margin: 20,
                borderColor: '#fff'
            },
            xAxis: {
                labels: {
                    useHTML: true
                }
            },
            yAxis: {
                title: null,
                max: 192,
                tickPixelInterval: 48,
                plotLines: [{
                    color: '#e2792c',
                    width: 1,
                    zIndex: 10,
                    dashStyle: 'ShortDash',
                    label: {
                        rotation: 0
                    }
                }, {
                    color: '#58b146',
                    width: 1,
                    value: 176,
                    zIndex: 10,
                    dashStyle: 'ShortDash',
                    label: {
                        text: 'TotalHours: 176',
                        rotation: 0
                    }
                }]
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: 'white',
                        formatter: function() {
                            if (this.y !== 0) {
                                return this.y;
                            }
                        }
                    }
                }
            },
            series: [{}],
            exporting: {
                enabled: false
            }
        }

        renderChart(defaultJson);

        /**
         * [renderChart: render chart by provided data url]
         * @param  {[string]} jsonUrl  [json url]
         * @param  {[string]} curHours [current hours]
         */

        function renderChart(jsonUrl) {
            $.getJSON(jsonUrl, function(data) {
                // height of chart
                var chartH,
                    //current hours
                    curHours = data.currentHour;

                $.each(data.people, function(key, val) {
                    var person = val.name,
                        isLeader = val.leader,
                        eid = val.eid;
                    // get leader's index
                    if (isLeader === 'yes') {
                        arayLeaderKey.push(key);
                    }
                    arayName.push(person);
                    arayEid.push(eid);
                });

                // get chart's data
                araySeriesData = data.hour;
                // get chart's height when data loaded
                chartH = data.people.length * 70;

                // set chart's height
                staffItoChartOption.chart.height = chartH;
                // set chart's category
                staffItoChartOption.xAxis.categories = arayName;
                // set chart's data
                staffItoChartOption.series = araySeriesData;
                // set chart's current hours and text for plotLines
                staffItoChartOption.yAxis.plotLines[0].value = curHours;
                staffItoChartOption.yAxis.plotLines[0].label.text = 'Current Hours ' + curHours;
                // render chart
                staffItoChart = new Highcharts.Chart(staffItoChartOption);
                if (fedPris.oldIE()) {
                    var svgData = staffItoChart.getSVG();
                    fedPris.fixHighchartForIE(staffItoChartOption.chart.renderTo, svgData);
                } 
                // get child node of data when click
                getStaff();
            });
        }

        /**
         * [isLeader: detect person has child node or not]
         */

        function isLeader() {
            var key = arayLeaderKey,
                idx,
                $allClickSpan = $('.atrack_chart .highcharts-axis-labels span');

            for (var i = 0; i < key.length; i++) {
                idx = key[i];
                $clickSpan = $allClickSpan.eq(idx);
                if (!$clickSpan.hasClass('.leader')) {
                    $clickSpan.addClass('leader').prepend($('<b>+</b>'));
                }
            }

            for (var j = 0; j < arayEid.length; j++) {
                $clickSpan = $allClickSpan.eq(j);
                $clickSpan.attr('eid', arayEid[j]);
            }
        }

        /**
         * [getStaff: get child node of data when click]
         */

        function getStaff() {
            $('#atrack_chart .leader').click(function() {
                var seriesLen = staffItoChart.series.length,
                    eid = $(this).attr('eid').replace(/^[A-Za-z]/gi, ''),
                    newJsonUrl = $('#atrack_chart').attr('data-souce-getPerson') + "?eid=" + eid;

                // clear cache of eid array
                arayEid = [];
                // remove default data
                staffItoChart.series[0].remove();
                // load new data
                renderChart(newJsonUrl);
                // url hash
                // window.location.hash = 'atrack_chart';
                $('#chartBack_btn').show();
            });
        }

        // load default data
        $('#chartBack_btn').click(function() {
            // clear cache of eid array
            arayEid = [];
            renderChart(defaultJson);
            $('#chartBack_btn').hide();
        });
    },

    // add class on to related nav by value of #cur_navTag
    highlightNav: function(){
        var curNav = $('#cur_navTag').val().replace(/\s/gi, '').toLowerCase();

        switch (curNav) {
            case 'mystaff':
                setClassOn('.nav_staff');
                break;
            case 'myproject':
                setClassOn('.nav_proj');
                break;
            case 'operationservice':
                setClassOn('.nav_serv');
                break;
            case 'reportcenter':
                setClassOn('.nav_repo');
                break;
            case 'systemmenu':
                setClassOn('.nav_setting');
                break;
            default:
                setClassOn('.nav_home');
                break;
        }

        function setClassOn(id){
            $(id).addClass('on').siblings().removeClass('on');
        }
    },

    // homepage functions
    homePage: function() {
        this.toTop(); // go to page top
        this.feedback(); // feedback pop win
        this.navHover(); // nav hover
        fedLib.switchable({ //slide
            container: ".switchable",
            content: ".contentBox",
            trigger: ".triggerBox",
            effect: "scrollx",
            pageButton: [".btnPrev", ".btnNext"],
            interval: 5000,
            autoPlay: true
        });
        this.projStatus();
        // this.renderNewsToIdx('#gihz');
        // this.renderSourceToFullCal('#mod_l_calendar', 'http://hzmis/Proxy/api/sp_calendar?site=gihz&title=gi-calendar', 'giActivity');
        this.tree(); // organization tree of index page
    },

    // billing pages functions
    billing: function() {
        this.toTop(); // go to page top
        this.feedback(); // feedback pop win
        this.showTip(); // show tip
        this.navHover(); // nav hover
        this.titleTips(); // get title property and change it to tooltip        
        this.tdEvenOdd(); // change even or odd table rows' background when hover
        this.inputTips(); // show and hide text type inputs' text tips
        this.selectAll(); // select all check boxes        
        this.fixedTable(); // show right fixed_table and operation
        // this.sortTable('#billing_table'); // sort table        
        this.prisTab('#report'); // tab switch
        this.showCustomize(); // show date customize
        this.rejTextarea(); // click reject then show reject textarea        
        this.datePicker(); // date picker
        this.rangeSelect(); // structure report chart range select     
        this.titleTips('.name_id'); // get title property and change it to tooltip
        this.print(); // print page
        this.TriggerSameSlct(); // trigger same select on page
    },

    // profile page functions
    profile: function() {
        this.toTop(); // go to page top
        this.feedback(); // feedback pop win
        this.navHover(); // nav hover
        this.inputTips(); // show and hide text type inputs' text tips
        this.titleTips(); // get title property and change it to tooltip
        this.tdEvenOdd(); // change even or odd table rows' background when hover
        this.modShowHide(); // mod show or hide        
        this.datePicker(); // date picker
        this.uploadingImg(); // upload image on profile page
        this.prisTab('#it_skil .toggle_con'); // tab switch        
        this.prisTab('#edit_proj'); // tab switch        
        // this.popWin(); // pop up window
        this.print(); // print page
        this.changeTitStatus(); // set checkbox, and change project title name
        this.sortTable('#pop_win_tls table'); // sort table  
        this.selectTL('#pop_win_tls'); // team leader selector
    },

    // my staff page functions
    staff: function() {
        this.toTop(); // go to page top
        this.feedback(); // feedback pop win
        this.navHover(); // nav hover
        this.tdEvenOdd(); // change even or odd table rows' background when hover
        this.titleTips(); // get title property and change it to tooltip
        this.sortTable('#staff_table'); // sort table
        this.staffTableClass('#staff_table'); // add class to staff table        
        this.editSlctProj(); // edit and then select project for .staff_table  
        this.renderStaffAtrackHour(); // render Atrack Hours for staff ito page
    },

    // project page functions
    project: function() {
        this.toTop(); // go to page top
        this.feedback(); // feedback pop win
        this.navHover(); // nav hover
        this.tdEvenOdd(); // change even or odd table rows' background when hover
        this.showTip(); // show tip
        this.titleTips(); // get title property and change it to tooltip
        this.addHeadc(); // click to show pop up window to add headcount
    },

    // meeting room page functions
    meetingRoom: function() {
        this.toTop(); // go to page top
        this.feedback(); // feedback pop win
        this.navHover(); // nav hover  
        this.titleTips(); // get title property and change it to tooltip
        this.titleTips('.ui-selectee'); // get title property and change it to tooltip
        this.datePicker(); // date picker
        this.setDaultRoom(); // set default meeting room tab
        this.prisTab('#meet_room'); // tab switch
        this.meetRoomScrol(); // meeting room calendar scroll
        this.meetRoomChosDate(); // meeting room calendar render and operation
        // this.popWin(); // pop up window
        this.blurHiddenIpt('#meet_room .date_month_meeting'); // blur a hidden input when focus on it
    },

    // bpo ais page functions
    bpoAis: function() {
        this.toTop(); // go to page top
        this.feedback(); // feedback pop win
        this.navHover(); // nav hover
        this.prisTab('#report'); // tab switch
        this.prisTab('.tab_in_tab'); // tab switch
    }
}
