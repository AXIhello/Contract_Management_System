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

        // 阻止点击选项时失焦导致关闭
        this.list.addEventListener('mousedown', e => {
            e.preventDefault(); // 阻止默认失焦行为
        });

        // 点击复选框改状态
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

        // 点击空白区域关闭
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

// 初始化数据
const peopleList = ['张三', '李四', '王五', '小明', '小强', '小丽'];
// TODO: peopleList 为模拟假数据，待修改
//通过 fetch 调用，拿到数据后赋值给 peopleList 并重新初始化 MultiSelect 实例
// 例子：
// fetch('/api/personnel/list')
//    .then(res => res.json())
//    .then(data => {
//        peopleList = data;  // data 应该是字符串数组
//        signerSelect = new MultiSelect(document.getElementById('signerSelect'), peopleList);
//        approveSelect = new MultiSelect(document.getElementById('approveSelect'), peopleList);
//        signListSelect = new MultiSelect(document.getElementById('signListSelect'), peopleList);
//    });


// 初始化实例
const signerSelect = new MultiSelect(document.getElementById('signerSelect'), peopleList);
const approveSelect = new MultiSelect(document.getElementById('approveSelect'), peopleList);
const signListSelect = new MultiSelect(document.getElementById('signListSelect'), peopleList);

// 提交取消
function submitAssign() {
    console.log('签订人:', signerSelect.getSelected());
    console.log('审批人:', approveSelect.getSelected());
    console.log('会签人:', signListSelect.getSelected());
    alert('分配成功！控制台有结果。');
}

function cancelAssign() {
    if (confirm('确定取消吗？')) location.reload();
}

// 假设你通过接口拿到合同名 contractName，动态替换标题
function updateContractTitle(contractName) {
    const titleElem = document.getElementById('contractTitle');
    titleElem.textContent = `流程配置：${contractName}`;
}

// TODO: 实际调用时，替换下面的模拟值为后端接口返回的合同名
// updateContractTitle('XX合同1');

window.submitAssign = submitAssign;
window.cancelAssign = cancelAssign;
