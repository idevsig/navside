(() => {
  // <stdin>
  var switchNightMode = () => {
    let night = $("body").attr("class") === "io-grey-mode" ? "1" : "0";
    localStorage.setItem("Hugo_Night", night);
    SetNightMode(night);
  };
  var SetNightMode = (night) => {
    if (typeof config === "undefined") {
      config = {};
    }
    if (!config.hasOwnProperty("bg_img")) {
      config.bg_img = "";
    }
    if (!config.hasOwnProperty("bg_img_night")) {
      config.bg_img_night = "";
    }
    const setMode = (modeClass, title, iconClass, bgImage) => {
      $("body").attr("class", modeClass);
      $(".switch-dark-mode").attr({
        "title": title,
        "data-original-title": title
      });
      $(".mode-ico").removeClass("fa-sun").removeClass("fa-moon").addClass(iconClass);
      if (bgImage.length > 0) {
        $("body").css("background-image", `url(${bgImage})`).css("background-size", "cover").css("background-attachment", "fixed");
      } else {
        $("body").css("background-image", "none");
      }
    };
    if (night === "0") {
      setMode("io-grey-mode", "\u65E5\u95F4\u6A21\u5F0F", "fa-sun", config.bg_img);
    } else {
      setMode("io-black-mode", "\u591C\u95F4\u6A21\u5F0F", "fa-moon", config.bg_img_night);
    }
  };
  var stickFooter = () => {
    $(".main-footer").attr("style", "");
    if ($(".main-footer").hasClass("text-xs")) {
      const win_height = jQuery(window).height();
      const footer_height = $(".main-footer").outerHeight(true);
      const main_content_height = $(".main-footer").position().top + footer_height;
      if (win_height > main_content_height - parseInt($(".main-footer").css("marginTop"), 10)) {
        $(".main-footer").css({
          marginTop: win_height - main_content_height
        });
      }
    }
  };
  var toTarget = (menu, padding, isMult) => {
    const slider = menu.children(".anchor");
    let target = menu.children(".hover").first();
    if (!target || target.length === 0) {
      target = isMult ? menu.find(".active").parent() : menu.find(".active");
    }
    if (target.length > 0) {
      const left = padding ? target.position().left + target.scrollLeft() + "px" : target.position().left + target.scrollLeft() + target.outerWidth() / 4 + "px";
      const width = padding ? target.outerWidth() + "px" : target.outerWidth() / 2 + "px";
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
  };
  var intoSlider = () => {
    $(".slider_menu[sliderTab]").each(function() {
      const menu = $(this).children("ul");
      menu.prepend('<li class="anchor" style="position:absolute;width:0;height:28px"></li>');
      const target = menu.find(".active").parent();
      if (target.length > 0) {
        menu.children(".anchor").css({
          left: target.position().left + target.scrollLeft() + "px",
          width: target.outerWidth() + "px",
          height: target.height() + "px",
          opacity: "1"
        });
      }
      $(this).addClass("into");
    });
  };
  (function() {
    const Mode = $("#NightMode").attr("data");
    const Real_Mode = (/* @__PURE__ */ new Date()).getHours() > 19 || (/* @__PURE__ */ new Date()).getHours() < 6 ? "1" : "0";
    const Loca_Mode = localStorage.getItem("Hugo_Night");
    const setNightModeByCondition = () => {
      if (Mode === "3" || Mode === "4") {
        SetNightMode(parseInt(Mode) - 3);
      } else if (!Loca_Mode) {
        SetNightMode(Mode === "2" ? Real_Mode : Mode);
      } else {
        SetNightMode(Loca_Mode);
      }
    };
    setNightModeByCondition();
    $("#NightMode").click(switchNightMode);
  })();
  (function($2) {
    $2(document).ready(function() {
      $2("#loading").addClass("close");
      setTimeout(() => $2("#loading").remove(), 500);
      stickFooter();
      intoSlider();
      setTimeout(() => {
        const hash = window.location.hash;
        if (hash.length > 0) {
          if (hash.startsWith("#category-")) {
            $2('a.smooth[href="' + window.location.hash + '"]').click();
          } else {
            $2("body,html").animate({
              scrollTop: 0
            }, 500);
          }
        }
      }, 300);
      $2(document).on("click", "a.smooth", function(ev) {
        if ($2("#sidebar").hasClass("show") && !$2(this).hasClass("change-href")) {
          $2("#sidebar").modal("toggle");
        }
        if ($2(this).attr("href").substr(0, 1) === "#") {
          $2("html, body").animate({
            scrollTop: $2($2(this).attr("href")).offset().top - 90
          }, {
            duration: 500,
            easing: "swing"
          });
        }
        if (!$2(this).hasClass("change-href")) {
          const menu = $2("a" + $2(this).attr("href"));
          menu.click();
          toTarget(menu.parent().parent(), true, true);
        }
      });
      const have_search = $2("#search-bg").length > 0;
      if (!have_search) {
        $2(".big-header-banner").addClass("header-bg");
      }
      $2(window).scroll(function() {
        if ($2(this).scrollTop() >= 50) {
          $2("#to-up").fadeIn(200);
          if (have_search) {
            $2(".big-header-banner").addClass("header-bg");
          }
        } else {
          $2("#to-up").fadeOut(200);
          if (have_search) {
            $2(".big-header-banner").removeClass("header-bg");
          }
        }
      });
      $2("#to-up").click(function() {
        $2("body,html").animate({
          scrollTop: 0
        }, 500);
        window.location.hash = "#header";
      });
      $2("#sidebar-switch").on("click", function() {
        $2("#sidebar").removeClass("mini-sidebar");
      });
      $2(".sidebar-menu-inner a").on("click", function() {
        if (!$2(".sidebar-nav").hasClass("mini-sidebar")) {
          $2(this).parent("li").siblings("li.sidebar-item").children("ul").slideUp(200);
          if ($2(this).next().css("display") === "none") {
            $2(this).next("ul").slideDown(200);
            $2(this).parent("li").addClass("sidebar-show").siblings("li").removeClass("sidebar-show");
          } else {
            $2(this).next("ul").slideUp(200);
            $2(this).parent("li").removeClass("sidebar-show");
          }
        }
      });
      const trigger_lsm_mini = () => {
        if ($2('.header-mini-btn input[type="checkbox"]').prop("checked")) {
          $2(".sidebar-nav").removeClass("mini-sidebar");
          $2(".sidebar-menu ul ul").css("display", "none");
          $2(".sidebar-nav").addClass("animate-nav");
          $2(".sidebar-nav").stop().animate({
            width: 170
          }, 200);
        } else {
          $2(".sidebar-item.sidebar-show").removeClass("sidebar-show");
          $2(".sidebar-menu ul").removeAttr("style");
          $2(".sidebar-nav").addClass("mini-sidebar");
          $2(".sidebar-nav.change-href").each(function() {
            $2(this).attr("href", $2(this).data("change"));
          });
          $2(".sidebar-nav").addClass("animate-nav");
          $2(".sidebar-nav").stop().animate({
            width: 60
          }, 200);
        }
      };
      $2("#mini-button").on("click", trigger_lsm_mini);
      if ($2("#sidebar").attr("data") === "1") {
        $2("#mini-button").click();
      }
      $2(document).on("mouseover", ".mini-sidebar.sidebar-menu ul:first>li,.mini-sidebar.flex-bottom ul:first>li", function() {
        const offset = $2(this).parents(".flex-bottom").length !== 0 ? -3 : 2;
        $2(".sidebar-popup.second").length === 0 && $2("body").append("<div class='second sidebar-popup sidebar-menu-inner text-sm'><div></div></div>");
        $2(".sidebar-popup.second>div").html($2(this).html());
        $2(".sidebar-popup.second").show();
        let top = $2(this).offset().top - $2(window).scrollTop() + offset;
        const d = $2(window).height() - $2(".sidebar-popup.second>div").height();
        if (d - top <= 0) {
          top = d >= 0 ? d - 8 : 0;
        }
        $2(".sidebar-popup.second").stop().animate({
          "top": top
        }, 50);
      });
      $2(document).on("mouseleave", ".mini-sidebar.sidebar-menu ul:first,.mini-sidebar.slimScrollBar,.second.sidebar-popup", function() {
        $2(".sidebar-popup.second").hide();
      });
      $2(document).on("mouseover", ".mini-sidebar.slimScrollBar,.second.sidebar-popup", function() {
        $2(".sidebar-popup.second").show();
      });
      $2(".slider_menu").children("ul").children("li").not(".anchor").hover(function() {
        $2(this).addClass("hover");
        toTarget($2(this).parent(), true, true);
      }, function() {
        $2(this).removeClass("hover");
      });
      $2(".slider_menu").mouseleave(function(e) {
        const menu = $2(this).children("ul");
        setTimeout(() => toTarget(menu, true, true), 50);
      });
    });
    $2(window).resize(function() {
      setTimeout(stickFooter, 200);
    });
  })(jQuery);
})();
