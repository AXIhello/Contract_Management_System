class MultiSelect {
    constructor(wrapper, options) {
        this.wrapper = wrapper;
        this.input = wrapper.querySelector('.multi-input');
        this.list = wrapper.querySelector('.options-list');
        this.options = options;
        this.selected = new Set();

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
                const optText = e.target.nextSibling.textContent;
                if (e.target.checked) {
                    this.selected.add(optText);
                } else {
                    this.selected.delete(optText);
                }
                this.updateInputValue();
            }
        });

        document.addEventListener('click', () => this.hideList());
    }

    renderOptions() {
        this.list.innerHTML = '';
        this.filteredOptions.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'option-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.selected.has(opt);
            checkbox.id = `${this.wrapper.id}_opt_${opt}`;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = opt;
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
        this.filteredOptions = this.options.filter(o => o.toLowerCase().includes(kw));
        this.renderOptions();
        this.showList();
    }

    updateInputValue() {
        this.input.value = Array.from(this.selected).join('、');
    }

    getSelected() {
        return Array.from(this.selected);
    }
}

// 全局变量存放实例
let signerSelect, approveSelect, signListSelect;

// 动态拉人员列表，初始化 MultiSelect
function initMultiSelects(peopleList) {
    signerSelect = new MultiSelect(document.getElementById('signerSelect'), peopleList);
    approveSelect = new MultiSelect(document.getElementById('approveSelect'), peopleList);
    signListSelect = new MultiSelect(document.getElementById('signListSelect'), peopleList);
}

// 提交分配
function submitAssign() {
    console.log('签订人:', signerSelect.getSelected());
    console.log('审批人:', approveSelect.getSelected());
    console.log('会签人:', signListSelect.getSelected());
    alert('分配成功！结果已打印到控制台。');
    // 如果有上一页，可以用 history.back()
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "assignContract.html";
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
    titleElem.textContent = `流程配置：${contractName}`;
}

// 绑定按钮事件
document.getElementById('btnConfirm').addEventListener('click', submitAssign);
document.getElementById('btnBack').addEventListener('click', cancelAssign);

// 页面启动时，调用接口获取人员列表和合同名
window.addEventListener('DOMContentLoaded', () => {
    // 假设接口：/api/personnel/list 返回人员姓名字符串数组
    fetch('/api/personnel/list')
        .then(res => res.json())
        .then(data => {
            initMultiSelects(data);
        })
        .catch(err => {
            console.error('获取人员列表失败:', err);
            // 失败时可用默认假数据初始化
            initMultiSelects(['张三', '李四', '王五']);
        });

    // 假设接口：/api/contract/name?id=xxx 返回合同名
    // 你可以从URL参数或上下文拿到合同id，这里用模拟id
    const contractId = new URLSearchParams(window.location.search).get('id') || 'C001';
    fetch(`/api/contract/name?id=${contractId}`)
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