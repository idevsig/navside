(() => {
  // <stdin>
  var public_vars = public_vars || {};
  jQuery.extend(public_vars, {
    breakpoints: {
      largescreen: [991, -1],
      tabletscreen: [768, 990],
      devicescreen: [420, 767],
      sdevicescreen: [0, 419]
    },
    lastBreakpoint: null
  });
  function resizable(breakpoint) {
    var sb_with_animation;
    if (is("largescreen")) {
    }
    if (ismdxl()) {
    }
    if (is("tabletscreen")) {
    }
    if (is("tabletscreen")) {
      public_vars.$sidebarMenu.addClass("collapsed");
      ps_destroy();
    }
    if (isxs()) {
    }
    jQuery(window).trigger("xenon.resize");
  }
  function get_current_breakpoint() {
    var width = jQuery(window).width(), breakpoints = public_vars.breakpoints;
    for (var breakpont_label in breakpoints) {
      var bp_arr = breakpoints[breakpont_label], min = bp_arr[0], max = bp_arr[1];
      if (max == -1)
        max = width;
      if (min <= width && max >= width) {
        return breakpont_label;
      }
    }
    return null;
  }
  function is(screen_label) {
    return get_current_breakpoint() == screen_label;
  }
  function isxs() {
    return is("devicescreen") || is("sdevicescreen");
  }
  function ismdxl() {
    return is("tabletscreen") || is("largescreen");
  }
  function trigger_resizable() {
    if (public_vars.lastBreakpoint != get_current_breakpoint()) {
      public_vars.lastBreakpoint = get_current_breakpoint();
      resizable(public_vars.lastBreakpoint);
    }
    jQuery(window).trigger("xenon.resized");
  }
  (function($2, window2, undefined) {
    "use strict";
    $2(document).ready(function() {
      $2('a[data-toggle="chat"]').each(function(i, el) {
        $2(el).on("click", function(ev) {
          ev.preventDefault();
          public_vars.$body.toggleClass("chat-open");
          if ($2.isFunction($2.fn.perfectScrollbar)) {
            setTimeout(function() {
              public_vars.$chat.find(".chat_inner").perfectScrollbar("update");
              $2(window2).trigger("xenon.resize");
            }, 1);
          }
        });
      });
      $2('a[data-toggle="settings-pane"]').each(function(i, el) {
        $2(el).on("click", function(ev) {
          ev.preventDefault();
          var use_animation = attrDefault($2(el), "animate", false) && !isxs();
          var scroll = {
            top: $2(document).scrollTop(),
            toTop: 0
          };
          if (public_vars.$body.hasClass("settings-pane-open")) {
            scroll.toTop = scroll.top;
          }
          TweenMax.to(scroll, use_animation ? 0.1 : 0, {
            top: scroll.toTop,
            roundProps: ["top"],
            ease: scroll.toTop < 10 ? null : Sine.easeOut,
            onUpdate: function() {
              $2(window2).scrollTop(scroll.top);
            },
            onComplete: function() {
              if (use_animation) {
                public_vars.$settingsPaneIn.addClass("with-animation");
                if (!public_vars.$settingsPane.is(":visible")) {
                  public_vars.$body.addClass("settings-pane-open");
                  var height = public_vars.$settingsPane.outerHeight(true);
                  public_vars.$settingsPane.css({
                    height: 0
                  });
                  TweenMax.to(public_vars.$settingsPane, 0.25, { css: { height }, ease: Circ.easeInOut, onComplete: function() {
                    public_vars.$settingsPane.css({ height: "" });
                  } });
                  public_vars.$settingsPaneIn.addClass("visible");
                } else {
                  public_vars.$settingsPaneIn.addClass("closing");
                  TweenMax.to(public_vars.$settingsPane, 0.25, { css: { height: 0 }, delay: 0.15, ease: Power1.easeInOut, onComplete: function() {
                    public_vars.$body.removeClass("settings-pane-open");
                    public_vars.$settingsPane.css({ height: "" });
                    public_vars.$settingsPaneIn.removeClass("closing visible");
                  } });
                }
              } else {
                public_vars.$body.toggleClass("settings-pane-open");
                public_vars.$settingsPaneIn.removeClass("visible");
                public_vars.$settingsPaneIn.removeClass("with-animation");
              }
            }
          });
        });
      });
      $2('a[data-toggle="sidebar"]').each(function(i, el) {
        $2(el).on("click", function(ev) {
          ev.preventDefault();
          if (public_vars.$sidebarMenu.hasClass("collapsed")) {
            public_vars.$sidebarMenu.removeClass("collapsed");
            ps_init();
          } else {
            public_vars.$sidebarMenu.addClass("collapsed");
            ps_destroy();
          }
          $2(window2).trigger("xenon.resize");
        });
      });
      $2('a[data-toggle="mobile-menu"]').on("click", function(ev) {
        ev.preventDefault();
        public_vars.$mainMenu.add(public_vars.$sidebarProfile).toggleClass("mobile-is-visible");
        if ($2("#main-menu").hasClass("mobile-is-visible") === true) {
          public_vars.$sidebarMenu.removeClass("collapsed");
          $2(".sidebar-menu-inner").css("max-height", window2.innerHeight);
          ps_init();
        } else {
          ps_destroy();
        }
      });
      $2('a[data-toggle="mobile-menu-horizontal"]').on("click", function(ev) {
        ev.preventDefault();
        public_vars.$horizontalMenu.toggleClass("mobile-is-visible");
      });
      $2('a[data-toggle="mobile-menu-both"]').on("click", function(ev) {
        ev.preventDefault();
        public_vars.$mainMenu.toggleClass("mobile-is-visible both-menus-visible");
        public_vars.$horizontalMenu.toggleClass("mobile-is-visible both-menus-visible");
      });
      $2('a[data-toggle="user-info-menu"]').on("click", function(ev) {
        ev.preventDefault();
        public_vars.$userInfoMenu.toggleClass("mobile-is-visible");
      });
      $2('a[data-toggle="user-info-menu-horizontal"]').on("click", function(ev) {
        ev.preventDefault();
        public_vars.$userInfoMenuHor.find(".nav.nav-userinfo").toggleClass("mobile-is-visible");
      });
      $2("body").on("click", '.panel a[data-toggle="remove"]', function(ev) {
        ev.preventDefault();
        var $panel = $2(this).closest(".panel"), $panel_parent = $panel.parent();
        $panel.remove();
        if ($panel_parent.children().length == 0) {
          $panel_parent.remove();
        }
      });
      $2("body").on("click", '.panel a[data-toggle="reload"]', function(ev) {
        ev.preventDefault();
        var $panel = $2(this).closest(".panel");
        $panel.append('<div class="panel-disabled"><div class="loader-1"></div></div>');
        var $pd = $panel.find(".panel-disabled");
        setTimeout(function() {
          $pd.fadeOut("fast", function() {
            $pd.remove();
          });
        }, 500 + 300 * (Math.random() * 5));
      });
      $2("body").on("click", '.panel a[data-toggle="panel"]', function(ev) {
        ev.preventDefault();
        var $panel = $2(this).closest(".panel");
        $panel.toggleClass("collapsed");
      });
      $2("[data-loading-text]").each(function(i, el) {
        var $this = $2(el);
        $this.on("click", function(ev) {
          $this.button("loading");
          setTimeout(function() {
            $this.button("reset");
          }, 1800);
        });
      });
      $2('[data-toggle="popover"]').each(function(i, el) {
        var $this = $2(el), placement = attrDefault($this, "placement", "right"), trigger = attrDefault($this, "trigger", "click"), popover_class = $this.get(0).className.match(/(popover-[a-z0-9]+)/i);
        $this.popover({
          placement,
          trigger
        });
        if (popover_class) {
          $this.removeClass(popover_class[1]);
          $this.on("show.bs.popover", function(ev) {
            setTimeout(function() {
              var $popover = $this.next();
              $popover.addClass(popover_class[1]);
            }, 0);
          });
        }
      });
      $2('[data-toggle="tooltip"]').each(function(i, el) {
        var $this = $2(el), placement = attrDefault($this, "placement", "top"), trigger = attrDefault($this, "trigger", "hover"), tooltip_class = $this.get(0).className.match(/(tooltip-[a-z0-9]+)/i);
        $this.tooltip({
          placement,
          trigger
        });
        if (tooltip_class) {
          $this.removeClass(tooltip_class[1]);
          $this.on("show.bs.tooltip", function(ev) {
            setTimeout(function() {
              var $tooltip = $this.next();
              $tooltip.addClass(tooltip_class[1]);
            }, 0);
          });
        }
      });
    });
  })(jQuery, window);
  var public_vars = public_vars || {};
  (function($2, window2, undefined) {
    "use strict";
    $2(document).ready(function() {
      public_vars.$body = $2("body");
      public_vars.$pageContainer = public_vars.$body.find(".page-container");
      public_vars.$chat = public_vars.$pageContainer.find("#chat");
      public_vars.$sidebarMenu = public_vars.$pageContainer.find(".sidebar-menu");
      public_vars.$sidebarProfile = public_vars.$sidebarMenu.find(".sidebar-user-info");
      public_vars.$mainMenu = public_vars.$sidebarMenu.find(".main-menu");
      public_vars.$horizontalNavbar = public_vars.$body.find(".navbar.horizontal-menu");
      public_vars.$horizontalMenu = public_vars.$horizontalNavbar.find(".navbar-nav");
      public_vars.$mainContent = public_vars.$pageContainer.find(".main-content");
      public_vars.$mainFooter = public_vars.$body.find("footer.main-footer");
      public_vars.$userInfoMenuHor = public_vars.$body.find(".navbar.horizontal-menu");
      public_vars.$userInfoMenu = public_vars.$body.find("nav.navbar.user-info-navbar");
      public_vars.$settingsPane = public_vars.$body.find(".settings-pane");
      public_vars.$settingsPaneIn = public_vars.$settingsPane.find(".settings-pane-inner");
      public_vars.wheelPropagation = true;
      public_vars.$pageLoadingOverlay = public_vars.$body.find(".page-loading-overlay");
      public_vars.defaultColorsPalette = ["#68b828", "#7c38bc", "#0e62c7", "#fcd036", "#4fcdfc", "#00b19d", "#ff6264", "#f7aa47"];
      setup_sidebar_menu();
      setup_horizontal_menu();
      if (public_vars.$mainFooter.hasClass("sticky")) {
        stickFooterToBottom();
        $2(window2).on("xenon.resized", stickFooterToBottom);
      }
      if ($2.isFunction($2.fn.perfectScrollbar)) {
        if (public_vars.$sidebarMenu.hasClass("fixed"))
          ps_init();
        $2(".ps-scrollbar").each(function(i, el) {
          var $el = $2(el);
          if ($el.hasClass("ps-scroll-down")) {
            $el.scrollTop($el.prop("scrollHeight"));
          }
          $el.perfectScrollbar({
            wheelPropagation: false
          });
        });
        var $chat_inner = public_vars.$pageContainer.find("#chat .chat-inner");
        if ($chat_inner.parent().hasClass("fixed"))
          $chat_inner.css({ maxHeight: $2(window2).height() }).perfectScrollbar();
        $2(".dropdown:has(.ps-scrollbar)").each(function(i, el) {
          var $scrollbar = $2(this).find(".ps-scrollbar");
          $2(this).on("click", '[data-toggle="dropdown"]', function(ev) {
            ev.preventDefault();
            setTimeout(function() {
              $scrollbar.perfectScrollbar("update");
            }, 1);
          });
        });
        $2("div.scrollable").each(function(i, el) {
          var $this = $2(el), max_height = parseInt(attrDefault($this, "max-height", 200), 10);
          max_height = max_height < 0 ? 200 : max_height;
          $this.css({ maxHeight: max_height }).perfectScrollbar({
            wheelPropagation: true
          });
        });
      }
      $2("body").on("click", 'a[rel="go-top"]', function(ev) {
        ev.preventDefault();
        var obj = { pos: $2(window2).scrollTop() };
        TweenLite.to(obj, 0.3, { pos: 0, ease: Power4.easeOut, onUpdate: function() {
          $2(window2).scrollTop(obj.pos);
        } });
      });
      $2(".breadcrumb.auto-hidden").each(function(i, el) {
        var $bc = $2(el), $as = $bc.find("li a"), collapsed_width = $as.width(), expanded_width = 0;
        $as.each(function(i2, el2) {
          var $a = $2(el2);
          expanded_width = $a.outerWidth(true) + 5;
          $a.addClass("collapsed").width(expanded_width);
          $a.hover(
            function() {
              $a.removeClass("collapsed");
            },
            function() {
              $a.addClass("collapsed");
            }
          );
        });
      });
    });
    var wid = 0;
    $2(window2).resize(function() {
      clearTimeout(wid);
      wid = setTimeout(trigger_resizable, 200);
    });
  })(jQuery, window);
  var sm_duration = 0.2;
  function setup_sidebar_menu() {
    if (public_vars.$sidebarMenu.length) {
      var $items_with_subs = public_vars.$sidebarMenu.find("li:has(> ul)"), toggle_others = public_vars.$sidebarMenu.hasClass("toggle-others");
      $items_with_subs.filter(".active").addClass("expanded");
      if (is("largescreen") && public_vars.$sidebarMenu.hasClass("collapsed") == false) {
        $(window).on("resize", function() {
          if (is("tabletscreen")) {
            public_vars.$sidebarMenu.addClass("collapsed");
            ps_destroy();
          } else if (is("largescreen")) {
            public_vars.$sidebarMenu.removeClass("collapsed");
            ps_init();
          }
        });
      }
      $items_with_subs.each(function(i, el) {
        var $li = jQuery(el), $a = $li.children("a"), $sub = $li.children("ul");
        $li.addClass("has-sub");
        $a.on("click", function(ev) {
          ev.preventDefault();
          if (toggle_others) {
            sidebar_menu_close_items_siblings($li);
          }
          if ($li.hasClass("expanded") || $li.hasClass("opened"))
            sidebar_menu_item_collapse($li, $sub);
          else
            sidebar_menu_item_expand($li, $sub);
        });
      });
    }
  }
  function sidebar_menu_item_expand($li, $sub) {
  }
  function sidebar_menu_item_collapse($li, $sub) {
    if ($li.data("is-busy"))
      return;
    var $sub_items = $sub.children();
    $li.removeClass("expanded").data("is-busy", true);
    $sub_items.addClass("hidden-item");
    TweenMax.to($sub, sm_duration, { css: { height: 0 }, onUpdate: ps_update, onComplete: function() {
      $li.data("is-busy", false).removeClass("opened");
      $sub.attr("style", "").hide();
      $sub_items.removeClass("hidden-item");
      $li.find("li.expanded ul").attr("style", "").hide().parent().removeClass("expanded");
      ps_update(true);
    } });
  }
  function sidebar_menu_close_items_siblings($li) {
    $li.siblings().not($li).filter(".expanded, .opened").each(function(i, el) {
      var $_li = jQuery(el), $_sub = $_li.children("ul");
      sidebar_menu_item_collapse($_li, $_sub);
    });
  }
  function setup_horizontal_menu() {
    if (public_vars.$horizontalMenu.length) {
      var $items_with_subs = public_vars.$horizontalMenu.find("li:has(> ul)"), click_to_expand = public_vars.$horizontalMenu.hasClass("click-to-expand");
      if (click_to_expand) {
        public_vars.$mainContent.add(public_vars.$sidebarMenu).on("click", function(ev) {
          $items_with_subs.removeClass("hover");
        });
      }
      $items_with_subs.each(function(i, el) {
        var $li = jQuery(el), $a = $li.children("a"), $sub = $li.children("ul"), is_root_element = $li.parent().is(".navbar-nav");
        $li.addClass("has-sub");
        $a.on("click", function(ev) {
          if (isxs()) {
            ev.preventDefault();
            if (true) {
              sidebar_menu_close_items_siblings($li);
            }
            if ($li.hasClass("expanded") || $li.hasClass("opened"))
              sidebar_menu_item_collapse($li, $sub);
            else
              sidebar_menu_item_expand($li, $sub);
          }
        });
        if (click_to_expand) {
          $a.on("click", function(ev) {
            ev.preventDefault();
            if (isxs())
              return;
            if (is_root_element) {
              $items_with_subs.filter(function(i2, el2) {
                return jQuery(el2).parent().is(".navbar-nav");
              }).not($li).removeClass("hover");
              $li.toggleClass("hover");
            } else {
              var sub_height2;
              if ($li.hasClass("expanded") == false) {
                $li.addClass("expanded");
                $sub.addClass("is-visible");
                sub_height2 = $sub.outerHeight();
                $sub.height(0);
                TweenLite.to($sub, 0.15, { css: { height: sub_height2 }, ease: Sine.easeInOut, onComplete: function() {
                  $sub.attr("style", "");
                } });
                $li.siblings().find("> ul.is-visible").not($sub).each(function(i2, el2) {
                  var $el = jQuery(el2);
                  sub_height2 = $el.outerHeight();
                  $el.removeClass("is-visible").height(sub_height2);
                  $el.parent().removeClass("expanded");
                  TweenLite.to($el, 0.15, { css: { height: 0 }, onComplete: function() {
                    $el.attr("style", "");
                  } });
                });
              } else {
                sub_height2 = $sub.outerHeight();
                $li.removeClass("expanded");
                $sub.removeClass("is-visible").height(sub_height2);
                TweenLite.to($sub, 0.15, { css: { height: 0 }, onComplete: function() {
                  $sub.attr("style", "");
                } });
              }
            }
          });
        } else {
          $li.hoverIntent({
            over: function() {
              if (isxs())
                return;
              if (is_root_element) {
                $li.addClass("hover");
              } else {
                $sub.addClass("is-visible");
                sub_height = $sub.outerHeight();
                $sub.height(0);
                TweenLite.to($sub, 0.25, { css: { height: sub_height }, ease: Sine.easeInOut, onComplete: function() {
                  $sub.attr("style", "");
                } });
              }
            },
            out: function() {
              if (isxs())
                return;
              if (is_root_element) {
                $li.removeClass("hover");
              } else {
                sub_height = $sub.outerHeight();
                $li.removeClass("expanded");
                $sub.removeClass("is-visible").height(sub_height);
                TweenLite.to($sub, 0.25, { css: { height: 0 }, onComplete: function() {
                  $sub.attr("style", "");
                } });
              }
            },
            timeout: 200,
            interval: is_root_element ? 10 : 100
          });
        }
      });
    }
  }
  function stickFooterToBottom() {
    public_vars.$mainFooter.add(public_vars.$mainContent).add(public_vars.$sidebarMenu).attr("style", "");
    if (isxs())
      return false;
    if (public_vars.$mainFooter.hasClass("sticky")) {
      var win_height = jQuery(window).height(), footer_height = public_vars.$mainFooter.outerHeight(true), main_content_height = public_vars.$mainFooter.position().top + footer_height, main_content_height_only = main_content_height - footer_height, extra_height = public_vars.$horizontalNavbar.outerHeight();
      if (win_height > main_content_height - parseInt(public_vars.$mainFooter.css("marginTop"), 10)) {
        public_vars.$mainFooter.css({
          marginTop: win_height - main_content_height - extra_height
        });
      }
    }
  }
  function ps_update(destroy_init) {
    if (jQuery.isFunction(jQuery.fn.perfectScrollbar)) {
      if (public_vars.$sidebarMenu.hasClass("collapsed")) {
        return;
      }
      public_vars.$sidebarMenu.find(".sidebar-menu-inner").perfectScrollbar("update");
      if (destroy_init) {
        ps_destroy();
        ps_init();
      }
    }
  }
  function ps_init() {
    if (jQuery.isFunction(jQuery.fn.perfectScrollbar)) {
      if (public_vars.$sidebarMenu.hasClass("collapsed") || !public_vars.$sidebarMenu.hasClass("fixed")) {
        return;
      }
      public_vars.$sidebarMenu.find(".sidebar-menu-inner").perfectScrollbar({
        wheelSpeed: 1,
        wheelPropagation: public_vars.wheelPropagation
      });
    }
  }
  function ps_destroy() {
    if (jQuery.isFunction(jQuery.fn.perfectScrollbar)) {
      public_vars.$sidebarMenu.find(".sidebar-menu-inner").perfectScrollbar("destroy");
    }
  }
  function attrDefault($el, data_var, default_val) {
    if (typeof $el.data(data_var) != "undefined") {
      return $el.data(data_var);
    }
    return default_val;
  }
})();
/*! Hugo版WebStack主题 - v2.0.0
* https://github.com/iplaycode/webstack-hugo/ */
