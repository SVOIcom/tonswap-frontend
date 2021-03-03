$(document).ready(function() {
    $(".exchange-settings__button").click(function(e) {
        if ($(".exchange-settings__button").is(e.target) && !$(".exchange-settings").is(e.target) &&  $(".exchange-settings").has(e.target).length === 0) {
            $(".exchange-settings").fadeToggle(500);
        }
    });

    $(document).click(function (e) {
        if (!$(".exchange-settings__button").is(e.target) && !$(".exchange-settings").is(e.target) &&  $(".exchange-settings").has(e.target).length === 0) {
            $(".exchange-settings").hide();
        };
    });

    $(".exchange-settings__tolerance-item").click(function() {
         $(".exchange-settings__tolerance-item").removeClass("exchange-settings__tolerance-item_active");
         $(this).addClass("exchange-settings__tolerance-item_active");
    });

    $(document).click(function (e) {
        if (!$(".exchange-settings__button").is(e.target) && !$(".exchange-settings").is(e.target) &&  $(".exchange-settings").has(e.target).length === 0) {
            $(".exchange-settings").hide();
        };
    });

    $(".manage-list__item-arrow").click(function(e) {
        if ($(".manage-list__item-arrow").is(e.target) && !$(".manage-list__item-tooltip").is(e.target) &&  $(".manage-list__item-tooltip").has(e.target).length === 0) {
            $(".manage-list__item-tooltip").hide();
            $(this).find(".manage-list__item-tooltip").fadeToggle(500);
        }
    });

    $(document).click(function (e) {
        if (!$(".manage-list__item-arrow").is(e.target) && !$(".manage-list__item-tooltip").is(e.target) &&  $(".manage-list__item-tooltip").has(e.target).length === 0) {
            $(".manage-list__item-tooltip").hide();
        };
    });

    $(".manage-tabs__tab").click(function() {
        $(".manage-tabs__tab").removeClass("manage-tabs__tab_active");
        $(this).addClass("manage-tabs__tab_active");

        $(".manage-block").hide();
        $(".manage-block[data-id=" + $(this).data("id") + "]").fadeIn();
    });

    $('body').on('click', '.open-popup', function(e) {
        e.preventDefault();

        var el = $(this).data('popup');
        var $this = $(this);

        $.fancybox.close({});
        $.fancybox.open($('.popup-' + el), {
            touch: false,
            helpers: {
                thumbs: {
                    width: 50,
                    height: 50,
                },
                overlay: {
                    locked: true,
                },
            },
            beforeShow: function() {},
            afterShow: function() {},
        });
    });

    $("input#connect-accept__checkbox").on("change", function() {
        if(!$(this).is(':checked')) {
            $(".connect-items").addClass("disabled");
        } else {
            $(".connect-items").removeClass("disabled");
        }
    });

    $("input#import-token__risk-checkbox").on("change", function() {
        if(!$(this).is(':checked')) {
            $(".import-token__button").addClass("disabled");
        } else {
            $(".import-token__button").removeClass("disabled");
        }
    });

    $(".vote-tabs__tab").click(function() {
        var id = $(this).data("id");

        $(".vote-tabs__tab").removeClass("vote-tabs__tab_active");

        $(this).addClass("vote-tabs__tab_active");

        $(".vote__block").hide();
        $(".vote__block[data-id=" + id + "]").fadeIn();
    });

    $(".messages-item__close").click(function() {
        $(this).closest(".messages-item").fadeOut();
    });

    $(".header-mode__input, .footer-mode__input").on("change", function() {
       if($(this).is(":checked")) {
           $("body").addClass("dark_theme");
       } else {
           $("body").removeClass("dark_theme");
       }
    });

    $(".saved__star").click(function() {
        $(".saved").addClass("saved_opened");
    });

    $(".saved__close").click(function() {
        $(".saved").removeClass("saved_opened");
    });

    $(".header__more").click(function(e) {
        if ($(".header__more").is(e.target) && !$(".header-dropdown").is(e.target) && $(".header-dropdown").has(e.target).length === 0) {
            $(".header-dropdown").fadeToggle(500);
        }
    });

    $(document).click(function (e) {
        if (!$(".header__more").is(e.target) && !$(".header-dropdown").is(e.target) &&  $(".header-dropdown").has(e.target).length === 0) {
            $(".header-dropdown").hide();
        };
    });

    $(".footer__more").click(function(e) {
        if ($(".footer__more").is(e.target) && !$(".footer-dropdown").is(e.target) && $(".footer-dropdown").has(e.target).length === 0) {
            $(".footer-dropdown").fadeToggle(500);
        }
    });

    $(document).click(function (e) {
        if (!$(".footer__more").is(e.target) && !$(".footer-dropdown").is(e.target) &&  $(".footer-dropdown").has(e.target).length === 0) {
            $(".footer-dropdown").hide();
        };
    });

    function OP(name) {
        $.fancybox.open($('.popup-' + name), {
            touch: false,
            helpers: {
                thumbs: {
                    width: 50,
                    height: 50,
                },
                overlay: {
                    locked: true,
                },
            },
            beforeShow: function() {},
            afterShow: function() {},
        });
    }
    
    // OP("waiting");
    // OP("error");
    // OP("success");
    // OP("revive");
    // OP("creating-pool");
});