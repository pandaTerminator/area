/**
 * Created by sjw on 09/03/2017.
 */


/**
 * 获取当前选择的门店地址 $('el').data('address-result');
 */

+(function ($) {
    'use strict';
    var PluginName = 'ChooseArea';
    var html =
        '<div id="city-title" class="city-title">请选择省市区</div>' +
        '<div class="ks-overlay ks-overlay-hidden">' +
        '<div class="ks-overlay-content"> <div class="city-select-warp"><div class="city-select-tab"><a class="current" attr-cont="city-province">省份</a><a class="" attr-cont="city-city">城市</a> <a class="" attr-cont="city-district">县区</a> </div> <div class="city-select-content"> <div class="city-select city-province"><dl class=fn-clear><dt>A-G<dd class="a-g"></dl><dl class=fn-clear><dt>H-K<dd class="h-k"></dl><dl class=fn-clear><dt>L-S<dd class="l-s"></dl><dl class=fn-clear><dt>T-Z<dd class="t-z"></dl></div><div class="city-select hide city-city"></div><div class="city-select hide city-district"></div></div></div></div></div>';


    // 拼音排序
    function pySegSort(arr, empty) {
        if (!String.prototype.localeCompare)
            return null;

        var letters = "*abcdefghjklmnopqrstwxyz".split('');
        var zh = "啊把差大额发噶哈级卡啦吗那哦爬器然啥他哇西呀咋".split('');

        var segs = [];
        var curr;
        $.each(letters, function (i, letter) {
            curr = {
                letter: letter,
                data: []
            };
            $.each(arr, function () {
                if ((!zh[i - 1] || zh[i - 1].localeCompare(this.name) <= 0) && this.name.localeCompare(
                        zh[i] || '') == -1) {
                    curr.data.push(this);
                }
            });
            if (empty || curr.data.length) {
                segs.push(curr);
                curr.data.sort(function (a, b) {
                    return a.name.localeCompare(b.name);
                });
            }
        });
        return segs;
    }

    // 渲染省份
    var renderProvince = function (filted) {
        filted.forEach(function (value) {
            var html = '';
            var provinceData = value.zone;
            for (var i = 0; i < provinceData.length; i++) {
                html += '<a title="' + provinceData[i].name + '" attr-id="' + provinceData[i].id +
                    '" href="javascript:;">' + provinceData[i].name + '</a>';
            }
            $('.city-select-content .city-province dl').find("." + value.className).html(html);
        });
    };

    function ChooseCity(element, options) {
        this.element = $(element);
        this.element.append(html);
        this.result = [];
        this.areaData = options.areaData;
        this.init();
        this.tab();
        this.clickShow();
        this.clickHide();
        this.areaClick();
    }

    // 获取一级菜单数据
    ChooseCity.prototype.init = function () {
        var html = '',
            regPosistion = [{
                    reg: /^[a-g]$/i,
                    className: 'a-g',
                    zone: []
                },
                {
                    reg: /^[h-k]$/i,
                    className: 'h-k',
                    zone: []
                },
                {
                    reg: /^[l-s]$/i,
                    className: 'l-s',
                    zone: []
                },
                {
                    reg: /^[t-z]$/i,
                    className: 't-z',
                    zone: []
                }
            ];
        var filted = this.areaData.filter(function isPick(value) {
            return value.pid == 0;
        });
        var compositorData = pySegSort(filted);
        console.log(compositorData);
        compositorData.forEach(function (value) {
            for (var i = 0; i < regPosistion.length; i++) {
                if (regPosistion[i].reg.test(value.letter)) {
                    regPosistion[i].zone = regPosistion[i].zone.concat(value.data);
                }
            }
        });
        renderProvince(regPosistion);
    };

    // 点击显示地址栏
    ChooseCity.prototype.clickShow = function () {
        this.element.on('click', function () {
            $('.ks-overlay').removeClass('ks-overlay-hidden');
        });
    };

    // 点击隐藏地址栏
    ChooseCity.prototype.clickHide = function () {
        var targetArea = this.element;
        $(document).on('mouseup', function (e) {
            if (targetArea.has(e.target).length == 0 && !targetArea.is(e.target)) {
                $('.ks-overlay').addClass('ks-overlay-hidden');
            }
        });
    };

    // 选择地址
    ChooseCity.prototype.areaClick = function () {
        this.element.on('click', ' .city-select dd a', function (e) {
            var _this = this,
                target = e.target,
                cont = $('.city-select-tab').find('.current').attr('attr-cont'),
                id = $(target).attr('attr-id'),
                tit = $(target).text();
            $('.' + cont).find('dd a').removeClass('current');
            $(target).addClass('current');
            switch (cont) {
                case 'city-province':
                    var data = _this.areaData.filter(function isPick(value) {
                        return value.pid == id;
                    });
                    _this.renderArea('city-city', data);
                    _this.title(0, tit, id);
                    break;
                case 'city-city':
                    var data = _this.areaData.filter(function isPick(value) {
                        return value.pid == id;
                    });
                    _this.renderArea('city-district', data);
                    _this.title(1, tit, id);
                    break;
                case 'city-district':
                    _this.title(2, tit, id);
                    $('.ks-overlay').addClass('ks-overlay-hidden');
                    break;
            }
        }.bind(this));
    };

    // 渲染input当前地址
    ChooseCity.prototype.renderArea = function (position, data) {
        $('.city-select-content .city-select').addClass("hide");
        $('.city-select-content').find('.' + position).removeClass("hide").html('');
        $('.city-select-tab a').removeClass('current');
        $('.city-select-tab a').each(function (index, el) {
            if ($(el).attr('attr-cont') == position) {
                $(el).addClass('current');
            }
        });
        var html = '',
            node = '';
        for (var i = 0; i < data.length; i++) {
            node += '<a title="' + data[i].name + '" attr-id="' + data[i].id +
                '" href="javascript:;">' +
                data[i].name +
                '</a>';
        }
        html = '<dl class="fn-clear city-select-city"><dd>' + node + '</dd></dl>';
        $('.city-select-content').find('.' + position).append(html);
    };

    // 当选择省份改变时改变内容
    ChooseCity.prototype.destory = function () {
        $('.city-district .city-select-city dd').html('');
    };

    // tab切换
    ChooseCity.prototype.tab = function () {
        var titles = $('.bf-select').find('.city-select-tab a');
        var contents = $('.city-select-warp').find('.city-select-content .city-select');
        titles.each(function (index, el) {
            $(el).on('click', function () {
                $(titles).removeClass('current').eq(index).addClass('current');
                $(contents).addClass('hide').eq(index).removeClass('hide');
            });
        });
    };

    // 添加title
    ChooseCity.prototype.title = function (index, tit, id) {
        if (this.result[index] == undefined) {
            this.result.push({
                name: tit,
                id: id
            });
        } else {
            if (this.result[index] != tit) {
                this.result[index].name = tit;
                this.result[index].id = id;
                this.result = this.result.slice(0, index + 1);
                if (index == 0) {
                    this.destory();
                }
            }
        }
        var html = this.result.map(function (val) {
            return val.name;
        }).join('<span style="color:#cfcfcf">/</span>');
        this.element.data('address-result', this.result);
        $('.city-title').html('').append(html).addClass('has-city-title');
    };

    // 注册插件
    $.fn[PluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + PluginName)) {
                $.data(this, 'plugin_' + PluginName, new ChooseCity(this, options));
            }
        });
    };
})(jQuery);