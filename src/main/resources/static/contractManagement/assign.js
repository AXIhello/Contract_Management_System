
class MultiSelect {
    constructor(wrapper, options) {
        this.wrapper = wrapper;
        this.input = wrapper.querySelector('.multi-input');
        this.list = wrapper.querySelector('.options-list');
        this.options = options; // 现在options是User对象数组
        this.selected = new Set(); // 存储选中的User对象

        this.filteredOptions = [...this.options];

        this.renderOptions();

        this.input.addEventListener('click', e => {
            e.stopPropagation();
            this.showList();
        });

        this.input.addEventListener('input', e => {
            this.filter(e.target.value);
        });

        this.list.addEventListener('mousedown', e => {
            e.preventDefault();
        });

        this.list.addEventListener('change', e => {
            if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'checkbox') {
                const userId = parseInt(e.target.dataset.userId);
                const user = this.options.find(u => u.userId === userId);

                if (e.target.checked) {
                    this.selected.add(user);
                } else {
                    this.selected.delete(user);
                }
                this.updateInputValue();
            }
        });

        document.addEventListener('click', () => this.hideList());
    }

    renderOptions() {
        this.list.innerHTML = '';
        this.filteredOptions.forEach(user => {
            const div = document.createElement('div');
            div.className = 'option-item';

            const label = document.createElement('label');
            label.className = 'option-label';
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.width = '100%';
            label.style.cursor = 'pointer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.selected.has(user);
            checkbox.dataset.userId = user.userId;
            checkbox.style.marginRight = '8px';

            const text = document.createElement('span');
            text.textContent = `${user.username} (${user.userId})`;

            label.appendChild(checkbox);
            label.appendChild(text);
            div.appendChild(label);
            this.list.appendChild(div);
        });
    }


    showList() {
        this.list.classList.add('show');
    }

    hideList() {
        this.list.classList.remove('show');
    }

    filter(keyword) {
        const kw = keyword.trim().toLowerCase();
        this.filteredOptions = this.options.filter(user =>
            user.username.toLowerCase().includes(kw) ||
            user.userId.toString().includes(kw)
        );
        this.renderOptions();
        this.showList();
    }

    updateInputValue() {
        this.input.value = Array.from(this.selected)
            .map(user => `${user.username} (${user.userId})`)
            .join('、');
    }

    getSelectedUserIds() {
        return Array.from(this.selected).map(user => user.userId);
    }
}

// 全局变量存放实例
let signerSelect, approveSelect, signListSelect;

// 动态拉人员列表，初始化 MultiSelect
function initMultiSelects(countersignUsers, approveUsers, signUsers) {
    signListSelect = new MultiSelect(document.getElementById('signListSelect'), signUsers);
    approveSelect = new MultiSelect(document.getElementById('approveSelect'), approveUsers);
    signerSelect = new MultiSelect(document.getElementById('signerSelect'), countersignUsers);
}

// 提交分配
async function submitAssign() {
    const contractId = new URLSearchParams(window.location.search).get('id');
    const id = parseInt(contractId);
    if (!id) {
        alert("无法获取合同ID");
        return;
    }

    const signerIds = signerSelect.getSelectedUserIds();
    const approverIds = approveSelect.getSelectedUserIds();
    const countersignerIds = signListSelect.getSelectedUserIds();

    try {
        // 🔸 第一步：预处理（清空流程表 + 设置状态）
        const prepareResponse = await fetch(`/api/contract/assign/prepare/${id}`, {
            method: 'PUT'
        });
        const prepareData = await prepareResponse.json();

        if (!prepareResponse.ok) {
            if (prepareData.code === 403) {
                throw new Error("权限不足，无法初始化合同流程");
            } else if (prepareData.code === 401) {
                throw new Error("未登录或登录已过期，请重新登录");
            } else {
                throw new Error(prepareData.msg || "初始化失败");
            }
        }

        // 🔸 第二步：分配会签人
        for (const userId of countersignerIds) {
            const request = { conNum: id, userId };
            const response = await fetch('/api/contract/assign/countersign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法分配会签人");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
        }

        // 🔸 第三步：分配审批人
        for (const userId of approverIds) {
            const request = { conNum: id, userId };
            const response = await fetch('/api/contract/assign/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法分配审批人");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
        }

        // 🔸 第四步：分配签订人
        for (const userId of signerIds) {
            const request = { conNum: id, userId };
            const response = await fetch('/api/contract/assign/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法分配签订人");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
        }

        alert('分配成功！');
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "assignContract.html";
        }

    } catch (error) {
        console.error('分配失败:', error);
        alert('分配失败: ' + error.message);
    }
}


// 取消分配，返回上一页或刷新
function cancelAssign() {
    if (confirm('确定取消吗？')) {
        // 如果有上一页，可以用 history.back()
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = "assignContract.html";
        }
    }
}

// 动态设置合同标题
function updateContractTitle(contractName) {
    const titleElem = document.getElementById('contractTitle');
    if(titleElem)
        titleElem.textContent = `流程配置：${contractName}`;
    else titleElem.textContent = `未知合同||updateError`;
}

// 绑定按钮事件
document.getElementById('btnConfirm').addEventListener('click', submitAssign);
document.getElementById('btnBack').addEventListener('click', cancelAssign);

// 页面启动时，调用接口获取人员列表和合同名
window.addEventListener('DOMContentLoaded', () => {
    // 获取会签人员列表
    fetch('/api/right/list/countersign')
        .then(res => res.json())
        .then(data => {
            if (!data) throw new Error("获取会签人员失败");
            return data;
        })
        .then(countersignUsers => {
            // 获取审批人员列表
            fetch('/api/right/list/approve')
                .then(res => res.json())
                .then(data => {
                    if (!data) throw new Error("获取审批人员失败");
                    return data;
                })
                .then(approveUsers => {
                    // 获取签订人员列表
                    fetch('/api/right/list/sign')
                        .then(res => res.json())
                        .then(data => {
                            if (!data) throw new Error("获取签订人员失败");
                            return data;
                        })
                        .then(signUsers => {
                            // 初始化 MultiSelect 组件
                            initMultiSelects(countersignUsers, approveUsers, signUsers);
                        })
                        .catch(err => {
                            console.error(err);
                            alert(err.message || "获取签订人员失败");
                            initMultiSelects([], [], []);
                        });
                })
                .catch(err => {
                    console.error(err);
                    alert(err.message || "获取审批人员失败");
                    initMultiSelects([], [], []);
                });
        })
        .catch(err => {
            console.error(err);
            alert(err.message || "获取会签人员失败");
            initMultiSelects([], [], []);
        });

    const conId = new URLSearchParams(window.location.search).get('id') || 'C001';
    fetch(`/api/contract/name?id=${conId}`)
        .then(async res => {
            const data = await res.json();
            if (!res.ok) {
                if (data.code === 403) {
                    throw new Error("权限不足，无法获取合同名称");
                } else if (data.code === 401) {
                    throw new Error("未登录或登录已过期，请重新登录");
                } else {
                    throw new Error(data.msg || "请求失败");
                }
            }
            return data;
        })
        .then(data => {
            updateContractTitle(data.name || '未知合同||dataNull');
        })
        .catch(err => {
            console.error('获取合同名失败:', err);
            alert(err.message || '获取合同名失败');
            updateContractTitle('未知合同||catchError');
        });
});

document.addEventListener('DOMContentLoaded', function () {
    const wrappers = document.querySelectorAll('.multi-select-wrapper');

    wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('.multi-input');
        const optionsList = wrapper.querySelector('.options-list');
        const checkboxes = wrapper.querySelectorAll('.option-checkbox');

        // 点击输入框显示选项列表
        input.addEventListener('click', function (e) {
            e.stopPropagation();
            hideAllOptions();
            optionsList.classList.add('show');
        });

        optionsList.addEventListener('click', function (e) {
            e.stopPropagation();

            // 查找最近的 .option-item（包括点击在子元素上）
            let item = e.target.closest('.option-item');
            if (!item || !optionsList.contains(item)) return;

            // 切换 checkbox 状态（不管点击到哪个区域，只要在 option-item 内）
            let checkbox = item.querySelector('.option-checkbox');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;

                // 获取所有选中项的文本
                const selected = Array.from(optionsList.querySelectorAll('.option-checkbox'))
                    .filter(cb => cb.checked)
                    .map(cb => cb.closest('.option-item').querySelector('.option-text').textContent);

                input.value = selected.join(', ');
            }
        });

    });

    // 点击其他地方关闭所有下拉框
    document.addEventListener('click', function () {
        hideAllOptions();
    });

    function hideAllOptions() {
        document.querySelectorAll('.options-list').forEach(el => {
            el.classList.remove('show');
        });
    }
});