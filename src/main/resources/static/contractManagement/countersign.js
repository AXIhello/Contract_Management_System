// 获取URL中的合同ID
const contractId = new URLSearchParams(window.location.search).get('id');
window.existingAttachments = []; // 已有附件数组
window.deletedAttachments = []; // 要删除的附件路径数组

// 格式化日期函数
function formatDate(dateString) {
    if (!dateString) return '未知日期';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 初始化附件列表
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

            // 文件信息
            const fileInfo = document.createElement('span');
            fileInfo.textContent = file.name;
            fileInfo.style.flex = '1';

            // 修改下载链接，使用后端提供的统一下载接口
            const downloadBtn = document.createElement('a');
            downloadBtn.href = `/api/contract/attachment/download?filepath=${encodeURIComponent(file.url)}`;
            downloadBtn.textContent = '下载';
            downloadBtn.target = '_blank';
            downloadBtn.rel = 'noopener noreferrer';
            downloadBtn.style.marginRight = '10px';
            downloadBtn.style.color = '#007bff';
            downloadBtn.style.textDecoration = 'none';

            // 删除按钮
            const delBtn = document.createElement('button');
            delBtn.type = 'button';
            delBtn.textContent = '删除';
            delBtn.onclick = () => removeExistingAttachment(idx);
            delBtn.style.background = '#dc3545';
            delBtn.style.color = 'white';
            delBtn.style.border = 'none';
            delBtn.style.padding = '2px 8px';
            delBtn.style.borderRadius = '3px';
            delBtn.style.cursor = 'pointer';

            div.appendChild(fileInfo);
            div.appendChild(downloadBtn);
            div.appendChild(delBtn);
            attachmentsElement.appendChild(div);
        });
    }

    // 删除已有附件（仅记录）
    function removeExistingAttachment(index) {
        const file = window.existingAttachments[index];
        if (!file) return;

        if (confirm(`确认删除附件 "${file.name}" 吗？`)) {
            // 记录要删除的附件路径
            window.deletedAttachments.push(file.url);

            // 从展示列表中移除
            window.existingAttachments.splice(index, 1);
            renderAttachments();

            console.log('标记删除附件:', file.url);
            console.log('当前待删除附件列表:', window.deletedAttachments);
        }
    }

    return { renderAttachments, removeExistingAttachment };
}

window.addEventListener('DOMContentLoaded', () => {
    if (contractId) {
        const { renderAttachments } = initAttachments(); // 初始化附件模块

        fetch(`/api/countersign/contract/${contractId}`)
            .then(res => res.json())
            .then(data => {
                // 填充合同基本信息
                document.getElementById('contractName').textContent = data.name || '未知合同';
                document.getElementById('contractNum').textContent = data.num || '未知编号';
                document.getElementById('beginTime').textContent = formatDate(data.beginTime);
                document.getElementById('endTime').textContent = formatDate(data.endTime);
                document.getElementById('userId').textContent = data.userId || '未知';
                document.getElementById('customer').textContent = data.customer || '未知';

                // 处理附件
                const attachmentsElement = document.getElementById('attachments');
                if (data.attachments && data.attachments.length > 0) {
                    window.existingAttachments = data.attachments.map(attachment => ({
                        id: attachment.id,
                        name: attachment.name,
                        url: attachment.url // 保持url不变，用于传递给下载接口
                    }));
                    renderAttachments(); // 渲染带删除功能的附件列表
                } else {
                    attachmentsElement.textContent = '无附件';
                }

                // 处理合同内容
                const contentElement = document.getElementById('contractContent');
                contentElement.innerHTML = data.content || '合同内容为空';
            })
            .catch(err => {
                console.error('获取合同信息失败:', err);
                // 错误处理保持不变
            });
    } else {
        // 错误处理保持不变
    }
});

// 重置表单（新增附件删除记录清空）
function resetForm() {
    document.getElementById('countersignComment').value = '';
    document.getElementById('errorMessage').style.display = 'none';
    window.deletedAttachments = []; // 清空删除记录
}

// 会签提交函数（新增附件删除参数）
function submitCountersign() {
    const comment = document.getElementById('countersignComment').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (!comment) {
        errorMessage.style.display = 'block';
        return;
    }

    errorMessage.style.display = 'none';

    const requestData = {
        contractId: contractId,
        comment: comment,
        deletedAttachments: window.deletedAttachments // 新增删除附件参数
    };

    fetch('/api/countersign/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('会签提交成功！');
                window.location.href = '/toBeCountersignedContractList.html';
            } else {
                alert('会签提交失败：' + (data.message || '未知错误'));
            }
        })
        .catch(err => {
            console.error('提交会签失败:', err);
            alert('提交会签失败，请稍后重试');
        });
}