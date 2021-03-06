define([
  'angular',
  'jquery',
  'perfectScrollbar',
  'browserDetection'
], function (angular, jQuery) {
  'use strict';

  angular.module('perfectScrollbar', ['app.common.services.browserDetection'])
  .directive('perfectScrollbar', function($parse, $window, $timeout, browserDetection) {
    var psOptions = [
      'wheelSpeed', 'wheelPropagation', 'minScrollbarLength', 'maxScrollbarLength', 'useBothWheelAxes',
      'useKeyboard', 'suppressScrollX', 'suppressScrollY', 'scrollXMarginOffset',
      'scrollYMarginOffset', 'includePadding'//, 'onScroll', 'scrollDown'
    ];

    return {
      restrict: 'EA',
      transclude: true,
      template: '<div><div ng-transclude></div></div>',
      replace: true,
      link: function($scope, $elem, $attr) {
        if (!$elem.perfectScrollbar) {
          $elem = jQuery($elem);
        }

        if (browserDetection.browser.IE && (browserDetection.browser.IE7 || browserDetection.browser.IE8 || browserDetection.browser.IE9)) {
          $elem.addClass('ps-overflow');
          return;
        }

        var jqWindow = angular.element($window);
        var options = {};

        for (var i=0, l=psOptions.length; i<l; i++) {
          var opt = psOptions[i];
          if ($attr[opt] !== undefined) {
            options[opt] = $parse($attr[opt])();
          }
        }

        $scope.$evalAsync(function() {
          $elem.perfectScrollbar(options);
          var onScrollHandler = $parse($attr.onScroll);
          $elem.scroll(function(){
            var scrollTop = $elem.scrollTop();
            var scrollHeight = $elem.prop('scrollHeight') - $elem.height();
            $scope.$apply(function() {
              onScrollHandler($scope, {
                scrollTop: scrollTop,
                scrollHeight: scrollHeight
              });
            });
          });
        });

        function update(eventType) {
          $scope.$evalAsync(function() {
            if ($attr.scrollDown == 'true' && eventType != 'mouseenter') {
              setTimeout(function () {
                $($elem).scrollTop($($elem).prop("scrollHeight"));
              }, 100);
            }
            $elem.perfectScrollbar('update');
          });
        }

        // This is necessary when you don't watch anything with the scrollbar
        $elem.on('mouseenter', update('mouseenter'));

        // Possible future improvement - check the type here and use the appropriate watch for non-arrays
        if ($attr.refreshOnChange) {
          $scope.$watchCollection($attr.refreshOnChange, function() {
            update();
          });
        }

        // this is from a pull request - I am not totally sure what the original issue is but seems harmless
        if ($attr.refreshOnResize) {
          jqWindow.on('resize', update);
        }

        $elem.on('$destroy', function() {
          jqWindow.off('resize', update);
          $elem.perfectScrollbar('destroy');
        });

        // fixes the no scrollbar until scroll err
        $timeout(function () {
          $elem.perfectScrollbar('update');
        });
      }
    };
  });
});