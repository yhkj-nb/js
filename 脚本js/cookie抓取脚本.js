// ==UserScript==
// @name         yhkj-nb Cookie抓取工具
// @namespace    https://github.com/yhkj-nb/js
// @version      1.0
// @description  点击按钮抓取当前页面的所有Cookie，支持复制和下载 - by yhkj-nb
// @author       yhkj-nb
// @run-at       document-end
// @match        https://*/*
// @match        http://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if (document.getElementById('cookie-grabber-btn')) {
        return;
    }

    let panel = null;
    let isPanelOpen = false;

    // SVG图标
    const ICONS = {
        cookie: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg>`,
        close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
        download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
        check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
        globe: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        grab: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12H4"/><path d="M12 4v16"/></svg>`
    };

    // 创建浮动按钮
    function createButton() {
        const btn = document.createElement('div');
        btn.id = 'cookie-grabber-btn';
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999998;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 18px;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            display: flex;
            align-items: center;
            gap: 8px;
            border: none;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        `;
        btn.innerHTML = `${ICONS.cookie} 抓取`;

        // 响应式调整
        if (window.innerWidth <= 768) {
            btn.style.padding = '10px 14px';
            btn.style.fontSize = '12px';
            btn.style.bottom = '15px';
            btn.style.right = '15px';
        }

        btn.onmouseenter = function() {
            if (window.innerWidth > 768) {
                this.style.transform = 'scale(1.08)';
                this.style.boxShadow = '0 6px 30px rgba(102, 126, 234, 0.6)';
            }
        };
        btn.onmouseleave = function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
        };

        btn.onclick = function(e) {
            e.stopPropagation();
            togglePanel();
        };

        document.body.appendChild(btn);
        return btn;
    }

    // 切换面板
    function togglePanel() {
        if (isPanelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    // 打开面板 - 居中显示
    function openPanel() {
        if (panel) {
            panel.style.display = 'flex';
            isPanelOpen = true;
            updateButtonText(true);
            return;
        }

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.id = 'cookie-grabber-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 999999;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease;
            padding: 20px;
            box-sizing: border-box;
        `;

        // 创建面板
        panel = document.createElement('div');
        panel.id = 'cookie-grabber-panel';
        panel.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 24px;
            width: 100%;
            max-width: 500px;
            max-height: 85vh;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideUp 0.3s ease;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            color: #333;
            position: relative;
            box-sizing: border-box;
        `;

        // 添加动画样式
        if (!document.getElementById('cookie-grabber-styles')) {
            const style = document.createElement('style');
            style.id = 'cookie-grabber-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                #cookie-result-area::-webkit-scrollbar {
                    width: 6px;
                }
                #cookie-result-area::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                }
                #cookie-result-area::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 3px;
                }
                #cookie-result-area::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                .cookie-item:hover {
                    background: #f0f0f0;
                }
                @media (max-width: 768px) {
                    #cookie-grabber-panel {
                        padding: 18px;
                        max-height: 80vh;
                        border-radius: 16px;
                    }
                    #cookie-grabber-panel h3 {
                        font-size: 16px !important;
                    }
                    .cookie-item {
                        font-size: 11px !important;
                    }
                    .action-btn {
                        font-size: 12px !important;
                        padding: 8px 10px !important;
                    }
                    #cookie-grabber-btn {
                        padding: 10px 14px !important;
                        font-size: 12px !important;
                        bottom: 15px !important;
                        right: 15px !important;
                    }
                }
                @media (max-width: 480px) {
                    #cookie-grabber-panel {
                        padding: 14px;
                        max-height: 75vh;
                        border-radius: 12px;
                    }
                    .action-btn {
                        font-size: 11px !important;
                        padding: 6px 8px !important;
                        min-width: 60px !important;
                    }
                    .btn-group {
                        gap: 5px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 头部
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            flex-shrink: 0;
        `;

        const title = document.createElement('h3');
        title.style.cssText = `
            margin: 0;
            font-size: 18px;
            color: #1a1a1a;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        title.innerHTML = `${ICONS.cookie} Cookie抓取`;

        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            padding: 4px 8px;
            transition: all 0.2s;
            border-radius: 4px;
            display: flex;
            align-items: center;
            touch-action: manipulation;
        `;
        closeBtn.innerHTML = ICONS.close;
        closeBtn.onclick = function(e) {
            e.stopPropagation();
            closePanel();
        };

        header.appendChild(title);
        header.appendChild(closeBtn);

        // 信息区域
        const info = document.createElement('div');
        info.style.cssText = `
            background: #f8f9fa;
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            flex-shrink: 0;
        `;

        const domainInfo = document.createElement('span');
        domainInfo.style.cssText = `color: #666; font-size: 13px; display: flex; align-items: center; gap: 6px;`;
        domainInfo.innerHTML = `${ICONS.globe} ${window.location.hostname}`;

        const countInfo = document.createElement('span');
        const currentCount = document.cookie.split(';').filter(c => c.trim()).length;
        countInfo.textContent = `Cookie: ${currentCount} 个`;
        countInfo.style.cssText = `color: #333; font-size: 13px; font-weight: 500;`;
        countInfo.id = 'cookie-count-display';

        info.appendChild(domainInfo);
        info.appendChild(countInfo);

        // 抓取按钮
        const grabBtn = document.createElement('button');
        grabBtn.style.cssText = `
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-shrink: 0;
            touch-action: manipulation;
        `;
        grabBtn.innerHTML = `${ICONS.grab} 开始抓取`;
        grabBtn.onclick = function() {
            grabCookies();
        };

        // 结果区域
        const resultArea = document.createElement('div');
        resultArea.id = 'cookie-result-area';
        resultArea.style.cssText = `
            display: none;
            margin-top: 12px;
            padding: 12px;
            background: #f8f9fa;
            border-radius: 10px;
            overflow: auto;
            flex: 1;
            min-height: 0;
        `;

        // 组装面板
        panel.appendChild(header);
        panel.appendChild(info);
        panel.appendChild(grabBtn);
        panel.appendChild(resultArea);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // 点击遮罩关闭
        overlay.onclick = function(e) {
            if (e.target === this) {
                closePanel();
            }
        };

        isPanelOpen = true;
        updateButtonText(true);

        // 抓取函数
        function grabCookies() {
            const cookies = document.cookie.split(';').reduce(function(acc, cookie) {
                var parts = cookie.trim().split('=');
                var name = parts.shift();
                var value = parts.join('=');
                if (name) {
                    acc[name] = decodeURIComponent(value || '');
                }
                return acc;
            }, {});

            var count = Object.keys(cookies).length;

            resultArea.style.display = 'block';
            resultArea.innerHTML = '';

            // 统计信息
            var statsDiv = document.createElement('div');
            statsDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e0e0e0;
                flex-shrink: 0;
            `;
            statsDiv.innerHTML = `
                <span style="color: #4CAF50; font-weight: 600;">✓ 抓取成功</span>
                <span style="color: #666; font-size: 13px;">共 ${count} 个Cookie</span>
            `;
            resultArea.appendChild(statsDiv);

            // Cookie列表
            var list = document.createElement('div');
            list.style.cssText = `
                font-size: 12px;
                line-height: 1.8;
                margin-bottom: 10px;
                overflow: auto;
                flex: 1;
                max-height: 200px;
            `;

            if (count === 0) {
                var emptyMsg = document.createElement('div');
                emptyMsg.style.cssText = 'text-align: center; color: #999; padding: 20px 0;';
                emptyMsg.textContent = '当前页面没有Cookie';
                list.appendChild(emptyMsg);
            } else {
                Object.keys(cookies).forEach(function(name) {
                    var value = cookies[name];
                    var item = document.createElement('div');
                    item.className = 'cookie-item';
                    item.style.cssText = `
                        padding: 4px 8px;
                        border-bottom: 1px solid #f0f0f0;
                        word-break: break-all;
                        border-radius: 4px;
                    `;

                    var displayValue = value.length > 60 ? value.substring(0, 60) + '...' : value;
                    item.innerHTML = `
                        <span style="color: #e83e8c; font-weight: 500;">${name}</span>
                        <span style="color: #999;"> = </span>
                        <span style="color: #333;">${displayValue}</span>
                    `;
                    list.appendChild(item);
                });
            }

            resultArea.appendChild(list);

            // 操作按钮组
            var btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';
            btnGroup.style.cssText = `
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                flex-shrink: 0;
                margin-top: 8px;
            `;

            // 复制按钮
            var copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn';
            copyBtn.style.cssText = `
                flex: 1;
                padding: 10px 12px;
                background: #2196F3;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                min-width: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                touch-action: manipulation;
            `;
            copyBtn.innerHTML = ICONS.copy + ' 复制JSON';
            copyBtn.onclick = function() {
                var json = JSON.stringify(cookies, null, 2);
                navigator.clipboard.writeText(json).then(function() {
                    copyBtn.innerHTML = ICONS.check + ' 已复制';
                    copyBtn.style.background = '#4CAF50';
                    setTimeout(function() {
                        copyBtn.innerHTML = ICONS.copy + ' 复制JSON';
                        copyBtn.style.background = '#2196F3';
                    }, 2000);
                }).catch(function() {
                    var textarea = document.createElement('textarea');
                    textarea.value = json;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    copyBtn.innerHTML = ICONS.check + ' 已复制';
                    copyBtn.style.background = '#4CAF50';
                    setTimeout(function() {
                        copyBtn.innerHTML = ICONS.copy + ' 复制JSON';
                        copyBtn.style.background = '#2196F3';
                    }, 2000);
                });
            };

            // 下载按钮
            var downloadBtn = document.createElement('button');
            downloadBtn.className = 'action-btn';
            downloadBtn.style.cssText = `
                flex: 1;
                padding: 10px 12px;
                background: #FF9800;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
                min-width: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                touch-action: manipulation;
            `;
            downloadBtn.innerHTML = ICONS.download + ' 下载JSON';
            downloadBtn.onclick = function() {
                var json = JSON.stringify(cookies, null, 2);
                var blob = new Blob([json], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'cookies_' + window.location.hostname + '_' + Date.now() + '.json';
                a.click();
                URL.revokeObjectURL(url);
                downloadBtn.innerHTML = ICONS.check + ' 已下载';
                downloadBtn.style.background = '#4CAF50';
                setTimeout(function() {
                    downloadBtn.innerHTML = ICONS.download + ' 下载JSON';
                    downloadBtn.style.background = '#FF9800';
                }, 2000);
            };

            btnGroup.appendChild(copyBtn);
            btnGroup.appendChild(downloadBtn);
            resultArea.appendChild(btnGroup);

            // 更新计数
            countInfo.textContent = 'Cookie: ' + count + ' 个';
        }
    }

    // 关闭面板
    function closePanel() {
        var overlay = document.getElementById('cookie-grabber-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        isPanelOpen = false;
        updateButtonText(false);
    }

    // 更新按钮文字
    function updateButtonText(isOpen) {
        var btn = document.getElementById('cookie-grabber-btn');
        if (btn) {
            if (isOpen) {
                btn.innerHTML = ICONS.close + ' 关闭';
            } else {
                btn.innerHTML = ICONS.cookie + ' 抓取';
            }
        }
    }

    // 创建按钮
    createButton();

    // 监听窗口大小变化，调整按钮
    window.addEventListener('resize', function() {
        var btn = document.getElementById('cookie-grabber-btn');
        if (btn) {
            if (window.innerWidth <= 768) {
                btn.style.padding = '10px 14px';
                btn.style.fontSize = '12px';
                btn.style.bottom = '15px';
                btn.style.right = '15px';
            } else {
                btn.style.padding = '12px 18px';
                btn.style.fontSize = '14px';
                btn.style.bottom = '20px';
                btn.style.right = '20px';
            }
        }
    });

    console.log('[yhkj-nb Cookie抓取工具] 已加载，点击右下角按钮使用');

})();