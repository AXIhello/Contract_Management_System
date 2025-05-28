
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

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.selected.has(user);
            checkbox.id = `${this.wrapper.id}_opt_${user.userId}`;
            checkbox.dataset.userId = user.userId;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = `${user.username} (${user.userId})`;
            label.style.flex = '1';
            label.style.cursor = 'pointer';

            div.appendChild(checkbox);
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
function initMultiSelects(userList) {
    signerSelect = new MultiSelect(document.getElementById('signerSelect'), userList);
    approveSelect = new MultiSelect(document.getElementById('approveSelect'), userList);
    signListSelect = new MultiSelect(document.getElementById('signListSelect'), userList);
}

// 提交分配
async function submitAssign() {
    const contractId = new URLSearchParams(window.location.search).get('id');
    if (contractId) {
        console.log("合同 ID 更新为：", contractId);
    } else {
        console.error('未找到合同 ID');
    }

    const signerIds = signerSelect.getSelectedUserIds();
    const approverIds = approveSelect.getSelectedUserIds();
    const countersignerIds = signListSelect.getSelectedUserIds();

    console.log("原始 contractId:", contractId, "类型:", typeof contractId);

    const id = parseInt(contractId);

    console.log("转化 contractId:", id, "类型:", typeof id);

    try {
        // 1. 分配会签人
        for (const userId of countersignerIds) {
            const request = {
                conNum: id,
                type: 1, // 1表示会签
                userId: userId
            };
            await assignToBackend(request);
        }

        // 2. 分配审批人
        for (const userId of approverIds) {
            const request = {
                conNum: id,
                type: 2, // 2表示审批
                userId: userId
            };
            await assignToBackend(request);
        }

        // 3. 分配签订人
        for (const userId of signerIds) {
            const request = {
                conNum: id,
                type: 3, // 3表示签订
                userId: userId
            };
            await assignToBackend(request);
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

async function assignToBackend(request) {
    const response = await fetch('/api/assign/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
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
    if(!titleElem)
        titleElem.textContent = `流程配置：${contractName}`;
    else titleElem.textContent = `未知合同`;
}

// 绑定按钮事件
document.getElementById('btnConfirm').addEventListener('click', submitAssign);
document.getElementById('btnBack').addEventListener('click', cancelAssign);

// 页面启动时，调用接口获取人员列表和合同名
window.addEventListener('DOMContentLoaded', () => {
    // 返回User对象数组
    fetch('/api/assign/user')
        .then(res => res.json())
        .then(data => {
            initMultiSelects(data);
        })
        .catch(err => {
            console.error('获取人员列表失败:', err);
            // 失败时可用默认假数据初始化
            initMultiSelects([
                { userId: 1, username: '张三' },
                { userId: 2, username: '李四' },
                { userId: 3, username: '王五' }
            ]);
        });

    const conId = new URLSearchParams(window.location.search).get('id') || 'C001';
    fetch(`/api/assign/name?id=${conId}`)
        .then(res => res.json())
        .then(data => {
            updateContractTitle(data.name || '未知合同');
        })
        .catch(err => {
            console.error('获取合同名失败:', err);
            updateContractTitle('未知合同');
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

        // 点击选项区域，切换勾选状态
        optionsList.addEventListener('click', function (e) {
            e.stopPropagation();

            // 如果点到的是 option-item 或其内部
            let item = e.target.closest('.option-item');
            if (item) {
                let checkbox = item.querySelector('.option-checkbox');
                checkbox.checked = !checkbox.checked;

                // 获取所有选中项文本，放入 input 显示
                const selected = Array.from(optionsList.querySelectorAll('.option-checkbox'))
                    .filter(cb => cb.checked)
                    .map(cb => cb.parentElement.querySelector('.option-text').textContent);

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