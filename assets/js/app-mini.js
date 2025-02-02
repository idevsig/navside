// 切换夜间模式
const switchNightMode = () => {
    let night = $("body").attr('class') === 'io-grey-mode'? '1' : '0';
    localStorage.setItem("Hugo_Night", night);
    SetNightMode(night);
}

// 设置夜间模式
const SetNightMode = (night) => {
    if (typeof config === 'undefined') {
        config = {};
    }
    if (!config.hasOwnProperty('bg_img')) {
        config.bg_img = '';
    }
    if (!config.hasOwnProperty('bg_img_night')) {
        config.bg_img_night = '';
    }

    const setMode = (modeClass, title, iconClass, bgImage) => {
        $("body").attr('class', modeClass);
        $(".switch-dark-mode").attr({
            "title": title,
            "data-original-title": title
        });
        $(".mode-ico").removeClass("fa-sun").removeClass("fa-moon").addClass(iconClass);
        if (bgImage.length > 0) {
            $('body').css('background-image', `url(${bgImage})`).css('background-size', 'cover').css('background-attachment', 'fixed');
        } else {
            $('body').css('background-image', 'none');
        }
    };

    if (night === '0') {
        setMode('io-grey-mode', '日间模式', 'fa-sun', config.bg_img);
    } else {
        setMode('io-black-mode', '夜间模式', 'fa-moon', config.bg_img_night);
    }
}

// 粘性页脚
const stickFooter = () => {
    $('.main-footer').attr('style', '');
    if ($('.main-footer').hasClass('text-xs')) {
        const win_height = jQuery(window).height();
        const footer_height = $('.main-footer').outerHeight(true);
        const main_content_height = $('.main-footer').position().top + footer_height;
        if (win_height > main_content_height - parseInt($('.main-footer').css('marginTop'), 10)) {
            $('.main-footer').css({
                marginTop: win_height - main_content_height
            });
        }
    }
}

const toTarget = (menu, padding, isMult) => {
    const slider = menu.children(".anchor");
    let target = menu.children(".hover").first();
    if (!target || target.length === 0) {
        target = isMult? menu.find('.active').parent() : menu.find('.active');
    }
    if (target.length > 0) {
        const left = padding? target.position().left + target.scrollLeft() + "px" : target.position().left + target.scrollLeft() + (target.outerWidth() / 4) + "px";
        const width = padding? target.outerWidth() + "px" : target.outerWidth() / 2 + "px";
        slider.css({
            left,
            width,
            opacity: "1"
        });
    } else {
        slider.css({
            opacity: "0"
        });
    }
}

// tab滑块
const intoSlider = () => {
    $(".slider_menu[sliderTab]").each(function() {
        const menu = $(this).children("ul");
        menu.prepend('<li class="anchor" style="position:absolute;width:0;height:28px"></li>');
        const target = menu.find('.active').parent();
        if (target.length > 0) {
            menu.children(".anchor").css({
                left: target.position().left + target.scrollLeft() + "px",
                width: target.outerWidth() + "px",
                height: target.height() + "px",
                opacity: "1"
            });
        }
        $(this).addClass('into');
    });
}

(function() {
	// Ｍode 模式：0-1.模式，2.实时模式，３.日间模式，４.夜间模式
    const Mode = $("#NightMode").attr("data");
	// 判断是否夜间
    const Real_Mode = (new Date().getHours() > 19 || new Date().getHours() < 6)? '1' : '0';
	// 取当前设置的模式
    const Loca_Mode = localStorage.getItem("Hugo_Night");

	// 设置夜间模式
    const setNightModeByCondition = () => {
		// 按模式设置日夜间模式
        if (Mode === '3' || Mode === '4') {
            SetNightMode(parseInt(Mode) - 3);
        } else if (!Loca_Mode) { // 未手动设置模式
            SetNightMode(Mode === '2'? Real_Mode : Mode);
        } else { // 按手动设置的模式处理
            SetNightMode(Loca_Mode);
        }
    };

    setNightModeByCondition();

    // 手动切换
    $('#NightMode').click(switchNightMode);
})();

(function($) {
    $(document).ready(function() {
        // 显示主体
        $('#loading').addClass('close');
        setTimeout(() => $('#loading').remove(), 500);

        // 粘性页脚
        stickFooter();
        // 初始化tab滑块
        intoSlider();
        // 分类定位
        setTimeout(() => {
            const hash = window.location.hash;
            if (hash.length > 0) {
                if (hash.startsWith('#category-')) {
                    $('a.smooth[href="' + window.location.hash + '"]').click();
                } else {
                    $('body,html').animate({
                        scrollTop: 0
                    }, 500);
                }
            }
        }, 300);

        // 分类栏点击事件
        $(document).on('click', 'a.smooth', function(ev) {
            // 手机端点击后收起侧边栏
            if ($('#sidebar').hasClass('show') &&!$(this).hasClass('change-href')) {
                $('#sidebar').modal('toggle');
            }
            // 分类定位
            if ($(this).attr("href").substr(0, 1) === "#") {
                $("html, body").animate({
                    scrollTop: $($(this).attr("href")).offset().top - 90
                }, {
                    duration: 500,
                    easing: "swing"
                });
            }
            if (!$(this).hasClass('change-href')) {
                const menu = $("a" + $(this).attr("href"));
                menu.click();
                toTarget(menu.parent().parent(), true, true);
            }
        });

        // 失败图标
        // $('#content img.lazy').attr('onerror', "javascript:this.src='./templates/admin/img/ie.svg'");

        const have_search = $("#search-bg").length > 0;
        if (!have_search) {
            $('.big-header-banner').addClass('header-bg');
        }

        // 返回顶部
        $(window).scroll(function() {
            if ($(this).scrollTop() >= 50) {
                $('#to-up').fadeIn(200);
                if (have_search) {
                    $('.big-header-banner').addClass('header-bg');
                }
            } else {
                $('#to-up').fadeOut(200);
                if (have_search) {
                    $('.big-header-banner').removeClass('header-bg');
                }
            }
        });
		// 点击返回顶部
        $('#to-up').click(function() {
            $('body,html').animate({
                scrollTop: 0
            }, 500);
            window.location.hash = '#header';
        });

        // 移动端展开菜单
        $('#sidebar-switch').on('click', function() {
            $('#sidebar').removeClass('mini-sidebar');
        });

        // 是否收起菜单
        $('.sidebar-menu-inner a').on('click', function() {
            if (!$('.sidebar-nav').hasClass('mini-sidebar')) {
                $(this).parent("li").siblings("li.sidebar-item").children('ul').slideUp(200);
                if ($(this).next().css('display') === "none") {
                    $(this).next('ul').slideDown(200);
                    $(this).parent('li').addClass('sidebar-show').siblings('li').removeClass('sidebar-show');
                } else {
                    $(this).next('ul').slideUp(200);
                    $(this).parent('li').removeClass('sidebar-show');
                }
            }
        });

		// PC 菜单收起展开
        const trigger_lsm_mini = () => {
			if ($('.header-mini-btn input[type="checkbox"]').prop("checked")) {
				$('.sidebar-nav').removeClass('mini-sidebar');
                $('.sidebar-menu ul ul').css("display", "none");
                $('.sidebar-nav').addClass('animate-nav');
                $('.sidebar-nav').stop().animate({
					width: 170
                }, 200);
            } else {
				$('.sidebar-item.sidebar-show').removeClass('sidebar-show');
                $('.sidebar-menu ul').removeAttr('style');
                $('.sidebar-nav').addClass('mini-sidebar');
                $('.sidebar-nav.change-href').each(function() {
					$(this).attr('href', $(this).data('change'));
                });
                $('.sidebar-nav').addClass('animate-nav');
                $('.sidebar-nav').stop().animate({
					width: 60
                }, 200);
            }
        };

		// 点击触发 PC 菜单收起展开
		$('#mini-button').on('click', trigger_lsm_mini);

        // 是否默认展开侧边栏
        if ($("#sidebar").attr("data") === '1') {
            $('#mini-button').click();
        }		

        // 显示2级悬浮菜单
        $(document).on('mouseover', '.mini-sidebar.sidebar-menu ul:first>li,.mini-sidebar.flex-bottom ul:first>li', function() {
            const offset = $(this).parents('.flex-bottom').length!== 0? -3 : 2;
            $(".sidebar-popup.second").length === 0 && ($("body").append("<div class='second sidebar-popup sidebar-menu-inner text-sm'><div></div></div>"));
            $(".sidebar-popup.second>div").html($(this).html());
            $(".sidebar-popup.second").show();
            let top = $(this).offset().top - $(window).scrollTop() + offset;
            const d = $(window).height() - $(".sidebar-popup.second>div").height();
            if (d - top <= 0) {
                top = d >= 0? d - 8 : 0;
            }
            $(".sidebar-popup.second").stop().animate({
                "top": top
            }, 50);
        });
        // 隐藏悬浮菜单面板
        $(document).on('mouseleave', '.mini-sidebar.sidebar-menu ul:first,.mini-sidebar.slimScrollBar,.second.sidebar-popup', function() {
            $(".sidebar-popup.second").hide();
        });
        // 常驻2级悬浮菜单面板
        $(document).on('mouseover', '.mini-sidebar.slimScrollBar,.second.sidebar-popup', function() {
            $(".sidebar-popup.second").show();
        });

        // 滑块菜单
        $('.slider_menu').children("ul").children("li").not(".anchor").hover(function() {
            $(this).addClass("hover");
            toTarget($(this).parent(), true, true);
        }, function() {
            $(this).removeClass("hover");
        });
        $('.slider_menu').mouseleave(function(e) {
            const menu = $(this).children("ul");
            setTimeout(() => toTarget(menu, true, true), 50);
        });
    });

    // 粘性页脚
    $(window).resize(function() {
        setTimeout(stickFooter, 200);
    });
})(jQuery);