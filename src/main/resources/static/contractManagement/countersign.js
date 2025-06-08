// 获取URL中的合同ID
const contractId = new URLSearchParams(window.location.search).get('id');
window.existingAttachments = []; // 已有附件数组

// 格式化日期函数
function formatDate(dateString) {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

window.addEventListener('DOMContentLoaded', () => {
// 初始化附件列表（仅展示和下载）
function initAttachments() {
    const attachmentsElement = document.getElementById('attachments');
    if (!attachmentsElement) return;

    // 渲染附件列表
    function renderAttachments() {
        attachmentsElement.innerHTML = '';
        if (window.existingAttachments.length === 0) {
            attachmentsElement.innerHTML = '<p>无附件</p>';
            return;
        }

        window.existingAttachments.forEach((file, idx) => {
            const div = document.createElement('div');
            div.className = 'attachment-item';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.style.padding = '8px';
            div.style.border = '1px solid #ddd';
            div.style.marginBottom = '5px';
            div.style.backgroundColor = '#f8f9fa'; // 浅灰背景表示只读

            // 文件信息
            const fileInfo = document.createElement('span');
            fileInfo.textContent = file.name;
            fileInfo.style.flex = '1';

            // 下载链接
            const downloadBtn = document.createElement('a');
            downloadBtn.href = `/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}`;
            downloadBtn.textContent = '下载';
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
            downloadBtn.style.color = '#007bff';
            downloadBtn.style.textDecoration = 'none';
            downloadBtn.style.padding = '4px 8px';
            downloadBtn.style.border = '1px solid #007bff';
            downloadBtn.style.borderRadius = '3px';
            downloadBtn.style.backgroundColor = 'white';

            // 鼠标悬停效果
            downloadBtn.onmouseover = function() {
                this.style.backgroundColor = '#007bff';
                this.style.color = 'white';
            };
            downloadBtn.onmouseout = function() {
                this.style.backgroundColor = 'white';
                this.style.color = '#007bff';
            };

            div.appendChild(fileInfo);
            div.appendChild(downloadBtn);
            attachmentsElement.appendChild(div);
        });
    }

    return { renderAttachments };
}

// 加载合同附件（新增函数）
async function loadContractAttachments(contractId) {
    try {
        const res = await fetch(`/api/contract/attachment/get/${contractId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        // 将附件数据转换为统一格式
        window.existingAttachments = data.map(item => ({
            id: item.id,
            name: item.fileName || item.name, // 兼容不同的字段名
            url: item.fileUrl || item.url      // 兼容不同的字段名
        }));

        console.log('加载到的附件:', window.existingAttachments);

        // 渲染附件列表
        const { renderAttachments } = initAttachments();
        renderAttachments();

    } catch (err) {
        console.error('加载合同附件失败:', err);
        const attachmentsElement = document.getElementById('attachments');
        if (attachmentsElement) {
            attachmentsElement.innerHTML = '<p style="color:red;">加载附件失败</p>';
        }
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    if (contractId) {
        const { renderAttachments } = initAttachments(); // 初始化附件模块

        try {
            // 获取合同基本信息
            const res = await fetch(`/api/countersign/contract/${contractId}`);
            const data = await res.json();

            // 填充合同基本信息
            document.getElementById('contractName').textContent = data.name || '未知合同';
            document.getElementById('contractNum').textContent = data.num || '未知编号';
            document.getElementById('beginTime').textContent = formatDate(data.beginTime);
            document.getElementById('endTime').textContent = formatDate(data.endTime);
            document.getElementById('userId').textContent = data.userId || '未知';
            document.getElementById('customer').textContent = data.customer || '未知';

            // 处理附件 - 优先使用专门的附件接口
            if (data.attachments && data.attachments.length > 0) {
                // 如果会签接口返回了附件信息，使用这些数据
                window.existingAttachments = data.attachments.map(attachment => ({
                    id: attachment.id,
                    name: attachment.name,
                    url: attachment.url
                }));
                renderAttachments();
            } else {
                // 如果会签接口没有返回附件，尝试从专门的附件接口获取
                await loadContractAttachments(contractId);
            }

            // 处理合同内容
            const contentElement = document.getElementById('contractContent');
            contentElement.innerHTML = data.content || '合同内容为空';

        } catch (err) {
            console.error('获取合同信息失败:', err);

            // 如果获取合同信息失败，仍然尝试加载附件
            try {
                await loadContractAttachments(contractId);
            } catch (attachmentErr) {
                console.error('加载附件也失败:', attachmentErr);
            }

            // 显示错误信息
            alert('获取合同信息失败，请刷新页面重试');
        }
    } else {
        alert('未找到合同ID，请检查URL参数');
        // 可以考虑跳转到合同列表页面
        // window.location.href = '/toBeCountersignedContractList.html';
    }
});

// 重置表单
function resetForm() {
    document.getElementById('countersignComment').value = '';
    document.getElementById('errorMessage').style.display = 'none';
}

// 会签提交函数
async function submitCountersign() {
    const comment = document.getElementById('countersignComment').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (!comment) {
        errorMessage.style.display = 'block';
        return;
    }

    errorMessage.style.display = 'none';

    const requestData = {
        contractId: contractId,
        comment: comment
    };

    try {
        const res = await fetch('/api/countersign/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await res.json();

        if (data.success) {
            alert('会签提交成功！');
            window.location.href = '/toBeCountersignedContractList.html';
        } else {
            alert('会签提交失败：' + (data.message || '未知错误'));
        }
    } catch (err) {
        console.error('提交会签失败:', err);
        alert('提交会签失败，请稍后重试');
    }
}