// ==UserScript==
// @name         开发者工具
// @namespace    https://github.com/yhkj-nb/js
// @version      1.0
// @description  自定义开发者调试工具 - by yhkj-nb
// @author       yhkj-nb
// @run-at       document-end
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    var script = document.createElement('script');
    script.src = "//cdn.jsdelivr.net/npm/eruda";
    document.body.appendChild(script);
    script.onload = function() {
        eruda.init();
        console.log('yhkj-nb开发者工具已加载！');
    };
})();
